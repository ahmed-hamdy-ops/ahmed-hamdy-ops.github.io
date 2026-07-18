import type { APIRoute } from 'astro';
import { site, absoluteUrl } from '@config/site';

/**
 * Crawl policy, driven entirely by site.canonicalApproved.
 *
 * The disallow-everything branch is kept, not dead code: it is correct again the
 * moment a future host is provisional. But note what it costs while it is on —
 * it does not only keep the site out of Google. Every link-preview crawler
 * respects robots.txt too, so LinkedIn, Slack and WhatsApp cannot read the page
 * to build a card, and LinkedIn refuses the URL outright as invalid. Blocking
 * indexing and blocking sharing are the same switch.
 */
export const GET: APIRoute = () => {
  const body = site.canonicalApproved
    ? [
        'User-agent: *',
        'Allow: /',
        'Disallow: /portfolio-print',
        '',
        `Sitemap: ${absoluteUrl('/sitemap-index.xml')}`,
        '',
      ].join('\n')
    : [
        '# Pre-launch. The canonical host is not approved yet (Gate 4).',
        '# Indexing is intentionally disabled so this temporary address does not',
        '# become the established canonical identity in search.',
        'User-agent: *',
        'Disallow: /',
        '',
      ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
