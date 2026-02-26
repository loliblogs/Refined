/**
 * 全局状态管理（使用 SolidJS 模块级 signal）
 *
 * 为什么用模块级 signal 而不是 CustomEvent？
 * 1. 解决时序问题：晚到的订阅者（createEffect）首次执行即读到当前值
 * 2. 消除双向握手：不需要 "ready" 事件
 * 3. 类型安全：TypeScript 编译时检查
 *
 * SSG 项目无 cross-request state pollution 风险，模块级 signal 是官方推荐方案。
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
