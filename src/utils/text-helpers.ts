/**
 * 文本处理辅助函数
 * 提供统一的文本处理功能
 */

import type { TruncateOptions } from '@/types/utils';

/**
 * 截断文本
 * 将文本截断到指定长度，可选择在单词边界截断
 *
 * @param text 原始文本
 * @param maxLength 最大长度
 * @param options 截断选项
 * @returns 截断后的文本
 */
export function truncateText(
  text: string,
  maxLength: number,
  options: TruncateOptions = {},
): string {
  // 处理空文本或无效长度
  if (!text || maxLength <= 0) {
    return '';
  }

  // 如果文本长度小于等于最大长度，直接返回
  if (text.length <= maxLength) {
    return text;
  }

  const { suffix = '...', wordBoundary = true } = options;

  // 计算实际截断长度（考虑后缀）
  const truncateLength = maxLength - suffix.length;

  if (truncateLength <= 0) {
    return suffix;
  }

  let truncated = text.substring(0, truncateLength);

  // 在单词边界截断
  if (wordBoundary) {
    // 查找最后一个空白字符的位置
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    // 如果找到空白字符，在该位置截断
    if (lastSpaceIndex > 0) {
      truncated = truncated.substring(0, lastSpaceIndex);
    }
  }

  return truncated + suffix;
}
