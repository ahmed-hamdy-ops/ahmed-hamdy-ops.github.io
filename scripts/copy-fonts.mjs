/**
 * Vendors the production fonts from node_modules into public/fonts/.
 *
 * Self-hosted, no font CDN at any point — the packages are a build-time
 * dependency, never a runtime request. Reproducible: re-run after `npm ci`.
 *
 * Choices:
 *  · Variable ("wght") axis files — every weight we use in one file, so
 *    Manrope 500/600/700 costs one request, not three.
 *  · `latin` subset only. The site is English-first; latin-ext would add
 *    weight for glyphs no page uses. Future Arabic needs its own subset and
 *    its own @font-face, not a bigger Latin file.
 *  · Source Serif 4: ITALIC only. It is used exclusively for the one-line
 *    strategic statement, which is italic. Shipping the roman would be ~50KB
 *    of font nobody renders.
 *
 * Run: npm run fonts
 */
import { mkdir, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public', 'fonts');

const FONTS = [
  {
    from: '@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
    to: 'manrope-latin-wght-normal.woff2',
    note: 'headings + UI, weights 500-700',
  },
  {
    from: '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
    to: 'inter-latin-wght-normal.woff2',
    note: 'body, weights 400-600',
  },
  {
    from: '@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-italic.woff2',
    to: 'source-serif-4-latin-wght-italic.woff2',
    note: 'strategic statement only, italic only',
  },
];

await mkdir(OUT, { recursive: true });
let total = 0;

for (const f of FONTS) {
  const src = path.join(ROOT, 'node_modules', f.from);
  const dest = path.join(OUT, f.to);
  await copyFile(src, dest);
  const { size } = await stat(dest);
  total += size;
  console.log(`  ✓ ${f.to.padEnd(46)} ${(size / 1024).toFixed(1).padStart(6)} KB  — ${f.note}`);
}

console.log(`\n  ${(total / 1024).toFixed(1)} KB total. Self-hosted; no CDN request at runtime.`);
