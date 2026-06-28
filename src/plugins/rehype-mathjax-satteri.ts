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

import type { LiteElement, LiteNode } from '@mathjax/src/js/adaptors/lite/Element.js';
import type { LiteText } from '@mathjax/src/js/adaptors/lite/Text.js';
import type { LiteDocument } from '@mathjax/src/js/adaptors/lite/Document.js';
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
AssistiveMmlHandler<LiteNode, LiteText, LiteDocument>(RegisterHTMLHandler(adaptor));

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
 * - 累积的 CHTML 样式表通过 ctx.data.astro.frontmatter.mathStyles 透出,由模板层注入。
 *   用 pending 计数器实现 finalize-once 语义:最后一个完成的 visit 负责
 *   提取一次 stylesheet,避免每公式都重算的 O(N²) 浪费。
 *   正确性依赖:① satteri dispatchMatches 是同步 for 循环(walk.rs 一次性收集
 *   matches,JS 同步派发);② await 的 ES 微任务屏障(详见 visit 内注释)。
 * 必须以裸引用传入 hastPlugins,保证 output/doc/pending 每文档隔离。
 */
export default function rehypeMathjaxSatteri() {
  let output: CHTML<LiteElement, unknown, unknown> | null = null;
  let doc: MathDocument<LiteElement, unknown, unknown> | null = null;
  // 已启动但未完成的公式数。配合 try/finally 配对自增/自减,
  // 在 pending === 0 时(最后一个完成的 visit)写一次 mathStyles。
  let pending = 0;

  return defineHastPlugin({
    name: 'rehype-mathjax-satteri',
    element: {
      filter: ['code'],
      async visit(node, ctx) {
        const classes = Array.isArray(node.properties.className)
          ? node.properties.className
          : [];
        // 非公式节点早 return,不计数(pending 只统计真正参与转换的公式)
        if (!classes.includes('language-math')) return;

        pending++;
        try {
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
          // ⚠️ 这个 await 是 finalize-once 正确性的关键屏障。
          // MathJax 首次初始化(字体加载、TeX 栈机 warmup)完成后,后续
          // convertPromise 内部走纯同步路径,直接返回已 resolved Promise。
          // 但 ES `Await` 操作符的语义保证:即使 awaitee 是已 settled 的
          // Promise 或根本不是 Promise,continuation 也必经微任务队列调度
          // (MDN: "execution doesn't return to the current function until
          // all other already-scheduled microtasks are processed")。
          // satteri dispatchMatches 是同步 for 循环,所有 visit 的 pending++
          // 必然在任何 await continuation 执行前全部跑完,因此 pending 累
          // 计到 N(公式总数)后才开始递减,pending===0 严格只在最后触发。
          // 删掉这个 await(或换成同步分支)会破坏屏障,导致 finalize 被
          // 触发 N 次而非 1 次。
          const lite = await doc.convertPromise(text, { display });
          const mjx = fromLiteElement(lite as LiteElement);

          // 块级:替换外层 <pre>;行内:替换 <code>
          if (display) {
            const parent = ctx.parent(node);
            if (parent.type === 'element' && parent.tagName === 'pre') {
              ctx.replaceNode(parent, mjx);
              return;
            }
          }
          return mjx;
        } finally {
          // try/finally 保证 pending-- 配对(convertPromise reject 或下游
          // throw 时也不漏减),避免计数器卡死让后续公式触发不了 finalize
          pending--;
          // 最后一个完成的 visit 写一次完整 stylesheet。output 内部累积了
          // 所有公式用到的字符 rules,到这一刻已是完整集
          if (pending === 0) {
            const astro = ctx.data.astro;
            if (astro && output && doc) {
              astro.frontmatter.mathStyles = adaptor
                .textContent(output.styleSheet(doc))
                .replace(FONT_CLEANUP_REGEX, '');
            }
          }
        }
      },
    },
  });
}
