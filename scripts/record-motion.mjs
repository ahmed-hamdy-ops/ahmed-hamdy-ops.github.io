/**
 * Records the two launch animations for review.
 *
 * Produces, for each: a .webm recording and a frame strip (stills at fixed
 * timestamps through the transformation), because a still cannot show motion
 * and a video cannot be inspected frame by frame.
 *
 * Run: node scripts/record-motion.mjs
 */
import { chromium } from 'playwright';
import { mkdir, readdir, rename } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.VERIFY_URL ?? 'http://localhost:4330';
const OUT = path.resolve(import.meta.dirname, '..', 'verification', 'motion');
await mkdir(OUT, { recursive: true });

// Sampled across the full ~4.4s diagnosis, one frame per narrative beat.
const FRAMES = [200, 700, 1300, 1900, 2400, 3000, 3600, 4400];

const browser = await chromium.launch();

// ── Seam Diagnosis (hero) ────────────────────────────────────────────────
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: path.join(OUT, 'tmp-seam'), size: { width: 1280, height: 720 } },
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const seam = await page.$('[data-seam]');
  await seam?.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);

  // Replay deterministically and sample frames through the transformation.
  await page.click('[data-seam-replay]');
  const t0 = Date.now();
  for (const t of FRAMES) {
    const wait = t - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
    // VIEWPORT capture, not elementHandle.screenshot(). An element screenshot
    // re-rasterises the SVG and RESTARTS its animation clock, so every frame
    // comes back showing the same ~100ms state — it reports a working
    // animation as frozen. This cost real debugging time; do not "simplify" it
    // back to el.screenshot().
    await page.screenshot({ path: path.join(OUT, `seam-frame-${String(t).padStart(4, '0')}ms.png`) });
  }
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'seam-frame-settled.png') });
  await ctx.close();
  console.log('  ✓ Seam Diagnosis — frames + video');
}

// ── Intervention Compression ─────────────────────────────────────────────
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: path.join(OUT, 'tmp-ic'), size: { width: 1280, height: 720 } },
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const ic = await page.$('[data-ic]');
  await ic?.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2600); // let the scroll-triggered run finish first

  await page.click('[data-ic-replay]');
  const t0 = Date.now();
  for (const t of FRAMES) {
    const wait = t - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
    await page.screenshot({ path: path.join(OUT, `compression-frame-${String(t).padStart(4, '0')}ms.png`) });
  }
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'compression-frame-settled.png') });
  await ctx.close();
  console.log('  ✓ Intervention Compression — frames + video');
}

await browser.close();

// Flatten the recorded videos out of their temp dirs with real names.
for (const [dir, name] of [['tmp-seam', 'seam-diagnosis.webm'], ['tmp-ic', 'intervention-compression.webm']]) {
  const d = path.join(OUT, dir);
  try {
    const files = await readdir(d);
    const vid = files.find((f) => f.endsWith('.webm'));
    if (vid) await rename(path.join(d, vid), path.join(OUT, name));
  } catch { /* no recording produced */ }
}

console.log('\nMotion →', path.relative(process.cwd(), OUT));
