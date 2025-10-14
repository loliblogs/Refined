import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  return new Response(`User-agent: *
Allow: /

Sitemap: ${new URL('sitemap-index.xml', site).toString()}`, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};
