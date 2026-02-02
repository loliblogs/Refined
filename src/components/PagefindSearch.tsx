/**
 * Pagefind搜索组件
 * 使用Pagefind自带的UI组件
 */

import { useEffect } from 'preact/hooks';
import type { FunctionComponent as FC } from 'preact';
import { getInstanceManager } from '@pagefind/component-ui';

const PagefindSearch: FC = () => {
  useEffect(() => {
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

    return () => {
      manager.removeInstance('default');
    };
  }, []);

  return null;
};

export default PagefindSearch;
