/**
 * 精简的 URL 辅助函数
 * 替代 hexo-helpers.ts 中的 URL 相关功能
 */

import type { LayoutType } from '@/types/content';


/**
 * 判断是否为首页
 * @param layoutType - 布局类型
 * @returns 是否为首页
 */
export function is_home(layoutType?: LayoutType): boolean {
  return layoutType === 'home';
}

/**
 * 判断是否为文章页
 * @param layoutType - 布局类型
 * @returns 是否为文章页
 */
export function is_post(layoutType?: LayoutType): boolean {
  return layoutType === 'post';
}
