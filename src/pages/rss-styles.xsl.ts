import type { APIContext, APIRoute } from 'astro';
import { experimental_AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { loadRenderers } from 'astro:container';

import { getContainerRenderer as solidjsContainerRenderer } from '@astrojs/solid-js';
import * as cheerio from 'cheerio';

import RSSLayout from '@/layouts/RSSLayout.astro';

export const GET: APIRoute = async (_context: APIContext) => {
  // 渲染 Astro 组件
  const renderers = await loadRenderers([solidjsContainerRenderer()]);
  const container = await experimental_AstroContainer.create({ renderers });

  const html = await container.renderToString(RSSLayout as AstroComponentFactory, {
    props: {
      pageContext: {
        collection: 'post',
      },
    },
  });

  const $ = cheerio.load(html);
  // 包装成 XSL 文档
  const xsl = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
${$.xml()}
  </xsl:template>
</xsl:stylesheet>`;

  return new Response(xsl, {
    headers: {
      'Content-Type': 'text/xsl; charset=utf-8',
    },
  });
};
