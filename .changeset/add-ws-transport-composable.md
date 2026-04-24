---
"@itsmelouis/wterm-vue": patch
---

Add `useWebSocketTransport()` composable — idiomatic Vue wrapper around `WebSocketTransport` from `@wterm/dom`. Provides a reactive `connected` ref, automatic lifecycle management on scope dispose, optional auto-wiring to a terminal ref, and URL-change-triggered reconnects.
