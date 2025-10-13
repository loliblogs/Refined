import { useEffect } from 'react';
import { formatDate } from '@/utils/date-helpers';

// ============================================================================
// 类型定义
// ============================================================================

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface TimelineElements {
  track: HTMLDivElement;
  thumbStart: HTMLDivElement;
  thumbEnd: HTMLDivElement;
  inputStart: HTMLInputElement;
  inputEnd: HTMLInputElement;
  labelStart: HTMLElement;
  labelEnd: HTMLElement;
  presets: HTMLElement;
  sections: HTMLElement[];
  emptyState: HTMLElement;
  visibleCount: HTMLElement;
  customSummary: HTMLElement;
  customDetails: HTMLDetailsElement;
}

// ============================================================================
// 常量
// ============================================================================

/**
 * 键盘控制增量配置
 * 使用 Infinity/-Infinity 配合 Math.min/max 实现边界值
 */
const KEYBOARD_DELTA: Record<string, number> = {
  ArrowLeft: -1,
  ArrowDown: -1,
  ArrowRight: 1,
  ArrowUp: 1,
  PageDown: -10,
  PageUp: 10,
  Home: -Infinity,
  End: Infinity,
};

// ============================================================================
// 纯工具函数（无副作用，无外部依赖）
// ============================================================================

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function dateToPercent(date: Date, minTime: number, maxTime: number): number {
  if (maxTime === minTime) return 50;
  const percent = ((date.getTime() - minTime) / (maxTime - minTime)) * 100;
  return Math.max(0, Math.min(100, percent));
}

function percentToDate(percent: number, minTime: number, maxTime: number): Date {
  const time = minTime + ((maxTime - minTime) * percent) / 100;
  return new Date(time);
}

function getYearMonth(date: Date): number {
  return date.getFullYear() * 100 + (date.getMonth() + 1);
}

/**
 * 滑块交换逻辑的唯一实现 - 消除所有特殊情况
 *
 * "好品味"原则：8行重复代码 → 4行统一逻辑
 */
function computeNewRange(
  whichThumb: 'start' | 'end',
  newDate: Date,
  currentRange: DateRange,
): DateRange {
  const { startDate, endDate } = currentRange;

  if (whichThumb === 'start') {
    return newDate > endDate
      ? { startDate: endDate, endDate: newDate }
      : { startDate: newDate, endDate };
  }

  return newDate < startDate
    ? { startDate: newDate, endDate: startDate }
    : { startDate, endDate: newDate };
}

// ============================================================================
// DOM 查询
// ============================================================================

function queryTimelineElements(timeline: HTMLElement): TimelineElements | null {
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
    return null;
  }

  return {
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
  };
}

// ============================================================================
// 初始化
// ============================================================================

function initializeRangeFromUrl(minTime: number, maxTime: number): DateRange {
  const params = new URLSearchParams(window.location.search);
  let startDate = parseDate(params.get('start')) ?? new Date(minTime);
  let endDate = parseDate(params.get('end')) ?? new Date(maxTime);

  // 修正非法范围
  if (startDate > endDate) {
    startDate = new Date(minTime);
    endDate = new Date(maxTime);
  }

  return { startDate, endDate };
}

// ============================================================================
// 视觉更新（CSS 变量 + ARIA）
// ============================================================================

function updateSliderVisuals(
  elements: TimelineElements,
  range: DateRange,
  minTime: number,
  maxTime: number,
): void {
  const startPercent = dateToPercent(range.startDate, minTime, maxTime);
  const endPercent = dateToPercent(range.endDate, minTime, maxTime);

  elements.track.style.setProperty('--slider-start', `${startPercent}%`);
  elements.track.style.setProperty('--slider-end', `${endPercent}%`);
  elements.track.style.setProperty('--slider-width', `${endPercent - startPercent}%`);

  elements.thumbStart.setAttribute('aria-valuenow', String(Math.round(startPercent)));
  elements.thumbEnd.setAttribute('aria-valuenow', String(Math.round(endPercent)));
  elements.thumbStart.setAttribute('aria-valuetext', formatDate(range.startDate));
  elements.thumbEnd.setAttribute('aria-valuetext', formatDate(range.endDate));
}

// ============================================================================
// DOM 同步（标签、输入、过滤、URL）
// ============================================================================

function syncRangeToView(
  elements: TimelineElements,
  range: DateRange,
): void {
  // 更新文本和输入
  const formattedStart = formatDate(range.startDate);
  const formattedEnd = formatDate(range.endDate);

  elements.labelStart.textContent = formattedStart;
  elements.labelEnd.textContent = formattedEnd;
  elements.inputStart.value = formattedStart;
  elements.inputEnd.value = formattedEnd;

  // 过滤可见项
  const visibleItemCount = filterSectionsByRange(elements.sections, range);

  elements.emptyState.classList.toggle('hidden', visibleItemCount > 0);
  elements.visibleCount.textContent = String(visibleItemCount);

  // 更新 URL（不包括 focus 参数）
  const params = new URLSearchParams(window.location.search);
  params.set('start', formattedStart);
  params.set('end', formattedEnd);
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

/**
 * 按年月过滤 sections，返回可见项数量
 *
 * 优化策略：
 * - 完全在范围外的月份：O(1) 隐藏
 * - 完全在范围内的月份：O(1) 显示
 * - 边界月份：O(items) 逐项检查
 */
function filterSectionsByRange(sections: HTMLElement[], range: DateRange): number {
  const startTime = range.startDate.getTime();
  const endTime = range.endDate.getTime();
  const startYM = getYearMonth(range.startDate);
  const endYM = getYearMonth(range.endDate);

  let visibleItemCount = 0;

  for (const section of sections) {
    const sectionYM = Number(section.dataset.ym);
    const items = section.querySelectorAll<HTMLElement>('[data-role="item"]');

    if (sectionYM < startYM || sectionYM > endYM) {
      // 范围外 - 隐藏所有
      section.classList.add('hidden');
      for (const item of items) {
        item.classList.add('hidden');
      }
    } else if (sectionYM === startYM || sectionYM === endYM) {
      // 边界月份 - 逐项检查
      let hasVisible = false;
      for (const item of items) {
        const timestamp = Number(item.dataset.timestamp);
        const isVisible = !Number.isNaN(timestamp) && timestamp >= startTime && timestamp <= endTime;
        item.classList.toggle('hidden', !isVisible);
        if (isVisible) {
          visibleItemCount++;
          hasVisible = true;
        }
      }
      section.classList.toggle('hidden', !hasVisible);
    } else {
      // 范围内 - 显示所有
      section.classList.remove('hidden');
      for (const item of items) {
        item.classList.remove('hidden');
      }
      visibleItemCount += items.length;
    }
  }

  return visibleItemCount;
}

// ============================================================================
// 焦点高亮（一次性参数）
// ============================================================================

function highlightFocusedItem(elements: TimelineElements, range: DateRange): void {
  const params = new URLSearchParams(window.location.search);
  const focusValue = params.get('focus');
  const focusDate = parseDate(focusValue);
  if (!focusDate) return;

  // 立即清理 focus 参数
  params.delete('focus');
  const cleanUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', cleanUrl);

  const startTime = range.startDate.getTime();
  const endTime = range.endDate.getTime();
  const focusTime = focusDate.getTime();

  if (focusTime < startTime || focusTime > endTime) return;

  // 查找最接近的可见项
  let closestItem: HTMLElement | null = null;
  let smallestDiff = Infinity;

  for (const section of elements.sections) {
    if (section.classList.contains('hidden')) continue;

    for (const item of section.querySelectorAll<HTMLElement>('[data-role="item"]')) {
      if (item.classList.contains('hidden')) continue;
      const timestamp = Number(item.dataset.timestamp);
      if (Number.isNaN(timestamp)) continue;
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

// ============================================================================
// 事件处理器设置
// ============================================================================

function setupDragHandlers(
  thumb: HTMLDivElement,
  whichThumb: 'start' | 'end',
  elements: TimelineElements,
  currentRange: { startDate: Date; endDate: Date },
  updateRange: (range: DateRange) => void,
  minTime: number,
  maxTime: number,
  signal: AbortSignal,
): void {
  function beginDrag(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    thumb.focus();

    const isTouch = 'touches' in event;
    const moveEvent = isTouch ? 'touchmove' : 'mousemove';
    const endEvent = isTouch ? 'touchend' : 'mouseup';
    const trackRect = elements.track.getBoundingClientRect();

    const handleMove = (ev: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in ev ? ev.touches[0]?.clientX : ev.clientX;
      if (clientX == null) return;

      const percent = Math.max(0, Math.min(100, ((clientX - trackRect.left) / trackRect.width) * 100));
      const newDate = percentToDate(percent, minTime, maxTime);
      const newRange = computeNewRange(whichThumb, newDate, currentRange);
      updateRange(newRange);
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

function setupDateInputs(
  elements: TimelineElements,
  currentRange: { startDate: Date; endDate: Date },
  updateRange: (range: DateRange) => void,
  signal: AbortSignal,
): void {
  const handleStartChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    const date = parseDate(value);
    if (!date || date.getFullYear() < 1000 || date > currentRange.endDate) return;
    updateRange({ startDate: date, endDate: currentRange.endDate });
  };

  const handleEndChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    const date = parseDate(value);
    if (!date || date.getFullYear() < 1000 || date < currentRange.startDate) return;
    updateRange({ startDate: currentRange.startDate, endDate: date });
  };

  elements.inputStart.addEventListener('change', handleStartChange, { signal });
  elements.inputEnd.addEventListener('change', handleEndChange, { signal });
}

function setupPresetButtons(
  elements: TimelineElements,
  updateRange: (range: DateRange) => void,
  minTime: number,
  maxTime: number,
  signal: AbortSignal,
): void {
  const handleClick = (e: Event) => {
    const target = (e.target as HTMLElement).closest('button[data-preset]');
    if (!target) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    const preset = target.getAttribute('data-preset');

    switch (preset) {
      case 'all':
        updateRange({ startDate: new Date(minTime), endDate: new Date(maxTime) });
        break;
      case 'this-year':
        updateRange({ startDate: new Date(currentYear, 0, 1), endDate: new Date(currentYear, 11, 31) });
        break;
      case 'last-year':
        updateRange({
          startDate: new Date(currentYear - 1, 0, 1),
          endDate: new Date(currentYear - 1, 11, 31),
        });
        break;
      case 'last-3m':
        updateRange({
          startDate: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
          endDate: now,
        });
        break;
      case 'last-6m':
        updateRange({
          startDate: new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
          endDate: now,
        });
        break;
    }
  };

  elements.presets.addEventListener('click', handleClick, { signal });
}

function setupKeyboardControl(
  elements: TimelineElements,
  currentRange: { startDate: Date; endDate: Date },
  updateRange: (range: DateRange) => void,
  minTime: number,
  maxTime: number,
  signal: AbortSignal,
): void {
  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isStart = target === elements.thumbStart;
    const isEnd = target === elements.thumbEnd;

    if (!isStart && !isEnd) return;

    const delta = KEYBOARD_DELTA[e.key];
    if (delta === undefined) return;

    e.preventDefault();

    const whichThumb = isStart ? 'start' : 'end';
    const currentDate = isStart ? currentRange.startDate : currentRange.endDate;
    const currentPercent = dateToPercent(currentDate, minTime, maxTime);
    const newPercent = Math.max(0, Math.min(100, currentPercent + delta));
    const newDate = percentToDate(newPercent, minTime, maxTime);
    const newRange = computeNewRange(whichThumb, newDate, currentRange);

    updateRange(newRange);
  };

  elements.thumbStart.addEventListener('keydown', handleKeyDown, { signal });
  elements.thumbEnd.addEventListener('keydown', handleKeyDown, { signal });
}

function setupCustomPanelClose(elements: TimelineElements, signal: AbortSignal): void {
  const onPointerDown = (e: PointerEvent) => {
    if (!elements.customDetails.open) return;
    const target = e.target as Node | null;
    if (target && !elements.customDetails.contains(target)) {
      elements.customDetails.open = false;
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && elements.customDetails.open) {
      elements.customDetails.open = false;
      elements.customSummary.focus();
    }
  };

  document.addEventListener('pointerdown', onPointerDown, { signal });
  document.addEventListener('keydown', onKeyDown, { signal });
}

// ============================================================================
// 主组件（最后 - 组装所有构建块）
// ============================================================================

export default function TimelineFilterClient() {
  useEffect(() => {
    // ------------------------------------------------------------------------
    // 1. DOM 查询与验证
    // ------------------------------------------------------------------------

    const timeline = document.querySelector<HTMLElement>('[data-role="timeline"]');
    if (!timeline) return;

    const elements = queryTimelineElements(timeline);
    if (!elements) return;

    const minTime = Number(timeline.getAttribute('data-min-time'));
    const maxTime = Number(timeline.getAttribute('data-max-time'));

    // ------------------------------------------------------------------------
    // 2. 状态初始化
    // ------------------------------------------------------------------------

    const controller = new AbortController();
    const { signal } = controller;

    let currentRange: DateRange = initializeRangeFromUrl(minTime, maxTime);
    let rafId: number | null = null;

    // 初始渲染
    updateSliderVisuals(elements, currentRange, minTime, maxTime);
    syncRangeToView(elements, currentRange);
    highlightFocusedItem(elements, currentRange);

    // ------------------------------------------------------------------------
    // 3. 核心更新函数（视觉立即，DOM 节流）
    // ------------------------------------------------------------------------

    const updateRange = (newRange: DateRange) => {
      currentRange = newRange;
      updateSliderVisuals(elements, currentRange, minTime, maxTime);

      // RAF 节流 DOM 更新
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        syncRangeToView(elements, currentRange);
        rafId = null;
      });
    };

    // ------------------------------------------------------------------------
    // 4. 事件绑定
    // ------------------------------------------------------------------------

    setupDragHandlers(elements.thumbStart, 'start', elements, currentRange, updateRange, minTime, maxTime, signal);
    setupDragHandlers(elements.thumbEnd, 'end', elements, currentRange, updateRange, minTime, maxTime, signal);
    setupDateInputs(elements, currentRange, updateRange, signal);
    setupPresetButtons(elements, updateRange, minTime, maxTime, signal);
    setupKeyboardControl(elements, currentRange, updateRange, minTime, maxTime, signal);
    setupCustomPanelClose(elements, signal);

    // ------------------------------------------------------------------------
    // 5. 清理
    // ------------------------------------------------------------------------

    return () => {
      controller.abort();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
