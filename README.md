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
import { Terminal, useTerminal, type WTerm } from "@itsmelouis/wterm-vue";
import "@itsmelouis/wterm-vue/css";

const { terminalRef, write, focus } = useTerminal();

function onReady(wt: WTerm) {
  write("hello from vue\r\n");
  focus();
}
</script>

<template>
  <Terminal ref="terminalRef" :cols="80" :rows="24" @ready="onReady" />
</template>
```

By default the terminal echoes typed input. To forward to a remote PTY instead:

```vue
<script setup lang="ts">
import { Terminal, useTerminal } from "@itsmelouis/wterm-vue";
import "@itsmelouis/wterm-vue/css";

const { terminalRef, write } = useTerminal();
const socket = new WebSocket("ws://localhost:8080/pty");
socket.binaryType = "arraybuffer";
socket.onmessage = (e) => write(typeof e.data === "string" ? e.data : new Uint8Array(e.data));

function onData(data: string) {
  socket.send(data);
}
</script>

<template>
  <Terminal ref="terminalRef" :echo="false" @data="onData" />
</template>
```

## `<Terminal>` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `cols` | `number` | `80` | Initial column count |
| `rows` | `number` | `24` | Initial row count |
| `wasmUrl` | `string` | — | Optional URL to serve the WASM binary separately (embedded by default) |
| `theme` | `string` | — | Theme name (`"solarized-dark"`, `"monokai"`, `"light"`) |
| `autoResize` | `boolean` | `false` | Auto-resize based on container dimensions |
| `cursorBlink` | `boolean` | `false` | Enable cursor blinking animation |
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
  write(data: string | Uint8Array): void;
  resize(cols: number, rows: number): void;
  focus(): void;
  readonly instance: WTerm | null;
}
```

## `useTerminal()` composable

Sugar to avoid manually typing the ref and proxying methods:

```ts
const { terminalRef, write, resize, focus } = useTerminal();
```

Pass `terminalRef` to `<Terminal ref="terminalRef">` in the template.

## Themes

Import the stylesheet once:

```ts
import "@itsmelouis/wterm-vue/css";
```

Built-in themes: `solarized-dark`, `monokai`, `light`. Switch via the `theme` prop. All colors use CSS custom properties (`--term-fg`, `--term-bg`, `--term-color-0` through `--term-color-15`), so custom themes are plain CSS.

## Development

```bash
corepack enable
pnpm install
pnpm dev        # starts the playground
pnpm build      # builds the library
```

## License

Apache-2.0
