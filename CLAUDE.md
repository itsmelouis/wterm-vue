# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A pnpm monorepo for [`@itsmelouis/wterm-vue`](./packages/wterm-vue) — a Vue 3 SFC wrapper around [`@wterm/dom`](https://www.npmjs.com/package/@wterm/dom), itself a DOM-based terminal emulator backed by a Zig/WASM core. There is no upstream Vue package from `vercel-labs/wterm`; this is an independent addon following the same API shape as `@wterm/react`.

## Layout

- `packages/wterm-vue/` — the published library. All source, configs, and the consumer-facing README live here. The Nuxt module ships as a subpath export (`@itsmelouis/wterm-vue/nuxt`, built from `src/nuxt.ts`) — not a separate package.
- `playground/vue/` — pnpm workspace member (`playground-vue`), Vite-based demo consuming the lib via `workspace:*` symlink. Hosts the remote-PTY Vite plugin for the `useWebSocketTransport` demo.
- `playground/nuxt/` — pnpm workspace member (`playground-nuxt`), Nuxt 4 app that consumes the Nuxt module via `modules: ['@itsmelouis/wterm-vue/nuxt']`.
- Root — meta only: `package.json` (private), `pnpm-workspace.yaml`, lockfile, this file, root README.

`pnpm-workspace.yaml` globs `packages/*` and `playground/*`, so a new sibling package goes under `packages/<name>/` and a new demo app under `playground/<name>/`.

## Commands

Run from the repo root unless noted.

```bash
corepack enable          # once, to activate pinned pnpm version
pnpm install             # installs every workspace
pnpm build               # → pnpm --filter @itsmelouis/wterm-vue build
pnpm dev                 # → pnpm --filter playground-vue dev (runs on :5173)
pnpm dev:nuxt            # → pnpm --filter playground-nuxt dev (runs on :3000)
pnpm type-check          # → pnpm -r --parallel --if-present type-check
pnpm playground:vue:build    # production build of the Vite demo
pnpm playground:nuxt:build   # production build of the Nuxt demo
```

The library `build` script (in `packages/wterm-vue/package.json`) splits responsibilities: **Vite library mode** emits the JS bundle + sourcemap to `dist/wterm-vue.js`; **vue-tsc** emits `.d.ts` only (via `tsconfig.build.json` which sets `emitDeclarationOnly`). Both must succeed.

## Architecture (`packages/wterm-vue/src/`)

- `Terminal.vue` — the component. Instantiates `new WTerm(el, opts)` in `onMounted`, calls `wt.init()` (async WASM load), `destroy()` in `onBeforeUnmount`. Syncs `cols/rows/cursorBlink` via `watch`. Emits `data | title | resize | ready | error`. Exposes `write / resize / focus / instance` via `defineExpose`.
- `useTerminal.ts` — sugar composable returning `{ terminalRef, write, resize, focus }` where `terminalRef` is the template ref for the component.
- `types.ts` — `TerminalProps` and `TerminalInstance` interfaces. Kept separate so they can be re-exported cleanly (vue-tsc + `.vue` type re-exports are awkward otherwise).
- `terminal.css` — single `@import "@wterm/dom/css"`. Relies on Vite/webpack resolving bare npm specifiers in CSS. Published as-is under the `./css` subpath export.
- `index.ts` — barrel; also does `export * from "@wterm/dom"` so consumers get `WTerm`, `WebSocketTransport`, etc. without a second import.

## Non-obvious gotchas

- **Use `shallowRef`, not `ref`, for the `WTerm` instance.** Vue's deep `UnwrapRef` mapped type loses the nominal identity of classes with private fields (`WTerm` has several), which surfaces as a TS2322 at build time. Same rule applies in `useTerminal` for `terminalRef`. Never switch these back to `ref()`.
- **`echo` prop semantics** (default `true`): when true, the wrapper always writes typed input back via `wterm.value?.write(data)` so the terminal behaves standalone. Set to `false` when forwarding to a remote PTY — the wrapper then only emits `@data` and does not echo. This mirrors (but does not exactly match) `@wterm/react`'s "if `onData` is set, no echo" behavior.
- **Peer externalisation.** `packages/wterm-vue/vite.config.ts` externalises `vue`, `@wterm/dom`, and `@wterm/core`. If you add a runtime dep that should be bundled, update `rollupOptions.external`.
- **`packageManager` is pinned** to `pnpm@10.33.0` at the repo root via corepack. Don't swap for npm/yarn — the workspace relies on pnpm's `workspace:*` protocol.
- The playgrounds are **not** published; they're pnpm workspace members (`playground-vue`, `playground-nuxt`) purely to consume the lib locally via symlink.
- The Nuxt module (`src/nuxt.ts`) resolves the lib and `@wterm/dom/css` paths via `createRequire(import.meta.url)` so Nuxt/Vite sees real file paths. Don't reintroduce bare specifiers here — they get re-resolved against the consuming app's `node_modules` and break for pnpm users.
- `<Terminal>` is registered as an "all" component (SSR + client), **not** `mode: 'client'`. The component defers every WASM/DOM interaction to `onMounted`, so SSR renders a bare `<div>`; switching to `mode: 'client'` wraps it in `<ClientOnly>` which breaks template refs.
- `@nuxt/kit` is an **optional** peer dep of the lib (via `peerDependenciesMeta`). Consumers using the main entry (`import { Terminal } from '@itsmelouis/wterm-vue'`) don't pull Nuxt; only those using `/nuxt` do.
- Vite builds two entries (`wterm-vue.js` + `nuxt.js`) via `build.lib.entry` as an object. `@nuxt/kit`, `@nuxt/schema`, and `/^node:/` must stay in `rollupOptions.external`.

## Reference: upstream

Model after `vercel-labs/wterm`'s `packages/@wterm/react` when shapes need to match (props, events, exposed methods). The WASM binary is embedded in `@wterm/dom` — no extra asset copy needed.
