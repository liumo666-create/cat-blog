import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  // 开启全局 Serverless 模式，完美避开 Vite 的静态打包 Bug
  output: 'server',
  
  // 接入 Cloudflare Pages 适配器
  adapter: cloudflare({
    platformProxy: {
      enabled: true 
    }
  })
});