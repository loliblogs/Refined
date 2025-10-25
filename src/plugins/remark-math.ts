/// <reference types="remark-parse" />
/// <reference types="remark-stringify" />

import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import type { Extension as FromMarkdownExtension } from 'mdast-util-from-markdown';
import type { ToOptions as MathToOptions } from 'mdast-util-math';
import { mathFromMarkdown, mathToMarkdown } from 'mdast-util-math';
import { math as micromarkMath } from 'micromark-extension-math';

export interface RemarkMathToOptions extends MathToOptions {
  flowSingleLineMinDelimiter?: number | null | undefined;
}

declare module 'mdast-util-from-markdown' {
  interface CompileData {
    customMathDelimiterSize?: number | undefined;
  }
}

type RemarkMathOptions = Readonly<RemarkMathToOptions>;

const emptyOptions: RemarkMathOptions = {};

const remarkMath: Plugin<[RemarkMathOptions?], Root> = function (options) {
  const settings = options ?? emptyOptions;
  const data = this.data();

  const micromarkExtensions = data.micromarkExtensions ?? [];
  const fromMarkdownExtensions = data.fromMarkdownExtensions ?? [];
  const toMarkdownExtensions = data.toMarkdownExtensions ?? [];

  micromarkExtensions.push(
    micromarkMath({
      singleDollarTextMath: true,
    }),
  );

  fromMarkdownExtensions.push(createDisplayFromMarkdown(settings, mathFromMarkdown()));
  toMarkdownExtensions.push(mathToMarkdown(settings));
};

function createDisplayFromMarkdown(
  settings: RemarkMathOptions,
  officialExt: FromMarkdownExtension,
): FromMarkdownExtension {
  const min = settings.flowSingleLineMinDelimiter ?? null;

  // 保存原始处理器
  const originalEnterMathText = officialExt.enter?.mathText;
  const originalExitMathText = officialExt.exit?.mathText;

  return {
    // 展开所有官方处理器
    ...officialExt,

    enter: {
      // 展开所有官方 enter 处理器
      ...officialExt.enter,

      // 只覆盖我们需要修改的
      mathText(token) {
        // 先调用官方处理器 (super)
        if (originalEnterMathText) {
          originalEnterMathText.call(this, token);
        }
        // 我们的逻辑
        this.data.customMathDelimiterSize = undefined;
      },

      // 添加我们独有的处理器
      mathTextSequence(token) {
        if (this.data.customMathDelimiterSize == null) {
          this.data.customMathDelimiterSize = token.end.column - token.start.column;
        }
      },
    },

    exit: {
      // 展开所有官方 exit 处理器
      ...officialExt.exit,

      // 只覆盖我们需要修改的
      mathText(token) {
        // 先调用官方处理器 (super)
        if (originalExitMathText) {
          originalExitMathText.call(this, token);
        }

        // 我们的逻辑
        const open = this.data.customMathDelimiterSize;
        this.data.customMathDelimiterSize = undefined;

        if (open == undefined || min == null || open < min) {
          return;
        }

        const parent = this.stack[this.stack.length - 1];
        if (!parent || !('children' in parent) || parent.children.length === 0) {
          return;
        }

        const node = parent.children.at(-1);
        if (node?.type === 'inlineMath') {
          // 添加强制显示标记
          node.data ??= {};
          node.data.hProperties ??= {};
          const classList = Array.isArray(node.data.hProperties.className)
            ? node.data.hProperties.className
            : [];
          node.data.hProperties.className = classList.map(className => className === 'math-inline' ? 'math-display' : className);
        }
      },
    },
  };
}

export default remarkMath;
