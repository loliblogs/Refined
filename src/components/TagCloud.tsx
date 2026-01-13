import { useEffect, useRef, type FC } from 'react';
import chroma from 'chroma-js';
import WordCloud from 'wordcloud';

import type { CollectionName } from '@/types/content';

import '@fontsource-variable/noto-serif-sc';

export interface Props {
  tags: [string, number, string][];
  collection?: CollectionName;
}

const TagCloud: FC<Props> = ({
  tags,
  collection = 'post',
}) => {
  const cloudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cloudRef.current) return;

    const renderWordCloud = () => {
      const cloudContainer = cloudRef.current;
      if (!cloudContainer) return;

      // 清空之前的内容（如果有）
      cloudContainer.replaceChildren();

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

    // 初次渲染
    void document.fonts.load('16px Noto Serif SC Variable', '标签云TagCloud')
      .then(() => {
        renderWordCloud();
      });

    // 监听主题变化并重绘
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      // 主题变化时重新渲染
      WordCloud.stop();
      renderWordCloud();
    };

    mediaQuery.addEventListener('change', handleThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
      WordCloud.stop();
    };
  }, [tags, collection]);

  return (
    <div
      ref={cloudRef}
      className="relative size-full min-h-64"
    />
  );
};

export default TagCloud;
