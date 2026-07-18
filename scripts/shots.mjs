/**
 * Targeted section captures for design review (not a pass/fail harness).
 * Run: node scripts/shots.mjs
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.VERIFY_URL ?? 'http://localhost:4330';
const OUT = path.resolve(import.meta.dirname, '..', 'verification', 'sections');
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

async function shoot(name, url, selector, { width = 1440, height = 900, wait = 1800 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(wait);
  if (selector) {
    const el = await page.$(selector);
    if (!el) { console.warn(`  ! selector not found: ${selector}`); await ctx.close(); return; }
    await el.scrollIntoViewIfNeeded();
    // Scroll-triggered one-shots run ~1.6s. Capture the SETTLED state, or the
    // shot lies about what the visitor ends up seeing.
    await page.waitForTimeout(2600);
    await el.screenshot({ path: path.join(OUT, `${name}.png`) });
  } else {
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  }
  console.log(`  ✓ ${name}`);
  await ctx.close();
}

const HOME = `${BASE}/`;
const F4U = `${BASE}/work/formula4you`;

await shoot('01-hero-viewport', HOME, null);
await shoot('02-seam-diagram', HOME, '[data-seam]');
await shoot('03-business-system', HOME, '#system');
await shoot('04-selected-work', HOME, '#work');
await shoot('05-capability-map', HOME, '#capabilities');
await shoot('06-intervention-compression', HOME, '[data-ic]');
await shoot('07-sab', HOME, '#sab');
await shoot('08-credibility', HOME, '#credibility');
await shoot('09-about', HOME, '#about');
await shoot('10-f4u-header', F4U, '.cs__hd');
await shoot('11-f4u-evidence-status', F4U, '.est');
await shoot('12-contact', `${BASE}/contact`, null);
await shoot('13-seam-mobile', HOME, '[data-seam]', { width: 390, height: 844 });
await shoot('14-hero-mobile', HOME, null, { width: 390, height: 844 });

await browser.close();
console.log('\nSections →', path.relative(process.cwd(), OUT));
