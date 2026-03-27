import type { APIRoute } from 'astro';

import RSSLayout from '@/layouts/RSSLayout.xsl?raw';
import styles from '@/styles/global.css?url';

export const GET: APIRoute = () => {
  const xsl = RSSLayout.replace('<!-- @STYLESHEETS@ -->', `<link rel="stylesheet" href="${styles}"/>`);

  return new Response(xsl, {
    headers: {
      'Content-Type': 'text/xsl; charset=utf-8',
    },
  });
};
