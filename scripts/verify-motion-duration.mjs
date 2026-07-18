/**
 * The `.play` class is removed after `duration`. If duration is shorter than the
 * last keyframe finishes, the sequence is amputated mid-flight and the tail of
 * the argument never renders — silently, and only for people who watch it.
 *
 * This reads the REAL computed animation delays+durations from the live DOM and
 * asserts the play window outlasts every one of them.
 *
 * Run: node scripts/verify-motion-duration.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.VERIFY_URL ?? 'http://localhost:4330';
let fails = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.error(`  ✗ ${m}`); fails++; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
const page = await ctx.newPage();

async function measure(url, sel, replaySel, label) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const el = await page.$(sel);
  if (!el) { bad(`${label}: ${sel} not found`); return; }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  // Trigger, then read every descendant's computed animation timing.
  await page.click(replaySel);
  await page.waitForTimeout(60);

  const r = await page.evaluate((s) => {
    const root = document.querySelector(s);
    let last = 0;
    let counted = 0;
    root.querySelectorAll('*').forEach((n) => {
      const cs = getComputedStyle(n);
      if (cs.animationName === 'none') return;
      const ms = (v) => v.split(',').map((x) => {
        x = x.trim();
        return x.endsWith('ms') ? parseFloat(x) : parseFloat(x) * 1000;
      });
      const dur = ms(cs.animationDuration);
      const del = ms(cs.animationDelay);
      for (let i = 0; i < dur.length; i++) {
        const end = (del[i] || 0) + (dur[i] || 0);
        if (end > last) last = end;
        counted++;
      }
    });
    return { last: Math.round(last), counted, playing: root.classList.contains('play') };
  }, sel);

  if (!r.counted) { bad(`${label}: no animations found while playing — is it running at all?`); return; }

  // How long does .play actually survive?
  const t0 = Date.now();
  await page.waitForFunction((s) => !document.querySelector(s).classList.contains('play'), sel, { timeout: 15000 });
  const window_ = Date.now() - t0 + 60;

  if (window_ < r.last) {
    bad(`${label}: .play removed after ${window_}ms but the last keyframe ends at ${r.last}ms — sequence is CUT SHORT by ${r.last - window_}ms`);
  } else {
    ok(`${label}: last keyframe ends ${r.last}ms · .play held ${window_}ms · ${r.counted} animated properties — nothing amputated`);
  }
}

console.log('\n── Play window vs keyframe timeline ──');
await measure(`${BASE}/`, '[data-seam]', '[data-seam-replay]', 'Seam Diagnosis');
await measure(`${BASE}/`, '[data-ic]', '[data-ic-replay]', 'Intervention Compression');
await measure(`${BASE}/review/gate-2-1`, '[data-seam2]', '[data-seam2-replay]', 'Seam Diagnosis v2');

await browser.close();
console.log('\n' + (fails ? `FAIL — ${fails}` : 'PASS — every sequence runs to completion'));
if (fails) process.exit(1);
