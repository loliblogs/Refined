import { defineMdastPlugin } from 'satteri';
import type { Blockquote, BlockContent, DefinitionContent, PhrasingContent } from 'mdast';

/**
 * 复刻 remark-github-admonitions-to-directives:把 `> [!NOTE]` 形式的 GitHub alert
 * blockquote 转成 containerDirective,再交给 remark-directive-satteri 渲染成 admonition。
 * 必须排在 remark-directive-satteri 之前。
 *
 * 映射与原包一致:IMPORTANT→info、CAUTION→danger,其余同名。
 */
const MAPPING: Record<string, string> = {
  NOTE: 'note',
  TIP: 'tip',
  WARNING: 'warning',
  IMPORTANT: 'info',
  CAUTION: 'danger',
};

const DECLARATION_REGEX = /^\s*\[!(\w+)\]\s*$/;

function buildAlertDirective(node: Readonly<Blockquote>) {
  const [firstChild, ...blockquoteChildren] = node.children;
  if (firstChild?.type !== 'paragraph') return undefined;

  const [firstParagraphChild, ...paragraphChildren] = firstChild.children;
  if (firstParagraphChild?.type !== 'text') return undefined;

  const [declaration, ...textLines] = firstParagraphChild.value.split('\n');
  if (declaration === undefined) return undefined;

  const match = DECLARATION_REGEX.exec(declaration);
  const rawType = match?.[1]?.toUpperCase();
  if (rawType === undefined) return undefined;

  const name = MAPPING[rawType];
  if (name === undefined) return undefined;

  const textNodeChildren: PhrasingContent[] = textLines.length > 0
    ? [{ type: 'text', value: textLines.join('\n') }]
    : [];
  const hasParagraphChildren = textNodeChildren.length > 0 || paragraphChildren.length > 0;
  const alertParagraphChildren: BlockContent[] = hasParagraphChildren
    ? [{ type: 'paragraph', children: [...textNodeChildren, ...paragraphChildren] }]
    : [];

  const children: (BlockContent | DefinitionContent)[] = [
    ...alertParagraphChildren,
    ...blockquoteChildren,
  ];

  return { type: 'containerDirective' as const, name, children };
}

export default function remarkGithubAlertsSatteri() {
  return defineMdastPlugin({
    name: 'remark-github-alerts-satteri',
    blockquote(node) {
      return buildAlertDirective(node);
    },
  });
}
