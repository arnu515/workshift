// @ts-check

import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      src: path.resolve("./src"),
      $lib: path.resolve("./src/lib"),
      $assets: path.resolve("./src/assets"),
      $routes: path.resolve("./src/routes")
    }
  }
});
