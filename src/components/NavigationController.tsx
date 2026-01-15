import { useEffect } from 'react';

const NavigationController = () => {
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // 缓存 checkbox 元素
    const menuToggle = document.getElementById('menu-toggle') as HTMLInputElement | null;
    const sidebarToggle = document.getElementById('sidebar-toggle') as HTMLInputElement | null;

    // 高亮当前页面
    const highlightCurrentNav = () => {
      const currentPath = window.location.pathname;

      document.querySelectorAll('[data-nav-item]').forEach((item) => {
        const navPath = item.getAttribute('data-path');
        const recursive = item.getAttribute('data-recursive') !== 'false';
        if (!navPath) return;

        let isActive: boolean;
        if (recursive) {
          isActive = currentPath === navPath
            || (navPath === '/' ? false : currentPath.startsWith(navPath + '/'));
        } else {
          isActive = currentPath === navPath;
        }

        if (isActive) {
          item.classList.add('bg-active');
        }
      });
    };

    highlightCurrentNav();

    // 关闭所有面板
    const closeAllPanels = () => {
      if (menuToggle) menuToggle.checked = false;
      if (sidebarToggle) sidebarToggle.checked = false;
    };

    // 渐进增强：遮罩上滚轮/滑动时关闭（让滚动穿透到底层内容）
    const navMenuMask = document.getElementById('nav-menu-mask');
    navMenuMask?.addEventListener('wheel', closeAllPanels, { signal, passive: true });
    navMenuMask?.addEventListener('touchmove', closeAllPanels, { signal, passive: true });

    // Escape 键关闭所有面板
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllPanels();
    }, { signal });

    // View Transition 开始前关闭所有面板
    document.addEventListener('astro:before-preparation', closeAllPanels, { signal });

    return () => {
      controller.abort();
    };
  }, []);

  return null;
};

export default NavigationController;
