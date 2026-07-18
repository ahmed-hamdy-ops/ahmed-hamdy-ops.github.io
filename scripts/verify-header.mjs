/**
 * Header stability: switching audience must move NOTHING.
 *
 * Measures the CTA box and every nav item's position before and after the
 * switch, at several desktop widths. Also catches an over-wide CTA squeezing
 * the nav (which is how the sizer bug showed up: the sizer sat beside the
 * labels and doubled the button's width).
 *
 * Run: node scripts/verify-header.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.VERIFY_URL ?? 'http://localhost:4330';
let fails = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.error(`  ✗ ${m}`); fails++; };

const browser = await chromium.launch();

for (const w of [1920, 1600, 1440, 1280, 1100]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  const snap = () =>
    page.evaluate(() => {
      const cta = document.querySelector('[data-cta-shell]');
      const r = cta?.getBoundingClientRect();
      const arrow = cta?.querySelector('.cta-shell__arrow')?.getBoundingClientRect();
      return {
        cta: r ? { x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height) } : null,
        arrowX: arrow ? Math.round(arrow.x) : null,
        nav: [...document.querySelectorAll('.hdr__nav a')].map((a) => {
          // An inline element that wraps produces more than one client rect.
          // (Dividing height by line-height counts padding as a second line.)
          const range = document.createRange();
          range.selectNodeContents(a);
          return {
            t: a.textContent.trim(),
            x: Math.round(a.getBoundingClientRect().x),
            lines: range.getClientRects().length,
          };
        }),
        headerH: Math.round(document.querySelector('.hdr')?.getBoundingClientRect().height ?? 0),
      };
    });

  const before = await snap();

  // No nav item may wrap.
  const wrapped = before.nav.filter((n) => n.lines > 1);
  if (wrapped.length) bad(`@${w}: nav item wraps to ${wrapped[0].lines} lines — "${wrapped[0].t}"`);

  // The CTA must not eat the header.
  if (before.cta && before.cta.w > w * 0.34)
    bad(`@${w}: CTA is ${before.cta.w}px (${Math.round((before.cta.w / w) * 100)}% of viewport) — too wide, it will squeeze the nav`);

  await page.click('.aud button[data-aud="employer"]');
  await page.waitForTimeout(500);
  const after = await snap();

  const dw = Math.abs((after.cta?.w ?? 0) - (before.cta?.w ?? 0));
  const dx = Math.abs((after.cta?.x ?? 0) - (before.cta?.x ?? 0));
  const dArrow = Math.abs((after.arrowX ?? 0) - (before.arrowX ?? 0));
  const navMoved = before.nav.filter((n, i) => Math.abs(n.x - (after.nav[i]?.x ?? 0)) > 0);
  const dH = Math.abs(after.headerH - before.headerH);

  if (dw > 0) bad(`@${w}: CTA width changed by ${dw}px on audience switch`);
  if (dx > 0) bad(`@${w}: CTA moved ${dx}px on audience switch`);
  if (dArrow > 0) bad(`@${w}: arrow moved ${dArrow}px on audience switch`);
  if (navMoved.length) bad(`@${w}: nav moved — "${navMoved[0].t}"`);
  if (dH > 0) bad(`@${w}: header height changed by ${dH}px`);

  if (!dw && !dx && !dArrow && !navMoved.length && !dH && !wrapped.length)
    ok(`@${w}: CTA ${before.cta?.w}×${before.cta?.h}px fixed · arrow fixed · nav fixed · header ${before.headerH}px — nothing moved`);

  // The label really did swap.
  const label = await page.evaluate(() =>
    document.querySelector('[data-cta-shell] .cta-shell__label.is-on')?.textContent?.trim()
  );
  if (label !== 'Discuss a Role') bad(`@${w}: label did not swap (got "${label}")`);

  await ctx.close();
}

await browser.close();
console.log('\n' + (fails ? `FAIL — ${fails}` : 'PASS — header is stable across audience states at every desktop width'));
if (fails) process.exit(1);
