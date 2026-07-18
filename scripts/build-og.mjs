/**
 * Build the social preview card.
 *
 * When a link is pasted into LinkedIn, Slack, WhatsApp or a message, the
 * receiving app fetches the page and builds a card from its og: tags. With no
 * og:image the card is a bare line of text — which is what a recruiter would
 * have seen in the one place Ahmed most wants the site to look considered.
 *
 * Rather than shipping a screenshot, this renders a card designed for the size:
 * 1200x630 is the ratio every platform crops to, and text laid out for a full
 * page is unreadable at the size a card actually appears.
 *
 * Same fonts, same tokens, same portrait treatment as the hero, so the card and
 * the page it opens are recognisably the same object.
 *
 * Run: node scripts/build-og.mjs   (output: public/og-card.png)
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUB = path.join(ROOT, 'public');
const OUT = path.join(PUB, 'og-card.png');
// The page is written into public/ and opened over file://, not handed to
// setContent. setContent leaves the document on about:blank with a null origin,
// which blocks every file:// subresource — the first run produced a card with
// no portrait and no webfonts, silently, because a blocked font just falls back.
// Relative paths from public/ resolve for both.
const TMP = path.join(PUB, '.og-build.html');
const font = (f) => `fonts/${f}`;
const portrait = '../src/assets/portrait/ahmed-hamdy-hero.webp';

const HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Manrope'; font-weight: 200 800; src: url('${font('manrope-latin-wght-normal.woff2')}') format('woff2-variations'); }
  @font-face { font-family: 'Inter'; font-weight: 100 900; src: url('${font('inter-latin-wght-normal.woff2')}') format('woff2-variations'); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; position: relative;
         background: radial-gradient(circle at 84% 22%, rgba(121,183,255,.18), transparent 24rem),
                     radial-gradient(circle at 7% 80%, rgba(72,224,187,.12), transparent 25rem),
                     linear-gradient(135deg,#04151e 0%,#082632 63%,#0a303a 100%); }
  /* The same dot field as the hero, at the same opacity. */
  .grain { position: absolute; inset: 0; opacity: .19;
           background-image: radial-gradient(rgba(255,255,255,.28) .7px, transparent .7px);
           background-size: 24px 24px;
           mask-image: radial-gradient(circle at 36% 36%, black, transparent 66%); }
  /* Portrait treatment lifted from the hero: cool grade, vignette on the
     wrapper, vertical fade on the image, wash on top. Nested masks rather than
     mask-composite, for the same WebKit reason. */
  .fig { position: absolute; top: 0; bottom: 0; right: -4%; width: 46%;
         mask-image: radial-gradient(ellipse 58% 74% at 54% 42%, #000 38%, rgba(0,0,0,.55) 66%, transparent 88%); }
  .fig img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 8%;
             filter: saturate(.6) contrast(1.07) brightness(.84) hue-rotate(-8deg);
             mask-image: linear-gradient(180deg, transparent 0%, #000 9%, #000 62%, transparent 96%); }
  .fig::after { content: ''; position: absolute; inset: 0;
                background: linear-gradient(180deg, rgba(4,21,30,.5) 0%, rgba(4,21,30,.04) 26%, rgba(8,38,50,.28) 62%, rgba(4,21,30,.9) 100%),
                            linear-gradient(90deg, rgba(4,21,30,.72) 0%, transparent 34%);
                mask-image: linear-gradient(180deg, transparent 0%, #000 9%, #000 62%, transparent 96%); }
  .copy { position: absolute; z-index: 3; left: 68px; top: 50%; transform: translateY(-50%); width: 660px; }
  .eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 26px;
             color: #48e0bb; font: 800 15px 'Manrope'; letter-spacing: .13em; text-transform: uppercase; }
  .eyebrow i { width: 9px; height: 9px; border-radius: 50%; background: #48e0bb;
               box-shadow: 0 0 0 5px rgba(72,224,187,.16); }
  h1 { color: #fff; font: 800 62px/1.03 'Manrope'; letter-spacing: -.035em; }
  h1 em { font-style: normal; color: #48e0bb; }
  p { margin-top: 26px; max-width: 560px; color: rgba(255,255,255,.66); font: 400 22px/1.5 'Inter'; }
  .rule { margin-top: 32px; display: flex; align-items: center; gap: 14px;
          color: rgba(255,255,255,.5); font: 700 15px 'Manrope'; letter-spacing: .08em; text-transform: uppercase; }
  .rule s { width: 46px; height: 2px; background: rgba(72,224,187,.55); border: 0; }
</style></head><body>
  <div class="grain"></div>
  <div class="fig"><img src="${portrait}" alt=""></div>
  <div class="copy">
    <div class="eyebrow"><i></i>Ahmed Hamdy</div>
    <h1>It shows up in support.<br><em>It started somewhere else.</em></h1>
    <p>I find where a business problem actually started, and fix the thing there — not the department it lands in.</p>
    <div class="rule"><s></s>Business Operations &amp; Process Improvement</div>
  </div>
</body></html>`;

fs.writeFileSync(TMP, HTML);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
try {
  await page.goto(pathToFileURL(TMP).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  // A blocked font or image fails silently — the card still renders, just wrong.
  // Assert both actually arrived rather than trusting the screenshot.
  const loaded = await page.evaluate(() => ({
    manrope: document.fonts.check("800 62px 'Manrope'"),
    inter: document.fonts.check("400 22px 'Inter'"),
    portrait: (() => { const i = document.querySelector('.fig img'); return !!i && i.complete && i.naturalWidth > 0; })(),
  }));
  const missing = Object.entries(loaded).filter(([, ok]) => !ok).map(([k]) => k);
  if (missing.length) throw new Error(`asset(s) never loaded: ${missing.join(', ')}`);

  await page.screenshot({ path: OUT });
} finally {
  await browser.close();
  fs.rmSync(TMP, { force: true });
}

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`  ✓ public/og-card.png — 1200x630, ${kb} KB (fonts and portrait verified present)`);
// Every platform has a ceiling; LinkedIn's is 5 MB, WhatsApp's is far lower.
if (fs.statSync(OUT).size > 1024 * 1024) console.log('  ⚠ over 1 MB — some clients will skip the preview');
