import { visitParents } from 'unist-util-visit-parents';
import { h } from 'hastscript';
import { toHtml } from 'hast-util-to-html';
import { rehypeMdxElements } from 'rehype-mdx-elements';

import type { TocItem } from '@/types/utils';
import type { Root } from 'hast';
import type { VFile } from 'vfile';

const mdxElements = rehypeMdxElements();

export default function rehypeSanitize() {
  return function (tree: Root, file: VFile) {
    const toc: TocItem[] = [];

    visitParents(tree, 'element', (element) => {
      if (element.tagName !== 'h1'
        && element.tagName !== 'h2'
        && element.tagName !== 'h3'
        && element.tagName !== 'h4'
        && element.tagName !== 'h5'
        && element.tagName !== 'h6') {
        return;
      }

      const newElement = h(null, element.children);
      mdxElements(newElement);

      toc.push({
        level: parseInt(element.tagName.slice(1)),
        text: toHtml(newElement.children),
        id: element.properties.id as string,
      });
    });

    file.data.astro ??= {};
    file.data.astro.frontmatter ??= {};
    file.data.astro.frontmatter.toc = toc;
  };
}
