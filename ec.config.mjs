import fs from 'fs';

import { defineEcConfig } from 'astro-expressive-code';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

const ahk2 = JSON.parse(fs.readFileSync('src/syntaxes/ahk2.tmLanguage.json', 'utf8'));

export default defineEcConfig({
  themes: ['gruvbox-dark-medium', 'gruvbox-light-hard'],
  plugins: [pluginCollapsibleSections(), pluginLineNumbers()],
  defaultProps: {
    showLineNumbers: true,
    wrap: true,
  },
  useThemedSelectionColors: true,
  shiki: {
    langs: [ahk2],
    langAlias: {
      ahk2: 'autohotkey2',
    },
  },
  styleOverrides: {
    borderColor: 'var(--color-soft)',
    codeFontFamily: 'var(--font-mono)',
    scrollbarThumbColor: 'var(--scrollbar-thumb)',
    scrollbarThumbHoverColor: 'var(--scrollbar-thumb-hover)',
    codePaddingInline: '0.875rem',
    codePaddingBlock: '0.75rem',
  },
});
