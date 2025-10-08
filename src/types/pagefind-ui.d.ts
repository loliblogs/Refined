/**
 * @pagefind/default-ui 类型定义
 * 基于源码 ui-core.js 逆向工程
 * "Show me the code" - Linus
 */

declare module '@pagefind/default-ui' {
  export interface PagefindUIOptions {
    /** 挂载元素选择器，默认 "[data-pagefind-ui]" */
    element?: string;
    /** Pagefind bundle 路径 */
    bundlePath?: string;
    /** 每页结果数量，默认 5 */
    pageSize?: number;
    /** 是否重置样式，默认 true */
    resetStyles?: boolean;
    /** 是否显示图片，默认 true */
    showImages?: boolean;
    /** 是否显示子结果，默认 false */
    showSubResults?: boolean;
    /** 摘要长度，默认 0 */
    excerptLength?: number;
    /** 自定义结果处理函数 */
    processResult?: ((result: unknown) => unknown) | null;
    /** 自定义搜索词处理函数 */
    processTerm?: ((term: string) => string) | null;
    /** 是否显示空过滤器，默认 true */
    showEmptyFilters?: boolean;
    /** 默认打开的过滤器 */
    openFilters?: string[];
    /** 防抖延迟毫秒数，默认 300 */
    debounceTimeoutMs?: number;
    /** 合并的索引 */
    mergeIndex?: unknown[];
    /** 翻译配置 */
    translations?: unknown[];
    /** 是否自动聚焦，默认 false */
    autofocus?: boolean;
    /** 排序配置 */
    sort?: unknown;
  }

  export class PagefindUI {
    constructor(opts: PagefindUIOptions);
    /** 触发搜索 */
    triggerSearch(term: string): void;
    /** 销毁组件 */
    destroy(): void;
  }
}
