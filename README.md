# Cat Blog — 像素风个人博客

基于 **Astro 6** + **Svelte 5** + **Tailwind CSS 4** 构建的像素风格个人博客，从单文件 HTML 重构为组件化 Astro 工程，灵感源自 Mizuki 模板架构。

---

## 目录

- [技术栈](#技术栈)
- [项目架构](#项目架构)
- [核心原理详解](#核心原理详解)
  - [1. Layout.astro — 全局外壳](#1-layoutastro--全局外壳)
  - [2. 像素美学体系](#2-像素美学体系)
  - [3. 游戏场景布局](#3-游戏场景布局)
  - [4. NavBar — 导航栏](#4-navbar--导航栏)
  - [5. HeroBanner — 横幅](#5-herobanner--横幅)
  - [6. PostCard — 文章卡片](#6-postcard--文章卡片)
  - [7. Sidebar — 侧边栏](#7-sidebar--侧边栏)
  - [8. SakuraEffect — 樱花特效](#8-sakuraeffect--樱花特效)
  - [9. index.astro — 主页编排](#9-indexastro--主页编排)
- [数据流](#数据流)
- [构建系统](#构建系统)
- [开发指南](#开发指南)

---

## 技术栈

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | **Astro** | 6.3.0 | 静态站点生成（SSG），组件化页面编排，服务端数据注入 |
| UI 组件 | **Svelte** | 5.55.5 | 可选交互组件运行时（通过 `@astrojs/svelte` 集成） |
| CSS 引擎 | **Tailwind CSS** | 4.2.4 | 通过 `@tailwindcss/vite` 插件提供原子化 CSS |
| 类型系统 | **TypeScript** | 5.9.3 | 组件 Props 类型定义与编译时检查 |
| 包管理 | **pnpm** | 10.33.0 | 严格的依赖解析与 workspace 支持 |
| 构建工具 | **Vite** | (Astro 内置) | 开发服务器、HMR、生产打包 |
| 代码压缩 | **esbuild** | (Vite 内置) | JS/CSS 极速压缩 |
| 后处理 | **PostCSS** | — | `postcss-import` + `postcss-nesting` 增强 CSS |

---

## 项目架构

```
cat-blog/
├── public/                          # 静态资源（构建时原样复制到 dist/）
│   ├── cat1.png ~ cat9.png          # 9 张猫咪头像（点击随机切换）
│   ├── sakura.webp                  # 樱花粒子贴图
│   ├── hero图.webp                   # Hero 横幅背景
│   ├── cat .webp                    # 备用猫咪图
│   └── ChatGPT Image ... .png       # 前景叠加层（游戏窗口边框）
│
├── src/
│   ├── components/                  # UI 组件
│   │   ├── NavBar.astro             # 头部：Logo + 导航链接
│   │   ├── HeroBanner.astro         # 横幅：背景图 + 标题叠加
│   │   ├── PostCard.astro           # 文章卡片（含 Post 接口导出）
│   │   ├── Sidebar.astro            # 侧栏：统计 + 分类 + 标签云
│   │   └── SakuraEffect.astro       # 特效：Canvas 樱花 + 点击爆炸 + 光标
│   │
│   ├── layouts/
│   │   └── Layout.astro             # 全局布局：<head>、CSS 变量、全局样式
│   │
│   ├── pages/
│   │   └── index.astro              # 主页：数据定义 + 组件组装 + 客户端脚本
│   │
│   ├── content.config.ts            # Astro Content Collections 配置
│   └── env.d.ts                     # Astro 客户端类型声明
│
├── astro.config.mjs                 # Astro 配置：SSG 模式、集成、Vite 插件
├── package.json                     # 依赖与脚本
├── tsconfig.json                    # TypeScript 配置与路径别名
├── svelte.config.js                 # Svelte 预处理配置
├── postcss.config.mjs               # PostCSS 插件链
└── .gitignore
```

---

## 核心原理详解

### 1. Layout.astro — 全局外壳

`src/layouts/Layout.astro` 是整个博客的 HTML 骨架，所有页面通过 `<slot />` 嵌入其中。

**服务端逻辑（Frontmatter）：**

```ts
---
import SakuraEffect from "@components/SakuraEffect.astro";

interface Props {
  title?: string;
  description?: string;
}

const { title, description } = Astro.props;
const pageTitle = title
  ? `${title} - FYH BLOG`
  : "FYH BLOG - Pixel Haven";
---
```

- `Astro.props` 是 Astro 组件接收外部传入属性的机制
- 当子页面传入 `title` 时，自动拼接为 `"{title} - FYH BLOG"`；否则使用默认标题
- `SakuraEffect` 在 `<body>` 最顶部引入，确保 Canvas 和光标样式最先加载

**模板层：**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <!-- 元数据 -->
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{pageTitle}</title>

    <!-- 行内 SVG Favicon（猫咪 emoji） -->
    <link rel="icon" href="data:image/svg+xml,..." />

    <!-- Google Fonts：像素字体 + 中文 + 等宽 -->
    <link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:..." />

    <!-- is:global 使样式作用于全局，不限于当前组件 -->
    <style is:global>...</style>
  </head>
  <body>
    <SakuraEffect />
    <slot />
  </body>
</html>
```

关键点：
- `<style is:global>` — Astro 默认对 `<style>` 做作用域隔离（Scoped CSS），加 `is:global` 后样式会注入到全局，确保所有子组件都能使用 CSS 变量和类名
- `{pageTitle}` — Astro 的表达式语法，在构建时将服务端变量注入 HTML
- `<slot />` — Web 标准插槽，子页面内容在此渲染

---

### 2. 像素美学体系

整个博客的视觉风格由三层设计系统构成：

#### 2.1 CSS 自定义属性（Design Tokens）

```css
:root {
  /* 主色调 — 赛博朋克霓虹 */
  --pink: #ff66cc;    /* 强调色：链接悬停、边框、分类标签 */
  --cyan: #66ffcc;    /* 高亮色：标题、链接、数字、状态 */
  --yellow: #ffdd44;  /* 警告色：公告框边框 */
  --purple: #aa77ff;  /* 辅助紫 */
  --orange: #ff9966;  /* 辅助橙 */

  /* 文字层级 */
  --text: #e8ddf5;    /* 正文：淡紫白，在深色背景上柔和可读 */
  --muted: #a088c0;   /* 次要文字：摘要、标签 */
  --dim: #6a5885;     /* 禁用级文字：日期、统计标签 */

  /* 背景层级 — 多层次半透明营造景深 */
  --deep: #0c0518;    /* 最深底色（body、game-scene） */
  --web: rgba(18,10,32,0.96);   /* web-wrapper 背景 */
  --card: rgba(22,12,48,0.92);  /* 卡片背景 */
  --hover: rgba(40,20,75,0.7);  /* 悬停高亮 */
  --glass: rgba(22,12,48,0.82); /* 毛玻璃 */

  /* 边框系统 */
  --b-sub: #332255;   /* 默认边框 */
  --b-hi: #452b75;    /* 高亮边框（inset box-shadow） */
  --b-ac: #6644aa;    /* 强调边框 */

  /* 字体栈 */
  --fp: "Pixelify Sans", "Courier New", monospace;  /* 像素标题字体 */
  --fb: "Noto Sans SC", ..., sans-serif;             /* 正文字体（中文优化） */
  --fm: "JetBrains Mono", "Courier New", monospace;  /* 代码/数据字体 */
}
```

设计原则：
- 所有颜色、字体、边框均通过变量引用，全局一致
- 深色背景（`#0c0518`）+ 霓虹高亮（`#ff66cc` / `#66ffcc`）构建赛博朋克氛围
- 半透明背景层（`rgba` 多层叠加）替代纯色，营造"玻璃 + 像素"的视觉层次

#### 2.2 字体系统

三套字体各司其职，通过 CSS 变量切换：

| 变量 | 字体 | 用途 |
|------|------|------|
| `--fp` | Pixelify Sans | 标题 `<h1>` `<h2>`、统计数字、项目名 — 像素风格 |
| `--fb` | Noto Sans SC | 正文、摘要、公告 — 中文阅读舒适 |
| `--fm` | JetBrains Mono | 日期、标签、导航、状态 — 终端/代码感 |

所有字体通过 Google Fonts CDN 加载，使用 `display=swap` 避免 FOIT（Flash of Invisible Text）。

#### 2.3 边框与阴影体系

博客使用**双层边框**技术实现像素风格的"嵌框"效果：

```css
.post-card {
  border: 2px solid #000;                      /* 外层纯黑边框 */
  box-shadow: inset 0 0 0 2px var(--b-hi);     /* 内层紫色发光边框 */
}
```

- 外层 `border: 2px solid #000` — 硬边像素感
- 内层 `box-shadow: inset 0 0 0 2px` — 不占布局空间的内发光，比 `outline` 更可控
- 两者叠加形成 4px 总宽度的双层边框，与像素游戏 UI 风格一致

悬停时的增强：
```css
.post-card:hover {
  box-shadow:
    0 12px 40px 0 rgba(255,102,204,0.25),   /* 粉色外发光投影 */
    inset 0 0 0 1px var(--pink);              /* 内边框变粉色 */
}
```

---

### 3. 游戏场景布局

博客的最外层不是常规的文档流，而是模拟了"游戏窗口"的视觉结构：

```
┌─────────────────────────────────────────┐
│  body (overflow: hidden)                 │
│  ┌───────────────────────────────────┐  │
│  │  .game-scene (absolute 居中)      │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │ .scroll-container (74.5%)   │ │  │
│  │  │ ┌─────────────────────────┐ │ │  │
│  │  │ │ .web-wrapper (内容区)   │ │ │  │
│  │  │ │  header                 │ │ │  │
│  │  │ │  hero-banner            │ │ │  │
│  │  │ │  section-page (home/    │ │ │  │
│  │  │ │    projects)            │ │ │  │
│  │  │ │  site-footer            │ │ │  │
│  │  │ └─────────────────────────┘ │ │  │
│  │  └─────────────────────────────┘ │  │
│  │  .foreground-layer (z-index:999) │  │
│  │  (游戏窗口边框装饰图)              │  │
│  └───────────────────────────────────┘  │
│  #canvas_sakura (z-index:900)           │
└─────────────────────────────────────────┘
```

各层职责：

**`.game-scene`**
```css
.game-scene {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);  /* 绝对居中 */
  min-width: 100vw;
  min-height: 100vh;
  aspect-ratio: 1672 / 941;          /* 固定宽高比 */
  background: var(--deep);
}
```
- 绝对定位 + `translate(-50%,-50%)` 实现视口居中
- `aspect-ratio: 1672/941` 保持固定的游戏窗口比例

**`.scroll-container`**
```css
.scroll-container {
  width: 74.52%;
  height: 82.57%;
  top: 48.5%;
  left: 48%;
  transform: translate(-50%, -50%);
  overflow-y: auto;                  /* 内容溢出时滚动 */
  overflow-x: hidden;
}
```
- 百分比尺寸精确匹配前景装饰图的"屏幕区域"
- 自定义滚动条：7px 宽，粉色滑块

**`.foreground-layer`**
```css
.foreground-layer {
  background-image: url("/ChatGPT Image ... .png");
  background-size: 100% 100%;
  z-index: 999;
  pointer-events: none;             /* 鼠标事件穿透！ */
}
```
- `pointer-events: none` 是关键 — 这张装饰图覆盖在最上层但完全透明于交互
- 模拟游戏机/CRT 显示器的物理边框

---

### 4. NavBar — 导航栏

`src/components/NavBar.astro`

```astro
<header>
  <div class="logo-area">
    <div class="cat-wrap" id="catWrap">
      <img id="catLogo" src="/cat1.png" alt="cat" />
    </div>
    <div class="logo-text">
      <h1>FYH BLOG</h1>
      <p>== PIXEL HAVEN ==</p>
    </div>
  </div>
  <nav class="nav-links" id="mainNav">
    <a data-page="home" class="active">HOME</a>
    <a data-page="projects">PROJECTS</a>
  </nav>
</header>
```

**导航激活态机制：**

导航使用 `data-page` 属性 + `class="active"` 实现单页内的视图切换：

```css
.nav-links a::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--pink);
  transition: width 0.25s ease;
}
.nav-links a.active::after {
  width: 60%;      /* 激活时下划线从中间向两侧展开到 60% 宽度 */
}
```

**猫咪 Logo 交互：**

客户端脚本（在 `index.astro` 中）监听点击切换图片：

```ts
catWrap.addEventListener("click", () => {
  const n = Math.floor(Math.random() * 9) + 1;  // 1-9 随机
  catLogo.src = `/cat${n}.png`;
});
```

猫咪图片使用 `image-rendering: pixelated` 强制像素缩放，放大时不会模糊：

```css
.cat-wrap img {
  image-rendering: pixelated;
  filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.9)); /* 像素阴影 */
}
```

---

### 5. HeroBanner — 横幅

`src/components/HeroBanner.astro`

```astro
<div class="hero-banner">
  <div class="hero-overlay">
    <h2>CODE. DESIGN. LIFE.</h2>
    <p id="heroSubtitle">PIXEL ART AND CODE</p>
  </div>
</div>
```

**CSS 渐变遮罩：**

```css
.hero-banner::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 50%,     /* 上半透明 */
    var(--deep) 100%     /* 下半渐变为背景色 */
  );
}
```

`::before` 伪元素覆盖整个 banner，下半部分渐变到 `--deep`，让底部的叠加文字可读，同时保留上半部分的图片清晰度。

**打字机特效：**

在 `index.astro` 的客户端脚本中实现：

```ts
const heroPhrases = [
  "CODE. DESIGN. LIFE.",
  "Keep it pixel.",
  "BITS AND BYTES",
  "HELLO, WORLD!",
  "> READY._",
  "Pixel is art.",
];

function startTypewriter() {
  const el = document.getElementById("heroSubtitle");
  let idx = 0;
  function cycle() {
    el.style.opacity = "0";              // 先淡出
    setTimeout(() => {
      el.textContent = phrases[idx];     // 300ms 后切换文字
      el.style.opacity = "1";            // 淡入
      idx = (idx + 1) % phrases.length;  // 循环索引
    }, 300);
    setTimeout(cycle, 3500);             // 每 3.5 秒轮换一次
  }
  el.textContent = phrases[0];
  setTimeout(cycle, 3500);
}
```

通过 `define:vars` 将服务端数据注入客户端：

```astro
<script define:vars={{ phrases: HERO_PHRASES }}>
```

`define:vars` 是 Astro 的安全数据传递机制 — 它在构建时将服务端数组序列化为 JSON，直接内联到 `<script>` 顶部，避免额外的网络请求。

---

### 6. PostCard — 文章卡片

`src/components/PostCard.astro`

```astro
---
export interface Post {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  tags: string[];
  isNew: boolean;
  pinned: boolean;
}

interface Props {
  post: Post;
}

const { post } = Astro.props;
---

<div class="post-card">
  <div class="post-date">{post.date}</div>
  <div class="post-title">{post.title}</div>
  <div class="post-excerpt">{post.excerpt}</div>
  <div class="post-meta">
    <span class="cat">{post.category}</span>
    {post.tags.map((tag) => <span class="tag">{tag}</span>)}
  </div>
</div>
```

关键设计：

- **接口导出** — `export interface Post` 使其他组件（如 `index.astro`）可导入类型，实现类型安全的组件间数据传递
- **解构 props** — `const { post } = Astro.props` 从 Astro 注入的 props 中提取数据
- **`.map()` 渲染** — `post.tags.map(...)` 在模板中直接使用 JS 表达式生成多个 `<span>`
- **分类 vs 标签的视觉区分** — `.cat` 使用粉色边框和粉色文字，`.tag` 使用紫色边框和灰色文字

悬停动效：
```css
.post-card:hover {
  transform: translateY(-4px);  /* 向上浮起 4px */
  box-shadow:
    0 12px 40px 0 rgba(255,102,204,0.25),  /* 粉色外发光 */
    inset 0 0 0 1px var(--pink);            /* 内边框变粉 */
}
```

---

### 7. Sidebar — 侧边栏

`src/components/Sidebar.astro`

```astro
---
export interface Category {
  name: string;
  icon: string;
  count: number;
  slug: string;
}

interface Props {
  postCount: number;
  projectCount: number;
  categories: Category[];
  tags: string[];
}
---
```

三个子区块：

**统计网格：**
```html
<div class="stats-grid">
  <div class="stat-item">
    <div class="stat-number">4</div>    <!-- 像素字体，青色 -->
    <div class="stat-label">POSTS</div>  <!-- 等宽字体，灰色 -->
  </div>
  ...
</div>
```
使用 `grid-template-columns: 1fr 1fr` 双列布局，每个 stat-item 有独立的双层边框。

**分类列表：**
```html
{categories.map((c) => (
  <div class="cat-item">
    <span>{c.icon} {c.name}</span>
    <span class="count">{c.count}</span>
  </div>
))}
```
分类项使用 `flex` + `justify-content: space-between` 实现图标+名称靠左、数量靠右的布局。

**标签云：**
```html
<div class="tag-cloud">
  {tags.map((t) => <span class="tag-chip">{t}</span>)}
</div>
```
`flex-wrap: wrap` 使标签自动换行，悬停时从灰色变为青色。

---

### 8. SakuraEffect — 樱花特效

这是整个博客最复杂的组件，包含三个独立子系统。

`src/components/SakuraEffect.astro`

#### 8.1 Canvas 樱花飘落（粒子系统）

**初始化流程：**

```
DOMContentLoaded
  → initSakura()
    → 获取 canvas 元素
    → 设置 canvas 尺寸 = window.innerWidth/Height
    → 获取 2D 上下文
    → new Image() 加载 /sakura.webp
    → image.onload 回调中：
      → 创建 30 个粒子对象
      → 启动 requestAnimationFrame 循环
```

**粒子数据结构：**

```ts
interface SakuraParticle {
  x: number;           // 水平位置（px）
  y: number;           // 垂直位置（px）
  size: number;        // 绘制尺寸（8-22px 随机）
  vx: number;          // 水平速度（-0.2 ~ 0.2）
  vy: number;          // 垂直速度（0.3 ~ 1.1）
  opacity: number;     // 透明度（0.25 ~ 0.75）
  rot: number;         // 当前旋转角度（弧度）
  rotSpeed: number;    // 旋转速度（-0.01 ~ 0.01）
  swayAmp: number;     // 水平摇摆幅度（0.3 ~ 1.3）
  swaySpeed: number;   // 摇摆频率（0.003 ~ 0.009）
  swayPhase: number;   // 摇摆相位（0 ~ 2π 随机）
}
```

**动画循环：**

```ts
function animateSakura() {
  sakuraCtx.clearRect(0, 0, canvas.width, canvas.height);  // 清空画布

  for (const p of particles) {
    // 1. 更新摇摆相位
    p.swayPhase += p.swaySpeed;

    // 2. 水平移动 = 基础速度 + 正弦摇摆偏移
    p.x += p.vx + Math.sin(p.swayPhase) * p.swayAmp * 0.3;

    // 3. 垂直下落
    p.y += p.vy;

    // 4. 旋转
    p.rot += p.rotSpeed;

    // 5. 边界循环：超出底部 → 回到顶部随机 x
    if (p.y > innerHeight + 40) {
      p.y = -40;
      p.x = Math.random() * innerWidth;
    }
    // 水平越界 → 从另一侧出现
    if (p.x < -40) p.x = innerWidth + 40;
    if (p.x > innerWidth + 40) p.x = -40;

    // 6. 绘制
    sakuraCtx.save();
    sakuraCtx.translate(p.x, p.y);     // 平移到粒子位置
    sakuraCtx.rotate(p.rot);           // 旋转
    sakuraCtx.globalAlpha = p.opacity; // 透明度
    sakuraCtx.drawImage(img, -p.size/2, -p.size/2, p.size, p.size);
    sakuraCtx.restore();
  }

  requestAnimationFrame(animateSakura);  // 递归调度下一帧
}
```

每一帧（约 16ms，60fps）：
1. `clearRect` 清空上一帧所有像素
2. 更新 30 个粒子的位置、旋转、摇摆
3. 对每个粒子执行 `save → translate → rotate → setAlpha → drawImage → restore`
4. 通过 `requestAnimationFrame` 请求下一帧

**窗口缩放适配：**
```ts
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
```
Canvas 尺寸与视口同步，粒子系统自动适应。

#### 8.2 点击樱花爆炸（DOM 动画）

```ts
document.addEventListener("click", (e: MouseEvent) => {
  const count = 5 + Math.floor(Math.random() * 4);  // 每次 5-8 个粒子

  for (let i = 0; i < count; i++) {
    // 创建 div 元素
    const sakura = document.createElement("div");
    sakura.className = "click-sakura";

    // 定位到鼠标点击位置
    sakura.style.left = e.clientX + "px";
    sakura.style.top = e.clientY + "px";

    document.body.appendChild(sakura);

    // 随机方向和距离
    const angle = Math.random() * Math.PI * 2;     // 0-360° 随机
    const distance = 40 + Math.random() * 60;       // 40-100px
    const rot = (Math.random() - 0.5) * 540 + "deg"; // ±270°

    // 触发 reflow 后应用动画终点
    sakura.offsetWidth;  // 强制浏览器计算布局
    sakura.style.transform = `translate(
      calc(-50% + ${Math.cos(angle) * distance}px),
      calc(-50% + ${Math.sin(angle) * distance}px)
    ) scale(1.2) rotate(${rot})`;
    sakura.style.opacity = "0";  // 同时淡出

    // 600ms 后移除 DOM 节点
    setTimeout(() => sakura.remove(), 600);
  }
});
```

工作原理：
1. 在 `click` 事件位置创建 5-8 个 `<div class="click-sakura">`
2. 每个 div 的初始样式：`scale(0.3) rotate(0deg) opacity(1)`（定义在 CSS 中）
3. 通过读取 `offsetWidth` 强制浏览器 reflow，使浏览器记录初始状态
4. 立即设置终点样式：`translate(...) scale(1.2) rotate(±270°) opacity(0)`
5. CSS `transition` 在初始态和终点态之间自动插值动画（0.6s cubic-bezier）
6. 动画结束后 `setTimeout` 移除 DOM，防止内存泄漏

`offsetWidth` 是关键技巧 — 如果在同一帧内连续修改样式，浏览器会批量处理而跳过过渡。读取布局属性会强制刷新样式计算，使过渡得以触发。

#### 8.3 自定义光标

使用 SVG Data URI 直接嵌入光标图像，零网络请求：

**默认光标（粉色箭头）：**
```css
body {
  cursor: url("data:image/svg+xml;utf8,<svg xmlns='...' width='24' height='24'>
    <path fill='%23ff66cc' stroke='%23ffffff' stroke-width='1.5'
          d='M2 2 L9 17 L10 12 L16 18 L18 16 L12 10 L17 9 Z'/>
  </svg>") 2 2, auto;
}
```

**悬停光标（青色箭头）：**
```css
a, button, .cat-wrap, .post-card, .cat-item, .tag-chip, .project-card {
  cursor: url("...fill='%2366ffcc'...") 2 2, pointer !important;
}
```

- `%23` = URL 编码的 `#`（Data URI 中 `#` 会被解析为片段标识符）
- `2 2` = 热点坐标（箭头尖端在 SVG 中的像素位置）
- `auto` / `pointer` = 回退光标（Data URI 不支持的浏览器使用系统默认）
- `!important` 确保覆盖默认光标样式

---

### 9. index.astro — 主页编排

`src/pages/index.astro` 是 Astro 的路由入口（映射为 `/`），负责：

1. **数据定义**（服务端 Frontmatter）
2. **组件组装**（模板层）
3. **客户端交互脚本**（`<script>` 标签）

#### 9.1 数据层（Frontmatter）

```astro
---
import Layout from "@layouts/Layout.astro";
import type { Post } from "@components/PostCard.astro";  // 导入类型

const POSTS: Post[] = [
  { id: 1, title: "Welcome to My Pixel Blog", ... },
  // ...
];

const HERO_PHRASES = ["CODE. DESIGN. LIFE.", ...];
```

数据在构建时处理，不发送到客户端（除通过 `define:vars` 显式传递的部分）。

#### 9.2 模板层 — 条件渲染

```astro
<Layout>
  <div class="game-scene">
    <div class="scroll-container">
      <div class="web-wrapper">
        <NavBar />
        <HeroBanner />

        <!-- HOME 页面（默认显示） -->
        <div class="section-page active" id="page-home">
          <div class="main-col">
            {POSTS.map((post) => <PostCard post={post} />)}
          </div>
          <div class="side-col">
            <Sidebar postCount={POSTS.length} ... />
          </div>
        </div>

        <!-- PROJECTS 页面（默认隐藏） -->
        <div class="section-page" id="page-projects">
          ...
        </div>
      </div>
    </div>
    <div class="foreground-layer"></div>
  </div>
</Layout>
```

两个 `section-page` 同时渲染到 DOM，但只有带 `.active` 的可见：

```css
.section-page { display: none; }
.section-page.active { display: flex; }
```

#### 9.3 客户端脚本 — 页面切换

```ts
mainNav.addEventListener("click", (e) => {
  const a = target.closest("a");
  if (!a?.dataset.page) return;

  // 1. 隐藏所有页面
  document.querySelectorAll(".section-page")
    .forEach(s => s.classList.remove("active"));

  // 2. 清除所有导航链接的激活态
  document.querySelectorAll("#mainNav a")
    .forEach(l => l.classList.remove("active"));

  // 3. 显示目标页面
  document.getElementById("page-" + a.dataset.page)
    ?.classList.add("active");

  // 4. 激活当前链接
  a.classList.add("active");
});
```

通过 `data-page` 属性关联导航链接和页面容器 — `data-page="home"` 对应 `#page-home`，`data-page="projects"` 对应 `#page-projects`。

#### 9.4 服务端到客户端的数据桥接

```astro
<script define:vars={{ phrases: HERO_PHRASES }}>
  function startTypewriter() {
    // phrases 变量在构建时被序列化为 JSON 内联到此处
    el.textContent = phrases[idx];
  }
</script>
```

`define:vars` 的工作机制：

1. 构建时，Astro 识别 `<script define:vars={{ phrases: [...] }}>`
2. 将值序列化为 JSON
3. 在 `<script>` 开头注入 `const phrases = ["CODE. DESIGN. LIFE.", ...];`
4. 客户端脚本直接使用该变量

这比在脚本中硬编码数据更灵活 — 数据源可以在服务端动态生成。

---

## 数据流

```
┌──────────────────────────────────────────────────┐
│  服务端（构建时 / SSR）                            │
│                                                   │
│  index.astro (Frontmatter)                        │
│  ┌─────────────────────────────────────────────┐ │
│  │ const POSTS: Post[] = [...]                 │ │
│  │ const PROJECTS_DATA = [...]                 │ │
│  │ const CATEGORIES = [...]                    │ │
│  │ const TAGS = [...]                          │ │
│  │ const HERO_PHRASES = [...]                  │ │
│  └──────────────┬──────────────────────────────┘ │
│                 │                                  │
│     ┌───────────┼───────────┐                     │
│     │           │           │                     │
│     ▼           ▼           ▼                     │
│  PostCard    Sidebar    define:vars               │
│  (props)     (props)    (JSON 序列化)              │
│     │           │           │                     │
└─────┼───────────┼───────────┼─────────────────────┘
      │           │           │
      ▼           ▼           ▼
┌──────────────────────────────────────────────────┐
│  客户端（浏览器）                                  │
│                                                   │
│  HTML 中的静态内容                                │
│  ┌─────────────────────────────────────────────┐ │
│  │ <div class="post-card">...</div>  (已渲染)  │ │
│  │ <div class="stat-item">4 POSTS</div>        │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  <script> 中的动态逻辑                             │
│  ┌─────────────────────────────────────────────┐ │
│  │ const phrases = [...]  ← define:vars 注入   │ │
│  │                                              │ │
│  │ // 导航切换                                  │ │
│  │ mainNav.click → toggle .active              │ │
│  │                                              │ │
│  │ // 猫咪随机                                  │ │
│  │ catWrap.click → random catN.png             │ │
│  │                                              │ │
│  │ // 打字机                                    │ │
│  │ cycle() → opacity + textContent              │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  SakuraEffect.astro <script>                      │
│  ┌─────────────────────────────────────────────┐ │
│  │ // Canvas 粒子系统                           │ │
│  │ initSakura() → 30 particles                 │ │
│  │ animateSakura() → requestAnimationFrame     │ │
│  │                                              │ │
│  │ // 点击爆炸                                  │ │
│  │ document.click → 5-8 DOM 粒子 + transition  │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## 构建系统

### Astro 配置 (`astro.config.mjs`)

```js
export default defineConfig({
  site: "https://catblog.fanyouhao.top/",
  output: "static",                          // SSG 模式，生成纯静态文件
  integrations: [svelte()],                  // Svelte 组件支持
  vite: {
    plugins: [tailwindcss()],               // Tailwind CSS v4 通过 Vite 插件
    build: {
      assetsInlineLimit: 4096,              // < 4KB 的资源内联为 base64
      cssCodeSplit: true,                   // CSS 按页面分割
      cssMinify: "esbuild",                 // CSS 压缩引擎
    },
  },
});
```

### 构建流程

```
pnpm run build
  → astro build
    → 1. 扫描 src/pages/ 确定路由
    → 2. 处理 Frontmatter（数据准备）
    → 3. 渲染 Astro 组件 → HTML
    → 4. Vite 打包 JS/CSS
    → 5. 复制 public/ → dist/
    → 6. 输出 dist/index.html
```

### 构建产物

```
dist/
├── index.html                                  # 主页（8.9 KB）
├── _astro/
│   ├── index.DYSKWeOl.css                      # CSS（9.0 KB）
│   └── client.svelte.q75NigDq.js               # Svelte 运行时（25.8 KB）
├── cat1.png ~ cat9.png                         # 图片直接复制
├── sakura.webp
├── hero图.webp
└── ChatGPT Image ... .png
```

---

## 开发指南

### 环境要求

- **Node.js** >= 18
- **pnpm** >= 10（`package.json` 中 `preinstall` 脚本强制使用 pnpm）

### 安装与运行

```bash
# 进入项目
cd cat-blog

# 安装依赖
pnpm install

# 启动开发服务器（http://localhost:4321）
pnpm run dev

# 生产构建
pnpm run build

# 预览生产构建
pnpm run preview
```

### 添加新文章

编辑 `src/pages/index.astro` 中的 `POSTS` 数组：

```ts
const POSTS: Post[] = [
  {
    id: 5,                                    // 唯一 ID
    title: "新文章标题",
    excerpt: "文章摘要...",
    date: "2026-07-15",
    category: "开发",                          // 分类名
    tags: ["Astro", "Web"],                   // 标签数组
    isNew: true,                              // 是否显示 NEW 标记
    pinned: false,                            // 是否置顶
  },
  // ...已有文章
];
```

### 添加新分类

编辑 `CATEGORIES` 数组：

```ts
const CATEGORIES: Category[] = [
  { name: "新分类", icon: "N", count: 3, slug: "new-cat" },
  // ...
];
```

### 添加新标签

编辑 `TAGS` 数组：

```ts
const TAGS: string[] = ["新标签", "像素", "博客", ...];
```

### 自定义 Hero 轮播语

编辑 `HERO_PHRASES` 数组：

```ts
const HERO_PHRASES = [
  "你的标语 1",
  "你的标语 2",
  // ...任意数量
];
```

轮播间隔可在脚本中调整 `setTimeout(cycle, 3500)` 的第二个参数（毫秒）。

### 调整樱花特效

编辑 `SakuraEffect.astro`：

| 参数 | 位置 | 默认值 | 说明 |
|------|------|--------|------|
| 粒子数量 | `i < 30` | 30 | 第 30 行的循环次数 |
| 下落速度 | `vy: 0.3 + Math.random() * 0.8` | 0.3 ~ 1.1 | 每帧垂直位移（px） |
| 摇摆幅度 | `swayAmp: 0.3 + Math.random() * 1.0` | 0.3 ~ 1.3 | 正弦波振幅 |
| 粒子大小 | `size: 8 + Math.random() * 14` | 8 ~ 22 | 绘制直径（px） |
| 透明度 | `opacity: 0.25 + Math.random() * 0.5` | 0.25 ~ 0.75 | alpha 通道 |
| 点击爆炸数 | `5 + Math.floor(Math.random() * 4)` | 5 ~ 8 | 每次点击生成的粒子数 |
| 爆炸扩散半径 | `40 + Math.random() * 60` | 40 ~ 100 | 粒子扩散距离（px） |

---

## 许可

MIT License

---

*Built with Astro · Svelte · Tailwind CSS · Pixel Love*