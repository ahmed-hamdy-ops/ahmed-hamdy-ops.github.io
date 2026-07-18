/**
 * Diagnose why motion does not visibly play on the LIVE deployment.
 * Observes only — changes nothing.
 *
 * Run: node scripts/diagnose-motion.mjs
 */
import { chromium, firefox, devices } from 'playwright';

const LIVE = process.env.VERIFY_URL ?? 'https://ahmed-hamdy-ops.github.io';

async function probe(browserType, name, contextOpts = {}) {
  const browser = await browserType.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...contextOpts });
  const page = await ctx.newPage();

  const consoleErrors = [];
  const failedReqs = [];
  const scriptReqs = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e)));
  page.on('requestfailed', (r) => failedReqs.push(`${r.url()} — ${r.failure()?.errorText}`));
  page.on('response', (r) => { if (/\.js(\?|$)/.test(r.url())) scriptReqs.push(`${r.status()} ${r.url().split('/').pop()}`); });

  // Instrument BEFORE any script runs: record every time .play toggles, with a
  // timestamp and whether the element was actually on screen at that moment.
  await page.addInitScript(() => {
    window.__playLog = [];
    const start = performance.now();
    const observe = () => {
      for (const sel of ['[data-seam]', '[data-ic]']) {
        const el = document.querySelector(sel);
        if (!el) continue;
        new MutationObserver(() => {
          const r = el.getBoundingClientRect();
          const onScreen = r.top < window.innerHeight && r.bottom > 0;
          const visibleFrac = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0)) / Math.max(1, r.height);
          window.__playLog.push({
            sel,
            has: el.classList.contains('play'),
            t: Math.round(performance.now() - start),
            onScreen,
            visibleFrac: +visibleFrac.toFixed(2),
            top: Math.round(r.top),
          });
        }).observe(el, { attributes: true, attributeFilter: ['class'] });
      }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observe);
    else observe();
  });

  await page.goto(`${LIVE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const state = await page.evaluate(() => {
    const seam = document.querySelector('[data-seam]');
    const ic = document.querySelector('[data-ic]');
    const r = seam?.getBoundingClientRect();
    const rr = ic?.getBoundingClientRect();
    return {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      seamExists: !!seam,
      icExists: !!ic,
      seamTopAtLoad: r ? Math.round(r.top) : null,
      seamInViewportAtLoad: r ? r.top < window.innerHeight && r.bottom > 0 : null,
      viewportH: window.innerHeight,
      icHeight: rr ? Math.round(rr.height) : null,
      icMaxVisibleFrac: rr ? +(Math.min(rr.height, window.innerHeight) / rr.height).toFixed(2) : null,
      replayBtn: !!document.querySelector('[data-seam-replay]'),
      hasJsClass: document.documentElement.classList.contains('js'),
      log: window.__playLog,
    };
  });

  console.log(`\n╔══ ${name} ══`);
  console.log(`║ prefers-reduced-motion : ${state.reducedMotion}`);
  console.log(`║ html.js class          : ${state.hasJsClass}`);
  console.log(`║ [data-seam] present    : ${state.seamExists}`);
  console.log(`║ [data-ic] present      : ${state.icExists}`);
  console.log(`║ replay button present  : ${state.replayBtn}`);
  console.log(`║ viewport height        : ${state.viewportH}px`);
  console.log(`║ seam top at load       : ${state.seamTopAtLoad}px  → in viewport: ${state.seamInViewportAtLoad}`);
  console.log(`║ [data-ic] height       : ${state.icHeight}px  → max visible fraction: ${state.icMaxVisibleFrac} (IO threshold is 0.35)`);
  console.log(`║ js responses           : ${scriptReqs.length ? scriptReqs.join(', ') : 'NONE'}`);
  console.log(`║ failed requests        : ${failedReqs.length ? failedReqs.join(' | ') : 'none'}`);
  console.log(`║ console errors         : ${consoleErrors.length ? consoleErrors.join(' | ') : 'none'}`);
  console.log(`║ .play toggle log       : ${state.log.length ? '' : 'NEVER TOGGLED'}`);
  for (const e of state.log) {
    console.log(`║   ${e.sel} .play=${e.has} @${e.t}ms  onScreen=${e.onScreen} visible=${e.visibleFrac} top=${e.top}px`);
  }

  // Scroll to the diagram and see whether anything replays.
  await page.evaluate(() => document.querySelector('[data-seam]')?.scrollIntoView());
  await page.waitForTimeout(1500);
  const afterScroll = await page.evaluate(() => window.__playLog.length);
  console.log(`║ toggles after scrolling to seam : ${afterScroll - state.log.length}`);

  // Does the replay control work?
  await page.click('[data-seam-replay]').catch(() => {});
  await page.waitForTimeout(400);
  const afterReplay = await page.evaluate(() => ({
    n: window.__playLog.length,
    hasPlay: document.querySelector('[data-seam]')?.classList.contains('play'),
  }));
  console.log(`║ replay click → .play now = ${afterReplay.hasPlay}, toggles = ${afterReplay.n - afterScroll}`);
  console.log('╚══');

  await browser.close();
  return state;
}

await probe(chromium, 'Chromium — default (no reduced motion forced)');
await probe(chromium, 'Chromium — reduced motion', { reducedMotion: 'reduce' });
await probe(chromium, 'Mobile Chrome', { ...devices['Pixel 7'] });
try {
  await probe(firefox, 'Firefox');
} catch (e) {
  console.log('\n(Firefox not installed — skipped)');
}
