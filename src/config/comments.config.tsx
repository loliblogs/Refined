/**
 * 评论系统配置
 * 使用 giscus web component 懒加载
 */

import type { CollectionName } from '@/types/content';
import { getSiteConfig } from './site.config';
import { useEffect } from 'react';

/**
 * 默认评论组件 - 懒加载版本
 */
export default function Comments({ collection, term }: { collection: CollectionName; term?: string }) {
  const config = getSiteConfig(collection);

  useEffect(() => {
    // 监听 ScrollbarManager 的事件来加载 giscus
    const handleLoadEvent = () => {
      import('giscus').catch((error: unknown) => {
        console.error('Failed to load giscus', error);
      });
      window.dispatchEvent(new CustomEvent('giscus:loaded'));
      window.removeEventListener('giscus:should-load', handleLoadEvent);
    };

    window.addEventListener('giscus:should-load', handleLoadEvent);
    window.dispatchEvent(new CustomEvent('giscus:ready'));

    return () => {
      window.removeEventListener('giscus:should-load', handleLoadEvent);
    };
  }, []);

  return (
    <div id="comments-section" className="min-h-[20rem]">
      <giscus-widget
        repo="loliblogs/discussion"
        repoId="R_kgDOPgBpfA"
        category="Announcements"
        categoryId="DIC_kwDOPgBpfM4CuTtG"
        mapping={term ? 'specific' : 'pathname'}
        {...(term && { term })}
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="preferred_color_scheme"
        lang={config.language}
      />
    </div>
  );
}
