import type { NuxtModule } from '@nuxt/schema'
import { createRequire } from 'node:module'
import { addComponent, addImports, defineNuxtModule } from '@nuxt/kit'

// Resolve paths against this module's own location — follows pnpm symlinks
// the same way a normal `import` would, so Nuxt/Vite sees real file paths
// (not bare specifiers that would be re-resolved against the consuming app).
const require = createRequire(import.meta.url)
const wtermVue = require.resolve('@itsmelouis/wterm-vue')
const wtermVueCss = require.resolve('@itsmelouis/wterm-vue/css')
const wtermDomCss = require.resolve('@wterm/dom/css')

export interface ModuleOptions {
  /**
   * Register the `<Terminal>` component globally. Default `true`.
   */
  components?: boolean
  /**
   * Inject the `@itsmelouis/wterm-vue/css` stylesheet. Default `true`.
   */
  css?: boolean
  /**
   * Prefix for the registered component name. `''` keeps `<Terminal>`,
   * `'W'` gives `<WTerminal>`. Default `''`.
   */
  prefix?: string
  /**
   * Register the auto-imported composables (`useTerminal`,
   * `useWebSocketTransport`). Default `true`.
   */
  composables?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@itsmelouis/wterm-vue/nuxt',
    configKey: 'wterm',
    compatibility: { nuxt: '>=3.0.0' },
  },
  defaults: {
    components: true,
    css: true,
    prefix: '',
    composables: true,
  },
  setup(options, nuxt) {
    if (options.css) {
      nuxt.options.css ||= []
      for (const href of [wtermDomCss, wtermVueCss]) {
        if (!nuxt.options.css.includes(href))
          nuxt.options.css.push(href)
      }
    }

    if (options.components) {
      // `<Terminal>` is registered as an "all" component: `Terminal.vue`
      // defers every WASM/DOM interaction to `onMounted`, so SSR renders
      // a bare `<div>`. Using `mode: 'client'` would wrap it in
      // `<ClientOnly>`, which breaks template refs.
      addComponent({
        name: `${options.prefix ?? ''}Terminal`,
        export: 'Terminal',
        filePath: wtermVue,
      })
    }

    if (options.composables) {
      addImports([
        { name: 'useTerminal', from: wtermVue },
        { name: 'useWebSocketTransport', from: wtermVue },
      ])
    }
  },
}) as NuxtModule<ModuleOptions>
