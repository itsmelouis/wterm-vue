---
"@itsmelouis/wterm-vue": patch
---

Add `debug` prop to `<Terminal>` for parity with `@wterm/react`. Forwards to the underlying `WTerm` instance and exposes a `DebugAdapter` (via `ref.instance`) for inspecting escape sequences, cell data, render performance, and unhandled CSI sequences. Bumps `@wterm/dom` peer to `^0.1.9` (required for the `debug` option).
