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

  // 在单词/句子边界截断
  if (wordBoundary) {
    // 使用贪婪匹配找到最后一个标点符号（包括中英文标点和空白字符）
    // 标点包含：空格、逗号、句号、分号、冒号、问号、感叹号、顿号、破折号、省略号等
    const match = /.*([\s,，.。;；:：?？!！、\-—…])/.exec(truncated);

    if (match?.[1]) {
      const punctuationChar = match[1]; // 捕获的标点字符
      const punctuationIndex = match[0].length - 1; // 标点在整个匹配中的位置

      // 对于空白字符，截断到它之前（不保留空白）
      // 对于其他标点，截断到它之后（保留标点，使句子结构完整）
      const breakpointIndex = /\s/.test(punctuationChar)
        ? punctuationIndex
        : punctuationIndex + 1;

      if (breakpointIndex > 0) {
        truncated = truncated.substring(0, breakpointIndex);
      }
    }
  }

  return truncated + suffix;
}
