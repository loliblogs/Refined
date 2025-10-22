import rss from '@astrojs/rss';
import { getContainerRenderer as mdxContainerRenderer } from '@astrojs/mdx';
import { getContainerRenderer as preactContainerRenderer } from '@astrojs/preact';
import { experimental_AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';

import type { APIRoute } from 'astro';

import { getPosts } from '@/utils/data-loader';
import { getSiteConfig } from '@/config/site.config';
import { getBasePath, getPostUrl, getRssStylesUrl } from '@/utils/collection-paths';

export const GET: APIRoute = async (context) => {
  const config = getSiteConfig('oi');
  // 获取已排序的文章（纯时间排序）
  const sortedPosts = await getPosts('archive', 'oi');

  // 创建 Astro 容器用于渲染 markdown
  const renderers = await loadRenderers([mdxContainerRenderer(), preactContainerRenderer()]);
  const container = await experimental_AstroContainer.create({ renderers });

  const items = await Promise.all(
    sortedPosts.map(async (post) => {
      // 渲染 markdown 内容为 HTML
      const { Content } = await post.render();
      const htmlContent = await container.renderToString(Content);

      return {
        title: post.title,
        pubDate: post.date,
        description: post.description,
        link: getPostUrl(post.slug, 'oi'),
        content: htmlContent,
        categories: [
          ...post.category,  // 一定是数组
          ...post.tags,  // 一定是数组
        ],
        author: post.author,  // data-loader 已确保有值
      };
    }),
  );

  return rss({
    title: config.title,
    description: config.description,
    site: new URL(getBasePath('oi'), context.site),
    items,
    customData: `
      <language>${config.language}</language>
      <copyright>Copyright ${new Date().getFullYear()}</copyright>
      <ttl>60</ttl>
      <lastBuildDate>${new Date().toISOString()}</lastBuildDate>
    `,
    stylesheet: getRssStylesUrl('oi'),
    trailingSlash: false,
  });
};
