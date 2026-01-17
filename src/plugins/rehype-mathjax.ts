import { toText } from 'hast-util-to-text';
import { SKIP, visitParents } from 'unist-util-visit-parents';
import { h } from 'hastscript';

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
import type { Element, Text, Root } from 'hast';

// Required configuration imports
import '@mathjax/src/js/input/tex/base/BaseConfiguration.js';
import '@mathjax/src/js/input/tex/ams/AmsConfiguration.js';
import '@mathjax/src/js/input/tex/newcommand/NewcommandConfiguration.js';
import '@mathjax/src/js/input/tex/noundefined/NoUndefinedConfiguration.js';
import '@mathjax/src/js/input/tex/textmacros/TextMacrosConfiguration.js';
import '@mathjax/src/js/input/tex/require/RequireConfiguration.js';
import '@mathjax/src/js/input/tex/autoload/AutoloadConfiguration.js';
import '@mathjax/src/js/input/tex/configmacros/ConfigMacrosConfiguration.js';

// 字体清理正则 - 直接移除所有 @font-face 块（包括注释和换行）
const FONT_CLEANUP_REGEX = /@font-face[\s\S]*?\{[\s\S]*?\}\s*/g;

// 全局缓存组件
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

export default function rehypeMathJax() {
  return async function (tree: Root) {
    const mathProcessor = (() => {
      let currentDocument: MathDocument<LiteElement, unknown, unknown> | null = null;
      let currentOutput: CHTML<LiteElement, unknown, unknown> | null = null;

      return {
        process: async (text: string, display: boolean) => {
          if (!currentDocument || !currentOutput) {
            currentOutput = new CHTML({ fontData: MathJaxNewcmFont });
            currentDocument = mathjax.document('', { InputJax: input, OutputJax: currentOutput });
          }

          const liteElement = await currentDocument.convertPromise(text, { display });
          return [fromLiteElement(liteElement as LiteElement)];
        },

        styleSheet: () => {
          if (!currentDocument || !currentOutput) {
            return null;
          }

          const styleSheet = currentOutput.styleSheet(currentDocument);

          return fromLiteElement(styleSheet);
        },
      };
    })();

    const processList: Promise<void>[] = [];

    visitParents(tree, 'element', (element, parents) => {
      const classes = Array.isArray(element.properties.className)
        ? element.properties.className
        : [];
      const languageMath = classes.includes('language-math');
      const mathDisplay = classes.includes('math-display');
      const mathInline = classes.includes('math-inline');
      let display = mathDisplay;

      if (!languageMath && !mathDisplay && !mathInline) return;

      let parent = parents[parents.length - 1];
      let scope = element;

      // 处理 ```math 代码块
      if (element.tagName === 'code' && languageMath && parent?.type === 'element' && parent.tagName === 'pre') {
        scope = parent;
        parent = parents[parents.length - 2];
        display = true;
      }

      if (!parent) return;

      const text = toText(scope, { whitespace: 'pre' });
      processList.push(mathProcessor.process(text, display).then((result) => {
        const index = parent.children.indexOf(scope);
        parent.children.splice(index, 1, ...result);
      }));

      return SKIP;
    });

    await Promise.all(processList);

    // 添加样式表
    const styleElement = mathProcessor.styleSheet();

    if (styleElement) {
      styleElement.properties.id = undefined;
      tree.children.unshift(styleElement);
    }
  };
}
