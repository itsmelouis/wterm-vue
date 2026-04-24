export default defineNuxtConfig({
  modules: ['@itsmelouis/wterm-vue/nuxt'],
  devtools: { enabled: false },
  compatibilityDate: '2025-01-01',
  vite: {
    optimizeDeps: {
      include: ['@wterm/dom'],
    },
  },
  wterm: {
    // All defaults: <Terminal> auto-registered, composables auto-imported,
    // CSS injected. Tweak here to verify the options surface.
  },
})
