/**
 * Build the CV, then prove it survives a parser.
 *
 * Printing HTML to PDF gives full control of the page and still leaves a real
 * text layer — which is what an applicant tracking system reads. That is only
 * true if the page is built for it (one column, no tables, no text boxes, no
 * images, contact details in the body rather than a header region), and the only
 * honest way to know it stayed true is to pull the text back out and read what a
 * parser would get.
 *
 * So this does not only build. It extracts the text layer with pdftotext — the
 * poppler engine most extraction stacks are built on — and fails loudly if the
 * reading order collapsed, a section vanished, the contact details went missing,
 * or a placeholder is still sitting in a document Ahmed might send.
 *
 * Run: node scripts/build-cv.mjs
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Three variants, one design and one stylesheet. Same facts throughout; what
// changes is which reader each is written for.
//
//   ops     — the consulting positioning. No longer linked from the site (a CV
//             button was the one thing arguing he was applying for a job), but
//             still built and served at /assets/ for anyone who asks.
//   support — Support / CX Manager applications. Leads on Alpha.
//   cs      — Customer Success / Account Management. Leads on the consulting,
//             because those roles ask for years of direct client management and
//             the consulting since 2022 is exactly that.
//
// All three must clear the parser independently. A variant that silently
// reverted to another one's ordering is worthless, so each asserts its own lead.
const TARGETS = [
  {
    src: 'scripts/cv/cv.html',
    out: 'public/assets/ahmed-hamdy-cv.pdf',
    txt: 'verification/cv-as-a-parser-sees-it.txt',
    role: 'Business Operations & Process Improvement Consultant',
    firstRole: 'Independent Consultant',
  },
  {
    src: 'scripts/cv/cv-support.html',
    out: 'public/assets/ahmed-hamdy-cv-support.pdf',
    txt: 'verification/cv-support-as-a-parser-sees-it.txt',
    role: 'Customer Support & Operations Manager',
    firstRole: 'Client Support Team Leader',
  },
  {
    src: 'scripts/cv/cv-cs.html',
    out: 'public/assets/ahmed-hamdy-cv-customer-success.pdf',
    txt: 'verification/cv-cs-as-a-parser-sees-it.txt',
    role: 'Customer Success & Support Operations Manager',
    firstRole: 'Independent Consultant',
  },
];

const browser = await chromium.launch();
let anyFail = false;

for (const T of TARGETS) {
  const SRC = path.resolve(T.src);
  const OUT = path.resolve(T.out);
  const TXT = path.resolve(T.txt);
  if (!fs.existsSync(SRC)) throw new Error('missing source: ' + SRC);

const page = await browser.newPage();
await page.goto(pathToFileURL(SRC).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const todo = await page.$$eval('.todo', (els) => els.map((e) => e.textContent.trim()));
// Structures that break parsers. Checked in the DOM, before the PDF exists.
const hostile = await page.evaluate(() => ({
  tables: document.querySelectorAll('table').length,
  images: document.querySelectorAll('img, svg, picture').length,
  columns: [...document.querySelectorAll('*')].filter((el) => {
    const cs = getComputedStyle(el);
    return cs.columnCount !== 'auto' || (cs.display === 'grid' && cs.gridTemplateColumns.split(' ').length > 1);
  }).length,
  positioned: [...document.querySelectorAll('body *')].filter(
    (el) => getComputedStyle(el).position === 'absolute',
  ).length,
}));

await page.pdf({ path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true });
await page.close();

// ── Read it back the way a parser would ─────────────────────────────────────
let text = '';
try {
  // -layout keeps the visual order; a single-column CV should come out clean.
  text = execFileSync('pdftotext', ['-layout', '-enc', 'UTF-8', OUT, '-'], {
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
} catch (e) {
  console.log('  ! pdftotext unavailable — cannot verify the text layer');
}
if (text) fs.writeFileSync(TXT, text);

// Count pages from the PDF, not from pdftotext's form feeds. pdftotext ends
// EVERY page with \f including the last, so counting them and adding one
// reports a phantom trailing page — which sent me trimming real content off a
// document that already fit. Ask the file.
const raw = fs.readFileSync(OUT).toString('latin1');
const pages = (raw.match(/\/Type\s*\/Page[^s]/g) || []).length;
const size = fs.statSync(OUT).size;
const has = (s) => text.toLowerCase().includes(s.toLowerCase());

const MUST = [
  'Ahmed Hamdy',
  T.role, // the one line that differs between the two variants
  'ahmedeldep30@gmail.com',
  '+20 104 002 0093',
  'linkedin.com/in/ahmed-hamdy-growth-operations',
  'Profile',
  'Professional Experience',
  'Client Support Team Leader',
  'Client Support Specialist',
  'Social Media Moderator',
  'Alpha Capital Group',
  'Formula4You',
  'Independent Consultant',
  'Core Skills',
  'Education & Languages',
  'Zendesk',
  'Ain Shams University',
];

const missing = MUST.filter((m) => !has(m));

// Reading order: the identity must arrive before the experience, which must
// arrive before the skills. A collapsed multi-column layout scrambles exactly
// this, and it is invisible until you look.
//
// Case-insensitively — the headings are uppercased by CSS, so the text layer
// holds "PROFILE" while the source says "Profile". Comparing raw, this check
// reported the reading order as scrambled when it was perfect. A verification
// that cries wolf is worse than none.
const hay = text.toLowerCase();
const order = ['Ahmed Hamdy', 'Profile', 'Professional Experience', 'Core Skills', 'Education & Languages'];
const at = order.map((k) => hay.indexOf(k.toLowerCase()));
const ordered = at.every((v, i) => v >= 0 && (i === 0 || v > at[i - 1]));

// Each variant leads on a different role. The support version is worthless if
// the reordering silently reverted and Independent Consultant is back on top.
const firstAt = hay.indexOf(T.firstRole.toLowerCase());
const otherRoles = ['Client Support Team Leader', 'Independent Consultant', 'Founder — Business Growth']
  .filter((r) => r !== T.firstRole)
  .map((r) => hay.indexOf(r.toLowerCase()));
const leadsCorrectly = firstAt >= 0 && otherRoles.every((v) => v < 0 || firstAt < v);

const failures = [];
if (missing.length) failures.push(`${missing.length} required string(s) lost in the text layer: ${missing.join(', ')}`);
if (!ordered) failures.push('reading order is scrambled — a parser will not get the sections in sequence');
if (!leadsCorrectly) failures.push(`expected "${T.firstRole}" to lead the experience, but another role comes first`);
if (hostile.tables) failures.push(`${hostile.tables} <table> — parsers linearise these unpredictably`);
if (hostile.images) failures.push(`${hostile.images} image(s) — text inside one is invisible to a parser`);
if (hostile.columns) failures.push(`${hostile.columns} multi-column container(s) — the classic cause of scrambled output`);
if (hostile.positioned) failures.push(`${hostile.positioned} absolutely positioned element(s) — position, not flow, decides their order`);
if (pages > 2) failures.push(`${pages} pages — a CV should be two at most`);

console.log(`\n  ${path.relative(process.cwd(), OUT)} — ${(size / 1024).toFixed(0)} KB, ${pages} page${pages === 1 ? '' : 's'} · leads on ${T.firstRole}`);
console.log(`  text layer → ${path.relative(process.cwd(), TXT)} (${text.split(/\s+/).filter(Boolean).length} words a parser can read)`);

if (failures.length) {
  anyFail = true;
  failures.forEach((f) => console.log(`  ✗ ${f}`));
} else {
  console.log('  ✓ ATS clean: every required field survives extraction, in order, no hostile structures');
}
if (todo.length) {
  anyFail = true;
  console.log(`  ⚠ NOT READY TO SEND — placeholder still present: ${todo.join(', ')}`);
}
}

await browser.close();
process.exit(anyFail ? 1 : 0);
