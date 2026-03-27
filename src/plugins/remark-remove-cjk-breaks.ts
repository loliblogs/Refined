/**
 * https://github.com/gatsbyjs/gatsby/blob/main/packages/gatsby-remark-remove-cjk-breaks/src/index.js
 */

import { visit } from 'unist-util-visit';
import { visitParents } from 'unist-util-visit-parents';
import type { Root } from 'mdast';

/* eslint @stylistic/indent: ["error", 2, { "ignoreComments": true }] */
const cjkChars = [
  '\\p{scx=Hani}',
  '\\p{scx=Bopomofo}',
  '\\p{scx=Yi}',
  '\\p{scx=Hiragana}',
  '\\p{scx=Katakana}',
  '\\p{Radical}',

  // Code points of CJK characters that are not included in the Unicode property escapes above
  // -----------------------------------------------------------------------------------------
  //
  // CJK Symbols and Punctuation
  '\\u{3004}', // 〄 ... CJK symbols and punctuation (Japanese Industrial Standard Symbol)
  '\\u{3012}', // 〒 ... CJK symbols (Postal Mark)
  '\\u{3020}', // 〠 ... CJK symbols (Postal Mark Face)
  '\\u{3036}', // 〶 ... Other CJK symbols (Circled Postal Mark)

  // Enclosed CJK Letters and Months
  '\\u{3248}-\\u{324F}', // ㉈㉉㉊㉋㉌㉍㉎㉏ ... Circled numbers on black squares from ARIB STD B24
  '\\u{3251}-\\u{325F}', // ㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟ ... Circled numbers
  '\\u{327F}',           // ㉿ ... Symbol (Korean Standard Symbol)
  '\\u{32B1}-\\u{32BF}', // ㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿ ... Circled numbers

  // Enclosed Ideographic Supplement
  '\\u{1F201}-\\u{1F202}', // 🈁🈂 ... Squared katakana
  '\\u{1F210}-\\u{1F23B}', // 🈐🈑🈒🈓🈔🈕🈖🈗🈘🈙🈚🈛🈜🈝🈞🈟🈠🈡🈢🈣🈤🈥🈦🈧🈨🈩🈪🈫🈬🈭🈮🈯🈰🈱
                           // 🈲🈳🈴🈵🈶🈷🈸🈹🈺🈻
                           // ... Squared ideographs and kana from ARIB STD B24, Squared ideographs
  '\\u{1F240}-\\u{1F248}', // 🉀🉁🉂🉃🉄🉅🉆🉇🉈 ... Ideographs with tortoise shell brackets from ARIB STD B24
  '\\u{1F260}-\\u{1F265}', // 🉠🉡🉢🉣🉤🉥 ... Symbols for Chinese folk religion

  // CJK Compatibility Forms
  '\\u{FE30}-\\u{FE44}', // ︰︱︲︳︴︵︶︷︸︹︺︻︼︽︾︿﹀﹁﹂﹃﹄ ... Glyphs for vertical variants
  '\\u{FE47}-\\u{FE4F}', // ﹇﹈ ... Glyphs for vertical variants, Overscores and underscores

  // Halfwidth and Fullwidth Forms
  '\\u{FF01}-\\u{FF60}',    // ！＂＃＄％＆＇（）＊＋，－．／０１２３４５６７８９：；＜＝＞？＠
                            // ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ
                            // ［＼］＾＿｀ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ｛｜｝～
                            // ｟｠ ... Fullwidth ASCII variants
  '\\u{FFE0}-\\u{FFE6}',    // ￠￡￢￣￤￥￦ ... Fullwidth symbol variants
  // '\\u{FFE8}-\\u{FFEE}', // ￨￩￪￫￬￭￮ ... Halfwidth symbol variants

  // Small Form Variants
  '\\u{FE50}-\\u{FE52}', // ﹐﹑﹒ ... Small form variants
  '\\u{FE54}-\\u{FE66}', // ﹔﹕﹖﹗﹘﹙﹚﹛﹜﹝﹞﹟﹠﹡﹢﹣﹤﹥﹦ ... Small form variants
  '\\u{FE68}-\\u{FE6B}', // ﹨﹩﹪﹫ ... Small form variants

  // Vertical Forms
  '\\u{FE10}-\\u{FE12}', // ︐︑︒ ... Glyphs for vertical variants
  '\\u{FE13}-\\u{FE16}',   // ︓︔︕︖ ... Glyphs for vertical variants (Latin symbols of vertical form)
  '\\u{FE17}-\\u{FE18}', // ︗︘ ... Glyphs for vertical variants
  '\\u{FE19}',            // ︙ ... Glyphs for vertical variants (Presentation Form for Vertical Horizontal Ellipsis)

  // References:
  // https://unicode.org/charts/
  // https://unicode.org/Public/UCD/latest/ucd/Scripts.txt
  // https://unicode.org/Public/UNIDATA/ScriptExtensions.txt
  // https://unicode-table.com/en/
];

const squaredLatinAbbrChars = [
  // Enclosed CJK Letters and Months
  '\\u{3250}',           // ㉐ ... Squared Latin abbreviation (Partnership Sign)
  '\\u{32CC}-\\u{32CF}', // ㋌㋍㋎㋏ ... Squared Latin abbreviations

  // CJK Compatibility
  '\\u{3371}-\\u{337A}', // ㍱㍲㍳㍴㍵㍶㍷㍸㍹㍺ ... Squared Latin abbreviations
  '\\u{3380}-\\u{33DF}', // ㎀㎁㎂㎃㎄㎅㎆㎇㎈㎉㎊㎋㎌㎍㎎㎏㎐㎑㎒㎓㎔
                         // ㎕㎖㎗㎘
                         // ㎙㎚㎛㎜㎝㎞㎟㎠㎡㎢㎣㎤㎥㎦㎧㎨㎩㎪㎫㎬㎭㎮㎯
                         // ㎰㎱㎲㎳㎴㎵㎶㎷㎸㎹㎺㎻㎼㎽㎾㎿㏀㏁㏂㏃㏄㏅㏆㏇
                         // ㏈㏉㏊㏋㏌㏍㏎㏏㏐㏑㏒㏓㏔㏕㏖㏗㏘㏙㏚㏛㏜㏝㏞㏟
                         // ... Squared Latin abbreviations, Abbreviations involving iter symbols, Squared Latin abbreviations
  '\\u{33FF}',           // ㏿ ... Squared Latin abbreviations (Square Gal)
];


export default function remarkRemoveCjkBreaks({
  includeHangul = false,
  includeEmoji = false,
  includeSquaredLatinAbbrs = false,
  includeMathWithPunctuation = true,
  additionalRegexpPairs,
}: {
  includeHangul?: boolean;
  includeEmoji?: boolean;
  includeSquaredLatinAbbrs?: boolean;
  includeMathWithPunctuation?: boolean;
  additionalRegexpPairs?: {
    beforeBreak?: string;
    afterBreak?: string;
  }[];
} = {}) {
  const charGroup = [...cjkChars];
  if (includeSquaredLatinAbbrs) charGroup.push(...squaredLatinAbbrChars);
  if (includeHangul) charGroup.push('\\p{scx=Hangul}');

  let pattern = `[${charGroup.join('')}]`;
  if (includeEmoji) pattern = `(?:${pattern}|\\p{RGI_Emoji})`;

  const regexpPairs = additionalRegexpPairs ?? [
    { beforeBreak: undefined, afterBreak: undefined },
  ];

  const regexpItems = regexpPairs.map((pair) => {
    const beforeBreak = pair.beforeBreak ? `|${pair.beforeBreak}` : '';
    const afterBreak = pair.afterBreak ? `|${pair.afterBreak}` : '';

    return new RegExp(
      `(${pattern + beforeBreak})(?:\r\n|\r|\n)(${pattern + afterBreak})`,
      'gv',
    );
  });

  // 构建标点相关的正则（用于处理公式前后的标点）
  const punctPattern = '[、。，：；！？]';
  const punctBeforeMathRegex = new RegExp(`(${punctPattern})[\\s\\r\\n]+$`, 'u');
  const punctAfterMathRegex = new RegExp(`^[\\s\\r\\n]+(${punctPattern})`, 'u');

  return function (tree: Root) {
    visit(tree, 'text', (node) => {
      for (const regItem of regexpItems) {
        node.value = node.value.replace(regItem, '$1$2');
      }
    });

    if (includeMathWithPunctuation) {
      visitParents(tree, 'inlineMath', (node, parents) => {
        const parent = parents[parents.length - 1];
        if (parent?.type !== 'paragraph') {
          return;
        }

        const index = parent.children.indexOf(node);
        if (index > 0) {
          const prevNode = parent.children[index - 1];
          if (prevNode?.type === 'text') {
            prevNode.value = prevNode.value.replace(punctBeforeMathRegex, '$1');
          }
        }

        if (index < parent.children.length - 1) {
          const nextNode = parent.children[index + 1];
          if (nextNode?.type === 'text') {
            nextNode.value = nextNode.value.replace(punctAfterMathRegex, '$1');
          }
        }
      });
    }
  };
}
