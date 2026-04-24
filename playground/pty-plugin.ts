import type { IncomingMessage } from 'node:http'
import type { Plugin } from 'vite'
import process from 'node:process'
import { spawn } from 'node-pty'
import { WebSocketServer } from 'ws'

export function ptyPlugin(): Plugin {
  return {
    name: 'playground-pty',
    configureServer(server) {
      const httpServer = server.httpServer
      if (!httpServer)
        return

      const wss = new WebSocketServer({ noServer: true })

      httpServer.on('upgrade', (req, socket, head) => {
        if (req.url !== '/pty')
          return
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req)
        })
      })

      wss.on('connection', (ws, req: IncomingMessage) => {
        const shell = process.env.SHELL
          ?? (process.platform === 'win32' ? 'powershell.exe' : 'bash')

        const pty = spawn(shell, [], {
          name: 'xterm-256color',
          cols: 80,
          rows: 24,
          cwd: process.env.HOME ?? process.cwd(),
          env: process.env as Record<string, string>,
        })

        const disposeData = pty.onData(data => ws.send(data))
        const disposeExit = pty.onExit(() => ws.close())

        ws.on('message', (data) => {
          pty.write(data.toString())
        })

        ws.on('close', () => {
          disposeData.dispose()
          disposeExit.dispose()
          try {
            pty.kill()
          }
          catch {
            // pty may already be gone
          }
        })

        const ip = req.socket.remoteAddress ?? 'unknown'
        // eslint-disable-next-line no-console
        console.log(`[pty] connected from ${ip}, shell=${shell}`)
      })
    },
  }
}
