/**
 * Font verification against a live/built target.
 *
 *  · Every declared family actually loads (not silently falling back).
 *  · No request leaves the origin — a font CDN would show up here.
 *  · Every font request returns 200 (base-path correctness).
 *  · Reports page height per breakpoint, for the length review.
 *
 * Run: node scripts/verify-fonts.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.VERIFY_URL ?? 'http://localhost:4330';
let fails = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.error(`  ✗ ${m}`); fails++; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const requests = [];
page.on('request', (r) => requests.push(r.url()));
const failed = [];
page.on('response', (r) => {
  if (r.url().includes('.woff') && r.status() >= 400) failed.push(`${r.url()} → ${r.status()}`);
});

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

// ── Families actually loaded ──────────────────────────────────────────────
const loaded = await page.evaluate(() => {
  const fams = new Set();
  document.fonts.forEach((f) => { if (f.status === 'loaded') fams.add(f.family); });
  return [...fams];
});
for (const fam of ['Manrope', 'Inter']) {
  if (loaded.includes(fam)) ok(`${fam} loaded`);
  else bad(`${fam} did NOT load — silently falling back`);
}

// ── Computed families actually applied ────────────────────────────────────
const applied = await page.evaluate(() => {
  const h1 = document.querySelector('h1');
  // Any real body paragraph — NOT a specific class. Tying this to `.lede` meant
  // a class rename silently reported "Body not Inter" with an empty value.
  const p = document.querySelector('main p:not([class*="eyebrow"])');
  const canvas = document.createElement('canvas').getContext('2d');
  const width = (text, font) => { canvas.font = font; return canvas.measureText(text).width; };
  return {
    h1: h1 ? getComputedStyle(h1).fontFamily : '',
    body: p ? getComputedStyle(p).fontFamily : '',
    // If Manrope really rendered, its metrics differ from the fallback.
    manropeDistinct: Math.abs(width('Handgloves', '700 44px Manrope') - width('Handgloves', '700 44px sans-serif')) > 0.5,
  };
});
// getComputedStyle quotes multi-word families ("Source Serif 4"), so compare
// against the unquoted first family rather than the raw stack.
const firstFamily = (stack) => (stack.split(',')[0] ?? '').trim().replace(/^["']|["']$/g, '');

if (firstFamily(applied.h1) === 'Manrope') ok('Headings resolve to Manrope');
else bad(`Headings not Manrope: ${applied.h1}`);
if (firstFamily(applied.body) === 'Inter') ok('Body resolves to Inter');
else bad(`Body not Inter: ${applied.body}`);
if (applied.manropeDistinct) ok('Manrope renders with its own metrics (not a silent fallback)');
else bad('Manrope metrics identical to generic sans — face may not be applied');

// ── Serif: used italic only, must load on the page that renders it ────────
const serif = await page.evaluate(() => {
  const el = document.querySelector('.statement');
  if (!el) return null;
  return { fam: getComputedStyle(el).fontFamily, style: getComputedStyle(el).fontStyle };
});
if (serif) {
  if (firstFamily(serif.fam) === 'Source Serif 4' && serif.style === 'italic')
    ok('Strategic statement resolves to Source Serif 4 italic');
  else bad(`Statement font wrong: ${serif.fam} / ${serif.style}`);
  const serifLoaded = await page.evaluate(() =>
    document.fonts.check('italic 400 24px "Source Serif 4"')
  );
  if (serifLoaded) ok('Source Serif 4 italic face is loaded and usable');
  else bad('Source Serif 4 declared but not loaded');
}

// ── No external requests at all ───────────────────────────────────────────
const external = requests.filter((u) => !u.startsWith(BASE.split('/ahmed-hamdy')[0]) && !u.startsWith('data:') && !u.startsWith('blob:'));
if (external.length === 0) ok('Zero external requests — no font CDN, no third party');
else bad(`External requests found: ${[...new Set(external)].slice(0, 4).join(', ')}`);

const fontReqs = requests.filter((u) => u.includes('.woff'));
ok(`${fontReqs.length} font request(s), all same-origin`);
if (failed.length) bad(`Font requests failed: ${failed.join(', ')}`);
else ok('All font requests returned 200 (base path correct)');

// ── CLS: does swapping the font reflow the page? ──────────────────────────
const cls = await page.evaluate(async () => {
  return new Promise((resolve) => {
    let total = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) total += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
    setTimeout(() => resolve(total), 1200);
  });
});
if (cls < 0.02) ok(`CLS ${cls.toFixed(4)} — metric-matched fallbacks: swap does not reflow`);
else bad(`CLS ${cls.toFixed(4)} — font swap is shifting layout`);

// ── Page height per breakpoint ────────────────────────────────────────────
console.log('\n── Page height ──');
const rows = [];
for (const [w, h] of [[1920, 1080], [1440, 900], [1024, 800], [768, 1024], [390, 844], [360, 780]]) {
  const c = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await c.newPage();
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(600);
  const m = await p.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  rows.push({ vp: `${w}×${h}`, height: m.height, screens: (m.height / h).toFixed(1), overflow: m.overflow });
  if (m.overflow > 1) bad(`Horizontal overflow ${m.overflow}px at ${w}px`);
  await c.close();
}
console.log('  VIEWPORT      HEIGHT     SCREENS   H-OVERFLOW');
for (const r of rows) {
  console.log(`  ${r.vp.padEnd(13)} ${String(r.height + 'px').padEnd(10)} ${String(r.screens).padEnd(9)} ${r.overflow}px`);
}

await browser.close();
console.log('\n' + (fails ? `FAIL — ${fails}` : 'PASS — fonts self-hosted, applied, no CDN, no shift'));
if (fails) process.exit(1);
