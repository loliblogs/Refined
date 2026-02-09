import type { AstroIntegration } from 'astro';

/**
 * SSG 模式下 server build 的产物是一次性的（渲染完 HTML 就删），
 * tree-shaking 对这些临时产物没有实际价值，跳过可以节省构建时间。
 */
export default function skipTreeshake(): AstroIntegration {
  return {
    name: 'skip-treeshake',
    hooks: {
      'astro:build:setup'({ target, updateConfig }) {
        if (target === 'server') {
          updateConfig({
            build: {
              rollupOptions: {
                treeshake: false,
              },
            },
          });
        }
      },
    },
  };
};
