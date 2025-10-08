import { visitParents } from 'unist-util-visit-parents';
import { u } from 'unist-builder';
import { h } from 'hastscript';
import type { Root } from 'mdast';

export default function remarkDirectiveRehype() {
  return function (tree: Root) {
    visitParents(tree, ['containerDirective', 'leafDirective', 'textDirective'], (node) => {
      if (node.type !== 'containerDirective'
        && node.type !== 'leafDirective'
        && node.type !== 'textDirective') {
        return;
      }

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
        default:
          console.warn(`Unknown directive: ${node.name}`);
          break;
      }
    });
  };
}
