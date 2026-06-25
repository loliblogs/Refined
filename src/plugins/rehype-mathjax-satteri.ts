import { h } from 'hastscript';
import { defineHastPlugin } from 'satteri';

// MathJax v4 imports
import { TeX } from '@mathjax/src/js/input/tex.js';
import { CHTML } from '@mathjax/src/js/output/chtml.js';
import { MathJaxNewcmFont } from '@mathjax/mathjax-newcm-font/js/chtml.js';
import { mathjax } from '@mathjax/src/js/mathjax.js';
import { RegisterHTMLHandler } from '@mathjax/src/js/handlers/html.js';
import { liteAdaptor } from '@mathjax/src/js/adaptors/liteAdaptor.js';
import { AssistiveMmlHandler } from '@mathjax/src/js/a11y/assistive-mml.js';

import '@mathjax/src/js/util/asyncLoad/esm.js';

import type { LiteElement } from '@mathjax/src/js/adaptors/lite/Element.js';
import type { MathDocument } from '@mathjax/src/js/core/MathDocument.js';
import type { Element, Text } from 'hast';

// Required configuration imports
import '@mathjax/src/js/input/tex/base/BaseConfiguration.js';
import '@mathjax/src/js/input/tex/ams/AmsConfiguration.js';
import '@mathjax/src/js/input/tex/newcommand/NewcommandConfiguration.js';
import '@mathjax/src/js/input/tex/noundefined/NoUndefinedConfiguration.js';
import '@mathjax/src/js/input/tex/textmacros/TextMacrosConfiguration.js';
import '@mathjax/src/js/input/tex/require/RequireConfiguration.js';
import '@mathjax/src/js/input/tex/autoload/AutoloadConfiguration.js';
import '@mathjax/src/js/input/tex/configmacros/ConfigMacrosConfiguration.js';

// 字体清理正则 - 直接移除所有 @font-face 块(包括注释和换行)
const FONT_CLEANUP_REGEX = /@font-face[\s\S]*?\{[\s\S]*?\}\s*/g;

// 全局缓存组件(无状态转换器,跨文档共享安全)
const input = new TeX({
  packages: ['ams', 'base', 'newcommand', 'noundefined', 'textmacros', 'require', 'autoload', 'configmacros'],
  inlineMath: [['$', '$'], ['\\(', '\\)']],
  displayMath: [['$$', '$$'], ['\\[', '\\]']],
});

const adaptor = liteAdaptor();
AssistiveMmlHandler(RegisterHTMLHandler(adaptor));

// 转换 LiteElement 到 hast Element
function fromLiteElement(liteElement: LiteElement): Element {
  const children: (Element | Text)[] = [];
  for (const node of liteElement.children) {
    children.push(
      'value' in node
        ? { type: 'text', value: node.value.replace(FONT_CLEANUP_REGEX, '') }
        : fromLiteElement(node),
    );
  }
  return h(liteElement.kind, liteElement.attributes, children);
}

/**
 * rehype-mathjax 的 Sätteri 版。
 * - satteri math feature 输出 `<code class="language-math math-inline|math-display">`,
 *   行内/块级(pre>code)逻辑沿用原插件。
 * - 单行 `$$...$$` 补偿:satteri 当 inline,但定界符 ≥2 个 `$` 时强制 display
 *   (复刻原 remark-math fork 的 flowSingleLineMinDelimiter:2)。
 * - 累积的 CHTML 样式表通过覆盖写 ctx.data.astro.frontmatter.mathStyles 透出,由模板层注入。
 * 必须以裸引用传入 hastPlugins,保证 output/doc 每文档隔离。
 */
export default function rehypeMathjaxSatteri() {
  let output: CHTML<LiteElement, unknown, unknown> | null = null;
  let doc: MathDocument<LiteElement, unknown, unknown> | null = null;

  return defineHastPlugin({
    name: 'rehype-mathjax-satteri',
    element: {
      filter: ['code'],
      async visit(node, ctx) {
        const classes = Array.isArray(node.properties.className)
          ? node.properties.className
          : [];
        if (!classes.includes('language-math')) return;

        // display 判定:math-display class,或原文定界符 ≥2 个 $(单行 $$)
        let display = classes.includes('math-display');
        if (!display) {
          const start = node.position?.start.offset;
          const end = node.position?.end.offset;
          if (start !== undefined && end !== undefined
            && ctx.source.slice(start, end).startsWith('$$')) {
            display = true;
          }
        }

        if (!output || !doc) {
          output = new CHTML<LiteElement, unknown, unknown>({ fontData: MathJaxNewcmFont });
          doc = mathjax.document('', { InputJax: input, OutputJax: output });
        }

        const text = ctx.textContent(node);
        const lite = await doc.convertPromise(text, { display });
        const mjx = fromLiteElement(lite as LiteElement);

        // 覆盖写累积样式:output 累积,最后一个公式 resolve 时即完整 CSS
        const astro = ctx.data.astro;
        if (astro) {
          astro.frontmatter.mathStyles = adaptor
            .textContent(output.styleSheet(doc))
            .replace(FONT_CLEANUP_REGEX, '');
        }

        // 块级:替换外层 <pre>;行内:替换 <code>
        if (display) {
          const parent = ctx.parent(node);
          if (parent.type === 'element' && parent.tagName === 'pre') {
            ctx.replaceNode(parent, mjx);
            return;
          }
        }
        return mjx;
      },
    },
  });
}
