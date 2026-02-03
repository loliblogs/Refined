/**
 * 评论系统配置
 * 使用 giscus web component，通过 client:visible 实现懒加载
 */

import { useEffect } from 'preact/hooks';

/**
 * 默认评论组件
 * 由 client:visible 控制水合时机，水合后立即加载 giscus
 */
export default function Comments({ term }: { term?: string }) {
  useEffect(() => {
    import('giscus').catch((error: unknown) => {
      console.error('Failed to load giscus', error);
    });
  }, []);

  return (
    <div data-comments-section className="min-h-80">
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
        lang="zh-CN"
      />
    </div>
  );
}
