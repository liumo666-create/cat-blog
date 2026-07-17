import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders"; // 🌟 新增：Astro 6 必备的加载器模块

// 定义博客文章的数据模型
const blogCollection = defineCollection({
  // 🌟 核心修改：明确告诉 Astro 去 src/content/blog 目录下抓取所有的 .md 文件
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }), 
  
  schema: z.object({
    title: z.string(), // 标题（必填）
    date: z.date(), // 日期（必填，用于排序）
    cover: z.string().optional(), // 封面图路径（选填，放在 public 目录下）
    excerpt: z.string().optional(), // 简短摘要（选填）
    category: z.string().default("未分类"), // 分类（默认值）
    tags: z.array(z.string()).default([]), // 标签数组
  }),
});

export const collections = {
  blog: blogCollection,
};