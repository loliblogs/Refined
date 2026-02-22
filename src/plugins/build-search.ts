import type { AstroIntegration } from 'astro';

import { createIndex } from 'pagefind';
import { globby } from 'globby';
import fs from 'fs/promises';
import path from 'path';

import { version } from '../../node_modules/pagefind/package.json';

interface SearchConfig {
  sourceDir: string;
  urlPrefix: string;
  exclude: string[];
}

async function buildSearchIndex(config: SearchConfig) {
  const { index } = await createIndex();
  if (!index) {
    throw new Error('Failed to create index');
  }

  const files = await globby('**/*.html', {
    cwd: config.sourceDir,
    ignore: config.exclude,
  });

  await Promise.all(files.map(async (file) => {
    // build.format 为 file 时，只有根目录的文件名会出现 index.html
    const url = file === 'index.html' ? '' : file.replace(/\.html$/, '');
    const fullUrl = path.posix.join('/', config.urlPrefix, url);
    const sourcePath = path.join(config.sourceDir, file);
    const content = await fs.readFile(sourcePath, 'utf-8');

    await index.addHTMLFile({ url: fullUrl, content });
  }));

  await index.writeFiles({
    outputPath: path.join(config.sourceDir, 'pagefind', version),
  });
}

export default {
  name: 'build-search',
  hooks: {
    'astro:build:done': async ({ logger }) => {
      const exclude = ['tag/**', 'category/**', 'page/**'];
      await buildSearchIndex({
        sourceDir: 'dist',
        urlPrefix: '',
        exclude: ['oi/**', ...exclude],
      });
      await buildSearchIndex({
        sourceDir: 'dist/oi',
        urlPrefix: 'oi',
        exclude,
      });
      logger.info('Search index built successfully');
    },
  },
} satisfies AstroIntegration;
