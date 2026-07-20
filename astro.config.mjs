import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

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
  integrations: [svelte()],
  
  vite: {
    plugins: [
      tailwindcss(),
      
      // 👇 极客补丁：专门拦截 Tailwind v4 的无理要求
      {
        name: 'fix-tailwind-ssr-bug',
        enforce: 'post', // 确保在 Tailwind 之后运行
        config(config, { isSsrBuild }) {
          if (isSsrBuild && config.build?.rollupOptions) {
            const input = config.build.rollupOptions.input;
            // 如果是服务端编译，且 Tailwind 强行塞了 HTML，直接清空它！
            if (input === 'index.html' || (Array.isArray(input) && input.includes('index.html'))) {
              config.build.rollupOptions.input = undefined;
            }
          }
        }
      }
      
    ]
  }
});