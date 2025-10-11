import { useEffect, type FC } from 'react';
import { OverlayScrollbars, ClickScrollPlugin } from 'overlayscrollbars';
import type { PartialOptions } from 'overlayscrollbars';

OverlayScrollbars.plugin(ClickScrollPlugin);

const PageScrollManager: FC = () => {
  useEffect(() => {
    const instances = new Map<Element, OverlayScrollbars>();

    // 缓存进度条元素
    const progressContainer = document.getElementById('reading-progress-container');
    const progressBar = document.getElementById('reading-progress-bar');

    // 评论区懒加载状态 - 如果没有评论区元素，直接标记为已加载
    const commentsSection = document.getElementById('comments-section');
    let giscusLoaded = !commentsSection; // 没有评论区 = 不需要加载

    // TOC 高亮状态管理 - 全局状态
    let currentActiveId = '';
    const tocLinks = new Map<string, HTMLAnchorElement>();
    let headingElements: { id: string; element: HTMLElement }[] = [];
    let lastIndex = 0;

    // 导航栏隐藏状态管理 - 全局状态
    const nav = document.getElementById('nav');
    const navMenu = document.getElementById('nav-menu');
    const aside = document.getElementById('aside');
    const openMenus = document.getElementById('open-menus');
    let scrollbar: HTMLElement | null = null;
    let lastScrollY = 0;
    let hideAmount = 0;
    let navHeight = 0;

    // 使用自定义主题 - 不再需要主题切换
    const config = {
      scrollbars: {
        theme: 'os-theme-modern',  // 使用自定义主题
        clickScroll: true,
      },
      update: {
        debounce: [0, 1000],
      },
    } satisfies PartialOptions;

    // 更新阅读进度
    function updateReadingProgress(viewport: HTMLElement) {
      if (!progressContainer || !progressBar) return;

      // 直接从 DOM 元素计算可滚动距离
      const scrollTop = viewport.scrollTop;
      const scrollHeight = viewport.scrollHeight;
      const clientHeight = viewport.clientHeight;
      const maxScroll = scrollHeight - clientHeight;

      // 检查是否可滚动
      const scrollable = maxScroll > 50;

      if (scrollable) {
        progressContainer.classList.remove('opacity-0', 'pointer-events-none');
        progressContainer.classList.add('opacity-100');

        const scrollPercent = (scrollTop / maxScroll) * 100;
        progressBar.style.setProperty('--progress', `${Math.min(scrollPercent, 100)}%`);
      } else {
        progressContainer.classList.add('opacity-0', 'pointer-events-none');
        progressContainer.classList.remove('opacity-100');
      }
    }

    // 检测评论区是否进入视口
    function checkGiscusVisibility(viewport: HTMLElement) {
      // 如果已经加载或者没有评论区，直接返回
      if (giscusLoaded || !commentsSection) return;

      // 使用 getBoundingClientRect 获取相对于视口的准确位置
      const viewportRect = viewport.getBoundingClientRect();
      const commentsRect = commentsSection.getBoundingClientRect();

      // 计算评论区相对于滚动容器的实际位置
      // commentsRect.top - viewportRect.top = 评论区距离容器顶部的距离
      const relativeTop = commentsRect.top - viewportRect.top;

      // 当评论区即将进入视口时触发（提前一个视口高度加载）
      // relativeTop < viewport.clientHeight 表示已经进入视口（不提前）
      // relativeTop < viewport.clientHeight * 2 表示还有一个视口高度就进入（提前一个视口）
      if (relativeTop < viewport.clientHeight * 2) {
        // 发送自定义事件，通知评论组件开始加载
        window.dispatchEvent(new CustomEvent('giscus:should-load'));
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
        currLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      const tocContainer = document.querySelector('#toc');
      if (!tocContainer) return;

      // 重新收集 TOC 链接和标题
      tocLinks.clear();
      headingElements = []; // 重置数组

      const links = Array.from(tocContainer.querySelectorAll<HTMLAnchorElement>('[data-toc-id]'));

      links.forEach((link) => {
        const id = link.getAttribute('data-toc-id');
        if (id) {
          tocLinks.set(id, link);
          const heading = document.getElementById(id);
          if (heading) {
            headingElements.push({ id, element: heading });
          }

          // 阻止默认跳转行为，手动滚动到目标位置
          link.addEventListener('click', (e) => {
            e.preventDefault();
            heading?.scrollIntoView();
          });
        }
      });

      // 重置索引
      lastIndex = 0;
    }

    function fixLastScrollY() {
      const hash = window.location.hash;
      if (hash) {
        const element = document.getElementById(hash.slice(1));
        element?.scrollIntoView({ behavior: 'instant' });
      }
    }

    // TOC 高亮查找函数 - 使用全局状态
    function findActiveHeading(viewport: HTMLElement): string {
      if (headingElements.length === 0) return '';

      const scrollTop = viewport.scrollTop;
      const len = headingElements.length;
      const scrollMarginTop = -48; // 美观考虑上移一定距离，与布局无关

      // 从上次位置开始搜索
      let index = Math.min(Math.max(0, lastIndex), len - 1);

      const currentTop = headingElements[index]?.element.offsetTop;

      if (currentTop === undefined) return '';

      if (currentTop + scrollMarginTop > scrollTop) {
        // 向前搜索：找到最后一个 offsetTop <= scrollTop 的元素
        while (index > 0) {
          const heading = headingElements[index]?.element.offsetTop;
          if (heading !== undefined && heading + scrollMarginTop <= scrollTop) {
            break;
          }
          index--;
        }
      } else {
        // 向后搜索：找到最后一个 offsetTop <= scrollTop 的元素
        while (index < len - 1) {
          const heading = headingElements[index + 1]?.element.offsetTop;
          if (heading !== undefined && heading + scrollMarginTop > scrollTop) {
            break;
          }
          index++;
        }
      }

      lastIndex = index;

      // 搜索完成后检查：如果找到的标题还在视口下方，说明还没滚动到第一个标题
      const result = headingElements[index];
      if (result === undefined || result.element.offsetTop + scrollMarginTop > scrollTop) {
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

      // aside 展开时，只更新 lastScrollY，不改变 hideAmount 和 transform
      if (aside?.classList.contains('aside-panel-show')) return;

      // 一旦滚动，就关闭菜单
      if (navMenu?.classList.contains('show')) {
        navMenu.classList.remove('show');
        openMenus?.blur();
      }

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

    // 初始化元素
    function initElement(element: Element | null, enableProgress = false) {
      if (element && !instances.has(element) && element instanceof HTMLElement) {
        const instance = OverlayScrollbars(element, config);
        instances.set(element, instance);

        // 为 content 元素启用进度条、评论区检测和 TOC 高亮
        if (enableProgress) {
          const { viewport } = instance.elements();

          // 获取滚动条元素（OverlayScrollbars 初始化后才存在）
          scrollbar = element.querySelector<HTMLElement>('#content > .os-scrollbar-vertical');

          const handleScroll = () => {
            // TOC 高亮更新（同步执行，因为很快）
            const activeId = findActiveHeading(viewport);
            updateActiveHeading(activeId); // 即使是空字符串也要处理，用于清除高亮

            // 导航栏渐进式隐藏
            updateNavbarHide(viewport);

            // 其他更新（异步执行）
            requestAnimationFrame(() => {
              updateReadingProgress(viewport);
              checkGiscusVisibility(viewport);
            });
          };

          const handleUpdated = () => {
            const oldHeight = navHeight;
            navHeight = nav?.offsetHeight ?? 0;

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
          fixLastScrollY();
          initTocHighlight();
          handleUpdated();

          instance.on('scroll', handleScroll); // 监听滚动事件
          instance.on('updated', handleUpdated); // 监听视口变化

          const handleGiscusReady = () => {
            checkGiscusVisibility(viewport);
            window.removeEventListener('giscus:ready', handleGiscusReady);
          };
          window.addEventListener('giscus:ready', handleGiscusReady);

          const handleGiscusLoaded = () => {
            giscusLoaded = true;
            window.removeEventListener('giscus:loaded', handleGiscusLoaded);
          };
          window.addEventListener('giscus:loaded', handleGiscusLoaded);

          // 监听内容解密事件，重新初始化 TOC 数据
          const handleContentDecrypted = () => {
            initTocHighlight();
            handleScroll();
            window.removeEventListener('content-decrypted', handleContentDecrypted);
          };
          window.addEventListener('content-decrypted', handleContentDecrypted);

          // 保存清理函数
          return () => {
            window.removeEventListener('content-decrypted', handleContentDecrypted);
            window.removeEventListener('giscus:ready', handleGiscusReady);
            window.removeEventListener('giscus:loaded', handleGiscusLoaded);
          };
        }
      }
      return null;
    }

    // 初始化所有滚动区域
    const cleanup = initElement(document.getElementById('content'), true);  // 启用进度条
    initElement(document.querySelector('[data-toc-container]'));
    initElement(document.querySelector('[data-searchresults-container]'));
    initElement(document.querySelector('[data-nav-menu-scroll]'));
    initElement(document.querySelector('[data-authmeta-container]'));

    // 清理
    return () => {
      instances.forEach((instance) => {
        // 清理 TOC 相关资源
        if (OverlayScrollbars.valid(instance)) {
          instance.destroy();
        }
      });
      cleanup?.();
    };
  }, []);

  return null;
};

export default PageScrollManager;
