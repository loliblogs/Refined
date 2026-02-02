import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

/**
 * 字符串数组字段 - 支持单个字符串或数组
 * 统一转换为数组，默认为空数组
 */
const stringArrayField = z.union([z.array(z.string()), z.string()])
  .transform(v => (Array.isArray(v) ? v : [v]))
  .default([]);

/**
 * 判断是否为小写品牌词（不应首字母大写）
 * npm、pnpm 及其衍生词（如 npm-cli、pnpm-workspace）保持小写
 */
const isLowercaseBrand = (s: string): boolean =>
  s.startsWith('npm') || s.startsWith('pnpm');

/**
 * 标准化分类/标签名称
 * 规则：
 * 1. 已有大写字母 → 保持原样（用户写的 FFmpeg、JavaScript 等）
 * 2. 全小写但是品牌词 → 保持原样（npm、pnpm 等）
 * 3. 全小写且非品牌词 → 首字母大写（frontend → Frontend）
 */
const normalizeName = (segment: string): string => {
  // 已有大写字母，保持原样
  if (segment !== segment.toLowerCase()) {
    return segment;
  }
  // 小写品牌词，保持原样
  if (isLowercaseBrand(segment)) {
    return segment;
  }
  // 全小写且非品牌词，首字母大写
  return segment.charAt(0).toUpperCase() + segment.slice(1);
};

/**
 * 处理分类/标签路径
 * 对每个路径段应用标准化规则
 */
const processPath = (path: string): string =>
  path.split('/').map(normalizeName).join('/');

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
  lang: z.string().optional(),

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
    // 标准化名称（首字母大写，品牌词除外）
    // URL 生成时会自动转小写，无需存储 slug
    category: [...data.category, ...categories].map(processPath),
    tag: [...data.tag, ...tags].map(processPath),
  };
});

const pageSchema = z.object({
  title: z.string(),
  date: z.coerce.date().optional(),
  updated: z.coerce.date().optional(),
  description: z.string().optional(),
  lang: z.string().optional(),
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
