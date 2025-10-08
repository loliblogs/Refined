import type { RenderResult } from 'astro:content';
import type { TaxonomyNode } from './utils';

export type CollectionName = 'post' | 'oi';
export type PageCollectionName = 'page' | 'oiPage';


/**
 * TimelineFilter组件用的精简文章类型
 * 只包含时间线展示必需的字段
 */
export interface TimelinePost {
  id: string;
  date: string;
  slug: string;
  title: string;
}

/**
 * 博客文章接口
 */
export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | undefined;  // 可选（影响主页渲染逻辑）
  date: Date;
  updated?: Date | undefined;
  author: string;  // 现在是必需的（默认使用站点配置的作者）

  // 分类（支持多分类，每个分类支持多级路径）
  category: string[];  // 必需（默认空数组）

  // 标签（支持多级路径）
  tags: string[];  // 必需（默认空数组）

  // 文章元数据
  sticky: number;  // 必需（默认 0）
  draft: boolean;  // 必需（默认 false）
  comments: boolean;  // 必需（默认使用站点配置）
  hasMoreTag: boolean;  // 是否包含 <!--more--> 标记

  // SEO 相关
  description: string;  // 必需（没有则从内容自动生成）

  // 加密相关
  encrypted: boolean;  // 是否加密（必填）
  salt?: string | undefined;       // 预处理的 salt（只有加密时才有）
  derivedKey?: string | undefined; // 预计算的密钥 base64 编码（只在服务端存在，不会序列化到客户端）
  hint?: string | undefined;       // 密码输入提示（只有加密时才有）
  prompt?: string | undefined;     // 加密内容提示（只有加密时才有）

  // Astro 集成字段
  collection: CollectionName;  // 必需（标识内容集合）
  render: () => Promise<RenderResult>;
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
  layoutType?: LayoutType; // 页面类型
  render?: () => Promise<RenderResult>;  // 渲染函数（仅文章页需要）
  title?: string;         // 页面标题
  collection: CollectionName; // 所属collection
}

/**
 * 布局类型定义
 */
export type LayoutType = 'home' | 'post' | 'page' | 'archive' | 'category' | 'tag';
