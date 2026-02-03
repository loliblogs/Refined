/**
 * 全局状态管理（使用 Zustand vanilla stores）
 *
 * 为什么用 Zustand 而不是 CustomEvent？
 * 1. 解决时序问题：晚到的订阅者也能收到当前状态
 * 2. 消除双向握手：不需要 "ready" 事件
 * 3. 类型安全：TypeScript 编译时检查
 */

import { createStore } from 'zustand/vanilla';
import { subscribeWithSelector } from 'zustand/middleware';

/**
 * 内容解密状态
 *
 * 使用场景：
 * - DecryptClient 解密完成后设置为 true
 * - PageScrollManager 监听此状态，重新初始化 TOC 高亮
 */
export const decryptStore = createStore(
  subscribeWithSelector(() => ({
    isDecrypted: false,
  })),
);
