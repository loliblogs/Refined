import { useEffect } from 'preact/hooks';
import type { FunctionComponent as FC } from 'preact';
import { OverlayScrollbars, ClickScrollPlugin } from 'overlayscrollbars';
import type { PartialOptions } from 'overlayscrollbars';
import { decryptStore } from '@/stores/state';

OverlayScrollbars.plugin(ClickScrollPlugin);

const PageScrollManager: FC = () => {
  useEffect(() => {
    const instances = new Map<Element, OverlayScrollbars>();

    // 缓存进度条元素
    const progressContainer = document.querySelector<HTMLElement>('[data-reading-progress-container]');
    const progressBar = document.querySelector<HTMLElement>('[data-reading-progress-bar]');

    // TOC 高亮状态管理 - 全局状态
    let currentActiveId = '';
    const tocLinks = new Map<string, HTMLAnchorElement>();
    let headingElements: { id: string; element: HTMLElement }[] = [];
    let lastIndex = 0;

    // 导航栏隐藏状态管理 - 全局状态
    const nav = document.querySelector<HTMLElement>('[data-nav]');
    const navMobileBar = document.querySelector<HTMLElement>('[data-nav-mobile-bar]');
    const sidebarToggle = document.querySelector<HTMLInputElement>('#--sidebar-toggle');
    const menuToggle = document.querySelector<HTMLInputElement>('#--menu-toggle');
    let scrollbar: HTMLElement | null = null;
    let lastScrollY = 0;
    let hideAmount = 0;
    let navHeight = 0;
    let cachedMaxScroll = 0; // 缓存 scrollHeight - clientHeight，避免滚动时读取布局属性

    // 使用自定义主题 - 不再需要主题切换
    const config = {
      scrollbars: {
        theme: 'os-theme-modern',  // 使用自定义主题
        clickScroll: true,
      },
      update: {
        // 返回空对象，跳过 getMeasuredScrollCoordinates 的疯狂读写循环
        flowDirectionStyles: () => ({}),
      },
    } satisfies PartialOptions;

    // 更新阅读进度（使用缓存的 maxScroll，避免读取布局属性）
    function updateReadingProgress(viewport: HTMLElement) {
      if (!progressContainer || !progressBar) return;

      const scrollTop = viewport.scrollTop; // scrollTop 不触发布局
      const scrollable = cachedMaxScroll > 50;

      if (scrollable) {
        progressContainer.classList.remove('opacity-0', 'pointer-events-none');
        progressContainer.classList.add('opacity-100');

        const scrollRatio = scrollTop / cachedMaxScroll;
        progressBar.style.setProperty('--progress', `${Math.min(scrollRatio, 1)}`);
      } else {
        progressContainer.classList.add('opacity-0', 'pointer-events-none');
        progressContainer.classList.remove('opacity-100');
      }
    }

    // 更新 TOC 高亮状态
    function updateActiveHeading(newActiveId: string) {
      if (currentActiveId === newActiveId) return;

      // 移除旧的高亮
      if (currentActiveId) {
        const prevLink = tocLinks.get(currentActiveId);
        prevLink?.removeAttribute('data-active');
      }

      // 添加新的高亮
      const currLink = tocLinks.get(newActiveId);
      if (currLink) {
        currLink.setAttribute('data-active', 'true');
        // 滚动 TOC 容器以显示当前项
        currLink.scrollIntoView({ behavior: 'instant', block: 'center' });
      }

      window.history.replaceState(
        null,
        '',
        newActiveId ? `#${newActiveId}` : window.location.pathname + window.location.search,
      );

      currentActiveId = newActiveId;
    }

    // 初始化 TOC 高亮
    function initTocHighlight() {
      const tocContainer = document.querySelector('[data-toc]');
      if (!tocContainer) return;

      // 重新收集 TOC 链接和标题
      tocLinks.clear();
      headingElements = []; // 重置数组

      const links = Array.from(tocContainer.querySelectorAll<HTMLAnchorElement>('[data-toc-id]'));

      links.forEach((link) => {
        const id = link.getAttribute('data-toc-id');
        if (!id) return;

        const heading = document.getElementById(id);
        if (heading) {
          tocLinks.set(id, link);
          headingElements.push({ id, element: heading });
        }
      });

      // 重置索引
      lastIndex = 0;
    }

    // TOC 高亮查找函数 - 使用全局状态
    function findActiveHeading(viewport: HTMLElement): string {
      if (headingElements.length === 0) return '';

      const viewportTop = viewport.getBoundingClientRect().top;
      const len = headingElements.length;
      const scrollMarginTop = -48; // 美观考虑上移一定距离，与布局无关

      // 从上次位置开始搜索
      let index = Math.min(Math.max(0, lastIndex), len - 1);

      const currentTop = headingElements[index]?.element.getBoundingClientRect().top;

      if (currentTop === undefined) return '';

      if (currentTop + scrollMarginTop > viewportTop) {
        // 向前搜索：找到最后一个 offsetTop <= scrollTop 的元素
        while (index > 0) {
          const heading = headingElements[index]?.element.getBoundingClientRect().top;
          if (heading !== undefined && heading + scrollMarginTop <= viewportTop) {
            break;
          }
          index--;
        }
      } else {
        // 向后搜索：找到最后一个 offsetTop <= scrollTop 的元素
        while (index < len - 1) {
          const heading = headingElements[index + 1]?.element.getBoundingClientRect().top;
          if (heading !== undefined && heading + scrollMarginTop > viewportTop) {
            break;
          }
          index++;
        }
      }

      lastIndex = index;

      // 搜索完成后检查：如果找到的标题还在视口下方，说明还没滚动到第一个标题
      const result = headingElements[index];
      if (result === undefined || result.element.getBoundingClientRect().top + scrollMarginTop > viewportTop) {
        return ''; // 不高亮
      }

      return result.id;
    }

    // 导航栏渐进式隐藏
    function updateNavbarHide(viewport: HTMLElement) {
      const scrollTop = viewport.scrollTop;
      const delta = scrollTop - lastScrollY;
      lastScrollY = scrollTop;  // 永远更新，无论什么状态

      if (!window.matchMedia('(max-width: 1024px)').matches || !nav) {
        if (scrollbar) {
          scrollbar.style.paddingTop = '0';
        }
        return;
      }

      // 滚动时关闭菜单
      if (menuToggle?.checked) {
        menuToggle.checked = false;
      }

      // sidebar 展开时，只更新 lastScrollY，不改变导航栏位置
      if (sidebarToggle?.checked) return;

      if (scrollTop <= 0) {
        hideAmount = 0;
      } else {
        hideAmount = Math.max(0, Math.min(navHeight, hideAmount + delta));
      }

      nav.style.transform = `translateY(-${hideAmount}px)`;

      // 更新滚动条 padding-top
      if (scrollbar) {
        scrollbar.style.paddingTop = `${navHeight - hideAmount}px`;
      }
    }

    // 通用滚动条初始化
    function initScrollbar(element: Element | null) {
      if (element && !instances.has(element) && element instanceof HTMLElement) {
        const instance = OverlayScrollbars(element, config);
        instances.set(element, instance);
      }
    }

    // content 专属滚动条初始化
    function initContentScrollbar(): (() => void) | null {
      const target = document.querySelector<HTMLElement>('[data-content]');
      const viewport = document.querySelector<HTMLElement>('[data-content-viewport]');
      if (!target || !viewport) return null;

      // 初始化前 focus 到 body 层级的 trap 元素
      // 该元素不受 OverlayScrollbars DOM 操作影响，避免 focus() 触发累积的脏样式重算
      // 仅当用户没有主动 focus 其他元素时才执行（避免打断用户操作）
      const activeEl = document.activeElement;
      if (!activeEl || activeEl === document.body || activeEl === document.documentElement) {
        document.querySelector<HTMLElement>('[data-focus-trap]')?.focus();
      }

      // overflow-x: hidden 不需要水平滚动，禁用 scrollLeft setter 避免无意义的布局计算
      Object.defineProperty(viewport, 'scrollLeft', {
        get() { return 0; },
        set() { /* empty */ },
      });

      // 使用预定义的 viewport 元素，避免 DOM 操作导致的卡顿
      const instance = OverlayScrollbars({
        target,
        elements: { viewport },
      }, {
        ...config,
        overflow: {
          x: 'hidden',
          y: 'scroll',
        },
      });
      instances.set(target, instance);

      // 获取滚动条元素
      scrollbar = target.querySelector<HTMLElement>('.os-scrollbar-vertical');

      const handleScroll = () => {
        // TOC 高亮更新（同步执行，因为很快）
        const activeId = findActiveHeading(viewport);
        updateActiveHeading(activeId); // 即使是空字符串也要处理，用于清除高亮

        // 导航栏渐进式隐藏
        updateNavbarHide(viewport);

        // 阅读进度更新（异步执行）
        requestAnimationFrame(() => {
          updateReadingProgress(viewport);
        });
      };

      const handleUpdated = () => {
        const oldHeight = navHeight;
        navHeight = navMobileBar?.offsetHeight ?? 0;

        // 更新缓存的 maxScroll（只在 updated 时读取布局属性）
        cachedMaxScroll = viewport.scrollHeight - viewport.clientHeight;

        if (oldHeight !== navHeight) {
          hideAmount = 0;
          if (nav) {
            nav.style.transform = '';
          }
          lastScrollY = viewport.scrollTop;
        }

        handleScroll();
      };

      // 初始化 TOC 数据
      initTocHighlight();

      // 延迟到下一帧，让 OverlayScrollbars 的布局计算先完成，避免触发累积的脏布局重算
      requestAnimationFrame(handleUpdated);

      instance.on('scroll', handleScroll);
      instance.on('updated', handleUpdated);

      // 订阅内容解密状态
      const unsubscribeDecrypt = decryptStore.subscribe(
        state => state.isDecrypted,
        (isDecrypted) => {
          if (isDecrypted) {
            initTocHighlight();
            handleScroll();
          }
        },
        { fireImmediately: true },
      );

      return () => {
        unsubscribeDecrypt();
      };
    }

    // 初始化所有滚动区域
    const contentCleanup = initContentScrollbar();
    initScrollbar(document.querySelector('[data-toc-container]'));
    initScrollbar(document.querySelector('[data-searchresults-container]'));
    initScrollbar(document.querySelector('[data-nav-menu-scroll]'));
    initScrollbar(document.querySelector('[data-authmeta-container]'));

    // 清理
    return () => {
      instances.forEach((instance) => {
        // 清理 TOC 相关资源
        if (OverlayScrollbars.valid(instance)) {
          instance.destroy();
        }
      });
      contentCleanup?.();
    };
  }, []);

  return null;
};

export default PageScrollManager;
