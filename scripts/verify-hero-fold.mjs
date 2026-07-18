/**
 * The arrival: what a visitor meets in the first viewport, before scrolling.
 *
 * The premise changed at Gate 2.2. Previously this asserted the DIAGNOSIS was
 * in the first viewport — correct while the diagram was the hero. Ahmed's
 * objection was that a personal portfolio opened with a systems diagram and no
 * person in it, and chose: portrait beside headline, diagnosis demoted to the
 * second act. So the fold now has a different job:
 *
 *   1. The visitor sees WHO this is — portrait, name, role — without scrolling.
 *   2. They see the claim (the h1) without scrolling.
 *   3. They see a way to act (a CTA) without scrolling.
 *   4. The diagnosis is NOT expected here; verify-motion.mjs proves it plays
 *      when scrolled to.
 *
 * Run: node scripts/verify-hero-fold.mjs
 */
import { chromium, devices } from 'playwright';

const BASE = process.env.VERIFY_URL ?? 'http://localhost:4330';
let fails = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.error(`  ✗ ${m}`); fails++; };

const browser = await chromium.launch();

async function check(label, contextOpts) {
  const ctx = await browser.newContext({ ...contextOpts, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800); // arrival choreography settles

  const r = await page.evaluate(() => {
    const vh = innerHeight;
    const seen = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      if (b.height === 0) return null;
      const vis = Math.max(0, Math.min(b.bottom, vh) - Math.max(b.top, 0));
      const cs = getComputedStyle(el);
      return {
        frac: +(vis / b.height).toFixed(2),
        top: Math.round(b.top),
        opacity: +cs.opacity,
      };
    };
    return {
      vh,
      scrolled: Math.round(scrollY),
      portrait: seen('.pf__img'),
      name: seen('.intro__name'),
      role: seen('.intro__role'),
      head: seen('.intro__head'),
      cta: seen('.intro__ctas .btn'),
      nameText: document.querySelector('.intro__name')?.textContent?.trim(),
    };
  });

  if (r.scrolled !== 0) { bad(`${label}: page auto-scrolled — test invalid`); await ctx.close(); return; }

  const need = [
    ['portrait', r.portrait, 0.75],
    ['name', r.name, 0.9],
    ['role', r.role, 0.9],
    ['headline', r.head, 0.9],
    ['a CTA', r.cta, 0.9],
  ];

  const missing = need.filter(([, m, min]) => !m || m.frac < min || m.opacity < 0.9);
  if (missing.length) {
    bad(`${label}: not visible on arrival → ${missing.map(([n, m]) => `${n}${m ? ` (${Math.round(m.frac * 100)}% vis, opacity ${m.opacity})` : ' (absent)'}`).join(', ')}`);
  } else {
    ok(`${label}: meets ${r.nameText} — portrait ${Math.round(r.portrait.frac * 100)}% visible, name, role, claim and CTA all on the first screen`);
  }
  await ctx.close();
}

console.log('\n── What does a visitor meet before scrolling? ──');
await check('wide 1920×1080', { viewport: { width: 1920, height: 1080 } });
await check('desktop 1440×900', { viewport: { width: 1440, height: 900 } });
await check('laptop 1366×768', { viewport: { width: 1366, height: 768 } });
await check('laptop 1280×800', { viewport: { width: 1280, height: 800 } });
await check('tablet 768×1024', { viewport: { width: 768, height: 1024 } });
await check('mobile 390×844', { ...devices['Pixel 7'] });
await check('mobile 360×780', { viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true });

await browser.close();
console.log('\n' + (fails ? `FAIL — ${fails}` : 'PASS — the visitor meets Ahmed, the claim, and an action on arrival'));
if (fails) process.exit(1);
