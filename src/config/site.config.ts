/**
 * 站点配置入口（服务端专用）
 *
 * 此文件执行 MathJax 预处理，只应在服务端（.astro 文件）中导入。
 */

import { postConfig, oiConfig } from './base.config';
import { createMathProcessor } from '@/utils/mathjax-processor';
import type { ProcessedSiteConfig, SiteConfig } from '@/types/site-config';
import type { CollectionName } from '@/types/content';

/**
 * 处理配置中可能包含数学公式的字段
 * 每个 collection 使用独立的 processor，保证 CSS 隔离
 */
async function processConfigMath(config: SiteConfig): Promise<ProcessedSiteConfig> {
  const proc = createMathProcessor();

  // 处理 menu labels
  const menuEntries = await Promise.all(
    Object.entries(config.menu).map(async ([label, path]) => [
      await proc.process(label),
      path,
    ] as const),
  );

  // 处理 author 信息
  const author = {
    ...config.author,
    name: await proc.process(config.author.name),
    work: await proc.process(config.author.work),
    location: await proc.process(config.author.location),
  };

  // 所有处理完成，获取 CSS
  return {
    ...config,
    menu: Object.fromEntries(menuEntries),
    author,
    mathCSS: proc.getCSS(),
  };
}

/**
 * 配置映射（各 collection 独立处理，CSS 隔离）
 */
const configMap = {
  post: await processConfigMath(postConfig),
  oi: await processConfigMath(oiConfig),
} as const;

/**
 * 获取完整配置（支持 collection 参数）
 * 注意：此函数返回 MathJax 处理后的配置，只应在服务端使用
 */
export function getSiteConfig(collection: CollectionName): ProcessedSiteConfig {
  return configMap[collection];
}
