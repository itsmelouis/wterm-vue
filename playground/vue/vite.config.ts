import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { ptyPlugin } from './pty-plugin'

export default defineConfig({
  plugins: [vue(), ptyPlugin()],
  server: {
    port: 5173,
  },
})
