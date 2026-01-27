import { useEffect } from 'preact/hooks';

/**
 * 导航控制器 - 仅处理交互逻辑
 * 高亮逻辑已移至 Navigation.astro 静态计算
 */
const NavigationController = () => {
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // 缓存 checkbox 元素
    const menuToggle = document.getElementById('menu-toggle') as HTMLInputElement | null;
    const sidebarToggle = document.getElementById('sidebar-toggle') as HTMLInputElement | null;

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
