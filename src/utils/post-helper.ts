import type { Post } from '@/types/content';

export function getAdjacentPosts(posts: Post[], index: number, skipDraft = true) {
  let prevPost: Post | null = null;
  let nextPost: Post | null = null;

  for (let i = index + 1; i < posts.length; ++i) {
    if (!posts[i]?.draft || !skipDraft) {
      nextPost = posts[i] ?? null;
      break;
    }
  }

  for (let i = index - 1; i >= 0; --i) {
    if (!posts[i]?.draft || !skipDraft) {
      prevPost = posts[i] ?? null;
      break;
    }
  }

  return { prevPost, nextPost };
}
