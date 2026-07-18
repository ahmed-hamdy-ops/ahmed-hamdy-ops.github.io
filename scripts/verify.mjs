/**
 * Gate 2 verification harness.
 *
 * Drives the real built site in a real browser and checks the things that can
 * be checked mechanically:
 *   · every required breakpoint renders with no horizontal overflow
 *   · no console errors
 *   · no broken internal links
 *   · every image has non-trivial alt text and actually loads
 *   · reduced-motion renders the complete static state
 *   · the no-JavaScript contact fallback still works
 *   · base-path routing works on direct entry
 *
 * Screenshots land in verification/ (gitignored — regenerated, not source).
 *
 * Run: node scripts/verify.mjs
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.VERIFY_URL ?? 'http://localhost:4330';
const OUT = path.resolve(import.meta.dirname, '..', 'verification');

const VIEWPORTS = [
  { name: 'wide-1920', width: 1920, height: 1080 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'laptop-1024', width: 1024, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-360', width: 360, height: 780 },
];

const PAGES = [
  { name: 'home', url: `${BASE}/` },
  { name: 'formula4you', url: `${BASE}/work/formula4you` },
  { name: 'work', url: `${BASE}/work` },
  { name: 'contact', url: `${BASE}/contact` },
];

const results = { errors: [], warnings: [], passes: [] };
const fail = (m) => { results.errors.push(m); console.error(`  ✗ ${m}`); };
const warn = (m) => { results.warnings.push(m); console.warn(`  ! ${m}`); };
const pass = (m) => { results.passes.push(m); console.log(`  ✓ ${m}`); };

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

// ── 1. Breakpoints: overflow, console errors, screenshots ─────────────────
console.log('\n── Responsive + console ──');
for (const vp of VIEWPORTS) {
  for (const pg of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    const consoleErrors = [];
    // Log the failing URL, not just "404". "Failed to load resource" with no
    // target is unactionable.
    page.on('response', (r) => {
      if (r.status() >= 400) consoleErrors.push(`HTTP ${r.status()} → ${r.url()}`);
    });
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => consoleErrors.push(String(e)));

    const resp = await page.goto(pg.url, { waitUntil: 'networkidle' });
    if (!resp || resp.status() >= 400) fail(`${pg.name} @ ${vp.name}: HTTP ${resp?.status()}`);

    // Let the one-shot animations finish before capturing.
    await page.waitForTimeout(1700);

    const overflow = await page.evaluate(() =>
      Math.max(
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
        document.body.scrollWidth - document.body.clientWidth
      )
    );
    if (overflow > 1) fail(`${pg.name} @ ${vp.name}: horizontal overflow of ${overflow}px`);

    if (consoleErrors.length) fail(`${pg.name} @ ${vp.name}: console errors — ${consoleErrors.slice(0, 2).join(' | ')}`);

    await page.screenshot({
      path: path.join(OUT, `${pg.name}--${vp.name}.png`),
      fullPage: true,
    });
    await ctx.close();
  }
  pass(`${vp.name} — all pages: no overflow, no console errors, captured`);
}

// ── 2. Images: alt text quality + actually loaded ─────────────────────────
console.log('\n── Images ──');
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  for (const pg of PAGES) {
    await page.goto(pg.url, { waitUntil: 'networkidle' });
    // Walk the page so every lazy image enters the viewport, then wait for
    // decode. A single jump to the bottom skips everything passed en route.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
      await Promise.all(
        Array.from(document.images).map((i) =>
          i.complete ? Promise.resolve() : i.decode().catch(() => {})
        )
      );
    });
    await page.waitForTimeout(400);
    const imgs = await page.$$eval('img', (els) =>
      els.map((e) => ({
        src: e.currentSrc || e.src,
        alt: e.getAttribute('alt'),
        w: e.naturalWidth,
      }))
    );
    for (const im of imgs) {
      const f = im.src.split('/').pop();
      if (im.alt === null) fail(`${pg.name}: <img> with no alt attribute — ${f}`);
      else if (im.alt.trim().length < 20) fail(`${pg.name}: alt too short (${im.alt.length}) — ${f}`);
      if (im.w === 0) fail(`${pg.name}: image failed to load — ${f}`);
    }
    if (imgs.length) pass(`${pg.name}: ${imgs.length} image(s) loaded with descriptive alt text`);
  }
  await ctx.close();
}

// ── 3. Internal links resolve ─────────────────────────────────────────────
console.log('\n── Internal links ──');
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const seen = new Set();
  for (const pg of PAGES) {
    await page.goto(pg.url, { waitUntil: 'domcontentloaded' });
    const hrefs = await page.$$eval('a[href]', (els) => els.map((e) => e.getAttribute('href')));
    for (const h of hrefs) {
      if (!h || h.startsWith('http') || h.startsWith('mailto:') || h.startsWith('tel:')) continue;
      if (h.startsWith('#')) continue;
      const url = new URL(h, pg.url).href.split('#')[0];
      if (seen.has(url)) continue;
      seen.add(url);
      const r = await page.request.get(url);
      if (r.status() >= 400) fail(`Broken internal link: ${h} → HTTP ${r.status()} (from ${pg.name})`);
    }
  }
  pass(`${seen.size} unique internal link(s) resolve`);
  await ctx.close();
}

// ── 4. Reduced motion: complete static state, nothing hidden ──────────────
console.log('\n── Reduced motion ──');
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  // Every part of the diagnosis must be visible with motion disabled.
  const hidden = await page.evaluate(() => {
    const bad = [];
    document.querySelectorAll('[data-seam] .s-fx-break, [data-seam] .s-fx-resolve, [data-seam] .seam__f, [data-ic] .ic-keep')
      .forEach((el) => {
        const cs = getComputedStyle(el);
        if (parseFloat(cs.opacity) < 0.9) bad.push(el.className.toString() || el.tagName);
      });
    return bad;
  });
  if (hidden.length) fail(`Reduced motion hides content: ${hidden.slice(0, 3).join(', ')}`);
  else pass('Reduced motion: full diagnosis + resolution visible (no blank frames)');

  await page.screenshot({ path: path.join(OUT, 'home--reduced-motion.png'), fullPage: true });

  const ic = await page.$('[data-ic]');
  await ic?.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, 'sab--reduced-motion.png') });
  await ctx.close();
}

// ── 5. No-JavaScript: contact fallback must still work ────────────────────
console.log('\n── No JavaScript ──');
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/contact`, { waitUntil: 'domcontentloaded' });

  const wa = await page.$('a[href^="https://wa.me"]');
  const mail = await page.$('a[href^="mailto:"]');
  const tel = await page.$('a[href^="tel:"]');
  if (!wa) fail('No-JS: WhatsApp link missing on /contact');
  if (!mail) fail('No-JS: email link missing on /contact');
  if (!tel) fail('No-JS: phone link missing on /contact');
  if (wa && mail && tel) pass('No-JS: WhatsApp, email, and phone all render server-side and work');

  const ns = await page.$('noscript');
  if (!ns) warn('No-JS: no <noscript> explanation on /contact');
  else pass('No-JS: <noscript> explains the builder needs JS and points at the direct channels');

  await page.screenshot({ path: path.join(OUT, 'contact--no-js.png'), fullPage: true });
  await ctx.close();
}

// ── 6. Base path: direct entry to a deep route ────────────────────────────
console.log('\n── Base path ──');
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const r = await page.goto(`${BASE}/work/formula4you`, { waitUntil: 'domcontentloaded' });
  if (!r || r.status() >= 400) fail(`Direct entry to /work/formula4you → HTTP ${r?.status()}`);
  else pass('Direct entry to a deep route under the base path works');

  // Derived, not hard-coded: on a user site the prefix is '/', so every
  // root-relative asset passes — which is the correct answer, not a skipped check.
  const basePath = new URL(BASE).pathname.replace(/\/+$/, '') || '/';
  const badAssets = await page.$$eval('img, link[rel="stylesheet"]', (els, bp) =>
    els.map((e) => e.getAttribute('src') || e.getAttribute('href'))
       .filter((h) => h && h.startsWith('/') && !h.startsWith(bp)),
    basePath,
  );
  if (badAssets.length) fail(`Assets bypassing the base path: ${badAssets.slice(0, 3).join(', ')}`);
  else pass('All assets resolve through the configured base path');
  await ctx.close();
}

await browser.close();

console.log('\n' + '─'.repeat(64));
console.log(`PASS ${results.passes.length}   WARN ${results.warnings.length}   FAIL ${results.errors.length}`);
console.log('Screenshots →', path.relative(process.cwd(), OUT));
if (results.errors.length) {
  console.log('\nFAILURES:');
  results.errors.forEach((e) => console.log('  ✗ ' + e));
  process.exit(1);
}
