/**
 * Pagefind搜索组件
 * 使用Pagefind自带的UI组件
 */

import { onMount, onCleanup } from 'solid-js';
import { getInstanceManager } from '@pagefind/component-ui';

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

    if (initialQuery) instance.triggerSearch(initialQuery);
    instance.on('search', handleInput);

    onCleanup(() => {
      manager.removeInstance('default');
    });
  });

  return null;
}
