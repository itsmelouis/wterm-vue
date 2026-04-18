<div align="center">

# @itsmelouis/wterm-vue

[![npm](https://img.shields.io/npm/v/@itsmelouis/wterm-vue?style=flat-square)](https://www.npmjs.com/package/@itsmelouis/wterm-vue)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)
[![Vue](https://img.shields.io/badge/vue-3.4+-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org)

A Vue 3 wrapper around [`@wterm/dom`](https://www.npmjs.com/package/@wterm/dom) — a terminal emulator for the web.

`<Terminal>` component and `useTerminal()` composable with idiomatic Vue 3 events and template refs.

[Install](#install) • [Usage](#usage) • [API](#api) • [Development](#development)

</div>

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

## Features

- **Vue 3 idiomatic** — Props, events, template refs, `defineExpose`
- **Composable** — `useTerminal()` for ergonomic ref + method access
- **Themes** — Built-in `solarized-dark`, `monokai`, `light` via CSS custom properties
- **Echo control** — Standalone mode or remote PTY forwarding
- **Lightweight** — Thin wrapper, no extra runtime beyond `@wterm/dom`

## API

See the full [API documentation](./packages/wterm-vue/README.md) for props, events, exposed methods, and composable usage.

## Development

```bash
corepack enable          # once, to activate pinned pnpm
pnpm install
pnpm dev                 # runs the playground on :5173
pnpm build               # builds the library
pnpm type-check          # type-checks every workspace
pnpm playground:build    # production build of the playground
```

### Workspaces

- [`packages/wterm-vue`](./packages/wterm-vue) — the published library
- [`playground/`](./playground) — local dev app consuming the library via `workspace:*`

## License

MIT © [Louis F.](https://github.com/itsmelouis)
