import { onMount, onCleanup } from 'solid-js';

/**
 * 导航控制器 - 仅处理交互逻辑
 * 高亮逻辑已移至 Navigation.astro 静态计算
 */
export default function NavigationController() {
  onMount(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // 缓存 checkbox 元素
    const menuToggle = document.querySelector<HTMLInputElement>('#--menu-toggle');
    const sidebarToggle = document.querySelector<HTMLInputElement>('#--sidebar-toggle');

    // 关闭所有面板
    const closeAllPanels = () => {
      if (menuToggle) menuToggle.checked = false;
      if (sidebarToggle) sidebarToggle.checked = false;
    };

    // 渐进增强：遮罩上滚轮/滑动时关闭（让滚动穿透到底层内容）
    const navMenuMask = document.querySelector('[data-nav-menu-mask]');
    navMenuMask?.addEventListener('wheel', closeAllPanels, { signal, passive: true });
    navMenuMask?.addEventListener('touchmove', closeAllPanels, { signal, passive: true });

    // Escape 键关闭所有面板
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllPanels();
    }, { signal });

    // View Transition 开始前关闭所有面板
    document.addEventListener('astro:before-preparation', closeAllPanels, { signal });

    onCleanup(() => {
      controller.abort();
    });
  });

  return null;
}
