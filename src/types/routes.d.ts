/**
 * 路由相关的类型定义
 * 统一管理所有路由页面的 Props 类型
 */

import type { Page } from 'astro';
import type { CollectionEntry } from 'astro:content';
import type { Post, Category, Tag } from './content';

/**
 * 文章详情页 Props
 * 用于 /post/[...slug] 和 /oi/post/[...slug]
 */
export interface PostRouteProps {
  post: Post;
  prevPost: Post | null;
  nextPost: Post | null;
}

/**
 * 分类首页 Props
 * 用于 /category/[...path] 和 /oi/category/[...path]
 */
export interface CategoryRouteProps {
  category: Category;
  posts: Post[];
  ancestors: Category[];
  subcategories: Category[];
  currentPage: number;
  lastPage: number;
}

/**
 * 分类分页页 Props
 * 用于 /category/[...path]/page/[page]
 */
export interface CategoryPagedRouteProps {
  page: Page<Post>;
  category: Category;
}

/**
 * 标签首页 Props
 * 用于 /tag/[...path] 和 /oi/tag/[...path]
 */
export interface TagRouteProps {
  tag: Tag;
  posts: Post[];
  ancestors: Tag[];
  relatedTags: Tag[];
  childTags: Tag[];
  currentPage: number;
  lastPage: number;
}

/**
 * 标签分页页 Props
 * 用于 /tag/[...path]/page/[page]
 */
export interface TagPagedRouteProps {
  page: Page<Post>;
  tag: Tag;
  relatedTags: Tag[];
  childTags: Tag[];
}

/**
 * 首页分页 Props
 * 用于 /page/[page] 和 /oi/page/[page]
 */
export interface HomePagedRouteProps {
  page: Page<Post>;
}

/**
 * 自定义页面 Props
 * 用于 /[...slug] 和 /oi/[...slug]
 */
export interface CustomPageRouteProps {
  page: CollectionEntry<'page'> | CollectionEntry<'oiPage'>;
}
