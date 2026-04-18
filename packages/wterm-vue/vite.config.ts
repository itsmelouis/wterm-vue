import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "WTermVue",
      formats: ["es"],
      fileName: () => "wterm-vue.js",
    },
    sourcemap: true,
    rollupOptions: {
      external: ["vue", "@wterm/dom", "@wterm/core"],
      output: {
        globals: {
          vue: "Vue",
          "@wterm/dom": "WTermDom",
          "@wterm/core": "WTermCore",
        },
      },
    },
  },
});
