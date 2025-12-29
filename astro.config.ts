import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

import remarkMath from './src/plugins/remark-math';
import rehypeMathJax from './src/plugins/rehype-mathjax';
import rehypeSanitize from './src/plugins/rehype-sanitize';
import remarkDirectiveRehype from './src/plugins/remark-directive-rehype';
import remarkRemoveCjkBreaks from './src/plugins/remark-remove-cjk-breaks';
import buildSearch from './src/plugins/build-search';

import remarkDirective from 'remark-directive';
import remarkEmoji from 'remark-emoji';
import remarkGithubAdmonitionsToDirectives from 'remark-github-admonitions-to-directives';
import remarkPangu from 'remark-pangu';
import { remarkDefinitionList, defListHastHandlers } from 'remark-definition-list';

import expressiveCode from 'astro-expressive-code';
import playformCompress from '@playform/compress';
import db from '@astrojs/db';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.lolifamily.js.org',
  base: '/', // 可以改为 '/blog/' 等非根路径
  trailingSlash: 'never',
  output: 'static',
  cacheDir: '.cache',
  prefetch: {
    prefetchAll: true,
  },
  integrations: [expressiveCode(), preact(), mdx(), db(), playformCompress({
    CSS: false,
    HTML: true,
    JSON: true,
    Image: false,
    JavaScript: false,
  }), sitemap({
    filter: page => !page.endsWith('/404') && !page.endsWith('/403') && !page.endsWith('/search'),
    lastmod: new Date(),
  }), buildSearch],
  vite: {
    build: {
      minify: 'terser',
      cssMinify: 'lightningcss',
      sourcemap: true, // 开源项目，随便看！
    },
    optimizeDeps: {
      include: ['argon2-browser/dist/argon2-bundled.min.js'],
    },
    css: {
      transformer: 'lightningcss',
    },
    plugins: [
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // 仅用于开发时预览使用，避免重复打包，该选项不会影响生产环境
        '/pagefind': './dist/pagefind',
        '/oi/pagefind': './dist/oi/pagefind',
      },
    },
  },
  build: {
    // file模式可以保证不会因为目录自动跳转到带/的页面
    format: 'file',
  },
  markdown: {
    remarkPlugins: [remarkDefinitionList, remarkGithubAdmonitionsToDirectives,
      remarkDirective, remarkDirectiveRehype, remarkPangu,
      [remarkRemoveCjkBreaks, {
        includeEmoji: true,
        includeMathWithPunctuation: true,
      }], [remarkMath, {
        flowSingleLineMinDelimiter: 2,
      }], [remarkEmoji, {
        accessible: true,
      }]],
    rehypePlugins: [rehypeMathJax, rehypeSanitize],
    remarkRehype: {
      handlers: {
        ...defListHastHandlers,
      },
      footnoteBackContent: () => '',
      footnoteBackLabel: (idx, reIdx) => `返回引用 ${idx + 1}${reIdx > 1 ? `-${reIdx}` : ''}`,
      footnoteLabel: '脚注',
    },
  },
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  server: ({ command }) => ({
    port: command === 'preview' ? 4321 : 3000,
  }),
  devToolbar: {
    enabled: false,
  },
  experimental: {
    staticImportMetaEnv: true,
    headingIdCompat: true,
    contentIntellisense: true,
  },
});
