import { defineConfig, svgoOptimizer, envField } from 'astro/config';
import solidJs from '@astrojs/solid-js';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

import rehypeMathjax from './src/plugins/rehype-mathjax-satteri';
import rehypeSanitize from './src/plugins/rehype-sanitize-satteri';
import remarkDirective from './src/plugins/remark-directive-satteri';
import remarkGithubAlerts from './src/plugins/remark-github-alerts-satteri';
import remarkRemoveCjkBreaks from './src/plugins/remark-remove-cjk-breaks-satteri';
import remarkPangu from './src/plugins/remark-pangu-satteri';
import remarkEmoji from './src/plugins/remark-emoji-satteri';
import buildSearch from './src/plugins/build-search';
import postlinkIntegration from './src/plugins/postlink-integration';
import skipTreeshake from './src/plugins/skip-treeshake';

import expressiveCode from 'astro-expressive-code';
import playformCompress from '@playform/compress';

import { browserslistToTargets } from 'lightningcss';

import { satteri } from '@astrojs/markdown-satteri';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.lolifamily.js.org',
  base: '/', // 可以改为 '/blog/' 等非根路径
  trailingSlash: 'never',
  output: 'static',
  cacheDir: '.cache',
  integrations: [skipTreeshake(), postlinkIntegration(), expressiveCode(), solidJs(), mdx({ optimize: true }), playformCompress({
    CSS: false,
    HTML: {
      'html-minifier-terser': {
        minifyCSS: { targets: browserslistToTargets(['chrome 99', 'edge 99', 'firefox 97', 'safari 15']) },
        minifySVG: false,
        ignoreCustomFragments: [
          /<mjx-spacer[\s\S]*?<\/mjx-spacer>/,
        ],
        inlineCustomElements: [
          // MathJax 容器
          'mjx-container',
          'mjx-assistive-mml',

          // Token 元素（叶子节点，包含实际文本）
          'mi', 'mn', 'mo', 'mtext', 'ms', 'mspace',

          // 布局元素
          'mrow', 'mfrac', 'msqrt', 'mroot',
          'mstyle', 'merror', 'mpadded', 'mphantom',
          'menclose',   // MathML Full，非 Core
          'mfenced',    // 已废弃，但 MathJax 仍可能生成

          // 上下标元素
          'msub', 'msup', 'msubsup',
          'munder', 'mover', 'munderover',
          'mmultiscripts', 'mprescripts', 'none',

          // 表格元素
          'mtable', 'mtr', 'mtd',

          // 语义/注释元素
          'semantics', 'annotation', 'annotation-xml',

          // 动作元素
          'maction',
        ],
      },
    },
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
          // 合并 solid-js 运行时、状态管理到单一 chunk，减少关键路径串行深度
          manualChunks(id) {
            const runtimePatterns = [
              'node_modules/solid-js',
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
      tailwindcss({ optimize: false }),
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
    processor: satteri({
      features: {
        math: true,
        frontmatter: true,
        directive: true,
        gfm: {
          footnotes: {
            label: '脚注',
            backContent: '\u2003', // Em Space
            // satteri 的 referenceNumber 已是 1-based（remark-rehype 的 idx 是 0-based 需 +1）
            backLabel: (referenceNumber: number, rerunIndex: number) =>
              `返回引用 ${referenceNumber}${rerunIndex > 1 ? `-${rerunIndex}` : ''}`,
          },
        },
      },
      // ⚠️ 全部裸 factory 引用，保证 per-document 闭包隔离（尤其 rehypeMathjax 的 output）。
      // remarkGithubAlerts 必须排在 remarkDirective 之前（blockquote→containerDirective）。
      mdastPlugins: [
        remarkGithubAlerts,
        remarkDirective,
        remarkPangu,
        remarkRemoveCjkBreaks({ includeEmoji: true, includeMathWithPunctuation: true }),
        remarkEmoji,
      ],
      hastPlugins: [rehypeMathjax, rehypeSanitize],
    }),
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
    contentIntellisense: true,
    svgOptimizer: svgoOptimizer({
      plugins: [
        'preset-default',
        'removeXMLNS',
        {
          name: 'removeXlink',
          params: {
            includeLegacy: true,
          },
        },
      ],
    }),
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
