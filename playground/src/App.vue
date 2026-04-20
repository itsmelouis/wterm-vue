<script setup lang="ts">
import type { WTerm } from '@itsmelouis/wterm-vue'
import { Terminal, useTerminal } from '@itsmelouis/wterm-vue'
import { ref } from 'vue'

const { terminalRef, write, focus } = useTerminal()

const theme = ref('')
const title = ref('wterm-vue')

let line = ''
let _cols = 80

const BANNER = `\x1B[1;36m${String.raw`
           __                                                      
__  _  ___/  |_  ___________  _____           ___  ____ __   ____  
\ \/ \/ /\   __\/ __ \_  __ \/     \   ______ \  \/ /  |  \_/ __ \ 
 \     /  |  | \  ___/|  | \/  Y Y  \ /_____/  \   /|  |  /\  ___/ 
  \/\_/   |__|  \___  >__|  |__|_|  /           \_/ |____/  \___  >
                    \/            \/                            \/ 
`.replace(/\n/g, '\r\n')}\x1B[0m\r\n \x1B[2m A Vue 3 terminal component powered by @wterm/dom\x1B[0m\r\n`

const PROMPT = '\x1B[1;32m$ \x1B[0m'

const COMMANDS: Record<string, (args: string[]) => string> = {
  help: () =>
    [
      '',
      '  \x1B[1mAvailable commands:\x1B[0m',
      '',
      '  \x1B[33mhelp\x1B[0m       Show this message',
      '  \x1B[33mclear\x1B[0m      Clear the screen',
      '  \x1B[33mcolors\x1B[0m     Display ANSI color palette',
      '  \x1B[33mecho\x1B[0m       Echo arguments back',
      '  \x1B[33mdate\x1B[0m       Print current date/time',
      '  \x1B[33mwhoami\x1B[0m     Who are you?',
      '  \x1B[33mtheme\x1B[0m      Show or set theme (default, solarized-dark, monokai, light, vitesse-dark, vitesse-light)',
      '',
    ].join('\r\n'),

  clear: () => '\x1B[2J\x1B[H',

  colors: () =>
    [
      '',
      '  \x1B[31m██\x1B[0m \x1B[32m██\x1B[0m \x1B[33m██\x1B[0m \x1B[34m██\x1B[0m \x1B[35m██\x1B[0m \x1B[36m██\x1B[0m \x1B[37m██\x1B[0m',
      '  \x1B[1;31m██\x1B[0m \x1B[1;32m██\x1B[0m \x1B[1;33m██\x1B[0m \x1B[1;34m██\x1B[0m \x1B[1;35m██\x1B[0m \x1B[1;36m██\x1B[0m \x1B[1;37m██\x1B[0m',
      '',
      '  \x1B[1mbold\x1B[0m \x1B[3mitalic\x1B[0m \x1B[4munderline\x1B[0m \x1B[7mreverse\x1B[0m \x1B[9mstrike\x1B[0m',
      '  \x1B[38;2;255;128;0m24-bit truecolor orange\x1B[0m',
      '',
    ].join('\r\n'),

  echo: args => `\r\n${args.join(' ')}`,

  date: () => `\r\n  ${new Date().toLocaleString()}`,

  whoami: () => '\r\n  \x1B[1;35mguest\x1B[0m@wterm-vue',

  theme: (args) => {
    const valid = ['default', 'solarized-dark', 'monokai', 'light', 'vitesse-dark', 'vitesse-light']
    if (!args.length) {
      return `\r\n  current: \x1B[1m${theme.value || 'default'}\x1B[0m`
    }
    const t = args[0] ?? ''
    if (!valid.includes(t)) {
      return `\r\n  \x1B[31munknown theme:\x1B[0m ${t}\r\n  available: ${valid.join(', ')}`
    }
    theme.value = t === 'default' ? '' : t
    return `\r\n  switched to \x1B[1m${t}\x1B[0m`
  },
}

function prompt() {
  write(PROMPT)
}

function exec(input: string) {
  const parts = input.trim().split(/\s+/)
  const cmd = parts[0] ?? ''
  const args = parts.slice(1)

  if (!cmd) {
    prompt()
    return
  }

  const handler = COMMANDS[cmd]
  if (handler) {
    const output = handler(args)
    write(output)
  }
  else {
    write(`\r\n  \x1B[31mcommand not found:\x1B[0m ${cmd}`)
  }

  write('\r\n')
  prompt()
}

function onReady(wt: WTerm) {
  _cols = wt.cols
  write(BANNER)
  write('\r\n  Type \x1B[1mhelp\x1B[0m for available commands.\r\n\r\n')
  prompt()
  focus()
}

function onData(data: string) {
  for (const ch of data) {
    if (ch === '\r' || ch === '\n') {
      write('\r\n')
      exec(line)
      line = ''
    }
    else if (ch === '\x7F' || ch === '\b') {
      if (line.length > 0) {
        line = line.slice(0, -1)
        write('\b \b')
      }
    }
    else if (ch === '\x03') {
      // Ctrl+C
      line = ''
      write('^C\r\n')
      prompt()
    }
    else if (ch === '\x15') {
      // Ctrl+U — erase line
      const len = line.length
      line = ''
      write(`\x1B[${len}D\x1B[K`)
    }
    else if (ch === '\x1B') {
      // skip escape sequences (arrow keys etc.)
    }
    else if (ch >= ' ') {
      line += ch
      write(ch)
    }
  }
}

function onTitle(t: string) {
  title.value = t
}

function onResize(c: number) {
  _cols = c
}
</script>

<template>
  <h1>{{ title }}</h1>

  <div class="toolbar">
    <select v-model="theme">
      <option value="">
        default
      </option>
      <option value="solarized-dark">
        solarized-dark
      </option>
      <option value="monokai">
        monokai
      </option>
      <option value="light">
        light
      </option>
      <option value="vitesse-dark">
        vitesse-dark
      </option>
      <option value="vitesse-light">
        vitesse-light
      </option>
    </select>
  </div>

  <div class="terminal-wrap">
    <Terminal
      ref="terminalRef"
      :cols="80"
      :rows="24"
      :echo="false"
      :theme="theme || undefined"
      :cursor-blink="true"
      @ready="onReady"
      @data="onData"
      @title="onTitle"
      @resize="onResize"
    />
  </div>
</template>
