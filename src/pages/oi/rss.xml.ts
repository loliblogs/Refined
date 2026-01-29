import rss from '@astrojs/rss';

import type { APIRoute } from 'astro';

import { getPosts } from '@/utils/data-loader';
import { getSiteConfig } from '@/config/site.config';
import { getBasePath, getPostUrl, getRssStylesUrl } from '@/utils/collection-paths';

export const GET: APIRoute = async (context) => {
  const config = getSiteConfig('oi');
  // 获取已排序的文章（纯时间排序）
  const sortedPosts = await getPosts('archive', 'oi');

  const items = sortedPosts.map(post => ({
    title: post.title,
    pubDate: post.date,
    description: post.description,
    link: getPostUrl(post.slug, 'oi'),
    categories: [
      ...post.category,
      ...post.tags,
    ],
    author: post.author,
  }));

  return rss({
    title: config.title,
    description: config.description,
    site: new URL(getBasePath('oi'), context.site),
    items,
    customData: `
      <language>zh-CN</language>
      <copyright>Copyright ${new Date().getFullYear()}</copyright>
      <ttl>60</ttl>
      <lastBuildDate>${new Date().toISOString()}</lastBuildDate>
    `,
    stylesheet: getRssStylesUrl('oi'),
    trailingSlash: false,
  });
};
