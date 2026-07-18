/**
 * Why is the live diagram frozen for the visitor?
 *
 * Does not trust class toggles. Compares actual PIXELS across the animation
 * window after clicking Replay, in normal vs reduced-motion mode.
 * If pixels never change, it is frozen — whatever the classes say.
 */
import { chromium } from 'playwright';

const LIVE = process.env.VERIFY_URL ?? 'https://ahmed-hamdy-ops.github.io';

async function probe(label, reducedMotion) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion });
  const page = await ctx.newPage();
  await page.goto(`${LIVE}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const seam = await page.$('[data-seam]');
  await seam?.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500); // let any scroll-triggered run finish

  const state = await page.evaluate(() => ({
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    // What does CSS actually compute for an animated child right now?
    sample: (() => {
      const el = document.querySelector('[data-seam] .s-fx-trace, [data-seam] .fx-trace, [data-seam] path[class*="fx"]');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { animName: cs.animationName, animDur: cs.animationDuration };
    })(),
  }));

  // Click Replay and sample pixels through the whole sequence.
  await page.click('[data-seam-replay]');
  const shots = [];
  for (let i = 0; i < 8; i++) {
    shots.push(await seam.screenshot());
    await page.waitForTimeout(160);
  }

  const hashes = shots.map((b) => {
    let h = 0;
    for (let i = 0; i < b.length; i += 97) h = (h * 31 + b[i]) >>> 0;
    return h;
  });
  const distinct = new Set(hashes).size;

  const playAfterClick = await page.evaluate(() =>
    document.querySelector('[data-seam]')?.classList.contains('play')
  );

  console.log(`\n╔══ ${label} ══`);
  console.log(`║ prefers-reduced-motion          : ${state.reduced}`);
  console.log(`║ computed animation on a child   : ${state.sample ? `${state.sample.animName} / ${state.sample.animDur}` : 'n/a'}`);
  console.log(`║ .play present right after click : ${playAfterClick}`);
  console.log(`║ distinct frames across ~1.3s    : ${distinct} of 8`);
  console.log(`║ VERDICT                         : ${distinct > 2 ? 'MOVING' : '*** FROZEN — no pixels changed ***'}`);
  console.log('╚══');

  await browser.close();
  return distinct;
}

// NOTE: `reducedMotion: null` means "system default", and headless Chromium's
// system default is REDUCE. Passing null silently tests the wrong mode — it is
// how this harness first fooled itself. Always state the mode explicitly.
const normal = await probe('LIVE — motion allowed (no-preference)', 'no-preference');
const reduced = await probe('LIVE — OS reduced motion ON', 'reduce');

console.log('\n────────────────────────────────────────────');
if (normal > 2 && reduced <= 2) {
  console.log('CONCLUSION: motion works normally, but is completely dead when the');
  console.log('visitor has OS "reduce motion" enabled — including the Replay button,');
  console.log('which is an EXPLICIT request for motion and should be honoured.');
} else if (normal <= 2) {
  console.log('CONCLUSION: frozen even WITHOUT reduced motion — the CSS is not applying.');
} else {
  console.log('CONCLUSION: inconclusive.');
}
