import type { APIRoute } from 'astro';

// @astrojs/sitemap writes /sitemap-index.xml; this alias serves crawlers that only probe /sitemap.xml.
export const GET: APIRoute = ({ site }) => {
  const indexUrl = new URL('/sitemap-0.xml', site).href;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${indexUrl}</loc></sitemap></sitemapindex>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
