import { defineEcConfig } from 'astro-expressive-code';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

export default defineEcConfig({
  themes: ['gruvbox-dark-medium', 'gruvbox-light-hard'],
  plugins: [pluginCollapsibleSections(), pluginLineNumbers()],
  defaultProps: {
    showLineNumbers: true,
    wrap: true,
  },
  styleOverrides: {
    borderColor: 'var(--color-border)',
    codeFontFamily: 'var(--font-mono)',
    scrollbarThumbColor: 'var(--color-scrollbar-thumb)',
    scrollbarThumbHoverColor: 'var(--color-secondary)',
    codePaddingInline: '0.875rem',
    codePaddingBlock: '0.75rem',
  },
});
