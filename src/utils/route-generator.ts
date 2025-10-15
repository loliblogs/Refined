/**
 * 统一路由生成器 - 消除路由文件的重复代码
 * "Don't repeat yourself, or I'll repeat my insults"
 */

import { getCollection } from 'astro:content';
import type { GetStaticPathsOptions } from 'astro';

import { getPosts, getAllCategoryPaths, getAllTagPaths } from './data-loader';
import { getAdjacentPosts } from './post-helper';
import { getSiteConfig } from '@/config/site.config';

import type { CollectionName } from '@/types/content';

/**
 * 文章详情路由生成器
 * 用于 /post/[...slug] 和 /oi/post/[...slug]
 */
export function createPostRoutes(collection: CollectionName = 'post') {
  return async function getStaticPaths() {
    const posts = await getPosts('unfilteredArchive', collection);

    return posts.map((post, index) => ({
      params: { slug: post.slug },
      props: {
        post,
        // 草稿文章的上下篇可以包含其他草稿，正式文章只链接到正式文章
        ...getAdjacentPosts(posts, index, post.draft),
        collection,
      },
    }));
  };
}

/**
 * 分类首页路由生成器（第一页）
 * 用于 /category/[...path] 和 /oi/category/[...path]
 */
export function createCategoryRoutes(collection: CollectionName = 'post') {
  return async function getStaticPaths() {
    const categoryPaths = await getAllCategoryPaths(collection);
    const config = getSiteConfig(collection);

    return categoryPaths.map(({ params, props }) => {
      const { category, ancestors, subcategories, posts } = props;

      const pageSize = config.pagination.category;
      const totalPages = Math.ceil(posts.length / pageSize);
      const firstPagePosts = posts.slice(0, pageSize);

      return {
        params,
        props: {
          category,
          posts: firstPagePosts,
          ancestors,
          subcategories,
          currentPage: 1,
          lastPage: totalPages,
        },
      };
    });
  };
}

/**
 * 分类分页路由生成器（第2页及以后）
 * 用于 /category/[...path]/page/[page]
 * 注意：过滤掉第一页，避免与分类首页重复（SEO）
 */
export function createCategoryPagedRoutes(collection: CollectionName = 'post') {
  return async function getStaticPaths({ paginate }: GetStaticPathsOptions) {
    const categoryPaths = await getAllCategoryPaths(collection);
    const config = getSiteConfig(collection);

    return categoryPaths.flatMap(({ props }) => {
      const { category, posts } = props;

      if (posts.length === 0) return [];

      return paginate(posts, {
        pageSize: config.pagination.category,
        params: {
          path: category.path,
        },
        props: {
          category,
        },
      }).filter(route => route.props.page.currentPage !== 1);
    });
  };
}

/**
 * 标签首页路由生成器（第一页）
 * 用于 /tag/[...path] 和 /oi/tag/[...path]
 */
export function createTagRoutes(collection: CollectionName = 'post') {
  return async function getStaticPaths() {
    const tagPaths = await getAllTagPaths(collection);
    const config = getSiteConfig(collection);

    return tagPaths.map(({ params, props }) => {
      const { tag, ancestors, relatedTags, childTags, posts } = props;

      const pageSize = config.pagination.tag;
      const totalPages = Math.ceil(posts.length / pageSize);
      const firstPagePosts = posts.slice(0, pageSize);

      return {
        params,
        props: {
          tag,
          posts: firstPagePosts,
          ancestors,
          relatedTags,
          childTags,
          currentPage: 1,
          lastPage: totalPages,
        },
      };
    });
  };
}

/**
 * 标签分页路由生成器（第2页及以后）
 * 用于 /tag/[...path]/page/[page]
 * 注意：过滤掉第一页，避免与标签首页重复（SEO）
 */
export function createTagPagedRoutes(collection: CollectionName = 'post') {
  return async function getStaticPaths({ paginate }: GetStaticPathsOptions) {
    const tagPaths = await getAllTagPaths(collection);
    const config = getSiteConfig(collection);

    return tagPaths.flatMap(({ props }) => {
      const { tag, relatedTags, childTags, posts } = props;

      if (posts.length === 0) return [];

      return paginate(posts, {
        pageSize: config.pagination.tag,
        params: {
          path: tag.path,
        },
        props: {
          tag,
          relatedTags,
          childTags,
        },
      }).filter(route => route.props.page.currentPage !== 1);
    });
  };
}

/**
 * 首页分页路由生成器
 * 用于 /page/[page] 和 /oi/page/[page]
 * 注意：过滤掉第一页，避免与首页重复（SEO）
 */
export function createHomePagedRoutes(collection: CollectionName = 'post') {
  return async function getStaticPaths({ paginate }: GetStaticPathsOptions) {
    const config = getSiteConfig(collection);
    const sortedPosts = await getPosts('index', collection);

    return paginate(sortedPosts, {
      pageSize: config.pagination.index,
    }).filter(route => route.props.page.currentPage !== 1);
  };
}

/**
 * 自定义页面路由生成器
 * 用于 /[...slug] 和 /oi/[...slug]
 */
export function createCustomPageRoutes(collectionName: 'page' | 'oiPage' = 'page') {
  return async function getStaticPaths() {
    const pages = await getCollection(collectionName);
    return pages.map(page => ({
      params: { slug: page.slug },
      props: { page },
    }));
  };
}
