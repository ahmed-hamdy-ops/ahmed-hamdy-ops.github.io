/**
 * Lighthouse against the built site. Targets from the brief:
 * Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+.
 *
 * NOTE: the site is intentionally noindex until Gate 4 approves the canonical
 * host, so Lighthouse's SEO category will flag "blocked from indexing". That is
 * a deliberate pre-launch state, not a defect — it is reported, not suppressed.
 */
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

const BASE = process.env.VERIFY_URL ?? 'http://localhost:4330';
const PAGES = [
  ['home', `${BASE}/`],
  ['formula4you', `${BASE}/work/formula4you`],
  ['contact', `${BASE}/contact`],
];
const TARGET = { performance: 90, accessibility: 95, 'best-practices': 95, seo: 95 };

const chrome = await launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });
const rows = [];

for (const [name, url] of PAGES) {
  for (const formFactor of ['desktop', 'mobile']) {
    const res = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      formFactor,
      screenEmulation:
        formFactor === 'desktop'
          ? { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false }
          : { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false },
      throttling:
        formFactor === 'desktop'
          ? { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 }
          : { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4 },
      onlyCategories: Object.keys(TARGET),
    });

    const c = res.lhr.categories;
    const row = {
      page: `${name} (${formFactor})`,
      performance: Math.round(c.performance.score * 100),
      accessibility: Math.round(c.accessibility.score * 100),
      'best-practices': Math.round(c['best-practices'].score * 100),
      seo: Math.round(c.seo.score * 100),
    };
    rows.push(row);

    // Core Web Vitals, the numbers that actually matter to a visitor.
    const a = res.lhr.audits;
    row.LCP = a['largest-contentful-paint']?.displayValue ?? '—';
    row.CLS = a['cumulative-layout-shift']?.displayValue ?? '—';
    row.TBT = a['total-blocking-time']?.displayValue ?? '—';
  }
}

await chrome.kill();

console.log('\n' + 'PAGE'.padEnd(24) + 'PERF  A11Y  BP   SEO   LCP        CLS     TBT');
console.log('─'.repeat(78));
for (const r of rows) {
  console.log(
    r.page.padEnd(24) +
      String(r.performance).padEnd(6) +
      String(r.accessibility).padEnd(6) +
      String(r['best-practices']).padEnd(5) +
      String(r.seo).padEnd(6) +
      String(r.LCP).padEnd(11) +
      String(r.CLS).padEnd(8) +
      String(r.TBT)
  );
}

console.log('\nAgainst targets (Perf 90 / A11y 95 / BP 95 / SEO 95):');
let miss = 0;
for (const r of rows) {
  for (const [k, t] of Object.entries(TARGET)) {
    if (r[k] < t) {
      const note = k === 'seo' ? '  ← expected: noindex until Gate 4' : '';
      console.log(`  ! ${r.page} ${k}: ${r[k]} < ${t}${note}`);
      if (k !== 'seo') miss++;
    }
  }
}
console.log(miss ? `\n${miss} non-SEO target(s) missed.` : '\nAll non-SEO targets met.');
