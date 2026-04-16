# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Vue 3 SFC wrapper around [`@wterm/dom`](https://www.npmjs.com/package/@wterm/dom) — a DOM-based terminal emulator backed by a Zig/WASM core. This repo ships **one library** (`@itsmelouis/wterm-vue`) at the root plus a `playground/` workspace app for dev/testing. There is no upstream Vue package from `vercel-labs/wterm`; this is an independent addon following the same API shape as `@wterm/react`.

## Commands

```bash
corepack enable          # once, to activate pinned pnpm version
pnpm install             # installs root + playground
pnpm build               # lib: rimraf dist && vite build && vue-tsc -p tsconfig.build.json
pnpm dev                 # runs the playground on :5173
pnpm type-check          # vue-tsc --noEmit over src/
pnpm --filter playground build   # production build of the demo app
```

The `build` script splits responsibilities: **Vite library mode** emits the JS bundle + sourcemap to `dist/wterm-vue.js`; **vue-tsc** emits `.d.ts` only (via `tsconfig.build.json` which sets `emitDeclarationOnly`). Both must succeed.

## Architecture

- `src/Terminal.vue` — the component. Instantiates `new WTerm(el, opts)` in `onMounted`, calls `wt.init()` (async WASM load), `destroy()` in `onBeforeUnmount`. Syncs `cols/rows/cursorBlink` via `watch`. Emits `data | title | resize | ready | error`. Exposes `write / resize / focus / instance` via `defineExpose`.
- `src/useTerminal.ts` — sugar composable returning `{ terminalRef, write, resize, focus }` where `terminalRef` is the template ref for the component.
- `src/types.ts` — `TerminalProps` and `TerminalInstance` interfaces. Kept separate so they can be re-exported cleanly (vue-tsc + `.vue` type re-exports are awkward otherwise).
- `src/terminal.css` — single `@import "@wterm/dom/css"`. Relies on Vite/webpack resolving bare npm specifiers in CSS. Published as-is under the `./css` subpath export.
- `src/index.ts` — barrel; also does `export * from "@wterm/dom"` so consumers get `WTerm`, `WebSocketTransport`, etc. without a second import.

## Non-obvious gotchas

- **Use `shallowRef`, not `ref`, for the `WTerm` instance.** Vue's deep `UnwrapRef` mapped type loses the nominal identity of classes with private fields (`WTerm` has several), which surfaces as a TS2322 at build time. Same rule applies in `useTerminal` for `terminalRef`. Never switch these back to `ref()`.
- **`echo` prop semantics** (default `true`): when true, the wrapper always writes typed input back via `wterm.value?.write(data)` so the terminal behaves standalone. Set to `false` when forwarding to a remote PTY — the wrapper then only emits `@data` and does not echo. This mirrors (but does not exactly match) `@wterm/react`'s "if `onData` is set, no echo" behavior.
- **Peer externalisation.** `vite.config.ts` externalises `vue`, `@wterm/dom`, and `@wterm/core`. If you add a runtime dep that should be bundled, update `rollupOptions.external`.
- **`packageManager` is pinned** to `pnpm@10.33.0` via corepack. Don't swap for npm/yarn — the workspace relies on pnpm's `workspace:*` protocol (playground depends on the root package that way).
- The playground is **not** published; it's a pnpm workspace member purely to consume the lib locally via symlink.

## Reference: upstream

Model after `vercel-labs/wterm`'s `packages/@wterm/react` when shapes need to match (props, events, exposed methods). The WASM binary is embedded in `@wterm/dom` — no extra asset copy needed.
