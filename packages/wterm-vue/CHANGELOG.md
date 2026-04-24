# @itsmelouis/wterm-vue

## 0.1.2

### Patch Changes

- 505b08e: Add `debug` prop to `<Terminal>` for parity with `@wterm/react`. Forwards to the underlying `WTerm` instance and exposes a `DebugAdapter` (via `ref.instance`) for inspecting escape sequences, cell data, render performance, and unhandled CSI sequences. Bumps `@wterm/dom` peer to `^0.1.9` (required for the `debug` option).
- 48ec41f: Add a Nuxt module shipped as a subpath export at `@itsmelouis/wterm-vue/nuxt`. It auto-registers the `<Terminal>` component, auto-imports `useTerminal()` and `useWebSocketTransport()`, and injects the CSS. Enable it via `modules: ['@itsmelouis/wterm-vue/nuxt']` in `nuxt.config.ts`.

  Options (via the `wterm` key in `nuxt.config.ts`): `components`, `composables`, `css`, `prefix`.

- 215ff38: Add `useWebSocketTransport()` composable — idiomatic Vue wrapper around `WebSocketTransport` from `@wterm/dom`. Provides a reactive `connected` ref, automatic lifecycle management on scope dispose, optional auto-wiring to a terminal ref, and URL-change-triggered reconnects.
