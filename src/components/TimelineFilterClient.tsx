import { useEffect } from 'react';
import { formatDate } from '@/utils/date-helpers';

interface DateRange {
  startDate: Date;
  endDate: Date;
  startTime: number;  // 缓存的时间戳
  endTime: number;    // 缓存的时间戳
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function dateToPercent(date: Date, minTime: number, maxTime: number): number {
  if (maxTime === minTime) return 50;
  const percent = ((date.getTime() - minTime) / (maxTime - minTime)) * 100;
  return Math.max(0, Math.min(100, percent));
}

function percentToDate(percent: number, minTime: number, maxTime: number): Date {
  const time = minTime + (maxTime - minTime) * percent / 100;
  return new Date(time);
}

export default function TimelineFilterClient() {
  useEffect(() => {
    const timeline = document.querySelector<HTMLElement>('[data-role="timeline"]');
    if (!timeline) return;

    const track = timeline.querySelector<HTMLDivElement>('[data-role="track"]');
    const thumbStart = timeline.querySelector<HTMLDivElement>('[data-role="thumb-start"]');
    const thumbEnd = timeline.querySelector<HTMLDivElement>('[data-role="thumb-end"]');
    const inputStart = timeline.querySelector<HTMLInputElement>('[data-role="input-start"]');
    const inputEnd = timeline.querySelector<HTMLInputElement>('[data-role="input-end"]');
    const labelStart = timeline.querySelector<HTMLElement>('[data-role="label-start"]');
    const labelEnd = timeline.querySelector<HTMLElement>('[data-role="label-end"]');
    const presets = timeline.querySelector<HTMLElement>('[data-role="presets"]');
    const sections = Array.from(timeline.querySelectorAll<HTMLElement>('[data-role="section"]'));
    const emptyState = timeline.querySelector<HTMLElement>('[data-role="empty"]');
    const visibleCount = timeline.querySelector<HTMLElement>('[data-role="count-visible"]');
    const customSummary = timeline.querySelector<HTMLElement>('[data-role="custom"] > summary');
    const customDetails = customSummary?.closest('details') as HTMLDetailsElement | null;

    if (!track || !thumbStart || !thumbEnd || !inputStart || !inputEnd || !labelStart
      || !labelEnd || !presets || sections.length === 0 || !emptyState || !visibleCount
      || !customSummary || !customDetails) {
      console.error('TimelineFilterClient: missing required elements');
      return;
    }

    // 创建类型安全的元素对象（验证后这些都是非空的）
    const safeElements = {
      track,
      thumbStart,
      thumbEnd,
      inputStart,
      inputEnd,
      labelStart,
      labelEnd,
      presets,
      sections,
      emptyState,
      visibleCount,
      customSummary,
      customDetails,
    } as const;

    const minTime = Number(timeline.getAttribute('data-min-time'));
    const maxTime = Number(timeline.getAttribute('data-max-time'));

    // 使用 AbortController 统一管理所有事件监听器
    const controller = new AbortController();
    const { signal } = controller;

    let currentRange: DateRange = initializeRangeFromUrl(minTime, maxTime);
    let rafId: number | null = null;

    updateSliderCssVariables(currentRange);
    applyRangeToDomAndUrl(currentRange);
    highlightFocusedItem(currentRange);

    // 统一的更新函数（视觉立即更新，DOM 节流）
    const updateRange = (startDate: Date, endDate: Date) => {
      currentRange = {
        startDate,
        endDate,
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
      };
      updateSliderCssVariables(currentRange);  // 立即更新视觉反馈

      // 使用 requestAnimationFrame 节流 DOM 更新
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        applyRangeToDomAndUrl(currentRange);
        rafId = null;
      });
    };

    // 处理滑块拖动
    function handleThumbDrag(thumb: HTMLDivElement, whichThumb: 'start' | 'end'): void {
      function beginDrag(event: MouseEvent | TouchEvent): void {
        event.preventDefault();
        thumb.focus();
        const isTouch = 'touches' in event;
        const moveEvent = isTouch ? 'touchmove' : 'mousemove';
        const endEvent = isTouch ? 'touchend' : 'mouseup';
        const trackRect = safeElements.track.getBoundingClientRect();

        const handleMove = (ev: MouseEvent | TouchEvent) => {
          const clientX = 'touches' in ev ? ev.touches[0]?.clientX : ev.clientX;
          if (clientX == null) return;
          const percent = Math.max(0, Math.min(100, ((clientX - trackRect.left) / trackRect.width) * 100));
          const newDate = percentToDate(percent, minTime, maxTime);
          const { startDate, endDate } = currentRange;

          if (whichThumb === 'start') {
            if (newDate > endDate) {
              updateRange(endDate, newDate);
            } else {
              updateRange(newDate, endDate);
            }
          } else {
            if (newDate < startDate) {
              updateRange(newDate, startDate);
            } else {
              updateRange(startDate, newDate);
            }
          }
        };

        const handleEnd = () => {
          document.removeEventListener(moveEvent, handleMove);
          document.removeEventListener(endEvent, handleEnd);
        };

        document.addEventListener(moveEvent, handleMove, { passive: false });
        document.addEventListener(endEvent, handleEnd);
      }

      thumb.addEventListener('mousedown', beginDrag, { signal });
      thumb.addEventListener('touchstart', beginDrag, { signal });
    }

    // 处理日期输入
    function handleDateInputs(): void {
      const handleStartChange = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        const date = parseDate(value);
        if (!date) return;
        const { endDate } = currentRange;
        if (date <= endDate) updateRange(date, endDate);
      };

      const handleEndChange = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        const date = parseDate(value);
        if (!date) return;
        const { startDate } = currentRange;
        if (date >= startDate) updateRange(startDate, date);
      };

      safeElements.inputStart.addEventListener('change', handleStartChange, { signal });
      safeElements.inputEnd.addEventListener('change', handleEndChange, { signal });
    }

    // 处理预设按钮
    function handlePresetButtons(): void {
      const handleClick = (e: Event) => {
        const target = (e.target as HTMLElement).closest('button[data-preset]');
        if (!target) return;
        const now = new Date();
        const currentYear = now.getFullYear();
        const preset = target.getAttribute('data-preset');

        switch (preset) {
          case 'all':
            updateRange(new Date(minTime), new Date(maxTime));
            break;
          case 'this-year':
            updateRange(new Date(currentYear, 0, 1), new Date(currentYear, 11, 31));
            break;
          case 'last-year':
            updateRange(new Date(currentYear - 1, 0, 1), new Date(currentYear - 1, 11, 31));
            break;
          case 'last-3m':
            updateRange(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()), now);
            break;
          case 'last-6m':
            updateRange(new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()), now);
            break;
        }
      };

      safeElements.presets.addEventListener('click', handleClick, { signal });
    }

    // 处理键盘控制
    function handleKeyboardControl(): void {
      const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        const isStart = target === safeElements.thumbStart;
        const isEnd = target === safeElements.thumbEnd;

        if (!isStart && !isEnd) return;

        const { startDate, endDate } = currentRange;
        const currentPercent = isStart
          ? dateToPercent(startDate, minTime, maxTime)
          : dateToPercent(endDate, minTime, maxTime);

        let newPercent = currentPercent;

        switch (e.key) {
          case 'ArrowLeft':
          case 'ArrowDown':
            e.preventDefault();
            newPercent = Math.max(0, currentPercent - 1);
            break;
          case 'ArrowRight':
          case 'ArrowUp':
            e.preventDefault();
            newPercent = Math.min(100, currentPercent + 1);
            break;
          case 'PageDown':
            e.preventDefault();
            newPercent = Math.max(0, currentPercent - 10);
            break;
          case 'PageUp':
            e.preventDefault();
            newPercent = Math.min(100, currentPercent + 10);
            break;
          case 'Home':
            e.preventDefault();
            newPercent = 0;
            break;
          case 'End':
            e.preventDefault();
            newPercent = 100;
            break;
          default:
            return;
        }

        const newDate = percentToDate(newPercent, minTime, maxTime);

        if (isStart) {
          if (newDate > endDate) {
            updateRange(endDate, newDate);
          } else {
            updateRange(newDate, endDate);
          }
        } else {
          if (newDate < startDate) {
            updateRange(newDate, startDate);
          } else {
            updateRange(startDate, newDate);
          }
        }
      };

      safeElements.thumbStart.addEventListener('keydown', handleKeyDown, { signal });
      safeElements.thumbEnd.addEventListener('keydown', handleKeyDown, { signal });
    }

    // 执行所有事件绑定
    handleThumbDrag(safeElements.thumbStart, 'start');
    handleThumbDrag(safeElements.thumbEnd, 'end');
    handleDateInputs();
    handlePresetButtons();
    handleKeyboardControl();
    handleCustomPanelOutsideClose();

    function initializeRangeFromUrl(minTime: number, maxTime: number): DateRange {
      const params = new URLSearchParams(window.location.search);
      let startDate = parseDate(params.get('start')) ?? new Date(minTime);
      let endDate = parseDate(params.get('end')) ?? new Date(maxTime);
      if (startDate > endDate) {
        startDate = new Date(minTime);
        endDate = new Date(maxTime);
      }
      return {
        startDate,
        endDate,
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
      };
    }

    function updateSliderCssVariables(range: DateRange): void {
      const startPercent = dateToPercent(range.startDate, minTime, maxTime);
      const endPercent = dateToPercent(range.endDate, minTime, maxTime);
      safeElements.track.style.setProperty('--slider-start', `${startPercent}%`);
      safeElements.track.style.setProperty('--slider-end', `${endPercent}%`);
      safeElements.track.style.setProperty('--slider-width', `${endPercent - startPercent}%`);

      // 更新 ARIA 值
      safeElements.thumbStart.setAttribute('aria-valuenow', String(Math.round(startPercent)));
      safeElements.thumbEnd.setAttribute('aria-valuenow', String(Math.round(endPercent)));
      safeElements.thumbStart.setAttribute('aria-valuetext', formatDate(range.startDate));
      safeElements.thumbEnd.setAttribute('aria-valuetext', formatDate(range.endDate));
    }

    function handleCustomPanelOutsideClose(): void {
      const onPointerDown = (e: PointerEvent) => {
        if (!safeElements.customDetails.open) return;
        const target = e.target as Node | null;
        if (target && !safeElements.customDetails.contains(target)) {
          safeElements.customDetails.open = false;
        }
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && safeElements.customDetails.open) {
          safeElements.customDetails.open = false;
          safeElements.customSummary.focus();
        }
      };

      document.addEventListener('pointerdown', onPointerDown, { signal });
      document.addEventListener('keydown', onKeyDown, { signal });
    }

    function applyRangeToDomAndUrl(range: DateRange): void {
      safeElements.labelStart.textContent = formatDate(range.startDate);
      safeElements.labelEnd.textContent = formatDate(range.endDate);
      safeElements.inputStart.value = formatDate(range.startDate);
      safeElements.inputEnd.value = formatDate(range.endDate);

      // 计算边界年月
      const startYM = range.startDate.getFullYear() * 100 + (range.startDate.getMonth() + 1);
      const endYM = range.endDate.getFullYear() * 100 + (range.endDate.getMonth() + 1);

      let visibleItemCount = 0;

      // O(sections) 遍历，通常很少
      for (const section of safeElements.sections) {
        const sectionYM = Number(section.dataset.ym);

        if (sectionYM < startYM || sectionYM > endYM) {
          // 完全在范围外 - O(1) 隐藏整个 section
          section.classList.add('hidden');
          for (const item of section.querySelectorAll<HTMLElement>('[data-role="item"]')) {
            item.classList.add('hidden');
          }
        } else if (sectionYM === startYM || sectionYM === endYM) {
          // 边界月份 - 需要精确检查每篇文章
          let hasVisible = false;
          for (const item of section.querySelectorAll<HTMLElement>('[data-role="item"]')) {
            const timestamp = Number(item.dataset.timestamp);
            const isVisible = !isNaN(timestamp) && timestamp >= range.startTime && timestamp <= range.endTime;
            item.classList.toggle('hidden', !isVisible);
            if (isVisible) {
              visibleItemCount++;
              hasVisible = true;
            }
          }
          section.classList.toggle('hidden', !hasVisible);
        } else {
          // 中间月份 - O(1) 显示所有
          section.classList.remove('hidden');
          const items = section.querySelectorAll<HTMLElement>('[data-role="item"]');
          for (const item of items) {
            item.classList.remove('hidden');
          }
          visibleItemCount += items.length;
        }
      }

      // 只在需要改变状态时才操作 DOM，避免不必要的重排
      if (visibleItemCount === 0) {
        safeElements.emptyState.classList.remove('hidden');
      } else {
        safeElements.emptyState.classList.add('hidden');
      }
      safeElements.visibleCount.textContent = String(visibleItemCount);

      // 更新 URL 参数（只管范围，不管 focus）
      const params = new URLSearchParams(window.location.search);
      params.set('start', formatDate(range.startDate));
      params.set('end', formatDate(range.endDate));
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }

    function highlightFocusedItem(range: DateRange): void {
      const params = new URLSearchParams(window.location.search);
      const focusValue = params.get('focus');
      const focusDate = parseDate(focusValue);
      if (!focusDate) return;

      // 立即清理 focus 参数（一次性参数）
      params.delete('focus');
      const cleanUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', cleanUrl);

      if (focusDate < range.startDate || focusDate > range.endDate) return;

      // 只在可见的 sections 中查找
      let closestItem: HTMLElement | null = null;
      let smallestDiff = Infinity;

      const focusTime = focusDate.getTime();
      for (const section of safeElements.sections) {
        if (section.classList.contains('hidden')) continue;

        for (const item of section.querySelectorAll<HTMLElement>('[data-role="item"]')) {
          if (item.classList.contains('hidden')) continue;
          const timestamp = Number(item.dataset.timestamp);
          if (isNaN(timestamp)) continue;
          const diff = Math.abs(timestamp - focusTime);
          if (diff < smallestDiff) {
            smallestDiff = diff;
            closestItem = item;
          }
        }
      }

      if (!closestItem) return;
      closestItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      closestItem.classList.add('animate-[highlight-flash_2s_ease-in-out]');
      window.setTimeout(() => {
        closestItem.classList.remove('animate-[highlight-flash_2s_ease-in-out]');
      }, 2000);
    }

    return () => {
      controller.abort(); // 一次性清理所有事件监听器
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
