# Gate 2 — Phase 2/3 Review

> ## ⚠️ HISTORICAL RECORD — superseded. Do not read as current.
>
> This was the Gate 2 submission. **Gate 2 was rejected on visual grounds**, and much of
> what is described below has since changed. **For current state read [`00-STATUS.md`](00-STATUS.md).**
>
> | This document says | Reality |
> |---|---|
> | "I could not deploy" · "not published" | **Deployed.** Live at the github.io project-site URL, `noindex` until Gate 4. |
> | "Fonts fall back to system stack — highest-priority remaining visual item" | **Done.** Manrope + Inter + Source Serif 4 self-hosted, 121KB, zero CDN, CLS 0. |
> | Home is ~13,180px ≈ 14.6 screens | **12,476px ≈ 13.9 screens** after the merge and the Intro rework. |
> | Recommends merging Capability Map + Playbooks | **Done.** |
> | 12 home sections, diagram-led hero | **11 sections**, and the page now opens with the **portrait**. |
> | Workflow actions v4/v5 | **Upgraded** to node24 majors to clear the runtime deprecation warnings. |
> | "Gate 2 … awaiting approval" | **Rejected on visuals**; reworked at Gate 2.1/2.2 and awaiting review. |
>
> Still accurate: the evidence discipline, the claim model, private-asset handling, and the
> deployment/portability design.

**Status:** Complete and verified. Awaiting approval. **Not published.**
**Commits:** 3 · **Tracked files:** 60 · **Private files leaked:** 0 · **Build:** 5 pages, 1.5 MB

---

## 1. Live GitHub Pages preview — ⚠️ BLOCKED, needs one action from you

**I could not deploy.** There is no authenticated GitHub access in this environment (`gh` CLI
is not installed, no credentials). Pushing to your account is also not something I should do
unilaterally. Everything is committed and the workflow is written — it needs one push:

```bash
cd D:\portfolio
git remote add origin https://github.com/ahmedeldep30-ship-it/ahmed-hamdy-portfolio.git
git branch -M main
git push -u origin main
```

Then **Settings → Pages → Source: GitHub Actions.** It will build and deploy automatically to
`https://ahmedeldep30-ship-it.github.io/ahmed-hamdy-portfolio/`.

The CI runs `check:links` and `astro check` before building, so a broken deploy fails loudly
rather than shipping.

**It will deploy `noindex`.** That is deliberate — see §12.

## 2–4. Screenshots

`verification/` — regenerate any time with `npm run verify` and `npm run shots`.

| Set | Files |
|---|---|
| Full-page × 6 breakpoints × 4 routes | `home--{wide-1920,desktop-1440,laptop-1024,tablet-768,mobile-390,mobile-360}.png`, same for `formula4you`, `work`, `contact` |
| Sections (desktop 1440) | `sections/01-hero-viewport` … `sections/12-contact` |
| Mobile | `sections/13-seam-mobile`, `sections/14-hero-mobile` |
| Reduced motion | `home--reduced-motion.png`, `sab--reduced-motion.png` |
| No JavaScript | `contact--no-js.png` |
| Contact review step | `contact--review-step.png` |

## 5. Motion recordings

`verification/motion/` — `npm run` → `node scripts/record-motion.mjs`

- `seam-diagnosis.webm` + frames at 0/200/400/600/800/1000/1300ms + settled
- `intervention-compression.webm` + same frame strip + settled

## 6. Reduced motion

Verified mechanically, not by eye alone: with `prefers-reduced-motion: reduce`, every element
of the diagnosis (`.s-fx-break`, `.s-fx-resolve`, findings, surviving interventions) is
asserted at opacity ≥ 0.9. **The base state of every diagram is its resolved end state**, so
disabling animation leaves the complete argument, never a blank frame.

## 7. Lighthouse

| Page | Perf | A11y | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Home — desktop / mobile | **100 / 100** | **100 / 100** | **100 / 100** | 66 / 66 | 0.4s / 1.4s | 0 | 0ms |
| Formula4You — desktop / mobile | **100 / 100** | **100 / 100** | **100 / 100** | 66 / 66 | 0.3s / 1.2s | 0 | 0ms |
| Contact — desktop / mobile | **100 / 100** | **100 / 100** | **100 / 100** | 63 / 63 | 0.3s / 1.2s | 0 | 0ms |

**SEO scores 100 on every page with indexing enabled** — I tested it by flipping
`canonicalApproved` and re-running, rather than assuming. The 63–66 is entirely the deliberate
pre-launch noindex. Nothing else in the SEO category fails.

## 8. Accessibility

- **axe-core (WCAG 2.2 AA + best-practice): 0 violations** across 5 routes × 2 viewports.
- Skip link is the first tab stop.
- Capability map: roving tabindex, arrow-key navigation.
- First 25 tab stops all show a visible focus indicator (tested by real tabbing, not
  programmatic `.focus()`, which does not reliably match `:focus-visible`).
- Every `<a>`/`<button>` label verified visible against its own effective background.

**Three real accessibility bugs were found and fixed:**

1. **Cascade collision.** `@layer` order had `zones` before `components`, so the dark-surface
   `.eyebrow`/`.muted` colours won on the light stone panels — 9 failing nodes. My measured
   palette was defeated by my own layer order. Fixed and documented as load-bearing.
2. **Two invisible buttons** (teal label on teal fill) — About CTA and the Formula4You
   contextual CTA. **axe passed both.** Found by looking at the render. Added a dedicated check
   that catches the whole class of bug.
3. **Keyboard-inaccessible scroll region** — the compression chart scrolls horizontally on
   mobile and had no keyboard access. Now a focusable, labelled region.

## 9. Real assets used

All six supplied Formula4You screens, each placed at the reasoning stage it proves — not a
gallery at the end. Every one answers *“what decision does this screen prove?”*

| Asset | Placed at | Proves |
|---|---|---|
| `formula4you-supplier-merchant-pathways` | Participant model | Two coherent sides, each with its own offer and entry point |
| `formula4you-supplier-onboarding` | Onboarding friction | Two steps, seven fields, five required |
| `formula4you-onboarding-selling-journey` | Activation | One sequence with a defined end state — the first order |
| `formula4you-brand-store-customer-view` | Marketplace value | Fragrance-native data model — concentration, gender, volume as first-class fields |
| `formula4you-platform-home` | Live implementation | Payments, shipping, language, support are live commitments |
| `formula4you-market-development-visual` | Market thesis | Connect a fragmented market, reduce the steps |

Portrait: `ahmed-hamdy-portrait-approved.webp` — About only, never the hero.

Originals stay in gitignored `source-assets/`. Optimized copies −88% to −98%, no upscaling.

## 10. Remaining evidence gaps

| Gap | Consequence today |
|---|---|
| Employee of the Month proof | **Omitted entirely** — not softened |
| Trustpilot / 300+ reviews proof | “hundreds of five-star reviews” — no number, no metric card |
| Thousands of completed orders | Approved safe fallback wording, verbatim |
| Formula4You scale (suppliers, listings, traffic, revenue) | Not published. The rail says so explicitly. |
| Alpha Capital formal job title | Case study is Phase 4; still needed |
| Formula4You logo | Text treatment used |
| Formula4You roadmap / user stories / QA plan | Would materially strengthen the product-strategy claim |
| Verified support case | 1,000→100 stays illustrative |

### The “90%” claim
The supplier-onboarding filename asserts *“~90% of the essential supplier information.”* **I did
not publish it.** There is no baseline or calculation behind it, so it is recorded as
`user_asserted` with a fallback, and the case study says so out loud — it publishes only what
the screen itself shows (two steps, seven fields). The page argues *why* that restraint matters.

## 11. Private assets

`git ls-files | grep -c source-assets` → **0**. Confirmed via `git check-ignore`. No briefs, no
CV source, no original screenshots, no portrait master. Only the approved CV PDF ships, at
`/assets/ahmed-hamdy-cv.pdf`.

## 12. Deviations from instruction

| Deviation | Why |
|---|---|
| **Site deploys `noindex`** | The github.io URL is provisional until Gate 4. If indexed now, the temporary URL becomes the canonical identity and the domain move starts from a worse position. One flag: `site.canonicalApproved`. |
| **No live URL delivered** | No authenticated GitHub access here. §1. |
| **Nav links Playbooks/Insights/How I Work → home anchors** | Those routes are Phase 4–5. Nothing 404s, nothing is faked. |
| **`/work` index built** (not strictly listed) | Nav needs a real destination; it lists the flagship and marks the other three “in preparation”. |
| **Three supporting cases shown as “In preparation”** | Honest over a padded page. Not started, per instruction. |
| **Fonts fall back to system stack** | Manrope/Inter are not self-hosted yet — needs the woff2 subsets. Type scale, weights, and rhythm are correct; the faces are not. **Highest-priority remaining visual item.** |
| **`ORion` appears as the demo storefront** | It is a store *built on* Formula4You, used only as platform evidence. Never described as Ahmed's project. Flagging because the brief excludes “ORion” from V1 as a project — confirm this is the same brand and that you are comfortable. |
| **Intervention Compression ends on two moves** | A single magic bullet is the less credible story. |
| **Home is ~13,180px at 1440** | See below. |

### Home-page length — the merge question you asked me to evaluate

At 1440 the home page is **13,180px ≈ 14.6 screens**. That is long for a decision page. My
read, having looked at it:

- **Capability Proof Map + Playbooks → merge.** Recommended. They answer nearly the same
  question (“what can he do, and what proves it?”) and sit adjacently. Merging removes ~1.5
  screens and strengthens both.
- **Audit Method + Insights → already merged** into one two-column section. Keep.
- **Credibility + About → do not merge.** Credibility is deliberately unimpressive and
  evidence-led; About is narrative. Merging would let the narrative soften the evidence
  discipline, which is the opposite of the point.

## 13. Intentionally postponed until after Gate 2

Supporting case studies (E-commerce Conversion, Alpha Capital, Commercial Growth) · four full
playbooks · Insights publishing system, article template, category filtering, RSS · public
audits · both PDFs · `/for-businesses` · `/for-employers` · standalone `/about` · Search
Console / Bing onboarding · IndexNow.

---

## What I verified, and how

Every claim above is reproducible:

```bash
npm run preview -- --port 4330
npm run verify           # 14/14 — breakpoints, overflow, console, links, images, reduced motion, no-JS, base path
npm run verify:contact   # 16/16 — drives the builder, asserts the generated wa.me + mailto payloads
npm run verify:a11y      # 0 violations — axe WCAG 2.2 AA + keyboard + invisible-label check
npm run verify:lh        # Lighthouse
npm run check:links      # no hard-coded hosts, base paths, or contact details
npx astro check          # 0 errors, 0 warnings
```

Bugs the harness caught that review would have missed: a broken `/#sab` link (MDX bypassing
`withBase`), a `[hidden]` attribute defeated by `display:flex` (the review panel rendered on
page load), and the two invisible buttons.
