/**
 * 搜索框客户端增强组件
 * 不渲染DOM，只增强已存在的静态HTML
 */

import { useEffect, useState, useRef } from 'preact/hooks';
import type { FunctionComponent as FC } from 'preact';

interface SearchBoxClientProps {
  searchUrl?: string;
}

interface LocalMatch {
  text: string;
  element: HTMLElement;
  offset: number;
  context: string;
}

type Timeout = ReturnType<typeof setTimeout>;

const SearchBoxClient: FC<SearchBoxClientProps> = ({
  searchUrl = '/search',
}) => {
  const [keyword, setKeyword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [localResults, setLocalResults] = useState<LocalMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchTimeoutRef = useRef<Timeout | null>(null);
  const highlightTimeoutRef = useRef<Timeout | null>(null);
  const lastHighlightRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLElement | null>(null);
  const sidebarToggleRef = useRef<HTMLInputElement | null>(null);
  const contentRef = useRef<Element | null>(null);
  const resultsWrapperRef = useRef<Element | null>(null);
  const globalSearchRef = useRef<HTMLAnchorElement | null>(null);
  const keywordSpanRef = useRef<Element | null>(null);
  const containerRef = useRef<Element | null>(null);
  const lastSelectedRef = useRef<HTMLElement | null>(null);

  // 用 ref 存储最新状态，避免事件监听器重复绑定
  const stateRef = useRef({ showDropdown, localResults, selectedIndex, keyword });

  // 搜索文章内容 - 优化版本，使用正则表达式避免重复toLowerCase
  const findDOMMatches = (searchKeyword: string): LocalMatch[] => {
    const content = contentRef.current;
    if (!content || !searchKeyword.trim()) return [];

    const matches: LocalMatch[] = [];
    const keywordLen = searchKeyword.length;

    // 转义特殊字符并创建不区分大小写的正则表达式
    const escapedKeyword = searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedKeyword, 'gi');

    // 优化的TreeWalker过滤器 - 跳过太短的文本节点
    const walker = document.createTreeWalker(
      content,
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
    if (lastHighlightRef.current) {
      lastHighlightRef.current.style.outline = '';
      lastHighlightRef.current.style.outlineOffset = '';
    }
    if (highlightTimeoutRef.current !== null) {
      clearTimeout(highlightTimeoutRef.current);
    }

    element.style.outline = '0.125rem solid var(--color-primary)';
    element.style.outlineOffset = '0.125rem';
    lastHighlightRef.current = element;

    highlightTimeoutRef.current = setTimeout(() => {
      if (lastHighlightRef.current === element) {
        element.style.outline = '';
        element.style.outlineOffset = '';
        lastHighlightRef.current = null;
      }
    }, duration);
  };

  // 滚动到结果
  const scrollToResult = (result: LocalMatch) => {
    // 关闭移动端sidebar
    if (sidebarToggleRef.current) {
      sidebarToggleRef.current.checked = false;
    }

    result.element.scrollIntoView({
      behavior: 'auto',
      block: 'center',
    });
    highlightElement(result.element);

    // 清空搜索状态
    setKeyword('');
    setShowDropdown(false);
    setLocalResults([]);
    setSelectedIndex(0);

    // 清空输入框
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // 只更新选中样式，不重建 DOM（只操作 last 和 current 两个元素）
  const updateSelectedStyles = (idx: number) => {
    const contentWrapper = resultsWrapperRef.current;
    const globalSearch = globalSearchRef.current;
    if (!contentWrapper) return;

    // 清除上一个选中项的样式（检查元素是否还在 DOM 中）
    if (lastSelectedRef.current?.isConnected) {
      lastSelectedRef.current.classList.remove('bg-muted/20');
      lastSelectedRef.current.classList.add('hover:bg-muted/10', 'active:bg-muted/20');
    }

    // 找到新选中的元素
    let current: HTMLElement | null = null;
    if (idx === 0 && globalSearch && !globalSearch.classList.contains('hidden')) {
      current = globalSearch;
    } else if (idx > 0) {
      current = contentWrapper.querySelector(`[data-index="${idx}"]`);
    }

    // 应用选中样式
    if (current) {
      current.classList.remove('hover:bg-muted/10', 'active:bg-muted/20');
      current.classList.add('bg-muted/20');
      lastSelectedRef.current = current;
    } else {
      lastSelectedRef.current = null;
    }
  };

  // 重建搜索结果 DOM（仅当内容变化时调用）
  const updateResultsDOM = () => {
    const contentWrapper = resultsWrapperRef.current;
    const globalSearch = globalSearchRef.current;
    const keywordSpan = keywordSpanRef.current;

    if (!contentWrapper) return;

    // 更新全站搜索链接
    if (globalSearch && keywordSpan && keyword.trim()) {
      globalSearch.href = `${searchUrl}?q=${encodeURIComponent(keyword)}`;
      keywordSpan.textContent = `在全站搜索 "${keyword}"`;

      // 移除hidden并添加flex布局
      globalSearch.classList.remove('hidden');
      globalSearch.classList.add('flex', 'hover:bg-muted/10', 'active:bg-muted/20');

      // 绑定鼠标悬停事件
      globalSearch.onmouseenter = () => {
        setSelectedIndex(0);
      };
    } else if (globalSearch) {
      // 隐藏时添加hidden并移除flex
      globalSearch.classList.add('hidden');
      globalSearch.classList.remove('flex');
    }

    // 重置选中状态
    lastSelectedRef.current = null;

    // 直接操作wrapper，不管OverlayScrollbars的结构
    contentWrapper.replaceChildren();

    if (isSearching) {
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'px-4 py-8 text-center text-muted';
      loadingDiv.textContent = '搜索中...';
      contentWrapper.replaceChildren(loadingDiv);
    } else if (localResults.length > 0) {
      const fragment = document.createDocumentFragment();

      localResults.forEach((result, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('data-index', String(index + 1));
        button.className = `
          w-full border-b border-line/50 px-4 py-3 text-left transition-colors
          last:border-0
          hover:bg-muted/10
          active:bg-muted/20
        `;

        // 使用 DOM API 创建内容，避免 innerHTML
        const titleDiv = document.createElement('div');
        titleDiv.className = 'text-sm text-foreground font-medium';
        titleDiv.textContent = result.text;

        const contextDiv = document.createElement('div');
        contextDiv.className = 'text-xs text-muted mt-1 line-clamp-2';
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

      contentWrapper.replaceChildren(fragment);
      // DOM 重建后立即应用选中样式
      updateSelectedStyles(selectedIndex);
    } else if (keyword.trim()) {
      const noResultDiv = document.createElement('div');
      noResultDiv.className = 'px-4 py-8 text-center text-muted';
      noResultDiv.textContent = '本文无匹配内容';
      contentWrapper.replaceChildren(noResultDiv);
    }
  };

  // 处理输入变化
  const handleInput = (value: string) => {
    setKeyword(value);

    // 清除之前的定时器
    if (searchTimeoutRef.current !== null) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      setShowDropdown(false);
      setLocalResults([]);
      setSelectedIndex(0);
      return;
    }

    // 防抖搜索
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      const results = findDOMMatches(value);
      setLocalResults(results);
      setShowDropdown(true);  // 搜索完成后才显示下拉框
      setIsSearching(false);
      setSelectedIndex(0);  // 重置选中项
    }, 200);
  };

  // 初始化DOM引用
  useEffect(() => {
    const input = document.querySelector<HTMLInputElement>('[data-search-input]');
    const dropdown = document.querySelector<HTMLElement>('[data-search-dropdown]');

    if (!input || !dropdown) return;

    inputRef.current = input;
    dropdownRef.current = dropdown;
    sidebarToggleRef.current = document.querySelector<HTMLInputElement>('#sidebar-toggle');
    // 优先使用 pagefind 标记的内容区域，避免搜到标题、侧边栏等
    contentRef.current = document.querySelector('[data-pagefind-body]')
      ?? document.querySelector('#content');
    // 缓存搜索结果相关 DOM
    resultsWrapperRef.current = document.querySelector('[data-search-results-wrapper]');
    globalSearchRef.current = document.querySelector('[data-global-search]');
    keywordSpanRef.current = document.querySelector('[data-search-keyword]');
    containerRef.current = document.querySelector('[data-search-container]');
  }, []);

  // 同步状态到 ref，让事件处理器能读到最新值
  useEffect(() => {
    stateRef.current = { showDropdown, localResults, selectedIndex, keyword };
  }, [showDropdown, localResults, selectedIndex, keyword]);

  // 绑定事件处理器 - 只在 mount 时绑定一次
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    // 输入事件处理
    const handleInputEvent = (e: Event) => {
      const value = (e.target as HTMLInputElement).value;
      handleInput(value);
    };

    // 键盘事件处理 - 通过 stateRef 访问最新状态
    const handleKeyDownEvent = (e: KeyboardEvent) => {
      // Escape 始终可用：清空并 blur（不管下拉框是否显示）
      if (e.key === 'Escape') {
        e.stopPropagation();
        setKeyword('');
        setShowDropdown(false);
        setLocalResults([]);
        setSelectedIndex(0);
        if (inputRef.current) {
          inputRef.current.value = '';
          inputRef.current.blur();
        }
        return;
      }

      // 以下快捷键仅在下拉框显示时生效
      const { showDropdown: show, localResults: results, selectedIndex: idx, keyword: kw } = stateRef.current;
      if (!show) return;

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
          if (idx === 0) {
            window.location.href = `${searchUrl}?q=${encodeURIComponent(kw)}`;
          } else {
            const targetResult = results[idx - 1];
            if (targetResult) {
              scrollToResult(targetResult);
            }
          }
          break;
      }
    };

    // 点击外部关闭 - 使用缓存的 containerRef
    const handleClickOutside = (e: MouseEvent) => {
      const container = containerRef.current;
      if (container && !container.contains(e.target as Node)) {
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

    return () => {
      input.removeEventListener('input', handleInputEvent);
      input.removeEventListener('keydown', handleKeyDownEvent);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [searchUrl]);

  // 更新下拉框显示状态
  useEffect(() => {
    if (dropdownRef.current) {
      if (showDropdown && keyword.trim()) {
        dropdownRef.current.classList.remove('hidden');
      } else {
        dropdownRef.current.classList.add('hidden');
      }
    }
  }, [showDropdown, keyword]);

  // 更新搜索结果 DOM（内容变化时重建）
  useEffect(() => {
    updateResultsDOM();
  }, [localResults, isSearching, keyword, searchUrl]);

  // 更新选中样式（只操作两个元素，不重建 DOM）
  useEffect(() => {
    updateSelectedStyles(selectedIndex);
  }, [selectedIndex]);

  // 选中项滚动
  useEffect(() => {
    if (!showDropdown || !dropdownRef.current) return;

    // 全局搜索固定在顶部不滚动，选中它时滚动第一个结果项到顶部
    const targetIndex = selectedIndex === 0 ? 1 : selectedIndex;
    const element = dropdownRef.current.querySelector(`[data-index="${targetIndex}"]`);
    element?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, showDropdown]);

  // 清理
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current !== null) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (highlightTimeoutRef.current !== null) {
        clearTimeout(highlightTimeoutRef.current);
      }
      if (lastHighlightRef.current) {
        lastHighlightRef.current.style.outline = '';
        lastHighlightRef.current.style.outlineOffset = '';
      }
    };
  }, []);

  // 不渲染任何内容
  return null;
};

export default SearchBoxClient;
