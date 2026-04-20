---
name: wterm-vue
description: Use when a project depends on `@itsmelouis/wterm-vue` — a Vue 3 wrapper around `@wterm/dom` (WASM terminal emulator). Provides the `<Terminal>` SFC API, `useTerminal()` composable, echo vs remote-PTY wiring, themes, and non-obvious gotchas (shallowRef, CSS import, peer deps).
---

# wterm-vue

Vue 3 SFC + composable wrapping `@wterm/dom`, a Zig/WASM terminal emulator for the browser. Mirrors the shape of `@wterm/react` but idiomatically Vue (props/events/template refs).

## When this skill applies

- The user's `package.json` lists `@itsmelouis/wterm-vue` as a dep.
- The user asks to "add a terminal", "embed a shell", "build a web terminal/REPL/console" in a Vue 3 or Nuxt project.
- The user is wiring a WebSocket PTY bridge to a `<Terminal>`.

Skip when the user is on React (use `@wterm/react` instead) or plain DOM (use `@wterm/dom` directly).

## Install

```bash
pnpm add @itsmelouis/wterm-vue @wterm/dom
```

`vue@^3.4` and `@wterm/dom` are **peer deps** — both must be installed. No separate WASM asset copy is needed; the binary is embedded in `@wterm/dom`.

## Import surface

```ts
import type { TerminalInstance, TerminalProps } from '@itsmelouis/wterm-vue'
// `WTerm` and `WebSocketTransport` are re-exported from `@wterm/dom`, no second import needed:
import { Terminal, useTerminal, WebSocketTransport, WTerm } from '@itsmelouis/wterm-vue'
import '@itsmelouis/wterm-vue/css' // once, at app entry or in a layout
```

The CSS subpath import is **mandatory** — without it the terminal has no styling. It resolves `@wterm/dom/css` under the hood, so Vite/webpack must support bare specifiers in CSS (default in both).

## Two canonical patterns

### 1. Standalone (default, echoes input)

```vue
<script setup lang="ts">
import type { WTerm } from '@itsmelouis/wterm-vue'
import { Terminal, useTerminal } from '@itsmelouis/wterm-vue'
import '@itsmelouis/wterm-vue/css'

const { terminalRef, write, focus } = useTerminal()

function onReady(_wt: WTerm) {
  write('hello\r\n$ ')
  focus()
}
</script>

<template>
  <Terminal ref="terminalRef" :cols="80" :rows="24" @ready="onReady" />
</template>
```

Default `echo: true` means typed input is written back automatically — the terminal "works" standalone with no backend.

### 2. Remote PTY forwarding (disable echo)

```vue
<script setup lang="ts">
import { Terminal, useTerminal } from '@itsmelouis/wterm-vue'
import '@itsmelouis/wterm-vue/css'

const { terminalRef, write } = useTerminal()
const socket = new WebSocket('ws://localhost:8080/pty')
socket.binaryType = 'arraybuffer'
socket.onmessage = e => write(typeof e.data === 'string' ? e.data : new Uint8Array(e.data))

function onData(data: string) {
  socket.send(data)
}
</script>

<template>
  <Terminal ref="terminalRef" :echo="false" @data="onData" />
</template>
```

**Rule of thumb:** if input goes to a remote shell, set `:echo="false"` — the remote end will echo back through `write()`. Leaving `echo` on top of a remote PTY causes double characters.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `cols` | `number` | `80` | Live-reactive, triggers `wt.resize()`. |
| `rows` | `number` | `24` | Same. |
| `wasmUrl` | `string` | — | Only needed if you serve the WASM binary separately (rare). |
| `theme` | `string` | — | `"solarized-dark" \| "monokai" \| "light" \| "vitesse-dark" \| "vitesse-light"` or a custom `theme-<name>` CSS class. |
| `autoResize` | `boolean` | `false` | Fit to container. When `true`, `cols/rows` props are ignored after mount. |
| `cursorBlink` | `boolean` | `false` | Live-reactive. |
| `echo` | `boolean` | `true` | See remote-PTY pattern above. |

## Events

| Event | Payload | Fires |
|---|---|---|
| `data` | `(data: string)` | On user keystroke **and** host replies (cursor-position etc.). |
| `title` | `(title: string)` | OSC 0/2. |
| `resize` | `(cols, rows)` | After mount / on container resize / on explicit `resize()`. |
| `ready` | `(wt: WTerm)` | WASM loaded + `init()` resolved. Write startup banner here, not in `onMounted`. |
| `error` | `(err: unknown)` | WASM load or init failure. |

## Exposed instance (via `ref` or `useTerminal`)

```ts
interface TerminalInstance {
  write: (data: string | Uint8Array) => void
  resize: (cols: number, rows: number) => void
  focus: () => void
  readonly instance: WTerm | null // raw @wterm/dom instance — escape hatch
}
```

`useTerminal()` is sugar: returns `{ terminalRef, write, resize, focus }` — pass `terminalRef` to `<Terminal ref="terminalRef">`. Prefer it over raw `ref()` to avoid TS friction.

## Non-obvious gotchas

1. **Always use `shallowRef` for `WTerm` or `TerminalInstance` refs.** `WTerm` has private class fields. Vue's deep `UnwrapRef<T>` mapped type strips the nominal identity, producing TS2322 at build. The lib already uses `shallowRef` internally; mirror that in user code:
   ```ts
   const term = shallowRef<WTerm | null>(null) // ✅
   const term = ref<WTerm | null>(null) // ❌ TS2322
   ```

2. **Echo semantics differ from `@wterm/react`.** React's version disables echo whenever an `onData` handler is set. This lib keeps echo **on** by default even if you listen to `@data`. Explicitly set `:echo="false"` for the PTY case.

3. **Write on `@ready`, not `onMounted`.** `new WTerm()` is synchronous but `init()` loads the WASM asynchronously. Writing before `ready` is a no-op.

4. **`cols`/`rows` are reactive** — watching them calls `wt.resize()`. But when `autoResize: true`, prop-driven resize is ignored (the container's ResizeObserver wins).

5. **Theme switching is class-based.** Changing `theme` prop swaps `theme-<name>` classes on the root — custom themes are just CSS that overrides `--term-fg`, `--term-bg`, `--term-color-0` … `--term-color-15`. No JS API needed.

6. **Cleanup is automatic** — `onBeforeUnmount` calls `wt.destroy()`. Do not destroy manually from `instance`.

## Custom themes

```css
/* app.css, after importing wterm-vue/css */
.theme-my-brand {
  --term-bg: #0a0e27;
  --term-fg: #c0caf5;
  --term-color-0: #15161e;
  /* … colors 1..15 */
}
```

```vue
<Terminal theme="my-brand" />
```

## SSR / Nuxt

`@wterm/dom` touches `window` and loads WASM — it is **client-only**. In Nuxt:

```vue
<ClientOnly>
  <Terminal ref="terminalRef" />
</ClientOnly>
```

Or wrap the consuming component with `.client.vue` suffix / `<client-only>`.

## Escape hatch

Need something the wrapper doesn't expose? Grab the raw instance:

```ts
const { terminalRef } = useTerminal()
// after @ready:
const wt = terminalRef.value?.instance // WTerm | null — full @wterm/dom API
```

Common uses: `WebSocketTransport` wiring, direct buffer reads, custom keymap handlers.

## Quick reference: full signature

```ts
defineProps<{
  cols?: number
  rows?: number
  wasmUrl?: string
  theme?: string
  autoResize?: boolean
  cursorBlink?: boolean
  echo?: boolean
}>()

defineEmits<{
  data: [data: string]
  title: [title: string]
  resize: [cols: number, rows: number]
  ready: [wt: WTerm]
  error: [err: unknown]
}>()
```
