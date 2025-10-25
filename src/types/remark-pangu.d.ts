declare module 'remark-pangu' {
  import type { Plugin } from 'unified';
  import type { Root } from 'mdast';

  export default function remarkPangu(): Plugin<[], Root>;
}
