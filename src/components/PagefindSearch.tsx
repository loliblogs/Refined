/**
 * Pagefind搜索组件
 * 使用Pagefind自带的UI组件
 */

import { onMount, onCleanup, createEffect } from 'solid-js';
import { getInstanceManager } from '@pagefind/component-ui';
import { isScrollbarReady } from '@/stores/state';

export default function PagefindSearch() {
  onMount(() => {
    // 从URL获取初始查询
    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') ?? '';

    const manager = getInstanceManager();
    const instance = manager.getInstance('default');

    // 监听搜索框变化，更新URL
    const handleInput = (term: unknown) => {
      if (typeof term !== 'string') return;

      const params = new URLSearchParams(window.location.search);

      if (term) {
        params.set('q', term);
      } else {
        params.delete('q');
      }

      // 更新URL但不刷新页面
      const newUrl = `${pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    };

    // 等待 OverlayScrollbars 完成 DOM 操作后再触发初始搜索和聚焦，
    // 否则 <pagefind-input> 的 connectedCallback 会重建输入框并清空值
    createEffect(() => {
      if (isScrollbarReady()) {
        if (initialQuery) {
          instance.triggerSearch(initialQuery);
        }
        document.querySelector<HTMLInputElement>('.pf-input')?.focus();
      }
    });

    instance.on('search', handleInput);

    onCleanup(() => {
      manager.removeInstance('default');
    });
  });

  return null;
}
