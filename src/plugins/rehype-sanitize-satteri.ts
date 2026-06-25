import { defineHastPlugin } from 'satteri';
import { h } from 'hastscript';

/**
 * rehype-sanitize 的 Sätteri 版。
 * - raw 节点 `<!--more-->` → <span id="more">(摘要分隔锚点)。
 * - GFM 任务列表 checkbox 补 ARIA 属性。
 */
export default function rehypeSanitizeSatteri() {
  return defineHastPlugin({
    name: 'rehype-sanitize-satteri',
    raw(node) {
      if (node.value.trim() === '<!--more-->') {
        return h('span', { id: 'more' });
      }
      return undefined;
    },
    element: {
      filter: ['input'],
      visit(node, ctx) {
        // GFM checkbox: <input type="checkbox" checked disabled>
        if (node.properties.type !== 'checkbox' || node.properties.disabled !== true) {
          return;
        }

        const parent = ctx.parent(node);
        if (parent.type !== 'element'
          || parent.tagName !== 'li'
          || !Array.isArray(parent.properties.className)
          || parent.properties.className[0] !== 'task-list-item') {
          return;
        }

        const checked = node.properties.checked === true;
        ctx.setProperty(node, 'aria-disabled', 'true');
        ctx.setProperty(node, 'aria-checked', checked ? 'true' : 'false');
        ctx.setProperty(node, 'aria-label', checked ? 'Completed task' : 'Incomplete task');
      },
    },
  });
}
