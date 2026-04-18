# wterm-vue

Monorepo for [`@itsmelouis/wterm-vue`](./packages/wterm-vue) — a Vue 3 wrapper around [`@wterm/dom`](https://www.npmjs.com/package/@wterm/dom).

## Workspaces

- [`packages/wterm-vue`](./packages/wterm-vue) — the published library. See its [README](./packages/wterm-vue/README.md) for usage.
- [`playground/`](./playground) — local dev app consuming the library via `workspace:*`.

## Development

```bash
corepack enable          # once, to activate pinned pnpm
pnpm install
pnpm dev                 # runs the playground on :5173
pnpm build               # builds the library
pnpm type-check          # type-checks every workspace that exposes a type-check script
pnpm playground:build    # production build of the playground
```

## License

MIT
