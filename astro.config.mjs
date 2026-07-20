import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import svelte from '@astrojs/svelte';

export default defineConfig({
  // 保持 Serverless 云端渲染模式
  output: 'server',
  
  // 接入 Cloudflare
  adapter: cloudflare({
    platformProxy: {
      enabled: true 
    }
  }),
  
  // 恢复你的 Svelte 支持
  integrations: [svelte()]
});