# Ahmed Hamdy — Portfolio

Business Growth & Operations Specialist. Enterprise portfolio and business-opportunity system.

**→ For current status, what's done, and what's outstanding, read [`docs/00-STATUS.md`](docs/00-STATUS.md).**

**Live (provisional, noindex):** https://ahmedeldep30-ship-it.github.io/ahmed-hamdy-portfolio/
**Gate:** 2 — reworked, awaiting visual approval. Phase 4+ not started.
**Stack:** Astro 5 · strict TypeScript · MDX content collections · hand-authored CSS · no UI framework ships to the browser.

---

## Quick start

```bash
npm install
npm run fonts        # vendor woff2 from node_modules → public/fonts/
npm run assets       # source-assets/ (private) → src/assets/ (optimized, committed)
npm run dev          # http://localhost:4321/ahmed-hamdy-portfolio/
npm run build        # astro check && astro build
npm run preview      # serves dist/ on :4330 — every verify script targets this
```

## Verification

Nothing here ships on assertion. Every claim in the status doc is produced by a script you can re-run.

```bash
npm run preview          # in one terminal
npm run verify:all       # in another — everything except Lighthouse
npm run verify:lh        # Lighthouse (slow)
```

| Command | Asserts |
|---|---|
| `verify` | 6 breakpoints × 4 routes: overflow, console, links, images, alt text, reduced motion, no-JS, base path |
| `verify:arrival` | Portrait, name, role, claim and CTA on the first screen at 7 sizes |
| `verify:motion` | How much of the diagram is visible **at the instant it fires** |
| `verify:motion-duration` | The `.play` window outlasts the last keyframe |
| `verify:reduced-motion` | Autoplays when allowed · never when reduced · Replay still works |
| `verify:contact` | Drives the consultation builder, asserts the real `wa.me` / `mailto` payloads |
| `verify:header` | CTA box fixed, nav does not move between audience states |
| `verify:fonts` | Families load, zero external requests, base path correct, CLS |
| `verify:a11y` | axe WCAG 2.2 AA × 5 routes × 2 viewports + keyboard + invisible-label check |
| `check:links` | No hard-coded host, base path, or contact outside `config/site.ts` |

Diagnostics (observe only, change nothing): `diagnose:motion`, `diagnose:frozen`.
Artefacts: `shots`, `shots:review`, `record` → `verification/` (gitignored).

### Verification traps these encode

Each of these produced a **false result that cost real debugging time**. Do not "simplify" them away:

- **`elementHandle.screenshot()` restarts the SVG animation clock.** Every frame returns the same ~100ms state, so a working animation reports as frozen. Use viewport capture.
- **Playwright `reducedMotion: null` means *system default*, and headless Chromium's default is `reduce`.** A "normal motion" probe silently tests reduced motion. Always state the mode.
- **`page.click()` auto-scrolls to its target.** If the control sits below the diagram, clicking it moves the diagram off-screen mid-measurement.
- **Measure the diagram (`[data-seam-stage]`), not the `<figure>`.** The figure includes the findings and reports ~34% visible when the diagram is fully on screen.

---

## Architecture

```
src/
  config/site.ts        ← THE single source of deployment identity + contact.
  content.config.ts     ← Zod claim/evidence schema + public label mapping.
  content/work/*.mdx    ← Case studies. Frontmatter validated at build.
  styles/
    fonts.css           ← Metric-matched FALLBACKS only (no url() — see below).
    tokens.css          ← Design tokens. Every colour carries its measured ratio.
    base.css            ← @layer reset, base, layout, components, zones, utilities.
  components/
    Fonts.astro         ← The real @font-face, built through withBase().
    nav/                ← Header (5 links + audience switch + fixed CTA), Footer
    home/               ← Intro, SeamHero, and the 9 other sections
    case/               ← EvidenceRail, Shot, Decision
    review/             ← Gate 2.1 prototypes (delete or promote at Gate 2)
  scripts/
    play-once.ts        ← Visibility-gated one-shot animation
    audience.ts         ← Audience switch (labels + CTA only)
    consultation.ts     ← Contact adapters
scripts/                ← asset pipeline, font vendoring, verification, CI gates
source-assets/          ← GITIGNORED. Originals: screenshots, portrait, briefs, CV.
```

### Three things that are load-bearing

**1. `@layer` order** — `reset, base, layout, components, zones, utilities`

`zones` **must** come after `components`. The light-stone zone re-points text and accent
tokens to their accessible light-surface variants; if it lost the cascade, dark-surface
colours would render on stone at failing contrast. This was a real bug caught by
`verify:a11y`. Do not reorder without re-running it.

**2. `@font-face` lives in `Fonts.astro`, not in CSS**

A `url()` in a `.css` file is only base-path-rewritten at **build** time. Under `astro dev`
it stays absolute and 404s, so the site silently renders in fallback fonts — in the one
environment where you'd notice. Building the URL through `withBase()` makes dev and
production agree.

**3. Small-screen overrides go LAST in a component's `<style>`**

Same specificity means source order decides. An identical `@media` block placed above the
base rules silently lost to a `clamp()` — the override never applied and the headline
stayed 141px instead of 86px.

---

## Claims and evidence

The credibility rule is enforced by the type system, not by memory.

| Internal `claim_status` (governance) | Public label (what a visitor reads) |
|---|---|
| `verified` | Verified Evidence |
| `user_asserted` | Founder-Led Work |
| `illustrative` / `proposed` | Illustrative Scenario |
| `public_observation` | Independent Analysis |
| `confidential` | Client-Confidential |

“User-asserted” is **never** shown to a visitor. It is a validation state.

Enforced at build time:
- A claim marked `verified` **without a `source` fails the build** (`content.config.ts`).
- Only `verified` may enter a prominent metric card.
- `alt` text under 20 characters fails verification.
- Every `<Shot>` requires a `proves` prop — a screenshot that cannot answer *"what decision
  does this prove?"* cannot be published.

When evidence is missing, the approved **safe fallback wording** is used verbatim, and the
case study publishes the held-back claim **alongside the fallback that replaced it**.
See [`docs/02-EVIDENCE-REGISTER.md`](docs/02-EVIDENCE-REGISTER.md).

---

## Deployment

GitHub Actions → Pages (`.github/workflows/deploy.yml`). Zero cost. Actions pinned to
node24 majors. Push to `main` deploys.

### Indexing is OFF until Gate 4

```ts
// src/config/site.ts
canonicalApproved: false,   // → <meta name="robots" content="noindex"> + robots.txt Disallow
```

Deliberate. The github.io address is provisional; if it gets indexed now, that temporary URL
becomes the established canonical identity and the later domain move starts from a worse
position. **This is the only reason Lighthouse SEO reads 63–66** — verified 100 with the flag on.

### Custom domain later (no rebuild)

1. `echo "ahmedhamdy.com" > public/CNAME`
2. In `deploy.yml`: `SITE_URL=https://ahmedhamdy.com`, `BASE_PATH=/`
3. DNS → GitHub Pages; Settings → Pages → Custom domain → enforce HTTPS
4. Set `canonicalApproved: true`

**Route paths do not change**, so search equity is preserved. `npm run check:links` fails the
build if any file hard-codes a host, base path, or contact detail outside `config/site.ts`.

**User site instead of project site:** `SITE_URL=https://<user>.github.io`, `BASE_PATH=/`. Nothing else changes.

---

## Assets

Originals live in `source-assets/` and are **gitignored — never committed**. Only optimized,
approved copies enter the repository.

```bash
npm run assets
```

- Never upscales (a screenshot enlarged past source resolution turns text artificial).
- WebP q82/effort6 — high enough to keep 12px Arabic interface glyphs legible.
- Portrait: 900px max, q86.

Before publishing any screenshot: crop private data, write real alt text, write a caption,
and answer `proves`. **Never infer scale, revenue, or traffic from an interface screenshot.**

---

## Content editing

Add a case study: create `src/content/work/<slug>.mdx`. Frontmatter is validated against
`content.config.ts` — a missing `rail`, fewer than 3 `capabilities`, or a `verified` claim
without a source fails the build. The route generates at `/work/<slug>`.

Root-relative Markdown links are rewritten through the base path at build time
(`scripts/rehype-base-path.mjs`), because Markdown cannot call `withBase()`.
