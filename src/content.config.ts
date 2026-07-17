import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// 1. 原有的博客文章模型
const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    cover: z.string().optional(),
    excerpt: z.string().optional(),
    category: z.string().default("未分类"),
    tags: z.array(z.string()).default([]),
  }),
});

// 👇 2. 新增：光影画廊（相册）模型
const galleryCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/gallery" }),
  schema: z.object({
    title: z.string(), // 相册名称
    date: z.date(), // 拍摄或创建日期
    description: z.string().optional(), // 相册底部的描述文字
    photos: z.array(z.string()).min(1), // 照片路径数组（至少需要1张）
  }),
});

export const collections = {
  blog: blogCollection,
  gallery: galleryCollection, // 注册相册集合
};