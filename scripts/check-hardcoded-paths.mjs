/**
 * CI gate: nothing may hard-code deployment identity.
 *
 * Base-path portability is only real if it is enforced. Every internal link and
 * asset must go through withBase(); every contact detail must come from
 * src/config/site.ts. This script fails the build if that slips.
 *
 * Run: npm run check:links
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SCAN = ['src'];
const ALLOW = new Set([
  path.join('src', 'config', 'site.ts'),          // the single source of truth
  path.join('src', 'content.config.ts'),
]);

const RULES = [
  {
    id: 'hardcoded-github-io',
    re: /ahmed-hamdy-ops\.github\.io/,
    msg: 'Hard-coded GitHub Pages host. Use site.url / absoluteUrl().',
  },
  {
    id: 'hardcoded-base',
    re: /["'`]\/ahmed-hamdy-portfolio/,
    msg: 'Hard-coded base path. Use withBase().',
  },
  {
    id: 'hardcoded-phone',
    re: /201040020093|\+20\s?104\s?002\s?0093/,
    msg: 'Hard-coded phone/WhatsApp number. Import from config/site.ts.',
  },
  {
    id: 'hardcoded-email',
    re: /ahmedeldep30@gmail\.com/,
    msg: 'Hard-coded email. Import from config/site.ts.',
  },
];

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(astro|ts|tsx|js|mjs|mdx|md|css)$/.test(e.name)) yield p;
  }
}

let failures = 0;
for (const base of SCAN) {
  for await (const file of walk(path.join(ROOT, base))) {
    const rel = path.relative(ROOT, file);
    if (ALLOW.has(rel)) continue;
    const src = await readFile(file, 'utf8');
    src.split('\n').forEach((line, i) => {
      if (line.trimStart().startsWith('*') || line.trimStart().startsWith('//')) return; // comments
      for (const rule of RULES) {
        if (rule.re.test(line)) {
          console.error(`  ✗ ${rel}:${i + 1}  [${rule.id}] ${rule.msg}`);
          console.error(`      ${line.trim().slice(0, 100)}`);
          failures++;
        }
      }
    });
  }
}

if (failures) {
  console.error(`\n${failures} hard-coded path/contact violation(s). Deployment identity must stay in config/site.ts.`);
  process.exit(1);
}
console.log('✓ No hard-coded hosts, base paths, or contact details outside config/site.ts.');
