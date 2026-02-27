/**
 * 日期格式化 - 极简版
 *
 * "Talk is cheap. Show me the code." - Linus
 * 25行解决问题，不需要500行
 */

/**
 * 格式化日期为 YYYY-MM-DD
 *
 * @param date 日期输入
 * @returns YYYY-MM-DD 格式的日期字符串
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '';
  }

  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * 格式化日期为 MM/DD
 *
 * @param date 日期对象
 * @returns MM/DD 格式的字符串
 */
export function formatMonthDay(date: Date): string {
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${month}/${day}`;
}
