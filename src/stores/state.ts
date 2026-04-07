/**
 * 全局状态管理（使用 SolidJS 模块级 signal）
 *
 * 为什么用模块级 signal 而不是 CustomEvent？
 * 1. 解决时序问题：晚到的订阅者（createEffect）首次执行即读到当前值
 * 2. 消除双向握手：不需要 "ready" 事件
 * 3. 类型安全：TypeScript 编译时检查
 *
 * SSG 项目无 cross-request state pollution 风险，模块级 signal 是官方推荐方案。
 *
 * 注意：ES module 只求值一次，View Transitions 导航时 signal 值不会重置。
 * 所有 producer 必须在 onCleanup 中将 signal 重置为初始值，
 * 否则下次导航时 set(true) 不触发变更，consumer 的 createEffect 不会重新执行。
 */

import { createSignal } from 'solid-js';

/**
 * 内容解密状态
 *
 * 使用场景：
 * - DecryptClient 解密完成后调用 setIsDecrypted(true)
 * - PageScrollManager 监听此状态，重新初始化 TOC 高亮
 * - MediumZoom 监听此状态，重新附加图片
 * - SearchBoxClient 监听此状态，刷新内容引用
 */
export const [isDecrypted, setIsDecrypted] = createSignal(false);

/**
 * 内容滚动条就绪状态
 *
 * OverlayScrollbars 无条件执行 target.appendChild(viewport)，
 * DOM 规范强制 remove → insert（即使 viewport 已是最后子节点），
 * 导致 viewport 内所有自定义元素（如 <pagefind-input>）经历
 * disconnectedCallback → connectedCallback → 重建 DOM。
 * 需要依赖此状态的组件应在就绪后再操作这些自定义元素。
 *
 * 使用场景：
 * - PageScrollManager 初始化 OverlayScrollbars 后设置为 true
 * - PagefindSearch 等待此状态后再触发初始搜索
 */
export const [isScrollbarReady, setIsScrollbarReady] = createSignal(false);
