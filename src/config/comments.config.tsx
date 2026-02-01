/**
 * 评论系统配置
 * 使用 giscus web component 懒加载
 */

import { useEffect } from 'preact/hooks';
import { commentsStore } from '@/stores/state';

/**
 * 默认评论组件 - 懒加载版本
 */
export default function Comments({ term }: { term?: string }) {
  useEffect(() => {
    // 订阅评论加载状态（即使组件晚挂载也能收到通知）
    const unsubscribe = commentsStore.subscribe(
      state => state.shouldLoad,  // selector: 只监听 shouldLoad
      (shouldLoad) => {              // listener: 状态变化时触发
        if (shouldLoad) {
          import('giscus').catch((error: unknown) => {
            console.error('Failed to load giscus', error);
          });
        }
      },
      { fireImmediately: true },     // 订阅时立即用当前值触发一次
    );

    return unsubscribe;
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
