/**
 * Reduced-motion contract — pixel-verified, not class-verified.
 *
 * Reported from production as "completely frozen, the Replay button does
 * absolutely nothing". Cause: prefers-reduced-motion made run() bail out, so a
 * visitor with the OS setting on had a dead control and a static page.
 *
 * The contract, asserted here on real pixels:
 *   1. Motion allowed        → the diagram plays by itself when scrolled to.
 *   2. Reduced motion        → it NEVER plays by itself. (The accessibility promise.)
 *   3. Reduced motion        → pressing Replay DOES play it. (An explicit request.)
 *   4. Reduced motion, at rest → the full resolved diagram is still on screen.
 *
 * Run: node scripts/verify-reduced-motion.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.VERIFY_URL ?? 'http://localhost:4330/ahmed-hamdy-portfolio';
let fails = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.error(`  ✗ ${m}`); fails++; };

const hash = (b) => { let h = 0; for (let i = 0; i < b.length; i += 97) h = (h * 31 + b[i]) >>> 0; return h; };

async function frames(el, page, n = 8, gap = 160) {
  const out = [];
  for (let i = 0; i < n; i++) { out.push(hash(await el.screenshot())); await page.waitForTimeout(gap); }
  return new Set(out).size;
}

const browser = await chromium.launch();

// ── 1. Motion allowed: autoplays on scroll ────────────────────────────────
{
  // NOTE: `reducedMotion: null` = system default, and headless Chromium's
  // default is REDUCE. Always state the mode explicitly or the test lies.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const el = await page.$('[data-seam]');
  await el.scrollIntoViewIfNeeded();
  const n = await frames(el, page);
  n > 2 ? ok(`Motion allowed: autoplays on scroll (${n}/8 distinct frames)`)
        : bad(`Motion allowed: did NOT autoplay (${n}/8 frames — frozen)`);
  await ctx.close();
}

// ── 2/3/4. Reduced motion ─────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const el = await page.$('[data-seam]');
  await el.scrollIntoViewIfNeeded();

  // 2. Must NOT autoplay.
  const auto = await frames(el, page, 6, 200);
  auto <= 2 ? ok('Reduced motion: does not autoplay (the accessibility promise holds)')
            : bad(`Reduced motion: AUTOPLAYED anyway (${auto}/6 distinct frames)`);

  // 4. The resolved diagram must still be fully on screen at rest.
  const resolved = await page.evaluate(() => {
    const bad = [];
    document.querySelectorAll('[data-seam] .s-fx-break, [data-seam] .s-fx-resolve, [data-seam] .seam__f')
      .forEach((n) => { if (parseFloat(getComputedStyle(n).opacity) < 0.9) bad.push(n.className.toString()); });
    return bad.length;
  });
  resolved === 0 ? ok('Reduced motion: the complete resolved diagram is on screen at rest')
                 : bad(`Reduced motion: ${resolved} element(s) hidden at rest`);

  // 3. Explicit press MUST play.
  await page.click('[data-seam-replay]');
  const replay = await frames(el, page);
  replay > 2 ? ok(`Reduced motion: pressing Replay plays it (${replay}/8 distinct frames)`)
             : bad(`Reduced motion: Replay does NOTHING (${replay}/8 frames) — the reported bug`);

  // The override must not linger and silently re-enable motion site-wide.
  await page.waitForTimeout(1800);
  const lingering = await page.evaluate(() => document.documentElement.hasAttribute('data-motion-override'));
  lingering ? bad('data-motion-override left set — motion re-enabled globally')
            : ok('data-motion-override cleared after the run');

  // The control must tell reduced-motion visitors it works.
  const label = await page.evaluate(() =>
    document.querySelector('[data-seam][data-reduced-motion="true"] .seam__rm')?.textContent?.trim()
  );
  label ? ok(`Reduced-motion visitors see: "${label}"`)
        : bad('No reduced-motion hint shown — the button looks dead');

  await ctx.close();
}

await browser.close();
console.log('\n' + (fails ? `FAIL — ${fails}` : 'PASS — reduced-motion contract holds in both directions'));
if (fails) process.exit(1);
