/**
 * 获取构建产物中 runtime chunk 的路径
 *
 * 配合 astro.config.ts 中的 manualChunks 配置使用：
 * - manualChunks 将 solid-js 运行时等核心依赖合并到单一 runtime.xxx.js
 * - 本模块在 SSG 构建时读取生成的文件名，供 BaseLayout 添加 modulepreload
 * - 预加载 runtime chunk 可以减少客户端 JS 的瀑布流式加载深度
 *
 * 为什么用函数而不是直接导出值：
 * - 模块导入发生在 Astro 配置加载阶段，此时 dist/_astro 目录尚未生成
 * - 用函数包装后，实际的文件系统读取延迟到 SSG 页面渲染阶段
 * - 此时 Vite 已完成 JS 打包，runtime chunk 文件已存在于输出目录
 */
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { outDir } from 'astro:config/server';

const outDirPath = fileURLToPath(outDir);
const astroDir = join(outDirPath, '_astro');

// 缓存结果，整个 SSG 构建期间只读一次目录
let cachedPath: string | null | undefined;

/**
 * 从构建产物目录读取 runtime chunk 的完整路径
 * @returns 形如 `/_astro/runtime.abc123.js` 的路径，不存在时返回 null
 */
export default async function getRuntimePath(): Promise<string | null> {
  // dev 模式下 Vite 即时编译，不需要 modulepreload
  if (import.meta.env.DEV) return null;

  if (cachedPath !== undefined) return cachedPath;

  const files = await readdir(astroDir);
  const runtimeFileName = files.find(f => /^runtime\.[a-zA-Z0-9]+\.js$/.test(f));

  cachedPath = runtimeFileName ? `/_astro/${runtimeFileName}` : null;
  return cachedPath;
}
