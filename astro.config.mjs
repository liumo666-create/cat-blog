import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

export default defineConfig({
  site: "https://catblog.fanyouhao.top/",
  base: "/",
  trailingSlash: "always",
  output: "static",
  integrations: [svelte()],
  vite: {
    build: {
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      cssMinify: "esbuild",
    },
  },
});
