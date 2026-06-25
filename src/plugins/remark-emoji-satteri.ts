import { defineMdastPlugin } from 'satteri';
import type { PhrasingContent } from 'mdast';
import { get as getEmoji } from 'node-emoji';

/**
 * remark-emoji 的 Sätteri 版,固定 accessible 模式(项目配置 accessible: true)。
 * `:shortcode:` → emoji,并包成 <span role="img" aria-label="x">。
 * 一个 text 含多个 emoji 时拆成节点序列,用 insertBefore + removeNode 落地
 * (Sätteri visitor 只能返回单节点)。
 */
const RE_EMOJI = /:\+1:|:-1:|:[\w-]+:/g;
const RE_PUNCT = /_|-(?!1)/g;

function ariaEmoji(emoji: string, label: string): PhrasingContent {
  return {
    type: 'text',
    value: emoji,
    data: {
      hName: 'span',
      hProperties: { role: 'img', ariaLabel: label },
      hChildren: [{ type: 'text', value: emoji }],
    },
  };
}

function parseEmojiText(value: string): PhrasingContent[] | null {
  const parts: PhrasingContent[] = [];
  let hasEmoji = false;
  let lastIndex = 0;
  RE_EMOJI.lastIndex = 0;

  let match: RegExpExecArray | null = RE_EMOJI.exec(value);
  while (match !== null) {
    const emoji = getEmoji(match[0]);
    if (emoji !== undefined) {
      hasEmoji = true;
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: value.slice(lastIndex, match.index) });
      }
      const label = match[0].slice(1, -1).replace(RE_PUNCT, ' ') + ' emoji';
      parts.push(ariaEmoji(emoji, label));
      lastIndex = match.index + match[0].length;
    }
    match = RE_EMOJI.exec(value);
  }

  if (!hasEmoji) return null;
  if (lastIndex < value.length) {
    parts.push({ type: 'text', value: value.slice(lastIndex) });
  }
  return parts;
}

export default function remarkEmojiSatteri() {
  return defineMdastPlugin({
    name: 'remark-emoji-satteri',
    text(node, ctx) {
      const parts = parseEmojiText(node.value);
      if (parts === null) return;
      ctx.insertBefore(node, parts);
      ctx.removeNode(node);
    },
  });
}
