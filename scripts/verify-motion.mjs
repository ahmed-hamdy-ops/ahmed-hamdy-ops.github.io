/**
 * Motion visibility gate.
 *
 * The bug twice over was not "does it fire" — it was "how much of it could you
 * SEE when it fired". So that is what this asserts: at the instant `.play` is
 * added, a real share of the diagram must be on screen.
 *
 * Simulates a human scrolling down the page rather than jumping.
 *
 * Run: node scripts/verify-motion.mjs
 */
import { chromium, devices } from 'playwright';

const BASE = process.env.VERIFY_URL ?? 'http://localhost:4330';
let fails = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.error(`  ✗ ${m}`); fails++; };

/** Minimum share of the diagram that must be visible when it starts playing. */
const MIN_VISIBLE = 0.45;

const browser = await chromium.launch();

async function check(label, contextOpts, path, sel) {
  const ctx = await browser.newContext(contextOpts);
  const page = await ctx.newPage();

  await page.addInitScript(() => {
    window.__fired = null;
    const watch = () => {
      document.querySelectorAll('[data-seam],[data-seam2],[data-ic]').forEach((el) => {
        // Measure the DIAGRAM, not the whole <figure>. The figure also holds the
        // findings and conclusion (~900px), so measuring it reports 34% visible
        // when the diagram itself is fully on screen. The play trigger watches
        // the diagram; the assertion must watch the same thing.
        const measured = el.querySelector('[data-seam-stage]') ?? el;
        new MutationObserver(() => {
          if (!el.classList.contains('play')) return;
          const r = measured.getBoundingClientRect();
          if (r.height === 0) return;
          const vis = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
          (window.__fired ??= {});
          const key = el.getAttribute('data-seam') !== null ? 'seam'
            : el.getAttribute('data-seam2') !== null ? 'seam2' : 'ic';
          window.__fired[key] ??= {
            visibleFrac: +(vis / r.height).toFixed(2),
            visiblePx: Math.round(vis),
            viewportFrac: +(vis / innerHeight).toFixed(2),
          };
        }).observe(el, { attributes: true, attributeFilter: ['class'] });
      });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
    else watch();
  });

  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // Scroll the way a person does — in steps, not one jump.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.35;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
      // Do NOT break on the first fire — later sections must be reached too.
    }
  });
  await page.waitForTimeout(400);

  const fired = await page.evaluate(() => window.__fired);
  const key = sel.replace('data-', '').replace(/[[\]]/g, '');
  const info = fired?.[key];

  if (!info) {
    bad(`${label}: ${sel} never played while scrolling through it`);
  } else if (info.visibleFrac < MIN_VISIBLE && info.viewportFrac < 0.5) {
    bad(`${label}: ${sel} played at only ${Math.round(info.visibleFrac * 100)}% visible (${info.visiblePx}px, ${Math.round(info.viewportFrac * 100)}% of screen) — the visitor cannot see it`);
  } else {
    ok(`${label}: ${sel} played at ${Math.round(info.visibleFrac * 100)}% of the diagram visible (${info.visiblePx}px = ${Math.round(info.viewportFrac * 100)}% of the screen)`);
  }
  await ctx.close();
}

console.log('\n── Did the visitor actually see it? ──');
await check('desktop 1440', { viewport: { width: 1440, height: 900 } }, '/', 'data-seam');
await check('laptop 1024', { viewport: { width: 1024, height: 800 } }, '/', 'data-seam');
await check('mobile 390', { ...devices['Pixel 7'] }, '/', 'data-seam');
await check('desktop 1440', { viewport: { width: 1440, height: 900 } }, '/', 'data-ic');
await check('mobile 390', { ...devices['Pixel 7'] }, '/', 'data-ic');
await check('desktop 1440 (v2 hero)', { viewport: { width: 1440, height: 900 } }, '/review/gate-2-1', 'data-seam2');

await browser.close();
console.log('\n' + (fails ? `FAIL — ${fails}` : 'PASS — every animation plays while the visitor can actually see it'));
if (fails) process.exit(1);
