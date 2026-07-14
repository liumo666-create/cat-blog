import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://catblog.fanyouhao.top/",
  base: "/",
  trailingSlash: "always",
  output: "static",
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      cssMinify: "esbuild",
    },
  },
});
