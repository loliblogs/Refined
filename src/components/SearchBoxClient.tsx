/**
 * 搜索框客户端增强组件
 * 不渲染DOM，只增强已存在的静态HTML
 */

import { createSignal, createEffect, onMount, onCleanup, untrack } from 'solid-js';

import { isDecrypted } from '@/stores/state';

interface SearchBoxClientProps {
  searchUrl: string;
}

interface LocalMatch {
  text: string;
  element: HTMLElement;
  offset: number;
  context: string;
}

type Timeout = ReturnType<typeof setTimeout>;

export default function SearchBoxClient(props: SearchBoxClientProps) {
  // 响应式状态
  const [keyword, setKeyword] = createSignal('');
  const [showDropdown, setShowDropdown] = createSignal(false);
  const [localResults, setLocalResults] = createSignal<LocalMatch[]>([]);
  const [isSearching, setIsSearching] = createSignal(false);
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  // DOM 缓存（非响应式，mount 时赋值一次）
  let searchTimeout: Timeout | null = null;
  let highlightTimeout: Timeout | null = null;
  let lastHighlight: HTMLElement | null = null;
  let inputEl: HTMLInputElement | null = null;
  let dropdownEl: HTMLElement | null = null;
  let sidebarToggle: HTMLInputElement | null = null;
  let contentEl: Element | null = null;
  let resultsWrapper: Element | null = null;
  let globalSearchEl: HTMLAnchorElement | null = null;
  let keywordSpanEl: Element | null = null;
  let containerEl: Element | null = null;
  let lastSelected: HTMLElement | null = null;

  // 搜索文章内容 - 优化版本，使用正则表达式避免重复toLowerCase
  const findDOMMatches = (searchKeyword: string): LocalMatch[] => {
    if (!contentEl || !searchKeyword.trim()) return [];

    const matches: LocalMatch[] = [];
    const keywordLen = searchKeyword.length;

    // 转义特殊字符并创建不区分大小写的正则表达式
    const escapedKeyword = searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedKeyword, 'gi');

    // 优化的TreeWalker过滤器 - 跳过太短的文本节点
    const walker = document.createTreeWalker(
      contentEl,
      NodeFilter.SHOW_TEXT,
      (node: Node) => {
        const parent = node.parentElement;
        if (parent?.closest('script, style, iframe, [aria-hidden="true"]')) {
          return NodeFilter.FILTER_REJECT;
        }
        // 跳过比关键词还短的文本节点
        if (!node.textContent || node.textContent.length < keywordLen) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    );

    let node: Node | null;
    while ((node = walker.nextNode()) && matches.length < 10) {
      const text = node.textContent;
      if (!text) continue;

      const element = node.parentElement;
      if (!(element instanceof HTMLElement)) continue;

      // 重置正则表达式状态
      regex.lastIndex = 0;

      // 使用exec获取所有匹配，性能远优于indexOf
      let match;
      while ((match = regex.exec(text)) !== null && matches.length < 10) {
        const index = match.index;
        const matchedText = match[0];

        // 生成上下文
        const contextStart = Math.max(0, index - 30);
        const contextEnd = Math.min(text.length, index + matchedText.length + 30);
        let context = text.substring(contextStart, contextEnd);

        if (contextStart > 0) context = '...' + context;
        if (contextEnd < text.length) context = context + '...';

        matches.push({
          text: matchedText,
          element,
          offset: index,
          context,
        });

        // 跳过已匹配的部分，避免重叠匹配
        regex.lastIndex = index + keywordLen;
      }
    }

    return matches;
  };

  // 高亮元素
  const highlightElement = (element: HTMLElement, duration = 3000) => {
    if (lastHighlight) {
      lastHighlight.style.outline = '';
      lastHighlight.style.outlineOffset = '';
    }
    if (highlightTimeout !== null) {
      clearTimeout(highlightTimeout);
    }

    element.style.outline = '0.125rem solid var(--color-primary)';
    element.style.outlineOffset = '0.125rem';
    lastHighlight = element;

    highlightTimeout = setTimeout(() => {
      if (lastHighlight === element) {
        element.style.outline = '';
        element.style.outlineOffset = '';
        lastHighlight = null;
      }
    }, duration);
  };

  // 清空搜索状态和输入框
  const clearSearch = () => {
    setKeyword('');
    setShowDropdown(false);
    setLocalResults([]);
    setSelectedIndex(0);
    if (inputEl) {
      inputEl.value = '';
    }
  };

  // 滚动到结果
  const scrollToResult = (result: LocalMatch) => {
    // 关闭移动端sidebar
    if (sidebarToggle) {
      sidebarToggle.checked = false;
    }

    result.element.scrollIntoView({
      behavior: 'auto',
      block: 'center',
    });
    highlightElement(result.element);
    clearSearch();
  };

  // 只更新选中样式，不重建 DOM（只操作 last 和 current 两个元素）
  const updateSelectedStyles = (idx: number) => {
    if (!resultsWrapper) return;

    // 清除上一个选中项的样式（检查元素是否还在 DOM 中）
    if (lastSelected?.isConnected) {
      lastSelected.classList.remove(
        'bg-muted/20',
        'forced-colors:bg-[Highlight]',
        'forced-colors:text-[HighlightText]',
      );
      lastSelected.classList.add(
        'hover:bg-muted/10',
        'active:bg-muted/20',
        'forced-colors:hover:bg-[Highlight]',
        'forced-colors:hover:text-[HighlightText]',
        'forced-colors:active:bg-[Highlight]',
        'forced-colors:active:text-[HighlightText]',
      );
      // forced-color-adjust-none 下需要手动恢复基础文字色
      if (lastSelected === globalSearchEl) {
        lastSelected.classList.add('forced-colors:text-[LinkText]');
      } else {
        lastSelected.classList.add('forced-colors:text-[ButtonText]');
      }
    }

    // 找到新选中的元素
    let current: HTMLElement | null = null;
    if (idx === 0 && globalSearchEl && !globalSearchEl.classList.contains('hidden')) {
      current = globalSearchEl;
    } else if (idx > 0) {
      current = resultsWrapper.querySelector(`[data-index="${idx}"]`);
    }

    // 应用选中样式（forced-colors 下用 Highlight/HighlightText 反色替代不可见的 bg）
    if (current) {
      current.classList.remove(
        'hover:bg-muted/10',
        'active:bg-muted/20',
        // 移除基础文字色，避免与 HighlightText 同 specificity 冲突（互为 no-op）
        'forced-colors:text-[LinkText]',
        'forced-colors:text-[ButtonText]',
        'forced-colors:hover:bg-[Highlight]',
        'forced-colors:hover:text-[HighlightText]',
        'forced-colors:active:bg-[Highlight]',
        'forced-colors:active:text-[HighlightText]',
      );
      current.classList.add(
        'bg-muted/20',
        'forced-colors:bg-[Highlight]',
        'forced-colors:text-[HighlightText]',
      );
      lastSelected = current;
    } else {
      lastSelected = null;
    }
  };

  // 重建搜索结果 DOM（仅当内容变化时调用）
  const updateResultsDOM = () => {
    if (!resultsWrapper) return;

    const kw = keyword();
    const searching = isSearching();
    const results = localResults();

    // 更新全站搜索链接
    if (globalSearchEl && keywordSpanEl && kw.trim()) {
      globalSearchEl.href = `${props.searchUrl}?q=${encodeURIComponent(kw)}`;
      keywordSpanEl.textContent = `在全站搜索 "${kw}"`;

      // 移除hidden并添加flex布局
      globalSearchEl.classList.remove('hidden');
      globalSearchEl.classList.add(
        'flex',
        'hover:bg-muted/10',
        'active:bg-muted/20',
        'forced-colors:text-[LinkText]',
        'forced-colors:hover:bg-[Highlight]',
        'forced-colors:hover:text-[HighlightText]',
        'forced-colors:active:bg-[Highlight]',
        'forced-colors:active:text-[HighlightText]',
      );

      // 绑定鼠标悬停事件
      globalSearchEl.onmouseenter = () => {
        setSelectedIndex(0);
      };
    } else if (globalSearchEl) {
      // 隐藏时添加hidden并移除flex
      globalSearchEl.classList.add('hidden');
      globalSearchEl.classList.remove('flex');
    }

    // 重置选中状态
    lastSelected = null;

    // 直接操作wrapper，不管OverlayScrollbars的结构
    resultsWrapper.replaceChildren();

    if (searching) {
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'px-4 py-8 text-center text-muted';
      loadingDiv.textContent = '搜索中...';
      resultsWrapper.replaceChildren(loadingDiv);
    } else if (results.length > 0) {
      const fragment = document.createDocumentFragment();

      results.forEach((result, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('data-index', String(index + 1));
        button.className = `
          w-full border-b border-line/50 px-4 py-3 text-left transition-colors
          forced-color-adjust-none
          last:border-0
          hover:bg-muted/10
          active:bg-muted/20
          forced-colors:border-[CanvasText] forced-colors:text-[ButtonText]
          forced-colors:transition-none
          forced-colors:hover:bg-[Highlight]
          forced-colors:hover:text-[HighlightText]
          forced-colors:active:bg-[Highlight]
          forced-colors:active:text-[HighlightText]
        `;

        // 使用 DOM API 创建内容，避免 innerHTML
        const titleDiv = document.createElement('div');
        titleDiv.className = 'text-sm text-foreground font-medium forced-colors:text-inherit';
        titleDiv.textContent = result.text;

        const contextDiv = document.createElement('div');
        contextDiv.className = 'text-xs text-muted mt-1 line-clamp-2 forced-colors:text-inherit';
        contextDiv.textContent = result.context;

        button.appendChild(titleDiv);
        button.appendChild(contextDiv);

        button.addEventListener('click', () => {
          scrollToResult(result);
        });
        button.addEventListener('mouseenter', () => {
          setSelectedIndex(index + 1);
        });

        fragment.appendChild(button);
      });

      resultsWrapper.replaceChildren(fragment);
    } else if (kw.trim()) {
      const noResultDiv = document.createElement('div');
      noResultDiv.className = 'px-4 py-8 text-center text-muted';
      noResultDiv.textContent = '本文无匹配内容';
      resultsWrapper.replaceChildren(noResultDiv);
    }

    // DOM 重建后立即应用选中样式（untrack 避免 selectedIndex 成为本 effect 的依赖）
    updateSelectedStyles(untrack(selectedIndex));
  };

  // 处理输入变化
  const handleInput = (value: string) => {
    setKeyword(value);

    // 清除之前的定时器
    if (searchTimeout !== null) {
      clearTimeout(searchTimeout);
    }

    if (!value.trim()) {
      setShowDropdown(false);
      setLocalResults([]);
      setSelectedIndex(0);
      return;
    }

    // 防抖搜索
    setIsSearching(true);
    searchTimeout = setTimeout(() => {
      const results = findDOMMatches(value);
      setLocalResults(results);
      setShowDropdown(true);  // 搜索完成后才显示下拉框
      setIsSearching(false);
      setSelectedIndex(0);  // 重置选中项
    }, 200);
  };

  // === 初始化：DOM 引用 + 事件绑定 + 订阅 ===
  onMount(() => {
    const input = document.querySelector<HTMLInputElement>('[data-search-input]');
    const dropdown = document.querySelector<HTMLElement>('[data-search-dropdown]');

    if (!input || !dropdown) return;

    inputEl = input;
    dropdownEl = dropdown;
    sidebarToggle = document.querySelector<HTMLInputElement>('#--sidebar-toggle');
    // 优先使用 pagefind 标记的内容区域，避免搜到标题、侧边栏等
    contentEl = document.querySelector('[data-pagefind-body]')
      ?? document.querySelector('[data-content]');
    // 缓存搜索结果相关 DOM
    resultsWrapper = document.querySelector('[data-search-results-wrapper]');
    globalSearchEl = document.querySelector('[data-global-search]');
    keywordSpanEl = document.querySelector('[data-search-keyword]');
    containerEl = document.querySelector('[data-search-container]');

    // 输入事件处理
    const handleInputEvent = (e: Event) => {
      const value = (e.target as HTMLInputElement).value;
      handleInput(value);
    };

    // 键盘事件处理 - signal getter 没有闭包陷阱，不需要 stateRef 桥接
    const handleKeyDownEvent = (e: KeyboardEvent) => {
      // Escape 始终可用：清空并 blur（不管下拉框是否显示）
      if (e.key === 'Escape') {
        e.stopPropagation();
        clearSearch();
        inputEl?.blur();
        return;
      }

      // 以下快捷键仅在下拉框显示时生效
      if (!showDropdown()) return;

      const results = localResults();
      const totalItems = results.length + 1; // +1 for global search

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % totalItems);
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedIndex() === 0) {
            window.location.href = `${props.searchUrl}?q=${encodeURIComponent(keyword())}`;
          } else {
            const targetResult = results[selectedIndex() - 1];
            if (targetResult) {
              scrollToResult(targetResult);
            }
          }
          break;
      }
    };

    // 点击外部关闭
    const handleClickOutside = (e: MouseEvent) => {
      if (containerEl && !containerEl.contains(e.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(0);
      }
    };

    // 全局快捷键聚焦搜索框：/、Ctrl+K、Ctrl+/
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const isSlash = e.key === '/' && !mod && !e.altKey;
      const isModK = e.key === 'k' && mod && !e.altKey;
      const isModSlash = e.key === '/' && mod && !e.altKey;

      if (!isSlash && !isModK && !isModSlash) return;

      // 单独 "/" 忽略：焦点在输入框/可编辑区域/Pagefind 结果列表内
      if (isSlash
        && e.target instanceof HTMLElement
        && e.target.closest('input, textarea, select, [contenteditable="true"], pagefind-results')) {
        return;
      }

      e.preventDefault();
      input.focus();
    };

    // 绑定事件
    input.addEventListener('input', handleInputEvent);
    input.addEventListener('keydown', handleKeyDownEvent);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleGlobalKeyDown);

    // 监听解密状态：解密后清空搜索并刷新内容引用
    createEffect(() => {
      if (isDecrypted()) {
        clearSearch();
        // 解密后文章主体会添加 data-pagefind-body，重新获取引用
        contentEl = document.querySelector('[data-pagefind-body]');
      }
    });

    // 清理
    onCleanup(() => {
      input.removeEventListener('input', handleInputEvent);
      input.removeEventListener('keydown', handleKeyDownEvent);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleGlobalKeyDown);
      if (searchTimeout !== null) {
        clearTimeout(searchTimeout);
      }
      if (highlightTimeout !== null) {
        clearTimeout(highlightTimeout);
      }
      if (lastHighlight) {
        lastHighlight.style.outline = '';
        lastHighlight.style.outlineOffset = '';
      }
    });
  });

  // === 响应式 effects ===

  // 更新下拉框显示状态
  createEffect(() => {
    if (dropdownEl) {
      if (showDropdown() && keyword().trim()) {
        dropdownEl.classList.remove('hidden');
      } else {
        dropdownEl.classList.add('hidden');
      }
    }
  });

  // 更新搜索结果 DOM（内容变化时重建）
  createEffect(() => {
    updateResultsDOM();
  });

  // 更新选中样式（只操作两个元素，不重建 DOM）
  createEffect(() => {
    updateSelectedStyles(selectedIndex());
  });

  // 选中项滚动
  createEffect(() => {
    const idx = selectedIndex();
    if (!showDropdown() || !dropdownEl) return;

    // 全局搜索固定在顶部不滚动，选中它时滚动第一个结果项到顶部
    const targetIndex = idx === 0 ? 1 : idx;
    const element = dropdownEl.querySelector(`[data-index="${targetIndex}"]`);
    element?.scrollIntoView({ block: 'nearest' });
  });

  // 不渲染任何内容
  return null;
}
