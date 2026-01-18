/**
 * 搜索框客户端增强组件
 * 不渲染DOM，只增强已存在的静态HTML
 */

import { useEffect, useState, useRef, type FC } from 'react';
import { clsx } from 'clsx/lite';

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

  // 搜索文章内容 - 优化版本，使用正则表达式避免重复toLowerCase
  const findDOMMatches = (searchKeyword: string): LocalMatch[] => {
    const article = document.querySelector('article');
    if (!article || !searchKeyword.trim()) return [];

    const matches: LocalMatch[] = [];
    const keywordLen = searchKeyword.length;

    // 转义特殊字符并创建不区分大小写的正则表达式
    const escapedKeyword = searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedKeyword, 'gi');

    // 优化的TreeWalker过滤器 - 跳过太短的文本节点
    const walker = document.createTreeWalker(
      article,
      NodeFilter.SHOW_TEXT,
      (node: Node) => {
        const parent = node.parentElement;
        if (parent?.closest('script, style')) {
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

  // 更新DOM中的搜索结果
  const updateResultsDOM = () => {
    const contentWrapper = document.querySelector('[data-search-results-wrapper]');
    const globalSearch = document.querySelector<HTMLAnchorElement>('[data-global-search]');
    const keywordSpan = document.querySelector('[data-search-keyword]');

    if (!contentWrapper) return;

    // 更新全站搜索链接
    if (globalSearch && keywordSpan && keyword.trim()) {
      globalSearch.href = `${searchUrl}?q=${encodeURIComponent(keyword)}`;
      keywordSpan.textContent = `在全站搜索 "${keyword}"`;

      // 移除hidden并添加flex布局
      globalSearch.classList.remove('hidden');
      globalSearch.classList.add('flex');

      // 更新全站搜索的选中样式 - 需要清理所有可能的样式类
      globalSearch.classList.remove('bg-muted/20', 'hover:bg-muted/10', 'active:bg-muted/20');
      if (selectedIndex === 0) {
        globalSearch.classList.add('bg-muted/20');
      } else {
        globalSearch.classList.add('hover:bg-muted/10', 'active:bg-muted/20');
      }

      // 绑定鼠标悬停事件
      globalSearch.onmouseenter = () => {
        setSelectedIndex(0);
      };
    } else if (globalSearch) {
      // 隐藏时添加hidden并移除flex
      globalSearch.classList.add('hidden');
      globalSearch.classList.remove('flex');
    }

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
        button.className = clsx(
          'w-full px-4 py-3 text-left',
          `
            border-b border-line/50
            last:border-0
          `,
          'transition-colors',
          selectedIndex === index + 1
            ? 'bg-muted/20'
            : `
              hover:bg-muted/10
              active:bg-muted/20
            `,
        );

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
  }, []);

  // 绑定事件处理器 - 需要依赖状态更新
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    // 输入事件处理
    const handleInputEvent = (e: Event) => {
      const value = (e.target as HTMLInputElement).value;
      handleInput(value);
    };

    // 键盘事件处理 - 在这里定义以访问最新状态
    const handleKeyDownEvent = (e: KeyboardEvent) => {
      if (!showDropdown) return;

      const totalItems = localResults.length + 1; // +1 for global search

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
          if (selectedIndex === 0) {
            window.location.href = `${searchUrl}?q=${encodeURIComponent(keyword)}`;
          } else {
            const targetResult = localResults[selectedIndex - 1];
            if (targetResult) {
              scrollToResult(targetResult);
            }
          }
          break;

        case 'Escape':
          e.stopPropagation();
          setKeyword('');
          setShowDropdown(false);
          setLocalResults([]);
          setSelectedIndex(0);
          if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.blur();
          }
          break;
      }
    };

    // 点击外部关闭
    const handleClickOutside = (e: MouseEvent) => {
      const container = document.querySelector('[data-search-container]');
      if (container && !container.contains(e.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(0);
      }
    };

    // 绑定事件
    input.addEventListener('input', handleInputEvent);
    input.addEventListener('keydown', handleKeyDownEvent);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      input.removeEventListener('input', handleInputEvent);
      input.removeEventListener('keydown', handleKeyDownEvent);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, localResults, selectedIndex, keyword, searchUrl]);

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

  // 更新搜索结果
  useEffect(() => {
    updateResultsDOM();
  }, [localResults, isSearching, selectedIndex, keyword, searchUrl]);

  // 选中项滚动
  useEffect(() => {
    if (!showDropdown || !dropdownRef.current) return;

    const element = dropdownRef.current.querySelector(`[data-index="${selectedIndex}"]`);
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
