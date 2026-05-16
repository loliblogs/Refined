import { navigate } from 'astro:transitions/client';
import { onMount, onCleanup } from 'solid-js';
import type { Component } from 'solid-js';
import chroma from 'chroma-js';
import WordCloud from 'wordcloud';

export interface Props {
  tags: [string, number, string][];
}

const TagCloud: Component<Props> = (props) => {
  let cloudRef: HTMLDivElement | undefined;
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const generateAdaptiveColor = () => chroma.oklch(
    mediaQuery.matches ? 0.75 + Math.random() * 0.15 : 0.35 + Math.random() * 0.15,
    0.12 + Math.random() * 0.08,
    Math.random() * 360,
  ).hex();

  const renderWordCloud = () => {
    if (!cloudRef) return;

    const minWeight = Math.max(Math.min(...props.tags.map(tag => tag[1])), 1);
    const maxWeight = Math.max(...props.tags.map(tag => tag[1]), 1);
    // 边界保护：所有权重相同时使用默认factor
    const factor = minWeight === maxWeight ? 1 : 48 / Math.log(maxWeight / minWeight);

    // 配置选项
    const options: WordCloud.Options = {
      list: props.tags.filter(tag => tag[1] > 0).map(tag => ({
        word: tag[0],
        weight: tag[1],
        attributes: { tabindex: '0', role: 'link', 'data-url': tag[2] },
      })),
      gridSize: 8,
      weightFactor: (weight: number) => {
        if (weight === 0) return 24;
        return 24 + Math.log(weight / minWeight) * factor;
      },
      fontFamily: '\'Times New Roman\', \'Nimbus Roman\', \'Noto Serif SC\', \'Noto Serif CJK SC\', SimSun, \'Songti SC\', serif',
      color: generateAdaptiveColor,
      rotateRatio: 0,
      backgroundColor: 'transparent',
      shape: 'square',
      classes: 'cursor-pointer duration-200 transition-transform hover:scale-110',
    };

    // 调用WordCloud - 传入div而不是canvas，会自动使用span元素渲染
    WordCloud(cloudRef, options);
  };

  const handleResize = () => {
    if (window.matchMedia('print').matches) return;
    WordCloud.stop();
    renderWordCloud();
  };

  const handleMedia = () => {
    const spans = cloudRef?.querySelectorAll<HTMLSpanElement>('span');
    spans?.forEach((span) => {
      span.style.color = generateAdaptiveColor();
    });
  };

  const handleNavigate = (e: Event) => {
    const url = (e.target as HTMLElement).dataset.url;
    if (!url) return;
    e.preventDefault();
    void navigate(url);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleNavigate(e);
  };

  onMount(() => {
    if (!cloudRef) return;

    const ac = new AbortController();
    const { signal } = ac;

    cloudRef.addEventListener('click', handleNavigate, { signal });
    cloudRef.addEventListener('keydown', handleKeydown, { signal });
    mediaQuery.addEventListener('change', handleMedia, { signal });

    let timeoutId = 0;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(handleResize, timeoutId ? 200 : 0);
    });
    observer.observe(cloudRef);

    onCleanup(() => {
      observer.disconnect();
      WordCloud.stop();
      ac.abort();
      clearTimeout(timeoutId);
    });
  });

  return (
    <div
      ref={el => (cloudRef = el)}
      class="
        relative size-full min-h-64 forced-color-adjust-none
        forced-colors:*:text-[LinkText]!
        forced-colors:*:hover:text-[Highlight]!
      "
    />
  );
};

export default TagCloud;
