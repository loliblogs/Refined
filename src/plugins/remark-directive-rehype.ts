import { visit } from 'unist-util-visit';
import { u } from 'unist-builder';
import { h } from 'hastscript';
import type { Root } from 'mdast';
import { postlinkMap } from './postlink-integration';

export default function remarkDirectiveRehype() {
  return function (tree: Root) {
    visit(tree, ['containerDirective', 'leafDirective', 'textDirective'] as const, (node) => {
      node.data ??= {};
      node.data.hProperties ??= {};

      const hast = h(node.name, node.attributes ?? {});

      switch (node.name) {
        case 'note':
        case 'tip':
        case 'important':
        case 'warning':
        case 'caution':
          if (node.type !== 'containerDirective' || node.children.length === 0) {
            node.data.hProperties.class = 'hidden';
            console.warn('github admonitions to directives: not a container directive or no children');
          } else {
            node.data.hName = 'blockquote';
            node.data.hProperties = hast.properties;
            node.data.hProperties['data-directive-type'] = node.name;
            if (node.children[0]?.type === 'paragraph' && !node.children[0].data?.directiveLabel) {
              node.children.unshift(u('paragraph', {
                children: [u('text', { value: node.name.toUpperCase() })],
              }));
            }
          }
          break;
        case 'abbr':
          // leafDirective: ::abbr[HTML]{title="HyperText Markup Language"}
          // label 变成内容，attributes 直接映射到 HTML 属性
          if (node.type === 'containerDirective') {
            node.data.hProperties.class = 'hidden';
            console.warn('abbr directive should be a leaf directive (::) or text directive (:)');
          } else {
            node.data.hName = node.name;
            node.data.hProperties = hast.properties;
          }
          break;
        case 'mark':
        case 'sup':
        case 'sub':
        case 'kbd':
        case 'samp':
        case 'center':
          node.data.hName = node.name;
          node.data.hProperties = hast.properties;
          break;
        case 'more':
          if (node.type === 'textDirective') {
            console.warn('more directive should not be a text directive');
          }
          node.data.hName = 'span';
          node.data.hProperties = { id: 'more' };
          node.children = [];
          break;
        case 'postlink': {
          // :postlink[显示文本]{id="oi/article.md" anchor="section"}
          // id 格式：collection/filename，如 "oi/solution-CF1000A.md" 或 "post/readme.mdx"
          if (node.type === 'containerDirective') {
            node.data.hProperties.class = 'hidden';
            console.warn('postlink directive should be a leaf (::) or text (:) directive');
            break;
          }

          const id = node.attributes?.id;
          const anchor = node.attributes?.anchor;

          if (!id) {
            node.data.hProperties.class = 'hidden';
            console.warn('postlink directive should have an id attribute');
            break;
          }

          // id 直接作为 key 查找
          const url = postlinkMap[id];

          if (!url) {
            node.data.hName = 'span';
            node.data.hProperties = { class: 'text-admonition-caution' };
            node.children = [u('text', { value: `[postlink: not found ${id}]` })];
            console.warn(`postlink directive: not found ${id}`);
            break;
          }

          // 生成链接
          const href = anchor ? `${url}#${anchor}` : url;
          node.data.hName = 'a';
          node.data.hProperties = { href };
          break;
        }
        default:
          console.warn(`Unknown directive: ${node.name}`);
          break;
      }
    });
  };
}
