import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// 回归极简，彻底抛弃出 Bug 的 SSR 引擎
export default defineConfig({
  integrations: [svelte()]
});