/**
 * 内容渲染缓存 - 避免同一篇文章多次渲染
 *
 * 使用场景：PostPage 中 Content 出现多次（主体 + TableOfContents）
 * 第一次渲染后缓存 HTML，后续直接复用
 *
 * 注意：仅在单次构建进程内有效，不跨构建持久化
 */

export const contentCache = new Map<string, string>();
