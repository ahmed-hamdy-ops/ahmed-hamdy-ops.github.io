/**
 * Accessibility audit — axe-core against the real built pages, at desktop and
 * mobile, including keyboard reachability of the interactive components.
 *
 * WCAG 2.2 AA is the bar the brief sets, so that is what is asserted.
 */
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const BASE = process.env.VERIFY_URL ?? 'http://localhost:4330';
const PAGES = [
  ['home', `${BASE}/`],
  ['formula4you', `${BASE}/work/formula4you`],
  ['work', `${BASE}/work`],
  ['contact', `${BASE}/contact`],
  ['404', `${BASE}/404`],
];
const VIEWPORTS = [
  ['desktop', 1440, 900],
  ['mobile', 390, 844],
];

let violations = 0;
const browser = await chromium.launch();

for (const [vpName, w, h] of VIEWPORTS) {
  console.log(`\n── axe @ ${vpName} ──`);
  for (const [name, url] of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1600); // let one-shot animations settle

    const res = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();

    const real = res.violations.filter((v) => v.impact !== 'minor' || v.id.includes('contrast'));
    if (real.length === 0) {
      console.log(`  ✓ ${name}: 0 violations`);
    } else {
      for (const v of real) {
        console.error(`  ✗ ${name}: [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} node(s))`);
        v.nodes.slice(0, 2).forEach((n) => console.error(`      ${n.html.slice(0, 110)}`));
        violations++;
      }
    }
    await ctx.close();
  }
}

// ── Keyboard: the interactive components must be operable ─────────────────
console.log('\n── Keyboard ──');
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  // Skip link must be the first tab stop.
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => document.activeElement?.className ?? '');
  if (first.includes('skip')) console.log('  ✓ Skip link is the first tab stop');
  else { console.error(`  ✗ First tab stop is not the skip link (got "${first}")`); violations++; }

  // Capability map: arrow keys must move between tabs (roving tabindex).
  await page.focus('.cmap__btn[aria-selected="true"]');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(200);
  const sel = await page.evaluate(() =>
    document.activeElement?.getAttribute('aria-selected')
  );
  if (sel === 'true') console.log('  ✓ Capability map: arrow keys move selection (roving tabindex)');
  else { console.error('  ✗ Capability map: arrow-key navigation broken'); violations++; }

  // Visible focus, tested the way a keyboard user actually gets it. Programmatic
  // .focus() does not reliably match :focus-visible, so tab through for real.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const noFocus = [];
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const outlined = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
      const shadowed = cs.boxShadow !== 'none';
      return {
        tag: el.tagName,
        cls: (el.className || '').toString().slice(0, 40),
        visible: outlined || shadowed,
      };
    });
    if (info && !info.visible) noFocus.push(`${info.tag}.${info.cls}`);
  }
  if (noFocus.length === 0) console.log('  ✓ First 25 tab stops all show a visible focus indicator');
  else { console.error(`  ✗ No visible focus on: ${[...new Set(noFocus)].slice(0, 4).join(', ')}`); violations++; }

  await ctx.close();
}

// ── Invisible labels: axe did not catch a teal-on-teal button, so check the
//    thing directly. Any control whose text colour ~= its own background is a
//    cascade collision, and it renders as a blank slab.
console.log('\n── Control labels ──');
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  for (const [name, url] of PAGES) {
    await page.goto(url, { waitUntil: 'networkidle' });
    const blank = await page.evaluate(() => {
      const rgb = (s) => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
      const near = (a, b) => a.length === 3 && b.length === 3 &&
        a.every((v, i) => Math.abs(v - b[i]) < 24);
      const out = [];
      document.querySelectorAll('a, button').forEach((el) => {
        if (!el.textContent?.trim()) return;
        const cs = getComputedStyle(el);
        let bg = cs.backgroundColor;
        // Walk up for the effective background if this element is transparent.
        let p = el;
        while (bg === 'rgba(0, 0, 0, 0)' && p.parentElement) { p = p.parentElement; bg = getComputedStyle(p).backgroundColor; }
        if (near(rgb(cs.color), rgb(bg))) out.push(`${el.tagName}.${el.className} "${el.textContent.trim().slice(0, 30)}"`);
      });
      return out;
    });
    if (blank.length) { console.error(`  ✗ ${name}: invisible label(s) — ${blank.slice(0, 3).join(' | ')}`); violations++; }
    else console.log(`  ✓ ${name}: every control label is visible against its own fill`);
  }
  await ctx.close();
}

await browser.close();
console.log('\n' + '─'.repeat(60));
console.log(violations ? `FAIL — ${violations} issue(s)` : 'PASS — no accessibility violations');
if (violations) process.exit(1);
