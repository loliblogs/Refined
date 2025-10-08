/**
 * Pagefind搜索组件
 * 使用Pagefind自带的UI组件
 */

import { useEffect, type FC } from 'react';
import { PagefindUI } from '@pagefind/default-ui';

interface PagefindSearchProps {
  basePath?: string;
}

const PagefindSearch: FC<PagefindSearchProps> = ({ basePath = '' }) => {
  useEffect(() => {
    // 从URL获取初始查询
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') ?? '';

    // 根据collection设置bundlePath
    const bundlePath = `${basePath}/pagefind/`;

    const pagefindUI = new PagefindUI({
      element: '#pagefind-ui',
      showSubResults: true,
      showImages: false,
      resetStyles: false,
      bundlePath: bundlePath,
    });

    // 如果有初始查询，设置并触发搜索
    if (initialQuery) {
      // PagefindUI提供的API来设置初始值
      pagefindUI.triggerSearch(initialQuery);
    }

    // 监听搜索框变化，更新URL
    const handleInput = (e: Event) => {
      const value = (e.target as HTMLInputElement).value;
      const params = new URLSearchParams(window.location.search);

      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }

      // 更新URL但不刷新页面
      const newUrl = `${basePath}/search${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    };

    // 等待DOM元素出现后添加事件监听
    const observer = new MutationObserver(() => {
      const searchInput = document.querySelector('.pagefind-ui__search-input');
      if (searchInput instanceof HTMLInputElement) {
        searchInput.addEventListener('input', handleInput);
        observer.disconnect();
      }
    });

    const pagefindElement = document.getElementById('pagefind-ui');
    if (pagefindElement) {
      observer.observe(pagefindElement, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
      const searchInput = document.querySelector('.pagefind-ui__search-input');
      if (searchInput instanceof HTMLInputElement) {
        searchInput.removeEventListener('input', handleInput);
      }
      pagefindUI.destroy();
    };
  }, [basePath]);

  return null;
};

export default PagefindSearch;
