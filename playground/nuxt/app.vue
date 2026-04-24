<script setup lang="ts">
// All globals below (useTerminal, Terminal, ref) come from Nuxt auto-imports
// injected by @itsmelouis/wterm-vue/nuxt + Nuxt itself. No import needed.
const { terminalRef, write, focus } = useTerminal()
const title = ref('wterm-vue/nuxt playground')
const theme = ref('')

let line = ''

function prompt() {
  write('\x1B[1;32m$ \x1B[0m')
}

function onReady(wt: unknown) {
  // eslint-disable-next-line no-console
  console.log('[playground-nuxt] terminal ready', wt)
  write('\x1B[1;36m Hello from @itsmelouis/wterm-vue/nuxt 👋\x1B[0m\r\n')
  write(' Type \x1B[1mhelp\x1B[0m to see commands.\r\n\r\n')
  prompt()
  focus()
}

function onError(err: unknown) {
  console.error('[playground-nuxt] terminal error', err)
}

function exec(input: string) {
  const cmd = input.trim()
  if (!cmd) {
    prompt()
    return
  }
  if (cmd === 'help') {
    write('\r\n  available: \x1B[33mhelp\x1B[0m \x1B[33mdate\x1B[0m \x1B[33mclear\x1B[0m\r\n')
  }
  else if (cmd === 'date') {
    write(`\r\n  ${new Date().toLocaleString()}\r\n`)
  }
  else if (cmd === 'clear') {
    write('\x1B[2J\x1B[H')
  }
  else {
    write(`\r\n  \x1B[31munknown:\x1B[0m ${cmd}\r\n`)
  }
  prompt()
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
    else if (ch >= ' ') {
      line += ch
      write(ch)
    }
  }
}

function onTitle(t: string) {
  title.value = t
}
</script>

<template>
  <div class="container">
    <h1>{{ title }}</h1>
    <p>
      This page renders a <code>&lt;Terminal&gt;</code> component auto-registered
      by <code>@itsmelouis/wterm-vue/nuxt</code>. <code>useTerminal</code> is
      auto-imported too.
    </p>

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
        :rows="18"
        :echo="false"
        :theme="theme || undefined"
        :cursor-blink="true"
        @ready="onReady"
        @error="onError"
        @data="onData"
        @title="onTitle"
      />
    </div>
  </div>
</template>

<style>
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #0e0f13;
  color: #dbd7ca;
}
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
}
p { color: #888; margin: 0 0 1.5rem; }
code {
  background: #1f2028;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  font-size: 0.9em;
}
.toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
select {
  background: #1c1c1c;
  color: #dbd7ca;
  border: 1px solid #333;
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  font: inherit;
  cursor: pointer;
}
.terminal-wrap {
  border-radius: 6px;
  overflow: hidden;
  background: #000;
}
</style>
