/**
 * 内容类型定义 - 重构版
 *
 * 核心改进：
 * 1. excerptSource: 统一的摘要来源（判别联合类型）
 * 2. encryption: 必选字段，false 或对象（强制完整性）
 * 3. 删除所有分散的旧字段
 */

import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { TaxonomyNode } from './utils';

export type CollectionName = 'post' | 'oi';
export type PageCollectionName = 'page' | 'oiPage';

/**
 * 摘要来源 - 判别联合类型
 * fixed: 用户手写摘要或加密提示（固定文本）
 * generated: 从文章正文自动提取
 */
export type ExcerptSource
  = | { type: 'fixed'; text: string }
    | { type: 'generated'; hasMoreTag: boolean };

/**
 * 加密信息
 */
export interface EncryptionInfo {
  salt: string;
  derivedKey: string;
  hint: string;
  prompt: string;
}

/**
 * 博客文章接口
 */
export interface Post {
  id: string;
  slug: string;
  title: string;
  date: Date;
  updated?: Date | undefined;
  author: string;  // 现在是必需的（默认使用站点配置的作者）

  // 分类（支持多分类，每个分类支持多级路径）
  category: string[];  // 显示用，URL 生成时自动转小写

  // 标签（支持多级路径）
  tags: string[];  // 显示用，URL 生成时自动转小写

  // 文章元数据
  sticky: number;  // 必需（默认 0）
  draft: boolean;  // 必需（默认 false）
  comments: boolean;  // 必需（默认使用站点配置）

  // SEO 相关
  description: string;  // 必需（没有则从内容自动生成）

  // 摘要（新增，必选）
  excerptSource: ExcerptSource;

  // 加密（新增，必选，false 或对象）
  encryption: false | EncryptionInfo;

  // Astro 集成字段
  collection: CollectionName;  // 必需（标识内容集合）
  Content: AstroComponentFactory; // 预渲染的内容组件（Astro 5: 从 render(entry) 获取）
}

/**
 * 分类和标签 - 都是 TaxonomyNode
 * 没有实质差别，统一处理
 */
export type Category = TaxonomyNode;
export type Tag = TaxonomyNode;

/**
 * 页面上下文 - 只包含必要信息
 */
export interface PageContext {
  path: string;           // 当前页面路径
  collection: CollectionName; // 所属collection
  noindex?: boolean;         // 是否不索引（默认 false）
  redirect?: {
    to?: string;
    timeout: number;
  };
}
