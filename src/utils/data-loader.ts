/**
 * 优化的数据加载器 - 支持多collection
 * 核心改进：
 * 1. 支持多个collection独立管理
 * 2. 每个collection有独立的索引和缓存
 * 3. 保持向后兼容（默认使用'post'）
 */

import { getCollection } from 'astro:content';

import { getSiteConfig } from '@/config/site.config';
import type { Post, Tag, Category, CollectionName } from '@/types/content';
import type { CollectionData, TagPathData, CategoryPathData } from '@/types/utils';

import { TaxonomySystem } from './taxonomy-system';
import { truncateText } from './text-helpers';
import { getOrComputeArgon2Key } from './argon2-cache';

// 每个collection的独立数据存储
const collectionDataCache = new Map<CollectionName, CollectionData>();

// 每个collection独立的taxonomy系统
const tagSystems = new Map<CollectionName, TaxonomySystem>();
const categorySystems = new Map<CollectionName, TaxonomySystem>();

/**
 * 获取指定collection的Tag Taxonomy系统（对外异步，内部不创建，仅返回已初始化缓存）
 */
export async function getTagSystem(collection: CollectionName) {
  await initializeDataOnce(collection);
  const system = tagSystems.get(collection);
  if (!system) {
    throw new Error(`Tag taxonomy not initialized for collection "${collection}"`);
  }
  return system;
}

/**
 * 获取指定collection的Category Taxonomy系统（对外异步，内部不创建，仅返回已初始化缓存）
 */
export async function getCategorySystem(collection: CollectionName) {
  await initializeDataOnce(collection);
  const system = categorySystems.get(collection);
  if (!system) {
    throw new Error(`Category taxonomy not initialized for collection "${collection}"`);
  }
  return system;
}

/**
 * 获取或创建collection数据
 */
function getCollectionData(collection: CollectionName): CollectionData {
  let data = collectionDataCache.get(collection);
  if (!data) {
    data = {
      indexPosts: [],
      archivePosts: [],
      unfilteredArchivePosts: [],
      postMap: new Map(),
      tagPaths: [],
      categoryPaths: [],
      initialized: false,
    };
    collectionDataCache.set(collection, data);
  }
  return data;
}

/**
 * 核心加载函数（支持多collection）
 */
async function initializeDataOnce(collection: CollectionName = 'post'): Promise<void> {
  const data = getCollectionData(collection);

  // 已经加载过就直接返回
  if (data.initialized) {
    return;
  }

  // 加载对应collection的数据
  const posts = await getCollection(collection);

  // 获取站点配置的默认值（支持per-collection配置）
  const siteConfig = getSiteConfig(collection);
  const defaultAuthor = siteConfig.author.name;
  const defaultComments = siteConfig.comments;

  // 第一轮：并行处理所有文章的基础字段（不包括 Argon2 计算）
  const processedPosts: Post[] = posts
    .map((post) => {
      // 统一转换为数组 - 简单直接
      const normalizeArray = (value: string | string[] | undefined): string[] => {
        if (!value) return [];
        return Array.isArray(value) ? value : [value];
      };

      // 兼容性：复数形式优先，单数形式回退
      const normalizedCategory = normalizeArray(post.data.categories ?? post.data.category);
      const normalizedTags = normalizeArray(post.data.tags ?? post.data.tag);

      // 确定各字段的值
      const finalAuthor = post.data.author ?? defaultAuthor;
      const finalComments = post.data.comments ?? defaultComments;

      // 生成 SEO description
      const finalDescription = post.data.description
        ?? truncateText(post.body, 200, { wordBoundary: true });

      // 检查文章内容是否包含 <!--more--> 标记
      const hasMoreTag = !!post.body
        && (post.body.includes('<!--more-->') || post.body.includes('::more'));

      return {
        id: post.id,
        slug: post.slug,
        title: post.data.title,
        description: finalDescription,
        date: post.data.date,
        updated: post.data.updated,
        category: normalizedCategory,
        tags: normalizedTags,
        author: finalAuthor,
        comments: finalComments,
        draft: post.data.draft,
        sticky: post.data.sticky,
        excerpt: post.data.excerpt,
        hasMoreTag,  // 添加 hasMoreTag 字段
        collection,  // 记录所属collection
        render: post.render,
        encrypted: post.data.encrypted,  // 布尔值
        // 加密相关字段先不填，第二轮处理
        hint: post.data.hint ?? siteConfig.passwordHint ?? '输入密码',
        prompt: post.data.prompt ?? siteConfig.passwordPrompt ?? '此内容已加密，需要密码查看',
      };
    });

  // 第二轮：串行处理加密文章的 Argon2 计算
  // 每个 Argon2 计算需要 64MB 内存，串行确保内存可控
  for (const post of processedPosts) {
    if (post.encrypted) {
      const cacheResult = await getOrComputeArgon2Key(
        collection,
        post.id,
      );
      post.derivedKey = cacheResult.derivedKey;
      post.salt = cacheResult.salt;
    }
  }

  // 构建两套排序
  data.indexPosts = processedPosts
    .filter(post => !post.draft)
    .sort((a, b) => {
      // sticky 降序（大的在前）
      if (a.sticky !== b.sticky) {
        return b.sticky - a.sticky;
      }
      // sticky 相同按时间降序
      const timeDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (timeDiff !== 0) {
        return timeDiff;
      }
      // 时间相同时按 slug 升序排序，确保排序稳定
      return a.slug.localeCompare(b.slug);
    });

  data.unfilteredArchivePosts = processedPosts.sort((a, b) => {
    // 按时间降序
    const timeDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (timeDiff !== 0) {
      return timeDiff;
    }
    // 时间相同时按 slug 升序排序，确保排序稳定
    return a.slug.localeCompare(b.slug);
  });

  data.archivePosts = data.unfilteredArchivePosts.filter(post => !post.draft);

  // 构建文章映射
  data.postMap.clear();
  processedPosts.forEach((post) => {
    data.postMap.set(post.id, post);
  });

  // 初始化系统（每个collection独立） - 在此唯一创建并写回缓存
  const tagSystem = new TaxonomySystem();
  const categorySystem = new TaxonomySystem();
  tagSystems.set(collection, tagSystem);
  categorySystems.set(collection, categorySystem);
  tagSystem.initializeFromPosts(processedPosts, post => post.tags);
  categorySystem.initializeFromPosts(processedPosts, post => post.category);

  // 预计算所有路径数据 - 一次遍历构建所有数据
  // 创建标签和分类到文章的映射
  const tagPostsMap = new Map<string, Post[]>();
  const categoryPostsMap = new Map<string, Post[]>();

  // 一次遍历，分配所有文章到对应的标签和分类
  for (const post of data.indexPosts) {
    // 处理标签
    for (const tagPath of post.tags) {
      let tagPosts = tagPostsMap.get(tagPath);
      if (!tagPosts) {
        tagPosts = [];
        tagPostsMap.set(tagPath, tagPosts);
      }
      tagPosts.push(post);
    }

    // 处理分类
    for (const categoryPath of post.category) {
      let categoryPosts = categoryPostsMap.get(categoryPath);
      if (!categoryPosts) {
        categoryPosts = [];
        categoryPostsMap.set(categoryPath, categoryPosts);
      }
      categoryPosts.push(post);
    }
  }

  const tags = tagSystem.getAllNodes();
  const categories = categorySystem.getAllNodes();

  // 构建 tagPaths（预计算 ancestors 以提高性能）
  data.tagPaths = tags.map(tag => ({
    params: {
      path: tag.path,
    },
    props: {
      tag,
      posts: tagPostsMap.get(tag.path) ?? [],
      ancestors: tagSystem.getAncestors(tag.path),
      relatedTags: tagSystem.getRelatedNodes(tag.path),
      childTags: tagSystem.getChildren(tag.path),
    },
  }));

  // 构建 categoryPaths（预计算 ancestors 以提高性能）
  data.categoryPaths = categories.map(category => ({
    params: {
      path: category.path,
    },
    props: {
      category,
      posts: categoryPostsMap.get(category.path) ?? [],
      ancestors: categorySystem.getAncestors(category.path),
      subcategories: Array.from(category.childNodes),
    },
  }));

  data.initialized = true;
}

// 索引功能已移至 TaxonomySystem

// ===== 公共API（保持向后兼容） =====

// 删除对外预热API：loadAllPosts（不再需要，初始化由各get*内部保证）

/**
 * 获取文章列表（支持多collection）
 * @param sortMode 'index' = sticky优先+时间, 'archive' = 纯时间
 * @param collection 集合名称，默认'post'
 */
export async function getPosts(
  sortMode: 'index' | 'archive' | 'unfilteredArchive' = 'index',
  collection: CollectionName = 'post',
): Promise<Post[]> {
  await initializeDataOnce(collection);
  const data = getCollectionData(collection);
  return sortMode === 'archive'
    ? data.archivePosts
    : sortMode === 'unfilteredArchive'
      ? data.unfilteredArchivePosts
      : data.indexPosts;
}

/**
 * 获取标签相关文章（支持多collection）
 */
export async function getPostsByTag(
  tagPath: string,
  collection: CollectionName = 'post',
): Promise<{
  tag: Tag | null;
  posts: Post[];
  relatedTags: Tag[];
}> {
  await initializeDataOnce(collection);

  // 直接从预计算的数据中查找
  const data = getCollectionData(collection);
  const tagData = data.tagPaths?.find(tp => tp.params.path === tagPath);

  if (!tagData) {
    return {
      tag: null,
      posts: [],
      relatedTags: [],
    };
  }

  return {
    tag: tagData.props.tag,
    posts: tagData.props.posts,
    relatedTags: tagData.props.relatedTags,
  };
}

/**
 * 获取分类相关文章（支持多collection）
 */
export async function getPostsByCategory(
  categoryPath: string,
  collection: CollectionName = 'post',
): Promise<{
  category: Category | null;
  posts: Post[];
  ancestors: Category[];
  subcategories: Category[];
}> {
  await initializeDataOnce(collection);

  // 直接从预计算的数据中查找
  const data = getCollectionData(collection);
  const categoryData = data.categoryPaths?.find(cp => cp.params.path === categoryPath);

  if (!categoryData) {
    return {
      category: null,
      posts: [],
      ancestors: [],
      subcategories: [],
    };
  }

  return {
    category: categoryData.props.category,
    posts: categoryData.props.posts,
    ancestors: categoryData.props.ancestors,
    subcategories: categoryData.props.subcategories,
  };
}


export async function getAllTagPaths(collection: CollectionName = 'post'): Promise<TagPathData[]> {
  await initializeDataOnce(collection);

  // 直接返回预计算的结果
  const data = getCollectionData(collection);
  return data.tagPaths ?? [];
}


export async function getAllCategoryPaths(collection: CollectionName = 'post'): Promise<CategoryPathData[]> {
  await initializeDataOnce(collection);

  // 直接返回预计算的结果
  const data = getCollectionData(collection);
  return data.categoryPaths ?? [];
}

// getStats 函数已删除 - 无人使用且包含无意义的 memoryUsage 计算

/**
 * 获取文章详情（通过ID，支持多collection）
 */
export async function getPostById(postId: string, collection: CollectionName = 'post'): Promise<Post | null> {
  await initializeDataOnce(collection);
  return getCollectionData(collection).postMap.get(postId) ?? null;
}

/**
 * 获取文章详情（通过slug，支持多collection）
 */
export async function getPostBySlug(slug: string, collection: CollectionName = 'post'): Promise<Post | null> {
  await initializeDataOnce(collection);
  return getCollectionData(collection).indexPosts.find(post => post.slug === slug) ?? null;
}

/**
 * 获取所有文章（用于静态路径生成，支持多collection）
 */
export async function getAllPosts(collection: CollectionName = 'post'): Promise<Post[]> {
  return getPosts('archive', collection);
}
