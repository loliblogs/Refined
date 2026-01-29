/**
 * 优化的数据加载器 - 支持多collection
 * 核心改进：
 * 1. 支持多个collection独立管理
 * 2. 每个collection有独立的索引和缓存
 * 3. 保持向后兼容（默认使用post）
 */

import { getCollection, render } from 'astro:content';

import { getSiteConfig } from '@/config/site.config';
import type { Post, CollectionName, ExcerptSource } from '@/types/content';
import type { CollectionData, TagPathData, CategoryPathData } from '@/types/utils';

import { TaxonomySystem } from './taxonomy-system';
import { truncateText } from './text-helpers';
import { getOrComputeArgon2Key } from './argon2-cache';

// 每个collection的独立数据存储
const collectionDataCache = new Map<CollectionName, CollectionData>();

// 每个collection独立的taxonomy系统
const tagSystems = new Map<CollectionName, TaxonomySystem>();
const categorySystems = new Map<CollectionName, TaxonomySystem>();

// ============================================================================
// 纯工具函数
// ============================================================================

/**
 * 计算摘要来源 - 用类型系统消除特殊情况
 * "Good taste: eliminate special cases"
 *
 * 优先级：手动摘要 > 加密提示 > 自动生成
 * 前两者都是固定文本，统一为 fixed 类型
 */
function computeExcerptSource(
  excerpt: string | undefined,
  encrypted: boolean | undefined,
  prompt: string,
  body: string,
): ExcerptSource {
  // 优先级1：手动摘要（用户明确写的）
  if (excerpt) {
    return { type: 'fixed', text: excerpt };
  }

  // 优先级2：加密提示（配置的默认文本）
  if (encrypted) {
    return { type: 'fixed', text: prompt };
  }

  // 优先级3：自动生成（从正文提取）
  const hasMoreTag = !!body && (body.includes('<!--more-->') || body.includes('::more'));
  return { type: 'generated', hasMoreTag };
}

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
 * 核心加载函数（支持多collection）
 * "数据即状态" - Map的存在性就是状态，不需要initialized标志
 *
 * @returns 初始化后的CollectionData（从缓存或新建）
 */
async function initializeDataOnce(collection: CollectionName = 'post'): Promise<CollectionData> {
  // 快速路径：数据存在就直接返回
  const cached = collectionDataCache.get(collection);
  if (cached) {
    return cached;
  }

  // 加载对应collection的数据
  const posts = await getCollection(collection);

  // 获取站点配置的默认值（支持per-collection配置）
  const siteConfig = getSiteConfig(collection);
  const defaultAuthor = siteConfig.author.name;
  const defaultComments = siteConfig.comments;

  // 一轮循环处理所有文章（串行处理 Argon2 计算确保内存可控）
  const processedPosts: Post[] = [];
  for (const post of posts) {
    // 确定各字段的值
    const finalAuthor = post.data.author ?? defaultAuthor;
    const finalComments = post.data.comments ?? defaultComments;

    // 生成 SEO description
    const finalDescription = post.data.description ?? post.data.excerpt
      ?? truncateText(post.body, 150, { wordBoundary: true });

    // 计算 excerptSource - 统一使用工具函数
    const prompt = post.data.prompt ?? siteConfig.passwordPrompt ?? '此内容已加密，需要密码查看';
    const excerptSource = computeExcerptSource(
      post.data.excerpt,
      post.data.encrypted,
      prompt,
      post.body,
    );

    // 计算 encryption（可能需要 await Argon2）
    let encryption;
    if (post.data.encrypted) {
      const cacheResult = await getOrComputeArgon2Key(collection, post.id);
      encryption = {
        salt: cacheResult.salt,
        derivedKey: cacheResult.derivedKey,
        hint: post.data.hint ?? siteConfig.passwordHint ?? '输入密码',
        prompt,
      };
    } else {
      encryption = false as const;
    }

    // 预获取 Content 组件（Astro 5 方式：render() 很快，只返回组件引用）
    const { Content } = await render(post);

    // 构造完整 Post 对象
    processedPosts.push({
      id: post.id,
      slug: post.slug,
      title: post.data.title,
      description: finalDescription,
      date: post.data.date,
      updated: post.data.updated,
      category: post.data.category,
      tags: post.data.tag,
      author: finalAuthor,
      comments: finalComments,
      draft: post.data.draft,
      sticky: post.data.sticky,
      collection,
      Content,
      excerptSource,
      encryption,
    });
  }

  // 构建三套排序列表（SSG优化：预计算避免重复排序）
  // 1. indexPosts: 过滤草稿 + sticky优先排序（用于首页）
  const indexPosts = processedPosts
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

  // 2. unfilteredArchivePosts: 纯时间排序，包含草稿（用于渲染草稿）
  // 注意：原地修改 processedPosts（后续操作不依赖原始顺序）
  const unfilteredArchivePosts = processedPosts.sort((a, b) => {
    // 按时间降序
    const timeDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (timeDiff !== 0) {
      return timeDiff;
    }
    // 时间相同时按 slug 升序排序，确保排序稳定
    return a.slug.localeCompare(b.slug);
  });

  // 3. archivePosts: 基于unfilteredArchivePosts过滤草稿（用于归档页）
  const archivePosts = unfilteredArchivePosts.filter(post => !post.draft);

  // 构建文章映射
  const postMap = new Map<string, Post>();
  processedPosts.forEach((post) => {
    postMap.set(post.id, post);
  });

  // 初始化系统（每个collection独立） - 在此唯一创建并写回缓存
  const tagSystem = new TaxonomySystem();
  const categorySystem = new TaxonomySystem();
  tagSystems.set(collection, tagSystem);
  categorySystems.set(collection, categorySystem);
  // 传入显示名，TaxonomySystem 内部会将 path 转小写
  tagSystem.initializeFromPosts(processedPosts, post => post.tags);
  categorySystem.initializeFromPosts(processedPosts, post => post.category);

  // 预计算所有路径数据 - 一次遍历构建所有数据
  // 创建标签和分类到文章的映射
  const tagPostsMap = new Map<string, Post[]>();
  const categoryPostsMap = new Map<string, Post[]>();

  // 一次遍历，分配所有文章到对应的标签和分类
  for (const post of indexPosts) {
    // 处理标签（key 用小写，与 TaxonomyNode.path 匹配）
    for (const tag of post.tags) {
      const key = tag.toLowerCase();
      let tagPosts = tagPostsMap.get(key);
      if (!tagPosts) {
        tagPosts = [];
        tagPostsMap.set(key, tagPosts);
      }
      tagPosts.push(post);
    }

    // 处理分类（key 用小写，与 TaxonomyNode.path 匹配）
    for (const category of post.category) {
      const key = category.toLowerCase();
      let categoryPosts = categoryPostsMap.get(key);
      if (!categoryPosts) {
        categoryPosts = [];
        categoryPostsMap.set(key, categoryPosts);
      }
      categoryPosts.push(post);
    }
  }

  const tags = tagSystem.getAllNodes();
  const categories = categorySystem.getAllNodes();

  // 构建 tagPaths（预计算 ancestors 以提高性能）
  const tagPaths = tags.map(tag => ({
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
  const categoryPaths = categories.map(category => ({
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

  // 一次性构建完整数据对象
  const data: CollectionData = {
    indexPosts,
    archivePosts,
    unfilteredArchivePosts,
    postMap,
    tagPaths,
    categoryPaths,
  };

  // 写入缓存并返回
  collectionDataCache.set(collection, data);
  return data;
}

// 索引功能已移至 TaxonomySystem

// ===== 公共API（保持向后兼容） =====

// 删除对外预热API：loadAllPosts（不再需要，初始化由各get*内部保证）

/**
 * 获取文章列表（支持多collection）
 * @param sortMode 'index' = sticky优先+时间, 'archive' = 纯时间
 * @param collection 集合名称，默认post
 */
export async function getPosts(
  sortMode: 'index' | 'archive' | 'unfilteredArchive' = 'index',
  collection: CollectionName = 'post',
): Promise<Post[]> {
  const data = await initializeDataOnce(collection);

  // 早返回模式：消除嵌套三元
  if (sortMode === 'archive') return data.archivePosts;
  if (sortMode === 'unfilteredArchive') return data.unfilteredArchivePosts;
  return data.indexPosts;
}

export async function getAllTagPaths(collection: CollectionName = 'post'): Promise<TagPathData[]> {
  const data = await initializeDataOnce(collection);
  return data.tagPaths;
}


export async function getAllCategoryPaths(collection: CollectionName = 'post'): Promise<CategoryPathData[]> {
  const data = await initializeDataOnce(collection);
  return data.categoryPaths;
}
