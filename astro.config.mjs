import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  
  adapter: cloudflare({
    platformProxy: {
      enabled: true 
    }
  }),
  
  integrations: [svelte()],
  
  vite: {
    plugins: [
      tailwindcss(),
      
      // 👇 终极防御：无视路径，全盘绞杀任何 HTML 注入
      {
        name: 'crush-tailwind-html-injection',
        enforce: 'post',
        config(config, { isSsrBuild }) {
          if (isSsrBuild && config.build?.rollupOptions?.input) {
            const input = config.build.rollupOptions.input;
            
            // 1. 如果是单字符串绝对路径，且以 .html 结尾
            if (typeof input === 'string' && input.endsWith('.html')) {
              config.build.rollupOptions.input = undefined;
            } 
            // 2. 如果是数组，过滤掉所有 .html 文件
            else if (Array.isArray(input)) {
              config.build.rollupOptions.input = input.filter(i => !i.endsWith('.html'));
              if (config.build.rollupOptions.input.length === 0) {
                config.build.rollupOptions.input = undefined;
              }
            } 
            // 3. 如果是对象形式的入口，剔除 .html 属性
            else if (typeof input === 'object' && input !== null) {
              for (const key in input) {
                if (input[key].endsWith('.html')) {
                  delete input[key];
                }
              }
              if (Object.keys(input).length === 0) {
                config.build.rollupOptions.input = undefined;
              }
            }
          }
        }
      }
      
    ]
  }
});