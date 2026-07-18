/**
 * Drives the consultation builder for real: fill → review → generated link.
 * A contact flow that renders correctly but produces a broken message is worse
 * than no form, so this asserts the actual wa.me / mailto payload.
 */
import { chromium } from 'playwright';
import path from 'node:path';

const BASE = process.env.VERIFY_URL ?? 'http://localhost:4330';
const OUT = path.resolve(import.meta.dirname, '..', 'verification');
let fails = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.error(`  ✗ ${m}`); fails++; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => bad(`page error: ${e}`));

await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' });

// ── The review panel must NOT be on screen before submitting ──────────────
if (await page.isVisible('#rev')) bad('Review panel is visible on page load — [hidden] is being overridden');
else ok('Review panel hidden on load');

// ── Validation must actually block ────────────────────────────────────────
await page.click('#cf button[type="submit"]');
await page.waitForTimeout(300);
if (await page.isVisible('#cf-err')) ok('Empty name is rejected with a real message');
else bad('Empty name was NOT rejected');

// ── Fill it in ────────────────────────────────────────────────────────────
await page.fill('[name="name"]', 'Layla Mansour');
await page.fill('[name="company"]', 'Nile Botanicals');
await page.fill('[name="email"]', 'layla@example.com');
await page.fill('[name="url"]', 'https://example.com');
await page.selectOption('[name="visitor"]', 'founder');
await page.selectOption('[name="challenge"]', 'support');
await page.selectOption('[name="stage"]', 'growing');
await page.selectOption('[name="urgency"]', 'weeks');
await page.fill('[name="outcome"]', 'Fewer "where is my order" messages.');
await page.fill('[name="context"]', 'We ship in 3 days but the ad says next-day.');
await page.click('#cf button[type="submit"]');
await page.waitForTimeout(600);

// ── Review step must appear BEFORE anything opens ─────────────────────────
if (await page.isVisible('#rev')) ok('Review step shown before any app opens');
else bad('Review step did not appear');
if (!(await page.isVisible('#cf'))) ok('Form hidden while reviewing');
else bad('Form still visible behind the review step');

const preview = await page.textContent('#rev-p');
const expect = [
  ['Layla Mansour', 'name'],
  ['Nile Botanicals', 'company'],
  ['Founder / business owner', 'visitor label (not the raw value)'],
  ['Customers contact us too often', 'challenge label (not the raw value)'],
  ['Growing steadily', 'stage label'],
  ['Fewer "where is my order" messages.', 'desired outcome'],
  ['We ship in 3 days but the ad says next-day.', 'free-text context'],
];
for (const [needle, what] of expect) {
  if (preview?.includes(needle)) ok(`Message contains ${what}`);
  else bad(`Message MISSING ${what} — expected "${needle}"`);
}

// ── The generated link must be a real, correct wa.me deep link ────────────
const href = await page.getAttribute('#rev-go', 'href');
if (!href?.startsWith('https://wa.me/201040020093?text=')) bad(`Bad WhatsApp href: ${href?.slice(0, 60)}`);
else {
  ok('WhatsApp deep link targets the approved number');
  const decoded = decodeURIComponent(href.split('?text=')[1]);
  if (decoded.includes('Layla Mansour') && decoded.includes('Business Diagnostic request'))
    ok('WhatsApp payload is correctly encoded and complete');
  else bad('WhatsApp payload malformed');
}

await page.screenshot({ path: path.join(OUT, 'contact--review-step.png'), fullPage: true });

// ── Switching to email must swap the adapter ──────────────────────────────
await page.click('#rev-back');
await page.waitForTimeout(400);
await page.check('input[name="channel"][value="email"]');
await page.click('#cf button[type="submit"]');
await page.waitForTimeout(500);
const mailHref = await page.getAttribute('#rev-go', 'href');
if (mailHref?.startsWith('mailto:ahmedeldep30@gmail.com?subject=')) {
  ok('Email adapter produces a correct mailto with subject + body');
  const subj = decodeURIComponent(mailHref.split('subject=')[1].split('&body=')[0]);
  if (subj.includes('Layla Mansour') && subj.includes('Nile Botanicals')) ok(`Subject line is specific: "${subj}"`);
  else bad(`Subject not specific: ${subj}`);
} else bad(`Bad mailto href: ${mailHref?.slice(0, 60)}`);

// ── Back button must restore the form ─────────────────────────────────────
await page.click('#rev-back');
await page.waitForTimeout(300);
if (await page.isVisible('#cf')) ok('Edit answers returns to the form');
else bad('Edit answers did not restore the form');

await browser.close();
console.log(`\n${fails ? `FAIL ${fails}` : 'All contact-flow checks passed'}`);
if (fails) process.exit(1);
