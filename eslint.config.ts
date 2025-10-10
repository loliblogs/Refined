import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import css from '@eslint/css';
import tseslint from 'typescript-eslint';
import reactRefresh from 'eslint-plugin-react-refresh';
import stylistic from '@stylistic/eslint-plugin';
import astro from 'eslint-plugin-astro';
import * as mdx from 'eslint-plugin-mdx';
import * as mdxParser from 'eslint-mdx';
import tailwindcss from 'eslint-plugin-better-tailwindcss';

const stylisticConfig = stylistic.configs.customize({
  jsx: true,
  quotes: 'single',
  quoteProps: 'as-needed',
  braceStyle: '1tbs',
  semi: true,
});

export default defineConfig(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'public/**',
      'coverage/**',
      '.git/**',
      '.astro/**',
      '*.min.js',
      '*.min.css',
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  eslint.configs.recommended,
  css.configs.recommended,
  {
    files: ['**/*.{md,mdx}'],
    languageOptions: {
      parser: mdxParser,
      globals: {
        React: false,
      },
      // parserOptions 是关键，会传递给 performSyncWork
      parserOptions: {
        remarkConfigPath: 'package.json',
        ignoreRemarkConfig: false,
      },
    },
    plugins: {
      mdx,
    },
    // 使用 createRemarkProcessor 并确保配置一致
    processor: mdx.createRemarkProcessor({
      lintCodeBlocks: true,
      remarkConfigPath: 'package.json',
      ignoreRemarkConfig: false,
    }),
    rules: {
      'mdx/remark': 'error',
      'no-unused-expressions': 'error',
      'no-unused-vars': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      astro.configs['flat/recommended'],
      astro.configs['flat/jsx-a11y-strict'],
      stylisticConfig,
    ],
    files: ['**/*.{js,jsx,cjs,mjs,ts,tsx,astro}'],
    plugins: {
      '@stylistic': stylistic,
      'better-tailwindcss': tailwindcss,
    },
    rules: {
      ...tailwindcss.configs['recommended-error']?.rules,
      '@stylistic/no-multi-spaces': [
        'error',
        {
          ignoreEOLComments: true,
        },
      ],
      '@stylistic/no-multiple-empty-lines': [
        'error',
        {
          max: 2,
          maxEOF: 0,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
          allowBoolean: true,
        },
      ],
    },
  },
  {
    files: ['**/*.{jsx,tsx,astro}'],
    extends: [reactRefresh.configs.vite],
  },
  {
    files: ['**/*.{js,cjs,mjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ['**/*.{md,mdx}/**'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'no-undef': 'off',
    },
  },
  {
    files: ['src/layouts/RSSLayout.astro'],
    languageOptions: {
      globals: {
        xsl: 'readonly',
        'value-of': 'readonly',
        attribute: 'readonly',
        'for-each': 'readonly',
        if: 'readonly',
      },
    },
  },
  {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/global.css',
      },
    },
  },
);
