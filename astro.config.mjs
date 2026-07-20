import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  // 开启混合渲染模式：默认全局纯静态，只对特定的 API 或页面开启动态 SSR
  output: 'hybrid',
  
  // 接入 Cloudflare Pages 适配器
  adapter: cloudflare({
    platformProxy: {
      enabled: true // 允许在本地开发环境模拟读取 D1 和 R2
    }
  })
});