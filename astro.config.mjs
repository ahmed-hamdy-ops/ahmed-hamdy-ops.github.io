// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { rehypeBasePath } from './scripts/rehype-base-path.mjs';

/**
 * SITE_URL and BASE_PATH are the ONLY place deployment identity lives.
 *
 * Today  — GitHub Pages user site (the repo name matches the account, which
 *          is what makes it a user site rather than a project):
 *          SITE_URL=https://ahmed-hamdy-ops.github.io   BASE_PATH=/
 * Later  — custom domain (Gate 4+):
 *          SITE_URL=https://ahmedhamdy.com                  BASE_PATH=/
 *          + public/CNAME + DNS. No route changes, so search equity is preserved.
 *
 * The temporary github.io address is NOT the permanent canonical identity
 * until Gate 4 approval.
 */
const SITE_URL = process.env.SITE_URL ?? 'https://ahmed-hamdy-ops.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'ignore',
  output: 'static',
  build: { format: 'directory' },
  // Root-relative links inside MDX cannot call withBase(), so they are rewritten
  // at build time. Without this, `[text](/#sab)` 404s on a project-site deploy.
  markdown: {
    rehypePlugins: [[rehypeBasePath, { base: BASE_PATH }]],
  },
  integrations: [
    mdx(),
    sitemap({
      // Drafts, review routes, incomplete audits, and print routes never enter
      // the sitemap.
      filter: (page) =>
        !page.includes('/portfolio-print') &&
        !page.includes('/audits/') &&
        !page.includes('/review/') &&
        !page.includes('/draft/'),
    }),
  ],
  image: {
    // Screenshots must stay legible; no upscaling past source resolution.
    responsiveStyles: true,
  },
});
