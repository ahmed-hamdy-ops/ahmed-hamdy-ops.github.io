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

const BASE = process.env.VERIFY_URL ?? 'http://localhost:4330/ahmed-hamdy-portfolio';
const OUT = path.resolve(import.meta.dirname, '..', 'verification', 'motion');
await mkdir(OUT, { recursive: true });

const FRAMES = [0, 200, 400, 600, 800, 1000, 1300];

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
    await seam?.screenshot({ path: path.join(OUT, `seam-frame-${String(t).padStart(4, '0')}ms.png`) });
  }
  await page.waitForTimeout(900);
  await seam?.screenshot({ path: path.join(OUT, 'seam-frame-settled.png') });
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
    await ic?.screenshot({ path: path.join(OUT, `compression-frame-${String(t).padStart(4, '0')}ms.png`) });
  }
  await page.waitForTimeout(900);
  await ic?.screenshot({ path: path.join(OUT, 'compression-frame-settled.png') });
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
