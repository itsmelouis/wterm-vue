import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: {
        'wterm-vue': resolve(__dirname, 'src/index.ts'),
        'nuxt': resolve(__dirname, 'src/nuxt.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      external: [
        'vue',
        '@wterm/dom',
        '@wterm/core',
        '@nuxt/kit',
        '@nuxt/schema',
        /^node:/,
      ],
      output: {
        globals: {
          'vue': 'Vue',
          '@wterm/dom': 'WTermDom',
          '@wterm/core': 'WTermCore',
        },
      },
    },
  },
})
