# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A pnpm monorepo for [`@itsmelouis/wterm-vue`](./packages/wterm-vue) — a Vue 3 SFC wrapper around [`@wterm/dom`](https://www.npmjs.com/package/@wterm/dom), itself a DOM-based terminal emulator backed by a Zig/WASM core. There is no upstream Vue package from `vercel-labs/wterm`; this is an independent addon following the same API shape as `@wterm/react`.

## Layout

- `packages/wterm-vue/` — the published library. All source, configs, and the consumer-facing README live here.
- `playground/` — pnpm workspace member, **not** published. Consumes the lib via `workspace:*` symlink.
- Root — meta only: `package.json` (private), `pnpm-workspace.yaml`, lockfile, this file, root README.

When adding a new sibling package (e.g. a Nuxt module), create it under `packages/<name>/` — `pnpm-workspace.yaml` already globs `packages/*`.

## Commands

Run from the repo root unless noted.

```bash
corepack enable          # once, to activate pinned pnpm version
pnpm install             # installs every workspace
pnpm build               # → pnpm --filter @itsmelouis/wterm-vue build
pnpm dev                 # → pnpm --filter playground dev (runs on :5173)
pnpm type-check          # → pnpm -r --parallel --if-present type-check
pnpm playground:build    # production build of the demo app
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
- The playground is **not** published; it's a pnpm workspace member purely to consume the lib locally via symlink.

## Reference: upstream

Model after `vercel-labs/wterm`'s `packages/@wterm/react` when shapes need to match (props, events, exposed methods). The WASM binary is embedded in `@wterm/dom` — no extra asset copy needed.
