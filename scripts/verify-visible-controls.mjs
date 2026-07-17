/**
 * Are the controls actually visible?
 *
 * axe cannot be trusted with this one. It has now missed invisible buttons on
 * this project three times — teal text on a teal fill twice, and chalk text on
 * paper for "Download the CV" and "Read the Formula4You case". In the last case
 * it reported one violation on one run and zero on the next, for identical
 * markup. A contrast check that is nondeterministic is not a contrast check.
 *
 * Why it misses them: axe reads `background-color` off the element. A button
 * whose own background is rgba(255,255,255,0.055) is, as far as that check is
 * concerned, sitting on almost-white — so chalk text "passes" while a human
 * sees nothing at all.
 *
 * This resolves the real backdrop by walking up the ancestors until it finds an
 * opaque colour, composites any translucent layers on the way down, and then
 * computes WCAG contrast from the formula. No heuristics, no shortcuts.
 *
 * Run: node scripts/verify-visible-controls.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:4330/ahmed-hamdy-portfolio';
const ROUTES = ['/', '/contact', '/work', '/work/formula4you'];
const SELECTOR = '.btn, .mark__talk, button, [role="button"]';

const probe = () =>
  [...document.querySelectorAll('.btn, .mark__talk, button, [role="button"]')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
    })
    .map((el) => {
      const parse = (c) => {
        const m = c.match(/[\d.]+/g);
        return m ? { r: +m[0], g: +m[1], b: +m[2], a: m[3] === undefined ? 1 : +m[3] } : null;
      };
      // Collect every background from the element outward until something is opaque.
      const stack = [];
      let node = el;
      while (node) {
        const bg = parse(getComputedStyle(node).backgroundColor);
        if (bg && bg.a > 0) {
          stack.push(bg);
          if (bg.a === 1) break;
        }
        node = node.parentElement;
      }
      if (!stack.length || stack[stack.length - 1].a !== 1) stack.push({ r: 255, g: 255, b: 255, a: 1 });

      // Composite from the opaque layer forward.
      let bg = stack.pop();
      while (stack.length) {
        const top = stack.pop();
        bg = {
          r: top.a * top.r + (1 - top.a) * bg.r,
          g: top.a * top.g + (1 - top.a) * bg.g,
          b: top.a * top.b + (1 - top.a) * bg.b,
          a: 1,
        };
      }

      const fg = parse(getComputedStyle(el).color);
      // Text alpha composites over the resolved backdrop too.
      const text = {
        r: fg.a * fg.r + (1 - fg.a) * bg.r,
        g: fg.a * fg.g + (1 - fg.a) * bg.g,
        b: fg.a * fg.b + (1 - fg.a) * bg.b,
      };

      const lin = (c) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      };
      const L = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
      const [hi, lo] = [L(text), L(bg)].sort((a, b) => b - a);
      const ratio = (hi + 0.05) / (lo + 0.05);

      const cs = getComputedStyle(el);
      const px = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight, 10) >= 700;
      // WCAG large text: 24px, or 18.66px when bold.
      const large = px >= 24 || (bold && px >= 18.66);

      return {
        label: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 34),
        ratio: Math.round(ratio * 100) / 100,
        need: large ? 3 : 4.5,
        fg: cs.color,
        bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
      };
    });

const browser = await chromium.launch();
let failures = 0;
let checked = 0;

for (const route of ROUTES) {
  for (const [name, viewport] of [
    ['desktop', { width: 1440, height: 900 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const res = await page.goto(BASE + route, { waitUntil: 'networkidle' });
    if (!res || res.status() >= 400) {
      console.log(`  ✗ ${route} returned ${res ? res.status() : 'no response'}`);
      failures++;
      await context.close();
      continue;
    }
    await page.evaluate(() => document.fonts.ready);
    // Reveal-gated controls do not exist until they have been scrolled past.
    await page.evaluate(async () => {
      const step = innerHeight * 0.5;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 100));
      }
      scrollTo(0, 0);
    });
    // Depth inside a disclosure is still shipped markup and still needs to be legible.
    await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
    await page.waitForTimeout(400);

    const results = await page.evaluate(probe);
    checked += results.length;
    for (const r of results) {
      if (r.ratio < r.need) {
        failures++;
        console.log(
          `  ✗ ${route} ${name}: "${r.label}" — ${r.ratio}:1, needs ${r.need}:1\n      ${r.fg} on ${r.bg}`,
        );
      }
    }
    await context.close();
  }
}

await browser.close();
console.log(
  failures
    ? `\n✗ ${failures} control(s) below AA out of ${checked} checked`
    : `\n✓ all ${checked} controls legible against their real backdrop`,
);
process.exit(failures ? 1 : 0);
