import { useEffect, useRef, type FC } from 'react';
import chroma from 'chroma-js';
import WordCloud from 'wordcloud';

import '@fontsource-variable/noto-serif-sc';

export interface Props {
  tags: [string, number, string][];
}

const TagCloud: FC<Props> = ({ tags }) => {
  const cloudRef = useRef<HTMLDivElement>(null);

  const minWeight = Math.max(Math.min(...tags.map(tag => tag[1])), 1);
  const maxWeight = Math.max(...tags.map(tag => tag[1]), 1);

  // 边界保护：所有权重相同时使用默认factor
  const factor = minWeight === maxWeight ? 1 : 48 / Math.log(maxWeight / minWeight);

  // OKLCH颜色生成函数
  const generateAdaptiveColor = () => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // 使用OKLCH颜色空间 - 感知均匀
    return chroma.oklch(
      isDark ? 0.75 + Math.random() * 0.15 : 0.35 + Math.random() * 0.15,  // L: 亮度
      0.12 + Math.random() * 0.08,  // C: 色度
      Math.random() * 360,          // H: 色相
    ).hex();
  };

  const renderWordCloud = () => {
    const cloudContainer = cloudRef.current;
    if (!cloudContainer) return;

    // 配置选项
    const options: WordCloud.Options = {
      list: tags.filter(tag => tag[1] > 0),
      gridSize: 8,
      weightFactor: (weight: number) => {
        if (weight === 0) return 24;
        return 24 + Math.log(weight / minWeight) * factor;
      },
      fontFamily: 'Noto Serif SC Variable',
      color: generateAdaptiveColor,
      rotateRatio: 0,
      backgroundColor: 'transparent',
      shape: 'square',
      // 为span元素添加类名
      classes: 'transition-transform duration-200 hover:scale-110 cursor-pointer',
      // 点击事件
      click: (item) => {
        window.location.href = item[2] as string;
      },
    };

    // 调用WordCloud - 传入div而不是canvas，会自动使用span元素渲染
    WordCloud(cloudContainer, options);
  };

  const handleResize = () => {
    if (window.matchMedia('print').matches) return;
    WordCloud.stop();
    renderWordCloud();
  };

  const handleMedia = () => {
    const spans = cloudRef.current?.querySelectorAll<HTMLSpanElement>('span');
    spans?.forEach((span) => {
      span.style.color = generateAdaptiveColor();
    });
  };

  useEffect(() => {
    if (!cloudRef.current) return;

    let timeoutId = 0;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      // 首次 timeoutId 为 0 立即执行，后续 debounce 200ms
      timeoutId = window.setTimeout(handleResize, timeoutId ? 200 : 0);
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // 初次渲染
    void document.fonts.load('16px Noto Serif SC Variable', '标签云TagCloud')
      .then(() => {
        if (!cloudRef.current) return;

        observer.observe(cloudRef.current); // 监听大小变化
        mediaQuery.addEventListener('change', handleMedia); // 监听主题变化并重绘
      });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMedia);
      WordCloud.stop();
    };
  }, []);

  return (
    <div
      ref={cloudRef}
      className="relative size-full min-h-64"
    />
  );
};

export default TagCloud;
