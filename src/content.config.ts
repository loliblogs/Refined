import { defineCollection, z } from 'astro:content';

/**
 * 字符串数组字段 - 支持单个字符串或数组
 * 统一转换为数组，默认为空数组
 */
const stringArrayField = z.union([z.array(z.string()), z.string()])
  .transform(v => (Array.isArray(v) ? v : [v]))
  .default([]);

/**
 * 共享的内容 schema - Hexo风格
 *
 * 设计原则：
 * 1. 标准字段：单数（category/tag）
 * 2. 别名字段：复数（categories/tags）
 * 3. 合并策略：直接concat，消除特殊情况检查
 */
const contentSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  excerpt: z.string().optional(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),

  // 标准字段
  category: stringArrayField,
  tag: stringArrayField,

  // 别名字段（向后兼容）
  categories: stringArrayField,
  tags: stringArrayField,

  draft: z.boolean().default(false),
  sticky: z.number().default(0),
  author: z.string().optional(),
  comments: z.boolean().optional(),
  encrypted: z.boolean().default(false),
  prompt: z.string().optional(),
  hint: z.string().optional(),
}).transform((data) => {
  // 合并单数和复数字段
  const { categories, tags, ...rest } = data;

  return {
    ...rest,
    category: [...data.category, ...categories],
    tag: [...data.tag, ...tags],
  };
});

const pageSchema = z.object({
  title: z.string(),
  date: z.coerce.date().optional(),
  updated: z.coerce.date().optional(),
  description: z.string().optional(),
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
