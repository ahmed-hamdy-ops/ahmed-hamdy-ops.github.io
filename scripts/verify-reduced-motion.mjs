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

const BASE = process.env.VERIFY_URL ?? 'http://localhost:4330';
let fails = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.error(`  ✗ ${m}`); fails++; };

const hash = (b) => { let h = 0; for (let i = 0; i < b.length; i += 97) h = (h * 31 + b[i]) >>> 0; return h; };

/**
 * Samples the VIEWPORT, clipped to the element's box — never
 * elementHandle.screenshot(), which re-rasterises the SVG and restarts its
 * animation clock, returning the same early frame every time and reporting a
 * working animation as frozen.
 */
async function frames(el, page, n = 8, gap = 260) {
  const box = await el.boundingBox();
  const vp = page.viewportSize();
  const clip = box && {
    x: Math.max(0, box.x),
    y: Math.max(0, box.y),
    width: Math.min(box.width, vp.width - Math.max(0, box.x)),
    height: Math.min(box.height, vp.height - Math.max(0, box.y)),
  };
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(hash(await page.screenshot(clip && clip.height > 0 ? { clip } : {})));
    await page.waitForTimeout(gap);
  }
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
  await page.evaluate(() => { const e = document.querySelector("[data-seam]"); window.scrollTo(0, window.scrollY + e.getBoundingClientRect().top - 60); });
  await page.waitForTimeout(300);
  const n = await frames(el, page, 12, 400);
  n > 2 ? ok(`Motion allowed: autoplays on scroll (${n}/12 distinct frames)`)
        : bad(`Motion allowed: did NOT autoplay (${n}/12 frames — frozen)`);
  await ctx.close();
}

// ── 2/3/4. Reduced motion ─────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const el = await page.$('[data-seam]');
  await page.evaluate(() => { const e = document.querySelector("[data-seam]"); window.scrollTo(0, window.scrollY + e.getBoundingClientRect().top - 60); });
  await page.waitForTimeout(300);

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
  // Click via evaluate, NOT page.click(): page.click() scrolls the button into
  // view, and the button sits at the BOTTOM of the figure — which moves the
  // early beats above the viewport and makes the clip sample a region where
  // nothing happens until 2.75s. That reported a working replay as dead.
  await page.evaluate(() => document.querySelector('[data-seam-replay]').click());
  await page.evaluate(() => {
    const e = document.querySelector('[data-seam]');
    window.scrollTo(0, window.scrollY + e.getBoundingClientRect().top - 60);
  });
  // Sample across the WHOLE 4.6s sequence, not just its first 2s.
  const replay = await frames(el, page, 12, 400);
  replay > 2 ? ok(`Reduced motion: pressing Replay plays it (${replay}/12 distinct frames)`)
             : bad(`Reduced motion: Replay does NOTHING (${replay}/12 frames) — the reported bug`);

  // The override must not linger and silently re-enable motion site-wide.
  // Must outwait the full play window (4.6s), or this fails spuriously.
  await page.waitForFunction(
    () => !document.documentElement.hasAttribute('data-motion-override'),
    null,
    { timeout: 9000 }
  ).then(() => ok('data-motion-override cleared once the run ended'))
   .catch(() => bad('data-motion-override left set — motion re-enabled globally'));

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
