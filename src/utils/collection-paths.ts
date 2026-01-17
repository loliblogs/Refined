/**
 * Collection路径工具
 * 统一管理不同collection的路径生成
 *
 * "消除特殊情况，让它们变成正常情况"
 */

import { posix } from 'node:path';

import { base as globalBase } from 'astro:config/server';

import { getBasePath as getBasePathConfig } from '@/config/paths.config';
import type { CollectionName } from '@/types/content';

/**
 * 获取完整路径（包含 base）
 */
export function getFullPath(path: string): string {
  return posix.join(globalBase, path);
}

/**
 * 判断路径是否为站点根路径
 */
export function isRootPath(path: string): boolean {
  return path === globalBase;
}

/**
 * 获取collection的基础路径（包含 base）
 */
export function getBasePath(collection: CollectionName): string {
  return posix.join(globalBase, getBasePathConfig(collection));
}

/**
 * 生成文章URL
 */
export function getPostUrl(slug: string, collection: CollectionName): string {
  const basePath = getBasePath(collection);
  return posix.join(basePath, 'post', slug);
}

/**
 * 生成分类URL
 */
export function getCategoryIndexUrl(collection: CollectionName): string {
  const basePath = getBasePath(collection);
  return posix.join(basePath, 'category');
}

/**
 * 生成分类URL
 */
export function getCategoryUrl(category: string, collection: CollectionName): string {
  const basePath = getBasePath(collection);
  return posix.join(basePath, 'category', category);
}

/**
 * 生成标签URL
 */
export function getTagIndexUrl(collection: CollectionName): string {
  const basePath = getBasePath(collection);
  return posix.join(basePath, 'tag');
}

export function getTagUrl(tag: string, collection: CollectionName): string {
  const basePath = getBasePath(collection);
  return posix.join(basePath, 'tag', tag);
}

/**
 * 生成归档URL
 */
export function getArchiveUrl(collection: CollectionName): string {
  const basePath = getBasePath(collection);
  return posix.join(basePath, 'archive');
}

/**
 * 生成分页URL（用于列表页分页）
 */
export function getPaginationUrl(page: number, collection: CollectionName): string {
  const basePath = getBasePath(collection);

  // 第一页特殊处理
  if (page === 1) {
    return basePath || '/';
  }

  return posix.join(basePath, 'page', page.toString());
}

/**
 * 生成搜索URL
 */
export function getSearchUrl(collection: CollectionName): string {
  const basePath = getBasePath(collection);
  return posix.join(basePath, 'search');
}

/**
 * 生成搜索bundle路径
 */
export function getSearchBundlePath(collection: CollectionName): string {
  const basePath = getBasePath(collection);
  return posix.join(basePath, 'pagefind/');
}

/**
 * 生成sitemap索引URL
 */
export function getSitemapIndexUrl(): string {
  return posix.join(globalBase, 'sitemap-index.xml');
}

/**
 * 生成RSS URL
 */
export function getRssUrl(collection: CollectionName): string {
  const basePath = getBasePath(collection);
  return posix.join(basePath, 'rss.xml');
}

/**
 * 生成RSS URL
 */
export function getRssStylesUrl(collection: CollectionName): string {
  const basePath = getBasePath(collection);
  return posix.join(basePath, 'rss-styles.xsl');
}

/**
 * 生成独立页面URL（page/oiPage）
 */
export function getPageUrl(slug: string, collection: CollectionName): string {
  const basePath = getBasePath(collection);
  return posix.join(basePath, slug);
}
