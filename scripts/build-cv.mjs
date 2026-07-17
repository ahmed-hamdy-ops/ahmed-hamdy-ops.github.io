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

const SRC = path.resolve('scripts/cv/cv.html');
const OUT = path.resolve('public/assets/ahmed-hamdy-cv.pdf');
const TXT = path.resolve('verification/cv-as-a-parser-sees-it.txt');

if (!fs.existsSync(SRC)) throw new Error('missing source: ' + SRC);

const browser = await chromium.launch();
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
await browser.close();

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
  'Business Operations & Process Improvement Consultant',
  'ahmedeldep30@gmail.com',
  '+20 104 002 0093',
  'linkedin.com/in/ahmed-hamdy-growth-operations',
  'Profile',
  'Professional Experience',
  'Support Team Manager',
  'Alpha Capital Group',
  'Formula4You',
  'Independent Consultant',
  'Core Skills',
  'Education & Languages',
  'Zendesk',
  'Ticket taxonomy design',
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

const failures = [];
if (missing.length) failures.push(`${missing.length} required string(s) lost in the text layer: ${missing.join(', ')}`);
if (!ordered) failures.push('reading order is scrambled — a parser will not get the sections in sequence');
if (hostile.tables) failures.push(`${hostile.tables} <table> — parsers linearise these unpredictably`);
if (hostile.images) failures.push(`${hostile.images} image(s) — text inside one is invisible to a parser`);
if (hostile.columns) failures.push(`${hostile.columns} multi-column container(s) — the classic cause of scrambled output`);
if (hostile.positioned) failures.push(`${hostile.positioned} absolutely positioned element(s) — position, not flow, decides their order`);
if (pages > 2) failures.push(`${pages} pages — a CV should be two at most`);

console.log(`\n  ${path.relative(process.cwd(), OUT)} — ${(size / 1024).toFixed(0)} KB, ${pages} page${pages === 1 ? '' : 's'}`);
console.log(`  text layer → ${path.relative(process.cwd(), TXT)} (${text.split(/\s+/).filter(Boolean).length} words a parser can read)\n`);

if (failures.length) {
  failures.forEach((f) => console.log(`  ✗ ${f}`));
} else {
  console.log('  ✓ ATS: every required field survives extraction, in order');
  console.log('  ✓ no tables, images, columns or absolute positioning');
}

if (todo.length) {
  console.log(`\n  ⚠ NOT READY TO SEND — ${todo.length} placeholder still in the document: ${todo.join(', ')}`);
}

process.exit(failures.length ? 1 : 0);
