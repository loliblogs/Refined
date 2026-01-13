/**
 * Pagefind搜索组件
 * 使用Pagefind自带的UI组件
 */

import '@pagefind/component-ui';

import { useEffect, type FC } from 'react';
import { getInstanceManager } from '@pagefind/component-ui';

const PagefindSearch: FC = () => {
  useEffect(() => {
    // 从URL获取初始查询
    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') ?? '';

    const manager = getInstanceManager();
    const instance = manager.getInstance('default');

    // 如果有初始查询，设置并触发搜索
    if (initialQuery) {
      instance.triggerSearch(initialQuery);
    }

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

    instance.on('search', handleInput);

    return () => {
      manager.removeInstance('default');
    };
  }, []);

  return null;
};

export default PagefindSearch;
