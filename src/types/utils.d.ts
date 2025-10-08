/**
 * 工具类公共接口定义
 */

import type { Post, Category, Tag } from './content';

// ========== 分类系统相关 ==========

export interface TaxonomyNode {
  // 基础属性
  name: string;
  path: string;
  level: number;

  // 关系 - 直接使用引用，不用字符串
  parentNode?: TaxonomyNode | undefined;  // 明确允许 undefined
  childNodes: Set<TaxonomyNode>;

  /**
   * 直接属于该节点的文章ID集合
   * 注意：只包含直接属于该节点的文章，不包含子节点的文章
   * 例如：Frontend/ 分类可能没有直接文章（postIds为空），
   *      但其子分类 Frontend/React/ 有文章
   * 使用 Set 自动去重，避免同一文章被多次添加
   */
  postIds: Set<string>;

  /**
   * 递归文章总数（包含所有子孙节点的去重后文章数）
   * 与 postIds.size 不同，count 包含了所有子分类的文章
   * 例如：Frontend/ 的 count 包含 Frontend/React/ 和 Frontend/Vue/ 的所有文章
   */
  count: number;
}

export interface TaxonomyStats {
  totalNodes: number;
  maxLevel: number;
  averagePostsPerNode: number;
  topNodes: TaxonomyNode[];
}

// ========== 数据加载相关 ==========

export interface CollectionData {
  indexPosts: Post[];      // sticky优先+时间排序（首页用）
  archivePosts: Post[];    // 纯时间排序（归档用）
  unfilteredArchivePosts: Post[]; // 纯时间排序（实际渲染用，不过滤draft）
  postMap: Map<string, Post>;  // ID到文章的映射
  // 预计算的路径数据 - 避免重复计算
  tagPaths?: TagPathData[];  // 预计算的标签路径数据
  categoryPaths?: CategoryPathData[];  // 预计算的分类路径数据
  initialized: boolean;
}

export interface TagPathData {
  params: { path: string };
  props: {
    tag: Tag;
    posts: Post[];
    ancestors: Tag[];
    relatedTags: Tag[];
    childTags: Tag[];
  };
}

export interface CategoryPathData {
  params: { path: string };
  props: {
    category: Category;
    posts: Post[];
    ancestors: Category[];
    subcategories: Category[];
  };
}

// ========== TOC相关 ==========

export interface TocItem {
  level: number;
  text: string;
  id: string;
}

// ========== 文本处理相关 ==========

export interface TruncateOptions {
  /** 后缀，默认为 '...' */
  suffix?: string;
  /** 是否在单词边界截断，默认为 true */
  wordBoundary?: boolean;
}
