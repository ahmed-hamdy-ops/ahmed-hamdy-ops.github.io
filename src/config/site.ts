/**
 * Single source of truth for deployment identity, author, and contact.
 *
 * Nothing else in the codebase may hard-code a URL, base path, phone number,
 * or email. `npm run check:links` fails the build if it finds one.
 */

export const site = {
  /** Canonical origin. Approved — this is the host, not a placeholder. */
  url: import.meta.env.SITE ?? 'https://ahmed-hamdy-ops.github.io',
  /** Base path. '/' — this is a user site, and stays '/' on a custom domain. */
  base: import.meta.env.BASE_URL ?? '/',
  /**
   * The canonical host is approved. Ahmed chose it, the account was renamed to
   * match it, and it is the address going on his LinkedIn.
   *
   * It was false for a good reason that has since expired: while the host was
   * still provisional, letting a temporary URL get indexed would have made the
   * later migration start from a worse position. That risk is gone.
   *
   * What made it urgent rather than tidy: crawlers were blocked, so LinkedIn
   * could not fetch the page to build a preview and rejected the URL outright
   * with "Please enter a valid link". Blocking indexing also blocks every link
   * preview — which is the one place the site most needed to look considered.
   *
   * Moving to a custom domain later does not change this back. Keep it true and
   * change `url`; the routes and base path stay as they are.
   */
  canonicalApproved: true,
  name: 'Ahmed Hamdy',
  /**
   * "Business Growth & Operations Specialist" was the wrong door. It described
   * the two years at Alpha Capital and nothing else, when the consulting work —
   * a discipline (business growth, market positioning, sales, support and
   * root-cause diagnosis), not an industry — is the wider half. Consultant is
   * the accurate word.
   */
  title: 'Ahmed Hamdy — Business Operations & Process Improvement Consultant',
  role: 'Business Operations & Process Improvement Consultant',
  supportingLine:
    'Business Operations | Process Diagnosis | Workflow Design | Customer Experience | Support Operations',
  description:
    'I work out where a business problem actually lives — usually a department away from where it shows up — and define the smallest change that removes it.',
  locale: 'en',
  location: {
    city: 'Alexandria',
    country: 'Egypt',
    countryCode: 'EG',
  },
} as const;

/** Approved public contact channels (Master Brief v3 §16, re-confirmed at Gate 1). */
export const contact = {
  whatsapp: 'https://wa.me/201040020093',
  phoneDisplay: '+20 104 002 0093',
  phoneHref: 'tel:+201040020093',
  email: 'ahmedeldep30@gmail.com',
  emailHref: 'mailto:ahmedeldep30@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ahmed-hamdy-growth-operations',
  facebook: 'https://www.facebook.com/brocopra/',
} as const;

/** Verified external work. */
export const external = {
  formula4you: 'https://www.formula4you.com/',
} as const;

/** Schema.org sameAs — only profiles Ahmed has approved for publication. */
export const sameAs: readonly string[] = [contact.linkedin, contact.facebook, external.formula4you];

export const cta = {
  business: { label: 'Request a Business Diagnostic', href: '/contact?intent=diagnostic' },
  employer: { label: 'Discuss a Role', href: '/contact?intent=role' },
} as const;

export type Audience = 'business' | 'employer';

/**
 * Join a path to the configured base path.
 *
 * Every internal href and asset URL must go through this. It is what makes the
 * project-site → user-site → custom-domain migration a config change instead of
 * a find-and-replace across the codebase.
 */
export function withBase(path: string): string {
  const base = site.base.endsWith('/') ? site.base.slice(0, -1) : site.base;
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean === '/') return base === '' ? '/' : `${base}/`;
  return `${base}${clean}`;
}

/** Absolute URL for canonicals, Open Graph, and JSON-LD. */
export function absoluteUrl(path: string): string {
  return new URL(withBase(path), site.url).href;
}
