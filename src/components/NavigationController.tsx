import { useEffect } from 'react';

const NavigationController = () => {
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // 缓存DOM元素
    const elements = {
      navMenu: document.getElementById('nav-menu'),
      aside: document.getElementById('aside'),
      asideMask: document.getElementById('aside-mask'),
    };

    // 统一的toggle处理
    const toggleClass = (element: Element | null, className: string, force?: boolean) => {
      element?.classList.toggle(className, force);
    };

    // 高亮当前页面
    const highlightCurrentNav = () => {
      const currentPath = window.location.pathname;

      document.querySelectorAll('[data-nav-item]').forEach((item) => {
        const navPath = item.getAttribute('data-path');
        const recursive = item.getAttribute('data-recursive') !== 'false';  // 默认true，false表示精确匹配
        if (!navPath) return;

        // 根据recursive决定匹配逻辑 - 直接比较，不做任何转换
        let isActive: boolean;
        if (recursive) {
          // 递归匹配：当前路径是导航路径或其子路径
          // 首页特殊处理，否则任何界面都会被高亮
          isActive = currentPath === navPath
            || (navPath === '/' ? false : currentPath.startsWith(navPath + '/'));
        } else {
          // 精确匹配：当前路径必须完全等于导航路径
          isActive = currentPath === navPath;
        }

        if (isActive) {
          // 统一给nav-item添加激活背景
          item.classList.add('bg-active');
        }
      });
    };

    // 执行高亮
    highlightCurrentNav();

    // 菜单控制
    document.getElementById('open-menus')?.addEventListener(
      'click',
      (e) => {
        e.stopPropagation();
        toggleClass(elements.navMenu, 'show');
      },
      { signal },
    );

    // 侧边栏控制
    document.getElementById('open-panel')?.addEventListener(
      'click',
      (e) => {
        e.stopPropagation();
        toggleClass(elements.aside, 'aside-panel-show');
        toggleClass(elements.asideMask, 'aside-mask-visible');
      },
      { signal },
    );

    // 点击外部关闭
    document.addEventListener(
      'click',
      (e) => {
        const nav = document.getElementById('nav');
        if (nav && !nav.contains(e.target as Node)) {
          toggleClass(elements.navMenu, 'show', false);
        }
      },
      { signal },
    );

    // 移动端菜单项点击后关闭
    elements.navMenu?.querySelectorAll('[data-nav-item]').forEach((item) => {
      item.addEventListener(
        'click',
        () => {
          if (window.innerWidth < 1024) {
            toggleClass(elements.navMenu, 'show', false);
          }
        },
        { signal },
      );
    });

    // 遮罩点击关闭
    elements.asideMask?.addEventListener(
      'click',
      () => {
        toggleClass(elements.aside, 'aside-panel-show', false);
        toggleClass(elements.asideMask, 'aside-mask-visible', false);
      },
      { signal },
    );

    return () => {
      controller.abort();
    };
  }, []);

  return null;
};

export default NavigationController;
