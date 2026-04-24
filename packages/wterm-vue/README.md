# @itsmelouis/wterm-vue

Vue 3 addon for [wterm](https://github.com/vercel-labs/wterm) — a terminal emulator for the web.

Thin wrapper around [`@wterm/dom`](https://www.npmjs.com/package/@wterm/dom): exposes a `<Terminal>` SFC and a `useTerminal()` composable with idiomatic Vue 3 events and template refs.

## Install

```bash
pnpm add @itsmelouis/wterm-vue @wterm/dom
```

`vue@^3.4` and `@wterm/dom` are peer dependencies.

## Usage

```vue
<script setup lang="ts">
import type { WTerm } from '@itsmelouis/wterm-vue'
import { Terminal, useTerminal } from '@itsmelouis/wterm-vue'
import '@itsmelouis/wterm-vue/css'

const { terminalRef, write, focus } = useTerminal()

function onReady(wt: WTerm) {
  write('hello from vue\r\n')
  focus()
}
</script>

<template>
  <Terminal ref="terminalRef" :cols="80" :rows="24" @ready="onReady" />
</template>
```

By default the terminal echoes typed input. To forward to a remote PTY instead, use the built-in `useWebSocketTransport()` composable:

```vue
<script setup lang="ts">
import { Terminal, useTerminal, useWebSocketTransport } from '@itsmelouis/wterm-vue'
import '@itsmelouis/wterm-vue/css'

const { terminalRef } = useTerminal()
const { send, connected } = useWebSocketTransport('ws://localhost:8080/pty', {
  terminal: terminalRef,
})
</script>

<template>
  <span>{{ connected ? 'online' : 'offline' }}</span>
  <Terminal ref="terminalRef" :echo="false" @data="send" />
</template>
```

`useWebSocketTransport` wraps `@wterm/dom`'s `WebSocketTransport` with automatic reconnection, send buffering, and a reactive `connected` ref. Full API in the **Composables** section below.

## `<Terminal>` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `cols` | `number` | `80` | Initial column count |
| `rows` | `number` | `24` | Initial row count |
| `wasmUrl` | `string` | — | Optional URL to serve the WASM binary separately (embedded by default) |
| `theme` | `string` | — | Theme name (`"solarized-dark"`, `"monokai"`, `"light"`) |
| `autoResize` | `boolean` | `false` | Auto-resize based on container dimensions |
| `cursorBlink` | `boolean` | `false` | Enable cursor blinking animation |
| `debug` | `boolean` | `false` | Enable debug mode. Exposes a `DebugAdapter` on the underlying `WTerm` (via the exposed `instance`) for inspecting escape sequences, cell data, render performance, and unhandled CSI sequences. Init-only — changing after mount has no effect. |
| `echo` | `boolean` | `true` | When `true`, typed input is echoed back automatically. Set to `false` when forwarding input to a remote shell. |

## `<Terminal>` events

| Event | Payload | Description |
|---|---|---|
| `data` | `(data: string)` | Emitted on user input (and host responses like cursor-position replies) |
| `title` | `(title: string)` | Emitted when the terminal title changes (OSC 0/2) |
| `resize` | `(cols: number, rows: number)` | Emitted on resize |
| `ready` | `(wt: WTerm)` | Emitted once WASM is loaded and the terminal is initialized |
| `error` | `(err: unknown)` | Emitted if WASM loading or init fails |

## Exposed instance methods

The component exposes these via `ref`:

```ts
interface TerminalInstance {
  write: (data: string | Uint8Array) => void
  resize: (cols: number, rows: number) => void
  focus: () => void
  readonly instance: WTerm | null
}
```

## Composables

### `useTerminal()`

Sugar to avoid manually typing the ref and proxying methods:

```ts
const { terminalRef, write, resize, focus } = useTerminal()
```

Pass `terminalRef` to `<Terminal ref="terminalRef">` in the template.

### `useWebSocketTransport()`

Idiomatic wrapper around `WebSocketTransport` from `@wterm/dom`. Manages the socket lifecycle, exposes a reactive `connected` flag, and can auto-wire incoming data to a terminal ref.

```ts
const { send, connected, open, close, transport } = useWebSocketTransport(
  'ws://localhost:8080/pty',
  {
    terminal: terminalRef, // auto-write server data into the terminal
    reconnect: true, // auto-reconnect on disconnect (default true)
    maxReconnectDelay: 30000, // cap for the backoff, ms
    onData: (data) => {}, // called in addition to the auto terminal.write
    onOpen: () => {},
    onClose: () => {},
    onError: (event) => {},
    immediate: true, // open on mount when url is set (default true)
  },
)
```

The first argument is a `MaybeRefOrGetter<string | undefined>` — you can pass a ref and the transport will reconnect when its value changes. The connection is closed automatically on component unmount.

You still forward user input from the terminal via `@data="send"` — this keeps the Vue event flow intact and lets you intercept input if needed.

## Themes

Import the stylesheet once:

```ts
import '@itsmelouis/wterm-vue/css'
```

Built-in themes: `solarized-dark`, `monokai`, `light`, `vitesse-dark`, `vitesse-light`. Switch via the `theme` prop. All colors use CSS custom properties (`--term-fg`, `--term-bg`, `--term-color-0` through `--term-color-15`), so custom themes are plain CSS.

## Claude Code skill

A [Claude Code skill](https://docs.claude.com/en/docs/claude-code/skills) lives at [`/skills/wterm-vue`](https://github.com/itsmelouis/wterm-vue/tree/main/skills/wterm-vue) in this repo. It teaches an LLM the component API, the echo-vs-remote-PTY wiring, themes, and the non-obvious gotchas (e.g. `shallowRef` requirement, SSR, cleanup).

Install it via the [skills](https://skills.sh) CLI:

```bash
npx skills add itsmelouis/wterm-vue@wterm-vue
```

Or copy `skills/wterm-vue/SKILL.md` into your project's `.claude/skills/wterm-vue/`.

## Development

```bash
corepack enable
pnpm install
pnpm dev        # starts the playground
pnpm build      # builds the library
```

## License

MIT
