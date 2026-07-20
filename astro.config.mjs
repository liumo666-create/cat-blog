import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  // 把原来的 hybrid 改成 static
  output: 'static',
  
  // 接入 Cloudflare Pages 适配器
  adapter: cloudflare({
    platformProxy: {
      enabled: true 
    }
  })
});