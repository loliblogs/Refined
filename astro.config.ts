import { defineConfig, envField } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

import remarkMath from './src/plugins/remark-math';
import rehypeMathJax from './src/plugins/rehype-mathjax';
import rehypeSanitize from './src/plugins/rehype-sanitize';
import remarkDirectiveRehype from './src/plugins/remark-directive-rehype';
import remarkRemoveCjkBreaks from './src/plugins/remark-remove-cjk-breaks';
import remarkPangu from './src/plugins/remark-pangu';
import buildSearch from './src/plugins/build-search';
import postlinkIntegration from './src/plugins/postlink-integration';

import remarkDirective from 'remark-directive';
import remarkEmoji from 'remark-emoji';
import remarkGithubAdmonitionsToDirectives from 'remark-github-admonitions-to-directives';
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
  integrations: [postlinkIntegration(), expressiveCode(), preact(), mdx({ optimize: true }), db(), playformCompress({
    CSS: false,
    HTML: true,
    JSON: true,
    Image: false,
    JavaScript: false,
    SVG: false,
  }), sitemap({
    filter: page => !page.endsWith('/404') && !page.endsWith('/403') && !page.endsWith('/search'),
    lastmod: new Date(),
  }), buildSearch],
  vite: {
    build: {
      reportCompressedSize: !process.env.CI, // CI 不需要 gzip 大小估算
      minify: 'terser',
      cssMinify: 'lightningcss',
      target: ['chrome99', 'edge99', 'firefox97', 'safari15'],
      sourcemap: true, // 开源项目，随便看！
      rollupOptions: {
        output: {
          // 合并 preact 运行时、状态管理到单一 chunk，减少关键路径串行深度
          //
          // 为什么不用 @preact/signals 替代 zustand？
          // 1. zustand (~1KB gzip) 比 signals (~3KB gzip) 更小
          // 2. @astrojs/preact 的 client.js 用动态 import 加载 signals：
          //    if (signalsRaw) { await import("@preact/signals"); }
          //    只有组件 props 包含 signal 对象时才会触发（我们不传）
          // 3. 构建输出虽有 signals chunk（Vite 预打包动态 import），
          //    但运行时条件不满足，浏览器实际不会下载
          manualChunks(id) {
            const runtimePatterns = [
              'node_modules/preact',
              'node_modules/zustand',
              '@astrojs/preact/dist/client',
              'src/stores/state',
            ];

            return runtimePatterns.some(p => id.includes(p))
              ? 'runtime'
              : undefined;
          },
        },
      },
    },
    optimizeDeps: {
      include: ['@phi-ag/argon2', '@phi-ag/argon2/fetch', 'giscus'],
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
      footnoteBackContent: '\u2003', // Em Space
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
    clientPrerender: true,
    staticImportMetaEnv: true,
    headingIdCompat: true,
    contentIntellisense: true,
    svgo: true,
  },
  env: {
    schema: {
      SECRET_PASSWORDS: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
        default: '{}',
        startsWith: '{',
        endsWith: '}',
      }),
      SECRET_ENCRYPTION_PASSWORD: envField.string({
        context: 'server',
        access: 'secret',
      }),
      SECRET_ENCRYPTION_SALT: envField.string({
        context: 'server',
        access: 'secret',
      }),
    },
    validateSecrets: true,
  },
});
