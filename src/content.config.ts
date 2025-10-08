import { defineCollection, z } from 'astro:content';

// 共享的内容 schema - DRY原则
const contentSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  excerpt: z.string().optional(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  // 兼容单数和复数形式
  tag: z.union([z.array(z.string()), z.string()]).optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  category: z.union([z.array(z.string()), z.string()]).optional(),
  categories: z.union([z.array(z.string()), z.string()]).optional(),
  draft: z.boolean().default(false),
  sticky: z.number().default(0),
  author: z.string().optional(),
  comments: z.boolean().optional(),
  encrypted: z.boolean().default(false),
  prompt: z.string().optional(),
  hint: z.string().optional(),
});

const pageSchema = z.object({
  title: z.string(),
  date: z.coerce.date().optional(),
  updated: z.coerce.date().optional(),
  comments: z.boolean().optional(),
});

const post = defineCollection({
  type: 'content',
  schema: contentSchema,
});

const oi = defineCollection({
  type: 'content',
  schema: contentSchema,
});

const page = defineCollection({
  type: 'content',
  schema: pageSchema,
});

const oiPage = defineCollection({
  type: 'content',
  schema: pageSchema,
});

export const collections = {
  post,
  oi,
  page,
  oiPage,
};
