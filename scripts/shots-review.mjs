/**
 * Captures for the Gate 2.1 proposal review.
 * Run: node scripts/shots-review.mjs
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.VERIFY_URL ?? 'http://localhost:4330/ahmed-hamdy-portfolio';
const OUT = path.resolve(import.meta.dirname, '..', 'verification', 'gate-2-1');
await mkdir(OUT, { recursive: true });
const URL = `${BASE}/review/gate-2-1`;

const browser = await chromium.launch();

async function shot(name, sel, w, h, wait = 2800) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  if (sel) {
    const el = await page.$(sel);
    if (!el) { console.warn(`  ! not found: ${sel}`); await ctx.close(); return; }
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait);
    await el.screenshot({ path: path.join(OUT, `${name}.png`) });
  } else {
    await page.waitForTimeout(wait);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  }
  console.log(`  ✓ ${name}`);
  await ctx.close();
}

await shot('01-hero-desktop-1440', null, 1440, 900);
await shot('02-hero-desktop-1920', null, 1920, 1080);
await shot('03-hero-mobile-390', null, 390, 844);
await shot('04-hero-mobile-360', null, 360, 780);
await shot('05-buttons', '.rv-btns', 1440, 900);
await shot('06-header-cta-fix', '.rv-two', 1440, 900);
await shot('07-f4u-evidence', '.rv-stage', 1440, 900);
await shot('08-f4u-split', '.rv-f4u__split', 1440, 900);
await shot('09-card-reduction', '.rv-two:nth-of-type(1)', 1440, 900);
await shot('10-before-after', '.rv-ba', 1440, 900);

// Motion frame strip on the v2 hero — proof it visibly transforms.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: path.join(OUT, 'tmp'), size: { width: 1440, height: 900 } } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const fig = await page.$('[data-seam2]');
  await fig?.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2600);
  await page.click('[data-seam2-replay]');
  const t0 = Date.now();
  for (const t of [0, 200, 450, 620, 800, 1050, 1300, 1700]) {
    const w = t - (Date.now() - t0);
    if (w > 0) await page.waitForTimeout(w);
    await fig?.screenshot({ path: path.join(OUT, `motion-${String(t).padStart(4, '0')}ms.png`) });
  }
  await page.waitForTimeout(900);
  await fig?.screenshot({ path: path.join(OUT, 'motion-settled.png') });
  await ctx.close();
  console.log('  ✓ motion frames + video');
}

await browser.close();
console.log('\nGate 2.1 →', path.relative(process.cwd(), OUT));
