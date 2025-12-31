/**
 * Postlink Integration
 *
 * 在构建开始前扫描所有 content 文件，生成 id → URL 的映射表，
 * 通过 Vite virtual module 暴露给 remark 插件使用。
 *
 * 这样避免了在 remark 插件中调用 getCollection（会导致循环依赖）。
 */

import fs from 'node:fs';
import path, { posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globby } from 'globby';
import matter from 'gray-matter';
import GithubSlugger from 'github-slugger';
import type { AstroIntegration, AstroConfig } from 'astro';

import { getCollectionPath } from '../config/paths.config';

// 全局变量存储映射表（供 remark 插件同步访问）
export const postlinkMap: Record<string, string> = {};

/**
 * 计算文件的 slug
 * - 优先使用 frontmatter 中的 slug
 * - 否则使用 github-slugger 处理文件名
 */
function computeSlug(filename: string, frontmatter: Record<string, unknown>): string {
  // 优先使用自定义 slug
  if (frontmatter.slug && typeof frontmatter.slug === 'string') {
    return frontmatter.slug;
  }

  // 使用 github-slugger 处理文件名（去掉扩展名）
  const slugger = new GithubSlugger();
  const nameWithoutExt = filename.replace(/\.mdx?$/, '');
  return slugger.slug(nameWithoutExt);
}

/**
 * 生成文章 URL
 */
function buildPostUrl(slug: string, collection: string, base: string): string {
  const collectionPath = getCollectionPath(collection);
  return posix.join(base, collectionPath, slug);
}

/**
 * 扫描 content 目录，生成 id → URL 映射
 */
async function buildPostlinkMap(config: AstroConfig): Promise<void> {
  const base = config.base || '/';
  const rootDir = fileURLToPath(config.root);
  const contentDir = path.join(rootDir, 'src/content');

  // 扫描所有 md/mdx 文件（返回 posix 格式的相对路径）
  const files = await globby(['**/*.md', '**/*.mdx'], { cwd: contentDir });

  for (const relativePath of files) {
    // relativePath 已经是 posix 格式：'oi/article.md'
    const firstSlash = relativePath.indexOf('/');
    if (firstSlash === -1) continue;

    const collection = relativePath.slice(0, firstSlash);
    const id = relativePath.slice(firstSlash + 1);
    const filename = id.split('/').at(-1);

    // 跳过以 _ 开头的文件（隐藏文件）
    if (!filename || filename.startsWith('_')) continue;

    // 读取文件，解析 frontmatter
    const filePath = path.join(contentDir, relativePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter } = matter(content);

    // 计算 slug 和 URL
    const slug = computeSlug(filename, frontmatter);
    const url = buildPostUrl(slug, collection, base);

    // key = collection/id（与 PostLink 参数格式一致）
    postlinkMap[relativePath] = url;
  }
}

/**
 * Postlink Astro Integration
 */
export default function postlinkIntegration(): AstroIntegration {
  return {
    name: 'postlink',
    hooks: {
      'astro:config:setup': async ({ config }) => {
        await buildPostlinkMap(config);
      },
    },
  };
}
