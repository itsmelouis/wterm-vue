---
"@itsmelouis/wterm-vue": patch
---

Add a Nuxt module shipped as a subpath export at `@itsmelouis/wterm-vue/nuxt`. It auto-registers the `<Terminal>` component, auto-imports `useTerminal()` and `useWebSocketTransport()`, and injects the CSS. Enable it via `modules: ['@itsmelouis/wterm-vue/nuxt']` in `nuxt.config.ts`.

Options (via the `wterm` key in `nuxt.config.ts`): `components`, `composables`, `css`, `prefix`.
