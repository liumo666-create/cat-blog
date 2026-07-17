# Cat Blog — 像素风格个人博客 · 完整开发指南

基于 **Astro 6.3** + **Svelte 5** + **Tailwind CSS 4** 构建的像素风格单页个人博客（SPA）。灵感源自 Mizuki 模板但完全重写，所有交互均由原生 JavaScript 驱动。

> **本文档目标读者**：其他 AI 助手（如 Gemini、Claude），它们无法直接读取整个工程文件，因此本文档将详细描述每一个文件的完整内容、功能实现原理、CSS 动画机制、JavaScript 数据流，使 AI 能够理解并修改此项目。

---

## 目录

1. [技术栈](#1-技术栈)
2. [项目文件结构](#2-项目文件结构)
3. [npm 脚本](#3-npm-脚本)
4. [全局 CSS 变量体系](#4-全局-css-变量体系)
5. [文件详解](#5-文件详解)
6. [组件详解](#6-组件详解)
7. [主页面 index.astro 详解](#7-主页面-indexastro-详解)
8. [主题切换（昼夜模式）](#8-主题切换昼夜模式)
9. [数据持久化（localStorage）](#9-数据持久化localstorage)
10. [构建与部署](#10-构建与部署)
11. [添加新功能的步骤](#11-添加新功能的步骤)
12. [附录](#12-附录)

---
## 1. 技术栈

| 分类 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | Astro | 6.3.0 | 静态站点生成器，构建入口框架 |
| UI 框架 | Svelte | 5.55.5 | 组件框架（通过 @astrojs/svelte 集成） |
| CSS | Tailwind CSS | 4.2.4 | 工具类 CSS 框架（通过 @tailwindcss/vite 集成） |
| 类型检查 | TypeScript | 5.9.3 | 类型系统 |
| 语言工具 | @astrojs/check | 0.9.9 | Astro 类型检查工具 |
| 包管理器 | pnpm | 10.33.0 | 强制使用 pnpm（通过 preinstall 脚本 only-allow） |
| PostCSS | postcss-import | 16.1.1 | CSS @import 内联 |
| PostCSS | postcss-nesting | 14.0.0 | CSS 嵌套语法支持 |
| 格式化 | Prettier | 3.8.3 | 代码格式化（含 prettier-plugin-astro） |
| ESLint | @typescript-eslint/parser | 8.59.2 | TypeScript ESLint 解析器 |

### 关键依赖说明

- **Astro 6.3**：核心框架，处理 .astro 文件的编译和 SSG 输出。本项目为纯静态站点（`output: "static"`）。
- **@astrojs/svelte**：让 Astro 可以在 .astro 文件中嵌入 Svelte 组件。本项目虽然配置了 Svelte，但当前所有组件均为纯 Astro + 原生 JS，Svelte 预留给未来复杂交互组件。
- **@tailwindcss/vite**：Tailwind CSS 4 的 Vite 插件。注意 global.css 中 Tailwind 的 @import 当前被注释掉了，所有样式均为手写 CSS。
- **postcss-nesting**：允许在 CSS 中使用类似 SCSS 的嵌套语法。
- **pnpm**：通过 preinstall 脚本强制使用 pnpm，禁止 npm/yarn 安装。

---
## 2. 项目文件结构

```
cat-blog/
├── astro.config.mjs          # Astro 主配置（站点 URL、集成、Vite 选项）
├── tsconfig.json             # TypeScript 配置（路径别名 @components/*, @layouts/*, @/*）
├── svelte.config.js          # Svelte 预处理器配置（vitePreprocess）
├── postcss.config.mjs        # PostCSS 插件配置（postcss-import + postcss-nesting）
├── package.json              # 依赖和脚本
├── pnpm-lock.yaml            # pnpm 依赖锁文件
├── README.md                 # 本指南
├── public/                   # 静态资源（直接复制到构建输出）
│   ├── cat1.png ~ cat9.png   # 9 张随机猫咪头像（265-322 KB，像素风格 PNG）
│   ├── cat .webp             # 备用猫咪图片（8 KB）
│   ├── sakura.webp           # 樱花花瓣素材（6.2 KB，Canvas 粒子使用）
│   ├── day.png               # 日间模式背景图（1204 KB）
│   ├── hero-night.png        # 夜间模式 Hero 横幅背景（2282 KB）
│   ├── hero-day.png          # 日间模式 Hero 横幅背景（2259 KB）
│   ├── hero图.webp           # Hero 备用图（995 KB）
│   ├── dynamic_bg.webm       # 动态背景视频（540 KB，未在当前代码中使用）
│   └── ChatGPT Image ...png  # 前景装饰层（1084 KB）
├── src/
│   ├── env.d.ts              # Astro 客户端类型声明
│   ├── content.config.ts     # Astro 内容集合配置（当前为空集合）
│   ├── styles/
│   │   └── global.css        # 全局样式表（约 2221 行，包含所有 CSS 变量、动画、组件样式）
│   ├── layouts/
│   │   └── Layout.astro      # 全局布局壳（HTML5 结构、Google Fonts、主题初始化 JS）
│   ├── components/
│   │   ├── NavBar.astro      # 导航栏（Logo、导航链接、下拉菜单、主题切换按钮、SPA 导航）
│   │   ├── HeroBanner.astro  # Hero 横幅（打字机循环字幕效果）
│   │   ├── SakuraEffect.astro # Canvas 樱花粒子 + 点击爆发 + 自定义光标
│   │   ├── PostCard.astro    # 文章卡片组件（导出 Post 接口，当前未被 index.astro 使用）
│   │   └── Sidebar.astro     # 侧边栏组件（导出 Category 接口，当前未被 index.astro 使用）
│   └── pages/
│       └── index.astro       # 主页面（约 1056 行，SPA 风格的完整单页应用）
├── dist/                     # 构建输出（astro build 生成）
├── sucai/                    # 素材备份目录
└── node_modules/             # 依赖
```

---

## 3. npm 脚本

| 命令 | 作用 | 说明 |
|------|------|------|
| `pnpm dev` | 启动开发服务器 | 等同于 `astro dev`，默认 http://localhost:4321 |
| `pnpm start` | 同 pnpm dev | 启动开发服务器 |
| `pnpm build` | 生产构建 | 输出到 `dist/` 目录 |
| `pnpm preview` | 预览生产构建 | 先运行 pnpm build，然后本地预览 dist |
| `pnpm astro` | Astro CLI | 原始 Astro 命令行入口 |
| `pnpm preinstall` | 自动钩子 | 强制使用 pnpm，若用 npm/yarn 则报错退出 |

运行方式：

```bash
pnpm install    # 安装依赖
pnpm dev        # 开发模式（热更新）
pnpm build      # 生产构建
pnpm preview    # 预览构建结果
```

---
## 4. 全局 CSS 变量体系

所有 CSS 自定义属性定义在 `src/styles/global.css` 的 `:root` 伪类中，日间模式覆盖定义在 `.game-scene.day-mode` 选择器中。

### 4.1 颜色系统（12 色调）

| 变量名 | 夜间值 | 日间值 | 用途 |
|--------|--------|--------|------|
| `--pink` | `#ff6b9d` | `#d9466f` | 主强调色（粉色系） |
| `--cyan` | `#5eead4` | `#0d9488` | 副强调色（青色系） |
| `--yellow` | `#fbbf24` | `#c2832a` | 主题切换按钮/警告色 |
| `--purple` | `#a78bfa` | `#7c6db8` | 紫色强调色 |
| `--orange` | `#fb923c` | `#d97a3e` | 橙色/天气温度色 |
| `--pink-soft` | `#f9a8c9` | `#e8889a` | 柔和粉色变体 |
| `--cyan-soft` | `#99f6e4` | `#5eb8a8` | 柔和青色变体 |
| `--text` | `#ebe4f2` | `#2a1f36` | 主文本色（暗底亮字 vs 亮底暗字） |
| `--text-secondary` | `#c4b5d8` | `#4a3d58` | 副文本色 |
| `--muted` | `#8a7a9e` | `#6b5c78` | 弱化文本色 |
| `--dim` | `#5c5070` | `#9a8aa8` | 最淡文本/装饰色 |
| `--deep` | `#080414` | `#f6f1e8` | 最深层背景色 |

**设计原则**：夜间模式深紫黑底 + 亮色文字，日间模式暖白底 + 深色文字。所有组件通过 `var(--xxx)` 引用变量，主题切换只需修改 `.game-scene.day-mode` 下的变量值。

### 4.2 毛玻璃材质（Glassmorphism）

| 变量名 | 夜间值 | 日间值 | 用途 |
|--------|--------|--------|------|
| `--deep-alt` | `#100a24` | `#ede5d8` | 略亮的背景替代色 |
| `--web` | `rgba(10,6,22,0.88)` | `rgba(255,252,246,0.9)` | 主内容面板底色（半透明） |
| `--card` | `rgba(18,12,38,0.62)` | `rgba(255,250,244,0.7)` | 卡片背景色 |
| `--card-hover` | `rgba(24,16,48,0.74)` | `rgba(255,248,240,0.82)` | 卡片悬停背景色 |
| `--hover` | `rgba(40,20,70,0.42)` | `rgba(220,200,180,0.5)` | 通用悬停高亮 |
| `--glass` | `rgba(16,10,34,0.6)` | `rgba(255,252,246,0.72)` | 轻玻璃效果 |
| `--glass-strong` | `rgba(20,14,40,0.78)` | `rgba(255,250,242,0.88)` | 强玻璃效果（下拉菜单） |

所有毛玻璃效果均使用 `backdrop-filter: blur()` 实现，关键代码模式：

```css
.glass-card {
  background: var(--card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px); /* Safari 兼容 */
  border: 1px solid var(--border-sub);
}
```

### 4.3 边框系统

| 变量名 | 用途 |
|--------|------|
| `--border-sub` | 低调边框（夜间 rgba 6% 白色 / 日间 6% 黑色） |
| `--border-hi` | 常规可见边框（夜间 rgba 10% 白色） |
| `--border-ac` | 强调边框（粉色系 30% 透明） |

### 4.4 辉光系统

| 变量名 | 用途 |
|--------|------|
| `--glow-pink` | 粉色辉光（box-shadow 使用） |
| `--glow-cyan` | 青色辉光 |
| `--glow-purple` | 紫色辉光 |
| `--glow-gold` | 金色辉光 |

### 4.5 字体系统

| 变量名 | 字体栈 | 用途 |
|--------|--------|------|
| `--font-pixel` | `"Pixelify Sans", "Courier New", monospace` | 像素风格标题和数字 |
| `--font-body` | `"Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", system-ui, sans-serif` | 正文 |
| `--font-mono` | `"JetBrains Mono", "Fira Code", "Courier New", monospace` | 代码/等宽 |

字体通过 Google Fonts 加载（在 Layout.astro 中引入 `Pixelify Sans`, `Noto Sans SC`, `JetBrains Mono`）。
### 4.6 圆角系统

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--radius-sm` | `12px` | 按钮、标签等小组件 |
| `--radius-md` | `16px` | 卡片、面板 |
| `--radius-lg` | `20px` | 大容器（web-wrapper、hero） |

### 4.7 过渡动画

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--transition-fast` | `0.2s cubic-bezier(0.4, 0, 0.2, 1)` | 快速交互（hover 颜色变化） |
| `--transition-smooth` | `0.4s cubic-bezier(0.4, 0, 0.2, 1)` | 标准过渡（卡片hover、边框变化） |
| `--transition-slow` | `0.7s cubic-bezier(0.4, 0, 0.2, 1)` | 慢速过渡 |

### 4.8 @property 注册（CSS Houdini）

```css
@property --glow-x1 { syntax: "<percentage>"; inherits: false; initial-value: 15%; }
@property --glow-y1 { syntax: "<percentage>"; inherits: false; initial-value: 30%; }
@property --glow-x2 { syntax: "<percentage>"; inherits: false; initial-value: 75%; }
@property --glow-y2 { syntax: "<percentage>"; inherits: false; initial-value: 60%; }
@property --liquid-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
```

这些 `@property` 注册使浏览器可以对自定义属性进行动画插值：

- `--glow-x1/y1/x2/y2`：控制背景液态流动辉光的四个径向渐变圆心位置，通过 `liquidFlow` 关键帧动画驱动。
- `--liquid-angle`：控制 `web-wrapper` 内部渐变旋转角度，通过 `liquidAngleShift` 动画驱动 360° 连续旋转。

**没有 `@property` 注册，浏览器无法对自定义属性做平滑动画插值（会直接跳变）。**

---

## 5. 文件详解

### 5.1 astro.config.mjs

```js
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
      assetsInlineLimit: 4096,   // 小于 4KB 的资源内联为 base64
      cssCodeSplit: true,        // CSS 代码分割
      cssMinify: "esbuild",     // 使用 esbuild 压缩 CSS
    },
  },
});
```

关键配置项：

- **site**：生产站点 URL，用于生成 sitemap 和规范 URL。
- **trailingSlash**：URL 尾部总是带 `/`。
- **output: "static"**：纯静态输出，无 SSR。
- **integrations**：注册 Svelte 集成。
- **assetsInlineLimit: 4096**：小于 4KB 的图片/字体会被内联为 base64 data URI。

### 5.2 tsconfig.json

```json
{
  "extends": "astro/tsconfigs/base",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"]
}
```

路径别名映射：

- `@components/NavBar.astro` -> `src/components/NavBar.astro`
- `@layouts/Layout.astro` -> `src/layouts/Layout.astro`
- `@/styles/global.css` -> `src/styles/global.css`

### 5.3 svelte.config.js

```js
import { vitePreprocess } from "@astrojs/svelte";
export default { preprocess: [vitePreprocess({ script: true })] };
```

VitePreprocess 允许在 Svelte 组件中使用 TypeScript 和现代 JS 语法。

### 5.4 postcss.config.mjs

```js
import postcssImport from "postcss-import";
import postcssNesting from "postcss-nesting";
export default {
  plugins: {
    "postcss-import": postcssImport,
    "postcss-nesting": postcssNesting,
  },
};
```

- **postcss-import**：使 CSS 中的 `@import` 语句被内联处理。
- **postcss-nesting**：支持 CSS 嵌套语法（类似 SCSS/Sass 嵌套）。

### 5.5 content.config.ts

```ts
import { defineCollection } from "astro:content";
export const collections = {};
```

当前为空对象。Astro 内容集合（Content Collections）用于管理 Markdown/MDX 文章，本项目目前不使用该功能（文章数据通过 localStorage 管理）。

### 5.6 env.d.ts

```ts
/// <reference types="astro/client" />
```

标准 Astro 类型声明引用，提供 `Astro` 全局对象的类型支持。

### 5.7 package.json（preinstall 钩子）

```json
"preinstall": "npx only-allow pnpm"
```

此脚本在 `npm install` / `yarn install` 时触发，检查包管理器是否为 pnpm，若不是则报错退出。

---
## 6. 组件详解

### 6.1 Layout.astro — 全局布局壳

**文件**：`src/layouts/Layout.astro`

该组件是整个 HTML 页面的骨架，所有页面内容通过 `<slot />` 插入。

**HTML 结构**：

- `<!doctype html>` 和 `<html lang="zh-CN">`
- `<head>` 中包含 meta charset、viewport、title、description、favicon（内联 SVG 猫字图标）、Google Fonts 预连接和加载
- `<SakuraEffect />` 组件（独立于 slot，全站生效）
- `<slot />` 用于子页面内容注入

**内联 JS 功能（三个全局系统）**：

#### A. 主题初始化系统

```js
var SCENE = '.game-scene';
var BTN = '.theme-toggle-btn';
var KEY = 'fyh-theme';
```

- `updateRipple()`：计算主题切换按钮中心点相对于 `.game-scene` 的百分比坐标，设置为 `--ripple-x` 和 `--ripple-y` CSS 变量。
- `setTheme(t)`：先调用 `updateRipple()`，然后添加/移除 `day-mode` 类（scene）和 `day` 类（按钮），并将选择存入 `localStorage`。
- `toggle()`：在 day/night 之间切换。
- `init()`：页面加载时从 localStorage 读取上次主题选择并应用（默认夜间模式）。
- 事件绑定：`document.addEventListener('click', ...)` 委托监听 `.theme-toggle-btn`；`window.addEventListener('resize', updateRipple)` 响应窗口大小变化。

#### B. 鼠标辉光追踪（post-card 和 glass-card 的 --mouse-x/y）

```js
document.addEventListener('mousemove', function(e) {
  document.querySelectorAll('.post-card, .glass-card').forEach(function(c) {
    var r = c.getBoundingClientRect();
    c.style.setProperty('--mouse-x', ((e.clientX - r.left) / r.width) * 100 + '%');
    c.style.setProperty('--mouse-y', ((e.clientY - r.top) / r.height) * 100 + '%');
  });
});
```

实时更新 `.post-card` 和 `.glass-card` 元素上的 `--mouse-x` / `--mouse-y` CSS 变量。这些变量被 `.post-card::after` 伪元素的 `radial-gradient` 引用，产生跟随鼠标的辉光效果。

#### C. 玻璃卡片辉光追踪（glass-card 的 --mc-x/y）

```js
document.addEventListener('mousemove', function(e) {
  document.querySelectorAll('.glass-card').forEach(function(c) {
    var r = c.getBoundingClientRect();
    c.style.setProperty('--mc-x', ((e.clientX - r.left) / r.width) * 100 + '%');
    c.style.setProperty('--mc-y', ((e.clientY - r.top) / r.height) * 100 + '%');
  });
});
```

同上逻辑，但设置 `--mc-x` / `--mc-y`，被 `.glass-card::after` 的 `radial-gradient` 使用。

**注意**：这两个 mousemove 监听器是分开注册的（历史上可能是增量添加），可以合并为一个以提高性能。

### 6.2 global.css — 全局样式详解

**文件**：`src/styles/global.css`（约 2221 行）

#### 6.2.1 背景液态流动辉光（liquidFlow 动画）

```css
.game-scene::before {
  background:
    radial-gradient(ellipse at var(--glow-x1) var(--glow-y1), rgba(255,107,157,0.1) 0%, transparent 55%),
    radial-gradient(ellipse at var(--glow-y2) var(--glow-x1), rgba(94,234,212,0.07) 0%, transparent 55%),
    radial-gradient(ellipse at var(--glow-x2) var(--glow-y2), rgba(167,139,250,0.09) 0%, transparent 55%),
    radial-gradient(ellipse at var(--glow-y1) var(--glow-x2), rgba(251,191,36,0.05) 0%, transparent 50%);
  animation: liquidFlow 14s ease-in-out infinite alternate;
}

@keyframes liquidFlow {
  0%   { --glow-x1: 18%; --glow-y1: 25%; --glow-x2: 72%; --glow-y2: 55%; opacity: 0.8; }
  25%  { --glow-x1: 28%; --glow-y1: 18%; --glow-x2: 68%; --glow-y2: 65%; opacity: 1; }
  50%  { --glow-x1: 35%; --glow-y1: 30%; --glow-x2: 80%; --glow-y2: 40%; opacity: 0.85; }
  75%  { --glow-x1: 22%; --glow-y1: 35%; --glow-x2: 65%; --glow-y2: 58%; opacity: 1; }
  100% { --glow-x1: 15%; --glow-y1: 28%; --glow-x2: 78%; --glow-y2: 52%; opacity: 0.9; }
}
```

**原理**：4 个径向渐变充当"光斑"，通过 `@keyframes` 在 5 个关键帧之间移动 `--glow-x1/y1/x2/y2` 坐标。每个渐变的圆心由这些变量控制，浏览器通过 `@property` 注册进行平滑插值，创造出类似液态流动的视觉效果。动画周期 14 秒，`alternate`（往返），`ease-in-out` 缓动。

#### 6.2.2 clip-path 圆形波纹主题切换

```css
.game-scene::after {
  background-image: url("/day.png");
  background-size: cover;
  clip-path: circle(0% at var(--ripple-x, 50%) var(--ripple-y, 50%));
  transition: clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.game-scene.day-mode::after {
  clip-path: circle(150% at var(--ripple-x, 50%) var(--ripple-y, 50%));
}
```

**原理**：

- 夜间模式：`clip-path: circle(0% ...)` 完全裁剪掉日间背景图（半径 0%）。
- 日间模式：`clip-path: circle(150% ...)` 显示完整的日间背景图（半径 150% 覆盖全场景）。
- `--ripple-x` 和 `--ripple-y` 由 Layout.astro 中的 JS 动态设置（主题按钮中心坐标）。
- 切换时 `transition: clip-path 0.8s` 产生以按钮为中心的圆形展开/收缩波纹效果。

#### 6.2.3 web-wrapper 旋转渐变（liquidAngleShift 动画）

```css
.web-wrapper::before {
  background:
    linear-gradient(var(--liquid-angle), rgba(255,107,157,0.04), transparent 40%, transparent 60%, rgba(94,234,212,0.04)),
    linear-gradient(calc(var(--liquid-angle) + 120deg), rgba(167,139,250,0.03), transparent 50%, transparent 50%, rgba(251,191,36,0.03));
  animation: liquidAngleShift 10s linear infinite;
}

@keyframes liquidAngleShift {
  0% { --liquid-angle: 0deg; }
  100% { --liquid-angle: 360deg; }
}
```

**原理**：两个 `linear-gradient` 按不同角度（相差 120°）旋转，`--liquid-angle` 从 0° 到 360° 连续动画。通过 `@property` 注册使角度动画平滑。产生类似缓慢旋转的光扫效果。

#### 6.2.4 毛玻璃卡片系统（.glass-card）

毛玻璃卡片有 3 层视觉效果叠加：

1. **base 层**：半透明背景 + `backdrop-filter: blur(16px)`
2. **::before 层**：45° 对角线高光渐变（`rgba(255,255,255,0.05)` -> `transparent`），静态
3. **::after 层**：鼠标追踪辉光（`radial-gradient` at `--mc-x`/`--mc-y`），hover 时 opacity 从 0 -> 1

```css
.glass-card {
  background: var(--card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-sub);
  border-radius: var(--radius-md);
  padding: 16px;
  transition: all var(--transition-smooth);
}
.glass-card:hover {
  border-color: var(--border-ac);
  box-shadow: 0 8px 32px var(--glow-pink), 0 0 0 1px rgba(255,107,157,0.08);
  transform: translateY(-2px);
}
```

#### 6.2.5 文章卡片（.post-card）

与 `.glass-card` 类似但功能更丰富：

- **::before**：静态对角线高光
- **::after**：鼠标追踪粉色辉光（`radial-gradient` at `--mouse-x`/`--mouse-y`，`rgba(255,107,157,0.09)`）
- hover 时 `transform: translateY(-4px)` + 粉色边框 + box-shadow

子元素样式：

- `.post-date`：JetBrains Mono 等宽字体，`font-size: 11px`，`color: var(--dim)`
- `.post-title`：正文 17px bold
- `.post-excerpt`：14px muted 色
- `.post-meta > .tag`：紫色背景小标签
- `.post-meta > .cat`：粉色边框分类标签

#### 6.2.6 Hero 横幅

```css
.hero-banner {
  width: 100%; height: 200px;
  background-image: url("/hero-night.png");
  background-size: cover;
  border: 1px solid var(--border-hi);
  border-radius: var(--radius-lg);
}
.game-scene.day-mode .hero-banner {
  background-image: url("/hero-day.png");
}
```

主题切换时替换背景图。`::before` 伪元素创建底部渐变遮罩（`transparent -> var(--deep)`），使文字可读。

#### 6.2.7 樱花动画 CSS 部分

在 `SakuraEffect.astro` 中定义：

**自定义光标**：

```css
body {
  cursor: url("data:image/svg+xml;utf8,...粉色像素箭头...") 2 2, auto;
}
a, button, .cat-wrap, .post-card, ... {
  cursor: url("data:image/svg+xml;utf8,...青色像素箭头...") 2 2, pointer !important;
}
```

- 默认光标：粉色（#ff66cc）像素风箭头 SVG data URI
- 可交互元素光标：青色（#66ffcc）像素风箭头 SVG data URI
- 热点坐标 (2, 2)

**点击爆发粒子**：

```css
.click-sakura {
  position: fixed; pointer-events: none; z-index: 9999;
  width: 16px; height: 16px;
  background-image: url("/sakura.webp");
  transform: translate(-50%, -50%) scale(0.3) rotate(0deg);
  opacity: 1;
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s ease-in;
}
```

JS 创建元素时设置初始位置，然后修改 transform 和 opacity，CSS transition 处理动画。每个粒子 600ms 后从 DOM 移除。

#### 6.2.8 页面切换动画

```css
.section-page { animation: pageOut 0.25s ease forwards; }
.section-page.active { animation: pageIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

@keyframes pageIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pageOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

每个 `.section-page` 都绑定了 `pageOut` 动画，激活时覆盖为 `pageIn`。新页面从下方 12px 淡入，旧页面淡出。
### 6.3 NavBar.astro — 导航栏

**文件**：`src/components/NavBar.astro`

#### 结构

1. **Logo 区域**：`.cat-wrap`（58x58px 可点击猫咪图片容器）+ `.logo-text`（"FYH BLOG" + "像素天堂"）
2. **导航链接**：首页、链接（下拉菜单：抖音/B站/GitHub）、空间（下拉菜单：相册/写文章）、项目、关于
3. **主题切换按钮**：月亮/太阳 SVG 图标切换

#### JS 功能 1：随机猫咪（cat randomizer）

```js
function randomCat() {
  var m = (catLogo.src || '').match(/cat(\d+)\.png$/);
  var cur = m ? parseInt(m[1], 10) : -1;
  var n;
  do { n = Math.floor(Math.random() * 9) + 1; } while (n === cur && 9 > 1);
  catLogo.src = '/cat' + n + '.png';
}
```

- 页面加载时启动 500ms 间隔定时器，自动循环替换猫咪图片（cat1.png ~ cat9.png，共 9 张）
- 点击猫咪时重置定时器（重新以 500ms 间隔轮换）
- 保证连续两次不出现同一张图片（do-while 循环排除当前图片）
- 所有猫咪图片为像素风格 PNG（265-322 KB）

#### JS 功能 2：下拉菜单

- 两个下拉菜单：`data-dropdown="links"`（抖音/B站/GitHub）和 `data-dropdown="space"`（相册/写文章）
- 交互方式：hover 展开 + 200ms 延迟关闭 + click toggle
- `.nav-dropdown.open` 类控制展开状态（`opacity: 0 -> 1`, `visibility: hidden -> visible`, `transform` 上移 8px -> 0）
- 点击下拉菜单外部关闭所有下拉菜单（document 级 click 监听）
- 点击下拉菜单项后 150ms 延迟关闭

#### JS 功能 3：SPA 导航（navigateTo 函数）

```js
function navigateTo(pageName) {
  // 1. 移除所有 .section-page 的 .active 类
  document.querySelectorAll('.section-page').forEach(function(s) { s.classList.remove('active'); });
  // 2. 移除所有导航项的 .active 类（包括下拉触发按钮）
  document.querySelectorAll('#mainNav .nav-item').forEach(function(l) { l.classList.remove('active'); });
  document.querySelectorAll('.nav-dropdown-trigger').forEach(function(t) { t.classList.remove('active'); });
  // 3. 激活目标 section-page（通过 id="page-{pageName}" 匹配）
  var pageEl = document.getElementById('page-' + pageName);
  if (pageEl) {
    pageEl.classList.add('active');
    // 重新触发 animate-in 元素的入场动画
    pageEl.querySelectorAll('.animate-in').forEach(function(el) {
      el.style.animation = 'none';
      el.offsetHeight; // 强制回流
      el.style.animation = '';
    });
  }
  // 4. 激活匹配的导航项（包括下拉菜单内的项）
  document.querySelectorAll('[data-page="' + pageName + '"]').forEach(function(link) {
    link.classList.add('active');
    var dd = link.closest('.nav-dropdown');
    if (dd) {
      var trigger = dd.querySelector('.nav-dropdown-trigger');
      if (trigger) trigger.classList.add('active');
    }
  });
  // 5. 滚动到顶部
  var sc = document.getElementById('scrollContainer');
  if (sc) sc.scrollTop = 0;
  // 6. 懒初始化特定项目详情页的交互功能
  if (pageName === 'project-detail-1') setTimeout(function(){ initPixelPainter(); }, 100);
  if (pageName === 'project-detail-3') setTimeout(function(){ initSakuraPetals(); }, 100);
  if (pageName === 'project-detail-2') setTimeout(function(){ initCatShowcase(); }, 100);
}

// 暴露到全局作用域
window.navigateTo = navigateTo;
```

#### 主题切换按钮 CSS 动画

月亮和太阳图标使用绝对定位叠加，通过 `.day` 类切换：

- 夜间（默认）：月亮可见（opacity: 1），太阳隐藏（opacity: 0, rotated 90° scaled 0.5）
- 日间（`.day`）：月亮隐藏并旋转 -90° scaled 0.5，太阳显示并旋转回 0° scaled 1
- 过渡时间：0.5s（旋转）/ 0.35s（透明度），cubic-bezier(0.4,0,0.2,1)

### 6.4 HeroBanner.astro — 打字机字幕

**文件**：`src/components/HeroBanner.astro`

```js
var phrases = [
  "CODE. DESIGN. LIFE.",
  "像素即是艺术",
  "BITS AND BYTES",
  "HELLO, WORLD!",
  "> READY._",
  "PIXEL IS ART.",
  "猫咖的小天地"
];
```

- 7 条标语循环播放
- 每条显示 3.5 秒（3500ms setTimeout）
- 切换机制：先设置 `opacity: 0`（淡出），300ms 后更新 `textContent` 并设置 `opacity: 1`（淡入）
- 通过 `setTimeout` 递归调用 `cycle()` 实现无限循环
- 通过 `DOMContentLoaded` 事件启动

### 6.5 SakuraEffect.astro — Canvas 樱花粒子系统

**文件**：`src/components/SakuraEffect.astro`

**资源**：使用 `/sakura.webp`（6.2 KB 真实花瓣纹理图片）而非简单几何图形。

#### Canvas 粒子系统

**粒子数量**：30 个

**每个粒子的属性**：

```js
{
  x: Math.random() * window.innerWidth,    // 随机 X 起点
  y: Math.random() * window.innerHeight,   // 随机 Y 起点
  size: 8 + Math.random() * 14,            // 8~22px 随机大小
  vx: (Math.random() - 0.5) * 0.4,         // 水平速度 -0.2 ~ 0.2
  vy: 0.3 + Math.random() * 0.8,           // 垂直速度 0.3 ~ 1.1
  opacity: 0.25 + Math.random() * 0.5,     // 透明度 0.25 ~ 0.75
  rot: Math.random() * Math.PI * 2,        // 初始旋转角度
  rotSpeed: (Math.random() - 0.5) * 0.02,  // 旋转速度
  swayAmp: 0.3 + Math.random() * 1.0,      // 水平摆动幅度（正弦波振幅）
  swaySpeed: 0.003 + Math.random() * 0.006, // 水平摆动速度（正弦波频率）
  swayPhase: Math.random() * Math.PI * 2,   // 摆动初始相位
}
```

**每帧动画逻辑（requestAnimationFrame 循环）**：

```js
p.swayPhase += p.swaySpeed;
p.x += p.vx + Math.sin(p.swayPhase) * p.swayAmp * 0.3;  // 水平：基础速度 + 正弦摆动
p.y += p.vy;                                              // 垂直：匀速下降
p.rot += p.rotSpeed;                                      // 旋转
```

使用 `Math.sin(swayPhase)` 产生正弦波水平摆动，模拟真实花瓣飘落的左右摇摆。花瓣渲染使用 `ctx.drawImage(sakuraImg, ...)`。

**越界回收**：当 `p.y > window.innerHeight + 40` 时重置到顶部（`y = -40`），左右越界同理（`x < -40` 时设为 `window.innerWidth + 40`，反之亦然）。

**响应式**：`window.addEventListener("resize", ...)` 更新 Canvas 尺寸。

#### 点击爆发效果

```js
document.addEventListener("click", function(e) {
  var particleCount = 5 + Math.floor(Math.random() * 4); // 5~8 个粒子
  for (var i = 0; i < particleCount; i++) {
    var sakura = document.createElement("div");
    sakura.className = "click-sakura";
    sakura.style.left = e.clientX + "px";
    sakura.style.top = e.clientY + "px";
    document.body.appendChild(sakura);
    // 设置随机方向和旋转
    var angle = Math.random() * Math.PI * 2;
    var distance = 40 + Math.random() * 60;
    var rot = (Math.random() - 0.5) * 540 + "deg";
    sakura.offsetWidth; // 强制回流
    sakura.style.transform = "translate(calc(-50% + " + Math.cos(angle) * distance + "px), calc(-50% + " + Math.sin(angle) * distance + "px)) scale(1.2) rotate(" + rot + ")";
    sakura.style.opacity = "0";
    setTimeout(function() { sakura.remove(); }, 600);
  }
});
```

- 每次点击创建 5-8 个 DOM 元素
- 每个粒子以随机角度飞向 40~100px 外
- 同时旋转最多 540°（1.5 圈）
- 通过 CSS transition 驱动动画（transform 0.6s + opacity 0.6s）
- 600ms 后从 DOM 移除
- 使用 `/sakura.webp` 作为背景图

### 6.6 PostCard.astro 和 Sidebar.astro（备用组件）

这两个组件导出 TypeScript 接口但**未被 index.astro 当前页面使用**。

- **PostCard.astro**：定义 `Post` 接口（id, title, excerpt, date, category, tags, isNew, pinned），渲染单篇文章卡片。当前 index.astro 中的 `renderPosts()` 函数直接用模板字符串生成 HTML，未使用此组件。
- **Sidebar.astro**：定义 `Category` 接口，接收 `postCount`, `projectCount`, `categories`, `tags` props 渲染侧边栏。当前 index.astro 的侧边栏是硬编码在页面模板中的。

如果想启用这些组件，需要在 index.astro 的 frontmatter 中导入并通过 Astro.props 传递数据。

---
## 7. 主页面 index.astro 详解

**文件**：`src/pages/index.astro`（约 1056 行）

该文件是 SPA 核心，包含约 500 行客户端 JavaScript。

### 7.1 页面 ID 对照表

| section-page ID | 导航触发方式 | 内容说明 |
|-----------------|-------------|---------|
| `page-home` | `data-page="home"` | 首页：文章列表 + 侧边栏（时钟/日历/统计/分类/标签） |
| `page-about` | `data-page="about"` | 关于我：头像卡片 + 个人简介 + 技能网格 + 此刻正在... |
| `page-projects` | `data-page="projects"` | 项目列表：Featured 项目 + 项目卡片网格 |
| `page-project-detail-0` | `navigateTo('project-detail-0')` | FYH Blog 项目详情（Hero + 统计 + 技术栈卡片） |
| `page-project-detail-1` | `navigateTo('project-detail-1')` | Pixel Painter 项目详情（Canvas demo + 调色板 + 工具） |
| `page-project-detail-2` | `navigateTo('project-detail-2')` | CatViewer 项目详情（猫咪卡片网格） |
| `page-project-detail-3` | `navigateTo('project-detail-3')` | Sakura CSS 项目详情（樱花粒子动画 + 特性） |
| `page-album` | `data-page="album"` | 相册页面（相册集网格 + 相册查看器弹窗） |
| `page-editor` | `data-page="editor"` | Markdown 编辑器（标题输入 + 编辑区 + 预览 + 发布） |

### 7.2 核心 JavaScript 函数

所有以下函数在页面底部的 `<script>` 标签中定义。

#### renderPosts() — 渲染文章列表

从 `localStorage` 读取 `fyh_articles` 数组，按 id 降序排列（新文章在前），生成 `.post-card` HTML 模板字符串插入 `#postList`。同时更新首页统计数据（`statPosts`）、分类计数和标签云。

**生成的文章卡片结构**：

```html
<div class="post-card">
  <div class="post-date">YYYY-MM-DD</div>
  <div class="post-title">标题</div>
  <div class="post-excerpt">摘要（截取 120 字符）</div>
  <div class="post-meta">
    <span class="cat">分类</span>
    <span class="tag">标签1</span>
    <span class="tag">标签2</span>
  </div>
</div>
```

#### renderCalendar() — 渲染日历组件

- 维护 `currentCalYear` 和 `currentCalMonth`（0-based）变量
- 生成 7x6 的日期网格（42 个格子）
- 标记 `.today`（当天）和 `.has-entry`（有日记条目的日期，检查 `fyh_diary` localStorage）
- 上月/下月的日期添加 `.other-month` 类并降低透明度
- 显示周几标签行（一、二、三、四、五、六、日）
- 左右箭头按钮（`calPrev` / `calNext`）切换月份
- 点击有日记的日期显示日记内容

#### renderAlbums() — 渲染相册集

- 从 `localStorage` 读取 `fyh_albums` 数组
- 每个相册显示封面图（第一张照片）和最多 4 张散布照片（`.scatter-photo` 带 3D 旋转倾斜效果）
- 末尾添加 "新建相册集" 上传卡片（`#albumUpload`）
- 每个相册可点击进入查看器（`openAlbumViewer(idx)`）
- 更新统计数据（`albumCount`, `photoCount`, `statPhotos`）

#### renderProjects() — 渲染项目卡片

根据硬编码的 `PROJECTS` 数组（5 个项目）生成 `.proj-card` HTML。每个卡片包含：图标、名称、描述、状态标签、技术标签。

**PROJECTS 数据结构**：

```js
{
  id: number,
  name: string,
  desc: string,
  icon: string,      // 单字图标（猫/画/喵/樱/云）
  status: string,     // 活跃开发中 / 开发中 / 已完成 / 计划中
  accent: string,     // CSS 颜色变量（var(--pink) 等）
  iconBg: string,     // 图标背景色
  statusBg: string,   // 状态背景色
  tags: string[]      // 技术标签
}
```

卡片使用 CSS 自定义属性 `--proj-accent`, `--proj-glow`, `--proj-icon-bg`, `--proj-status-bg` 实现每个项目的个性化配色。

#### Markdown 编辑器功能

- 实时预览：`mdEditor` textarea 的 `input` 事件触发 `updatePreview()`
- 预览使用正则替换实现简易 Markdown 解析：
  - `# 标题` -> `<h1>`; `## 标题` -> `<h2>`; `### 标题` -> `<h3>`
  - `**加粗**` -> `<strong>`; `*斜体*` -> `<em>`
  - `` `代码` `` -> `<code>`; ` ```代码块``` ` -> `<pre><code>`
  - `[文本](url)` -> `<a href="url">文本</a>`
  - `![alt](url)` -> `<img src="url" alt="alt">`
  - 连续两个换行 -> `</p><p>`（段落分隔）
- "发布文章"按钮：收集标题和 Markdown 内容，构建文章对象存入 `fyh_articles`，导航回首页

#### 相册管理功能

- `openAlbumViewer(idx)`：打开相册查看器弹窗（`#albumViewer`）
- 查看器内操作：
  - 添加照片（`btnAddToAlbum` -> `<input type="file">` -> FileReader -> base64 data URL）
  - 删除照片（点击 `x` 按钮，`.photo-del`）
  - 删除整个相册（`btnDeleteAlbum`，带 confirm 确认）
- 新建相册：选择文件 -> `prompt()` 输入名称 -> 创建相册对象 -> 存入 localStorage
- Lightbox：`showLightbox(albumIdx, photoIdx)` 创建全屏遮罩层（`.lightbox-overlay`），支持：
  - 左右箭头切换照片（`.lightbox-nav.prev` / `.lightbox-nav.next`）
  - 点击背景或关闭按钮关闭
  - Escape 键关闭

#### 打字机效果（关于页）

```js
var phrases = ["🎨", "✨", "🐱", "💻", "🌸", "🎮"];
```

`#aboutTypewriter` 元素以 2.5 秒间隔循环显示 emoji，使用 opacity 过渡动画。

#### 鼠标追踪（proj-card 和 about-bio-card）

```js
document.addEventListener("mousemove", function(e) {
  document.querySelectorAll(".proj-card, .about-bio-card").forEach(function(c) {
    var r = c.getBoundingClientRect();
    c.style.setProperty("--mc-x", ((e.clientX - r.left) / r.width) * 100 + "%");
    c.style.setProperty("--mc-y", ((e.clientY - r.top) / r.height) * 100 + "%");
  });
});
```

为项目卡片和个人简介卡片设置 `--mc-x` / `--mc-y` 变量，用于 hover 辉光效果。

#### 全局 Escape 键处理

```js
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Escape') return;
  // 优先级：Lightbox > 相册查看器 > 文章编辑器弹窗 > 项目详情页
  if (lightboxEl) { closeLightbox(); return; }
  if (viewer && viewer.style.display === 'flex') { viewer.style.display = 'none'; renderAlbums(); return; }
  if (modal && modal.style.display === 'flex') { modal.style.display = 'none'; return; }
  var activeDetail = document.querySelector('.section-page.active[id^="page-project-detail-"]');
  if (activeDetail) { navigateTo('projects'); return; }
});
```

#### 懒初始化函数

这些函数在用户导航到对应详情页时才被调用（100ms 延迟确保 DOM 渲染完成）：

- **initPixelPainter()**：初始化 Pixel Painter Canvas demo（12px 像素网格 + 12 色调色板 + 画笔/橡皮/填充/清空工具）
- **initSakuraPetals()**：在 Sakura CSS 详情页生成 20 个 DOM 樱花花瓣（CSS 动画驱动飘落，使用自定义属性 `--sx`, `--sr`）
- **initCatShowcase()**：为 CatViewer 详情页的猫咪卡片添加 hover 弹性动画（`cubic-bezier(0.34, 1.56, 0.64, 1)` overshoot）

### 7.3 模态框和弹窗

- `#entryModal`：Markdown 编辑器全屏弹窗（包含标题输入 `<input>`、编辑区 `<textarea>`、预览区 `<div>`、发布 `<button>`）
- `#albumViewer`：相册查看器弹窗（包含标题、照片网格、添加/删除按钮）
- 两个弹窗均通过 `display: none/flex` 切换
- 点击背景遮罩层可关闭（通过事件委托检查 `e.target === this`）

### 7.4 Textarea 自动调整高度

```js
ta.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.max(this.scrollHeight, 250) + 'px';
});
```

编辑器 textarea 随内容自动增长，最小高度 250px。先将 height 重置为 auto 以获取正确的 scrollHeight，再设置为 scrollHeight 和 250 的最大值。

---

## 8. 主题切换（昼夜模式）

### 三层架构

#### 第一层：CSS 变量覆盖

`.game-scene.day-mode` 选择器重新定义所有颜色和材质变量。当 `day-mode` 类被添加到 `.game-scene` 上时，所有使用 `var(--xxx)` 的元素自动切换配色。

关键覆盖：

- 所有颜色变量从深色系变为浅色系（如 `--pink: #ff6b9d` -> `#d9466f`）
- 文本色反转（`--text: #ebe4f2` -> `#2a1f36`）
- 玻璃材质从暗半透明变为亮半透明（`--card: rgba(18,12,38,0.62)` -> `rgba(255,250,244,0.7)`）
- 辉光从暗调变为亮调
- 边框从白色半透明变为黑色半透明

#### 第二层：clip-path 圆形波纹

```css
.game-scene::after {
  background-image: url("/day.png");   /* 日间全幅背景 */
  clip-path: circle(0% at var(--ripple-x, 50%) var(--ripple-y, 50%));
  transition: clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.game-scene.day-mode::after {
  clip-path: circle(150% at var(--ripple-x, 50%) var(--ripple-y, 50%));
}
```

- 夜间模式：circle 半径 0%，日间背景图完全不可见
- 日间模式：circle 半径 150%，日间背景图完全覆盖
- `--ripple-x/y` 动态设置为主题按钮中心坐标
- 0.8 秒 transition 产生以按钮为中心的圆形展开/收缩动画

#### 第三层：localStorage 持久化

```js
function setTheme(t) {
  updateRipple(); // 更新波纹起点坐标
  if (t === 'day') { scene.classList.add('day-mode'); btn.classList.add('day'); }
  else { scene.classList.remove('day-mode'); btn.classList.remove('day'); }
  try { localStorage.setItem('fyh-theme', t); } catch(e) {}
}

function init() {
  var t = 'night'; // 默认夜间模式
  try { var s = localStorage.getItem('fyh-theme'); if (s === 'day' || s === 'night') t = s; } catch(e) {}
  setTheme(t);
}
```

- 键名：`fyh-theme`
- 值：`"day"` 或 `"night"`
- 页面加载时读取并应用
- 每次切换时写入

#### 主题切换按钮图标动画

月亮和太阳图标使用绝对定位叠加，通过 `.day` 类切换：

- 夜间（默认）：月亮可见，太阳隐藏并旋转 90°
- 日间（`.day`）：月亮隐藏并旋转 -90°，太阳显示回 0°
- 过渡时间：0.5s（旋转）/ 0.35s（透明度）

---

## 9. 数据持久化（localStorage）

本项目不使用后端数据库，所有用户数据存储在浏览器 localStorage 中。

### 9.1 存储键名和数据格式

#### fyh-theme（主题偏好）

- 类型：`string`
- 值：`"night"` | `"day"`
- 读取者：Layout.astro 中的 `init()` 函数

#### fyh_articles（文章列表）

- 类型：`Array<Article>`
- 存取函数：`getArticles()` / `saveArticles(articles)`

数据结构：

```js
{
  id: number,           // 自增 ID（基于已有最大 ID + 1）
  title: string,        // 文章标题
  excerpt: string,      // 摘要（纯文本，取 content 前 120 字符）
  content: string,      // 完整 Markdown 内容
  date: string,         // 日期 YYYY-MM-DD
  category: string,     // 分类（默认 "文章"）
  tags: string[]        // 标签数组（默认 ["原创"]）
}
```

#### fyh_albums（相册列表）

- 类型：`Array<Album>`
- 存取函数：`getAlbums()` / `saveAlbums(albums)`

数据结构：

```js
{
  name: string,         // 相册名称
  photos: string[],     // Base64 data URL 数组
  created: string       // ISO 日期字符串
}
```

#### fyh_diary（日历日记）

- 类型：`Array<DiaryEntry>`
- 存取函数：`getDiary()` / `saveDiary(diary)`

数据结构：

```js
{
  date: string,         // 日期 YYYY-MM-DD
  text: string          // 日记内容（纯文本）
}
```

### 9.2 存取函数模式

所有存取函数遵循相同的 try-catch 安全模式：

```js
function getArticles() {
  try { return JSON.parse(localStorage.getItem('fyh_articles') || '[]'); }
  catch(e) { return []; }
}

function saveArticles(articles) {
  try { localStorage.setItem('fyh_articles', JSON.stringify(articles)); }
  catch(e) {}
}
```

### 9.3 注意事项

- **容量限制**：localStorage 通常限制 5-10MB。Base64 编码的照片占用空间较大（约为原始文件的 1.33 倍），大量高分辨率照片可能导致存储溢出。
- **无备份机制**：清除浏览器数据会丢失所有内容。建议定期导出文章和相册。
- **同源限制**：数据仅在当前域名下可用，不同端口或协议的数据隔离。
- **同步 API**：localStorage 是同步 API，大量数据读写可能阻塞主线程。

---
## 10. 构建与部署

### 10.1 本地开发

```bash
pnpm install   # 安装依赖
pnpm dev       # 启动开发服务器（http://localhost:4321）
```

开发模式下：

- 热模块替换（HMR）实时预览修改
- `public/` 目录的静态资源可直接通过 `/` 路径访问
- Astro dev 服务器默认端口 4321

### 10.2 生产构建

```bash
pnpm build     # 构建到 dist/ 目录
pnpm preview   # 本地预览构建结果
```

构建配置（astro.config.mjs）：

- `output: "static"`：纯静态输出，每个页面生成独立 HTML
- `assetsInlineLimit: 4096`：小于 4KB 的资源内联为 base64
- `cssCodeSplit: true`：CSS 按页面分割
- `cssMinify: "esbuild"`：使用 esbuild 压缩 CSS

### 10.3 Vercel 部署

站点配置为 `site: "https://catblog.fanyouhao.top/"`。

部署步骤：

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中导入该仓库
3. Vercel 自动识别 Astro 项目并配置：
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
4. 部署完成后可通过自定义域名访问

### 10.4 其他平台部署

由于是纯静态输出（dist 目录），可部署到任何静态托管服务：

- **GitHub Pages**：使用 `peaceiris/actions-gh-pages` 等 action
- **Netlify**：拖拽 dist 文件夹或连接 Git 仓库
- **Cloudflare Pages**：连接 Git 仓库，设置构建命令和输出目录
- **Nginx/Apache**：将 dist 内容复制到 web 根目录

---

## 11. 添加新功能的步骤

### 11.1 添加新页面

1. 在 `src/pages/index.astro` 中添加新的 `<div class="section-page" id="page-新页面名">` HTML 块
2. 在 NavBar.astro 中添加对应的导航链接，设置 `data-page="新页面名"`
3. 在 `navigateTo()` 函数中确保页面路由正确（通过 `id="page-新页面名"` 匹配）
4. 如需要 Svelte 组件，在 `src/components/` 中创建 `.svelte` 文件，在 index.astro frontmatter 中导入

### 11.2 添加新组件

1. 在 `src/components/` 创建 `.astro` 或 `.svelte` 文件
2. 对于 Astro 组件，在需要使用的页面 frontmatter 中导入：`import MyComponent from "@components/MyComponent.astro"`
3. 在模板中使用：`<MyComponent prop1="value" />`
4. 组件样式可写在 `<style>` 标签中（scoped），或添加到 `global.css`（全局）

### 11.3 修改 CSS 动画

所有动画集中在 `src/styles/global.css` 中：

| 动画名称 | 位置（类/选择器） | 修改影响 |
|----------|------------------|---------|
| `liquidFlow` | `.game-scene::before` | 背景辉光流动速度和路径 |
| `liquidAngleShift` | `.web-wrapper::before` | 主面板渐变旋转速度 |
| `pageIn` / `pageOut` | `.section-page` | 页面切换过渡效果 |
| `blogCatBounce` | `.blog-cat-icon` | 项目详情页猫咪弹跳 |
| `sakuraFall` | `.sakura-petal` | 樱花飘落（CSS 版） |
| `weatherWiggle` | `.weather-day-card` | 天气卡片摆动 |

修改动画时注意：

- `liquidFlow` 和 `liquidAngleShift` 依赖 `@property` 注册的自定义属性
- 页面切换动画用 `animation` 而非 `transition`
- 樱花 Canvas 粒子的参数在 SakuraEffect.astro 的 JS 中

### 11.4 调整主题配色

所有颜色变量定义在两个位置：

- 夜间模式：`global.css` 中 `:root` 块
- 日间模式：`global.css` 中 `.game-scene.day-mode` 块

修改步骤：

1. 找到要修改的变量（如 `--pink`）
2. 在 `:root` 中修改夜间值
3. 在 `.game-scene.day-mode` 中修改日间值
4. 确保两个模式下的颜色对比度和可读性

### 11.5 添加新的 localStorage 数据类型

1. 定义存取函数对（如 `getTodos()` / `saveTodos(todos)`）
2. 在 `index.astro` 的 JS 中添加渲染函数
3. 在相关 `navigateTo()` 或页面初始化中触发渲染
4. 确保数据结构可被 `JSON.stringify` 序列化（不能有循环引用、Function、Symbol 等）

---

## 12. 附录

### 附录 A：CSS 类名速查表

#### 布局类

| 类名 | 作用 | 关键样式 |
|------|------|---------|
| `.game-scene` | 最外层容器，绝对定位居中 | `position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)` |
| `.game-scene::before` | 背景液态辉光 | 4 个 radial-gradient + liquidFlow 动画 |
| `.game-scene::after` | 主题切换 clip-path 遮罩 | `background-image:url("/day.png"); clip-path:circle(...)` |
| `.foreground-layer` | 前景装饰覆盖层 | `position:absolute; z-index:999; pointer-events:none` |
| `.scroll-container` | 可滚动内容区 | `overflow-y:auto; width:74.52%; height:82.57%` |
| `.web-wrapper` | 主玻璃面板 | `backdrop-filter:blur(28px); border-radius:var(--radius-lg)` |
| `.section-page` | 可切换的页面容器 | `display:none` -> `.active` 时 `display:flex` + pageIn 动画 |
| `.main-col` | 主内容列 | `flex:1; min-width:0` |
| `.side-col` | 侧边栏列 | `width:300px; flex-shrink:0` |

#### 卡片类

| 类名 | 作用 | 伪元素 |
|------|------|--------|
| `.glass-card` | 通用玻璃卡片 | `::before` 高光, `::after` 鼠标辉光（--mc-x/y） |
| `.post-card` | 文章卡片 | `::before` 高光, `::after` 鼠标辉光（--mouse-x/y） |
| `.proj-card` | 项目卡片 | 使用 `--proj-accent` 等 CSS 变量个性化 |
| `.blog-stat-card` | 项目详情统计卡 | `::before` 顶部渐变条 |
| `.blog-tech-card` | 技术栈卡片 | hover 弹性缩放 `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `.about-bio-card` | 关于页卡片 | 鼠标追踪 `--mc-x/y` |
| `.cat-fact-card` | CatViewer 特性卡 | `::before` 猫咪 emoji 水印 |
| `.painter-feature-card` | Pixel Painter 特性卡 | `::after` 顶部渐变条 |
| `.sakura-feature-item` | Sakura CSS 特性卡 | `::before` 渐变背景 |
| `.weather-feat-card` | 天气特性卡 | hover 图标缩放 |
| `.weather-day-card` | 天气日卡片 | hover wiggle 动画 |

#### 导航类

| 类名 | 作用 |
|------|------|
| `.nav-item` | 导航链接/按钮 |
| `.nav-item.active` | 当前激活的导航项 |
| `.nav-dropdown` | 下拉菜单容器 |
| `.nav-dropdown.open` | 展开的下拉菜单 |
| `.dropdown-menu` | 下拉菜单面板 |
| `.dropdown-item` | 下拉菜单项 |
| `.nav-dropdown-trigger` | 下拉菜单触发按钮 |
| `.nav-chevron` | 下拉箭头图标 |
| `.nav-icon` | 导航项图标 |

#### 组件类

| 类名 | 作用 |
|------|------|
| `.hero-banner` | Hero 横幅（背景图 + 文字叠加） |
| `.hero-overlay` | Hero 文字叠加层 |
| `.theme-toggle-btn` | 主题切换按钮 |
| `.cat-wrap` | 猫咪 Logo 容器（58x58px） |
| `.logo-text` | Logo 文字区域 |
| `.calendar-widget` | 日历小组件 |
| `.calendar-header` | 日历标题栏（月份 + 箭头） |
| `.calendar-grid` | 日历日期网格（7x6） |
| `.day-cell` | 日历单个日期格 |
| `.day-cell.today` | 今天标记（粉色背景） |
| `.day-cell.has-entry` | 有日记的日期（青色圆点） |
| `.day-cell.other-month` | 非当月日期（降低透明度） |
| `.calendar-btn` | 日历箭头按钮 |
| `.section-title` | 区块标题（带右侧渐变线） |
| `.tag-chip` | 标签小方块 |
| `.cat-item` | 分类列表项 |
| `.stat-item` | 统计数字卡片 |
| `.announce-box` | 公告栏（金色边框） |
| `.glass-btn` | 玻璃按钮 |
| `.site-footer` | 页脚 |

#### 相册类

| 类名 | 作用 |
|------|------|
| `.album-set` | 相册集卡片 |
| `.album-upload-card` | 新建相册上传卡片 |
| `.album-set-overlay` | 相册名称底部遮罩层 |
| `.scatter-photo` | 散布照片（3D 旋转倾斜效果） |
| `.album-viewer` | 相册查看器弹窗（`#albumViewer`） |
| `.album-viewer-photo` | 查看器中的单张照片 |
| `.photo-del` | 照片删除按钮（x） |
| `.lightbox-overlay` | 全屏灯箱遮罩 |
| `.lightbox-nav` | 灯箱左右导航箭头 |
| `.lightbox-close` | 灯箱关闭按钮 |

#### 编辑器类

| 类名 | 作用 |
|------|------|
| `.entry-modal-overlay` | 编辑器弹窗背景遮罩 |
| `.editor-panel` | 编辑器面板 |
| `.md-editor` | Markdown 编辑区（textarea） |
| `.md-preview` | Markdown 预览区 |

#### 详情页类

| 类名 | 作用 |
|------|------|
| `.proj-detail-back` | 返回按钮（带左箭头） |
| `.proj-detail-page` | 详情页容器 |
| `.proj-detail-page.active` | 激活的详情页 |
| `.painter-canvas-demo` | 像素画 Canvas 容器 |
| `.painter-swatch` | 调色板色块 |
| `.painter-swatch.active` | 当前选中的色块 |
| `.painter-tool-btn` | 像素画工具按钮 |
| `.painter-tool-btn.active` | 当前选中的工具 |
| `.cat-showcase` | 猫咪卡片网格 |
| `.cat-card` | 单个猫咪卡片 |
| `.cat-card-icon` | 猫咪卡片 emoji |
| `.sakura-petals` | 樱花花瓣容器（CSS 版） |
| `.sakura-petal` | 单个樱花花瓣 |
| `.sakura-content` | Sakura 详情页内容区 |
| `.proj-featured` | Featured 项目卡片 |
| `.proj-grid` | 项目卡片网格 |

#### 工具类

| 类名 | 作用 |
|------|------|
| `.animate-in` | 标记需触发入场动画的元素 |
| `.click-sakura` | 点击爆发的樱花粒子 |
| `.glass-shimmer` | 玻璃闪光扫过效果 |
| `.day-mode` | 日间模式标记（`.game-scene.day-mode`） |

### 附录 B：JavaScript 全局函数速查表

| 函数名 | 定义位置 | 参数 | 功能 |
|--------|---------|------|------|
| `navigateTo(pageName)` | NavBar.astro | `string` | SPA 页面切换（`window.navigateTo` 全局暴露） |
| `setTheme(t)` | Layout.astro | `"day"` / `"night"` | 设置并持久化主题 |
| `toggle()` | Layout.astro | 无 | 切换昼夜主题 |
| `updateRipple()` | Layout.astro | 无 | 更新主题切换波纹坐标 |
| `randomCat()` | NavBar.astro | 无 | 随机切换猫咪头像 |
| `openDropdown(dd)` | NavBar.astro | DOM element | 展开下拉菜单 |
| `closeDropdown(dd)` | NavBar.astro | DOM element | 关闭下拉菜单 |
| `renderPosts()` | index.astro | 无 | 渲染文章列表到 `#postList` |
| `renderCalendar()` | index.astro | 无 | 渲染日历到 `#calGrid` |
| `renderAlbums()` | index.astro | 无 | 渲染相册集到 `#albumGrid` |
| `renderProjects()` | index.astro | 无 | 渲染项目卡片到 `#projGrid` |
| `getArticles()` | index.astro | 无 -> Array | 从 localStorage 读取文章 |
| `saveArticles(arr)` | index.astro | Array | 保存文章到 localStorage |
| `getAlbums()` | index.astro | 无 -> Array | 从 localStorage 读取相册 |
| `saveAlbums(arr)` | index.astro | Array | 保存相册到 localStorage |
| `getDiary()` | index.astro | 无 -> Array | 从 localStorage 读取日记 |
| `saveDiary(arr)` | index.astro | Array | 保存日记到 localStorage |
| `openAlbumViewer(idx)` | index.astro | number | 打开相册查看器弹窗 |
| `showLightbox(albumIdx, photoIdx)` | index.astro | number, number | 打开全屏灯箱预览 |
| `closeLightbox()` | index.astro | 无 | 关闭灯箱 |
| `updatePreview()` | index.astro | 无 | 更新 Markdown 实时预览 |
| `initPixelPainter()` | index.astro | 无 | 懒初始化像素画 Canvas demo |
| `initSakuraPetals()` | index.astro | 无 | 懒初始化樱花 CSS 飘落动画 |
| `initCatShowcase()` | index.astro | 无 | 懒初始化猫咪卡片 hover 动画 |
| `initSakura()` | SakuraEffect.astro | 无 | 初始化 Canvas 樱花粒子系统 |
| `startTypewriter()` | HeroBanner.astro | 无 | 启动 Hero 打字机字幕循环 |

### 附录 C：静态资源清单

| 文件 | 大小 | 类型 | 用途 |
|------|------|------|------|
| `cat1.png` | 264.9 KB | PNG | 随机猫咪头像 1 |
| `cat2.png` | 290.9 KB | PNG | 随机猫咪头像 2 |
| `cat3.png` | 291.4 KB | PNG | 随机猫咪头像 3 |
| `cat4.png` | 296.9 KB | PNG | 随机猫咪头像 4 |
| `cat5.png` | 297.6 KB | PNG | 随机猫咪头像 5 |
| `cat6.png` | 297.9 KB | PNG | 随机猫咪头像 6 |
| `cat7.png` | 320.4 KB | PNG | 随机猫咪头像 7 |
| `cat8.png` | 322.0 KB | PNG | 随机猫咪头像 8 |
| `cat9.png` | 315.5 KB | PNG | 随机猫咪头像 9 |
| `cat .webp` | 8.0 KB | WebP | 备用猫咪图片 |
| `sakura.webp` | 6.2 KB | WebP | Canvas 樱花花瓣粒子素材 |
| `day.png` | 1203.9 KB | PNG | 日间模式全幅背景图（clip-path 遮罩） |
| `hero-night.png` | 2282.3 KB | PNG | 夜间模式 Hero 横幅背景 |
| `hero-day.png` | 2258.6 KB | PNG | 日间模式 Hero 横幅背景 |
| `hero图.webp` | 995.3 KB | WebP | Hero 备用图 |
| `dynamic_bg.webm` | 539.5 KB | WebM | 动态背景视频（未在当前代码中使用） |
| `ChatGPT Image 2026年6月4日 16_42_58.png` | 1083.6 KB | PNG | 前景装饰图层 |

### 附录 D：已知限制和改进方向

#### 数据持久化

- 当前使用 localStorage，容量有限（5-10MB），照片以 Base64 存储占用大
- 无数据导出/导入功能
- 建议：未来可迁移到 IndexedDB（更大容量、异步 API）或后端 API

#### SPA 路由

- 当前 SPA 不修改浏览器 URL（始终为 `/`），刷新页面会丢失当前浏览位置
- 无浏览器前进/后退按钮支持
- 建议：集成 History API（`pushState` / `popstate`），或迁移到 Astro 的文件路由

#### 性能优化

- `global.css` 约 2221 行，文件较大，可考虑按页面/组件拆分
- 多个 mousemove 监听器可合并为一个，减少事件处理开销（Layout.astro 中 2 个 + index.astro 中 1 个 = 共 3 个）
- 部分图片较大（hero-night.png 2.2MB、day.png 1.2MB），可做 WebP/AVIF 转换和响应式尺寸
- Canvas 樱花粒子在移动端可能影响性能，可添加帧率节流

#### 响应式设计

- 当前 CSS 主要为桌面端设计（`game-scene` 使用固定宽高比 1672:941）
- 仅在 `global.css` 末尾有少量 `@media (max-width: 900px)` 规则
- 侧边栏（300px 固定宽度 `.side-col`）在小屏幕上会挤压主内容
- 建议：完善移动端布局（mobile-first 或更全面的断点）

#### 可访问性

- 自定义光标（SVG data URI）可能影响可访问性
- 颜色对比度在日间/夜间模式下需系统验证
- 缺少 ARIA 标签和键盘导航支持

#### 组件化

- PostCard.astro 和 Sidebar.astro 定义了接口但未使用，当前数据通过模板字符串渲染
- 建议：重构 renderPosts 等函数使用 Astro 组件，享受类型安全和 SSR 优势

#### 国际化

- 当前全部为中文硬编码
- 建议：提取文本到 i18n 配置文件中

---

> **文档版本**：v1.0 | **最后更新**：2026-07-17 | **适用项目**：cat-blog (Astro 6.3 + Svelte 5)
