import type { Post } from '@/types/content';

/**
 * 获取上下篇文章
 * 如果 includeDrafts = true，上下篇可以是草稿或正式文章（用于草稿预览）
 * 如果 includeDrafts = false，上下篇只能是正式文章（用于正常浏览）
 */
export function getAdjacentPosts(
  posts: Post[],
  index: number,
  includeDrafts = false,
): { prevPost: Post | null; nextPost: Post | null } {
  const isValid = (post: Post | undefined) => {
    if (!post) return false;
    return includeDrafts || !post.draft;
  };

  const nextPost = posts.slice(index + 1).find(isValid) ?? null;
  const prevPost = posts.slice(0, index).findLast(isValid) ?? null;

  return { prevPost, nextPost };
}
