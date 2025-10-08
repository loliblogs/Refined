// MathJax 单例 - 延迟初始化，不阻塞模块加载
import { TeX } from '@mathjax/src/js/input/tex.js';
import { CHTML } from '@mathjax/src/js/output/chtml.js';
import { MathJaxNewcmFont } from '@mathjax/mathjax-newcm-font/js/chtml.js';
import { mathjax } from '@mathjax/src/js/mathjax.js';
import { RegisterHTMLHandler } from '@mathjax/src/js/handlers/html.js';
import { liteAdaptor } from '@mathjax/src/js/adaptors/liteAdaptor.js';

import '@mathjax/src/js/util/asyncLoad/esm.js';

import '@mathjax/src/js/input/tex/base/BaseConfiguration.js';
import '@mathjax/src/js/input/tex/ams/AmsConfiguration.js';
import '@mathjax/src/js/input/tex/newcommand/NewcommandConfiguration.js';
import '@mathjax/src/js/input/tex/noundefined/NoUndefinedConfiguration.js';
import '@mathjax/src/js/input/tex/textmacros/TextMacrosConfiguration.js';
import '@mathjax/src/js/input/tex/require/RequireConfiguration.js';
import '@mathjax/src/js/input/tex/autoload/AutoloadConfiguration.js';
import '@mathjax/src/js/input/tex/configmacros/ConfigMacrosConfiguration.js';


const input = new TeX({
  packages: ['ams', 'base', 'newcommand', 'noundefined', 'textmacros', 'require', 'autoload', 'configmacros'],
  inlineMath: [['$', '$'], ['\\(', '\\)']],
  displayMath: [['$$', '$$'], ['\\[', '\\]']],
});

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);


// 预编译的正则表达式（避免每次创建）
const FONT_CLEANUP_REGEX = /src:\s*url\("@mathjax\/mathjax-newcm-font\/js\/chtml\/woff2\/[^"]*\.woff2"\)\s*format\("woff2"\);?\s*/gm;

// 数学符号检测正则：未转义的 $ 或 \( 或 \[
const MATH_SYMBOLS_REGEX = /(?<!\\)\$|\\\(|\\\[/;

// MathJax 默认跳过的标签
const SKIP_TAGS = ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'annotation', 'annotation-xml'].join('|');
const SKIP_TAGS_REGEX = new RegExp(`<(?:${SKIP_TAGS})\\b[^<]*(?:(?!</(?:${SKIP_TAGS})>)<[^<]*)*</(?:${SKIP_TAGS})>`, 'gi');

// 缓存处理结果
const cache = new Map<string, string>();

// Early exit 检测函数 - 排除 MathJax 默认跳过的标签内容
function hasMathSymbols(content: string): boolean {
  // 移除需要跳过的标签及其内容
  const cleanedContent = content.replace(SKIP_TAGS_REGEX, '');
  // 检测数学符号
  return MATH_SYMBOLS_REGEX.test(cleanedContent);
}

export async function processMathJax(content: string, cacheKey?: string) {
  // 检查缓存
  if (import.meta.env.PROD && cacheKey && cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // Early exit: 如果没有数学符号，直接返回
  if (!hasMathSymbols(content)) {
    if (import.meta.env.PROD && cacheKey) {
      cache.set(cacheKey, content);
    }
    return content;
  }

  try {
    // 创建文档并渲染
    const document = mathjax.document(content, {
      InputJax: input,
      OutputJax: new CHTML({
        fontData: MathJaxNewcmFont,
        adaptiveCSS: false,
      }),
    });

    await document.renderPromise();

    // 获取处理后的 HTML
    const processed = document.adaptor.outerHTML(document.adaptor.root(document.document));

    // 清理字体引用（使用预编译正则）
    const result = processed.replace(FONT_CLEANUP_REGEX, '');

    // 缓存结果
    if (import.meta.env.PROD && cacheKey) {
      cache.set(cacheKey, result);
    }

    return result;
  } catch (error) {
    console.error('[MathJax Singleton] Processing error:', error);
    return content;
  }
}
