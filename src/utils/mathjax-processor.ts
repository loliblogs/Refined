/**
 * MathJax 批量处理器
 *
 * 设计原则：
 * 1. 每个 collection 独立的 CHTML 实例，CSS 隔离
 * 2. 每个文本用单独的 document，复用 output
 * 3. 所有处理完成后一次性获取 CSS
 */

import { TeX } from '@mathjax/src/js/input/tex.js';
import { CHTML } from '@mathjax/src/js/output/chtml.js';
import { MathJaxNewcmFont } from '@mathjax/mathjax-newcm-font/js/chtml.js';
import { mathjax } from '@mathjax/src/js/mathjax.js';
import { RegisterHTMLHandler } from '@mathjax/src/js/handlers/html.js';
import { liteAdaptor } from '@mathjax/src/js/adaptors/liteAdaptor.js';
import { AssistiveMmlHandler } from '@mathjax/src/js/a11y/assistive-mml.js';

import '@mathjax/src/js/util/asyncLoad/esm.js';

import '@mathjax/src/js/input/tex/base/BaseConfiguration.js';
import '@mathjax/src/js/input/tex/ams/AmsConfiguration.js';
import '@mathjax/src/js/input/tex/newcommand/NewcommandConfiguration.js';
import '@mathjax/src/js/input/tex/noundefined/NoUndefinedConfiguration.js';
import '@mathjax/src/js/input/tex/textmacros/TextMacrosConfiguration.js';
import '@mathjax/src/js/input/tex/require/RequireConfiguration.js';
import '@mathjax/src/js/input/tex/autoload/AutoloadConfiguration.js';
import '@mathjax/src/js/input/tex/configmacros/ConfigMacrosConfiguration.js';

import type { LiteElement } from '@mathjax/src/js/adaptors/lite/Element.js';
import type { MathDocument } from '@mathjax/src/js/core/MathDocument.js';

// 全局共享的 adaptor 和 input
const adaptor = liteAdaptor();
AssistiveMmlHandler(RegisterHTMLHandler(adaptor));

const input = new TeX({
  packages: ['ams', 'base', 'newcommand', 'noundefined', 'textmacros', 'require', 'autoload', 'configmacros'],
  inlineMath: [['$', '$'], ['\\(', '\\)']],
  displayMath: [['$$', '$$'], ['\\[', '\\]']],
});

// 数学符号检测
const MATH_SYMBOLS_REGEX = /(?<!\\)\$|\\\(|\\\[/;

// 字体清理
const FONT_CLEANUP_REGEX = /@font-face[\s\S]*?\{[\s\S]*?}\s*/g;

function hasMathSymbols(text: string): boolean {
  return MATH_SYMBOLS_REGEX.test(text);
}

export interface MathProcessor {
  process: (text: string) => Promise<string>;
  getCSS: () => string;
}

/**
 * 创建一个 collection 专用的处理器
 * 每个 collection 调用一次，保证 CSS 隔离
 */
export function createMathProcessor(): MathProcessor {
  const output = new CHTML<LiteElement, unknown, unknown>({ fontData: MathJaxNewcmFont });
  let lastDoc: MathDocument<LiteElement, unknown, unknown> | null = null;

  return {
    /**
     * 处理混合内容（普通文本 + 数学公式）
     * 每次创建新 document，复用 output（CSS 累积在 output 中）
     */
    async process(text: string): Promise<string> {
      if (!hasMathSymbols(text)) return text;

      // 用 mathjax.document 处理混合内容，扫描并渲染 $...$ 包裹的公式
      lastDoc = mathjax.document(text, { InputJax: input, OutputJax: output });
      await lastDoc.renderPromise();
      return lastDoc.adaptor.innerHTML(lastDoc.adaptor.body(lastDoc.document));
    },

    /**
     * 获取累积的 CSS（所有 process 调用完成后调用）
     */
    getCSS(): string {
      if (!lastDoc) return '';
      const styleSheet = output.styleSheet(lastDoc);
      return adaptor.textContent(styleSheet).replace(FONT_CLEANUP_REGEX, '');
    },
  };
}
