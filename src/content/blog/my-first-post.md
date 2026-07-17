---
title: "我的第一篇知识分享：Astro 架构重构"
date: 2026-07-18
cover: "/cat.png"
excerpt: "今天正式将博客升级为原生 Markdown..."
category: "开发"
tags: ["Astro", "前端"]
---

# 知识库重建计划

终于告别了在网页输入框里写长篇大论的痛苦。现在，我可以直接在 VSCode 里，用最舒服的姿势编写 Markdown 文件，只要把文件丢进 `src/content/blog/` 目录，网站就会自动抓取并生成精美的页面！

## 1. 视频直插直播测试

因为 Astro 的强大特性，我甚至不需要写复杂的插件，直接去 B 站网页端点击“分享 -> 嵌入代码”，然后给它加个圆角样式，就能完美播放。

<iframe src="//player.bilibili.com/player.html?isOutside=true&bvid=BV1GJ411x7h7&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="width: 100%; aspect-ratio: 16/9; border-radius: 16px; margin: 20px 0; box-shadow: 0 8px 24px rgba(0,0,0,0.15);"></iframe>

## 2. 图片展示

图片也非常简单，直接引用 `public` 文件夹里的图片，或者随便贴个网图：

![测试猫咪头像](/cat1.png)

以后这里就是我的核心工作站了！