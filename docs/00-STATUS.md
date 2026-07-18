# Project status — the single source of "where are we"

**Updated:** 2026-07-16 · positioning recalibration in progress
**Read this first.** The other docs in `docs/` are a historical record of decisions;
where they conflict with this file, this file wins.

---

## 1. Where we actually are

| | |
|---|---|
| **Live (provisional)** | https://ahmed-hamdy-ops.github.io/ |
| **Indexing** | **OFF** — `noindex` site-wide until Gate 4. Deliberate. |
| **Current gate** | **Gate 2.3 — direction locked; implementation pending.** The V4 positioning and content architecture now govern the refactor; visual direction remains unapproved. |
| **Phase 4+** | **Not started.** Blocked on Gate 2.3 implementation and Gate 2 visual approval. |
| **Routes live** | 6 public + 1 review + generated artefacts (§4) |
| **Repo** | `ahmed-hamdy-ops/ahmed-hamdy-ops.github.io`, branch `main` |

### Gate history — what was actually decided

| Gate | Status | Outcome |
|---|---|---|
| **Gate 0** — source audit | ✅ Passed | Brief, prompt, CV, assets read. Conflicts + missing evidence registered. |
| **Gate 1** — creative direction | ✅ **Approved** | Dark-leaning palette, 5-link nav + audience switch, `--teal-700`/`--coral-700` AA extensions, no Tailwind, Source Serif 4, motion vocabulary. |
| **Gate 2** — home + Formula4You | ❌ **Rejected on visuals** | Engineering accepted. Design rejected: *"feels like a dashboard… dull, unappealing, lifeless"*, no portrait, animation too simple. |
| **Gate 2.1** — visual proposal | ⏳ Built, **unreviewed** | `/review/gate-2-1` — editorial hero, fixed CTA, button system, F4U evidence at scale, card reduction, before/after. |
| **Gate 2.2** — direction decisions | ✅ **Decided** | Depth without WebGL · portrait beside headline · diagnosis moved below the intro. **Implemented on the home page.** |
| **Gate 2.3** — positioning and content direction | ✅ **Direction locked; implementation pending** | Keep Business Growth & Operations Specialist; make CX, Support Operations, Process Improvement, Team Development, and Service Quality the proven depth; bound technical-adjacent capabilities as supporting business lenses. See `04-PORTFOLIO-DIRECTION-V4.md`. |
| **Gate 3** — PDFs | ⛔ Not reached | |
| **Gate 4** — publish | ⛔ Not reached | Flips `canonicalApproved` → indexing on. |

---

## 2. What is DONE

**Foundation**
- Astro 5 · strict TypeScript · MDX content collections · hand-authored CSS · **no UI framework ships**
- Zod claim/evidence schema with **build-time enforcement** (a `verified` claim without a source fails the build)
- Base-path portability + CI gate against hard-coded hosts/paths/contacts
- GitHub Actions → Pages, node24 actions, deploying green

**Design system**
- Dark-leaning palette, **every contrast pair computed**, not assumed (`src/styles/tokens.css`)
- Self-hosted Manrope + Inter + Source Serif 4 (italic only) — 121KB, zero CDN, **CLS 0**
- Authored button system: fixed 44px box, travelling fill, directional arrow
- Fixed-width audience CTA shell — **header does not move** between audience states

**Home page (11 sections)**
1. **Intro** — portrait, name, role, claim, actions. Layered depth, pointer tilt, parallax, grain, choreographed arrival.
2. **Seam Diagnosis** — ~4.4s six-beat diagnosis; compact horizontal mobile variant
3. Audience Gateway · 4. Business System · 5. **Capabilities + Playbooks (merged)** ·
6. Audit Method + Insights · 7. How I Work + Simplify→Automate→Build (Intervention Compression) ·
8. Credibility · 9. About · 10. Contact CTA

**Formula4You flagship** — full case study, all 6 real screens placed at the reasoning stage each proves, Evidence Rail, public "Evidence status" section listing held-back claims and their fallbacks.

**Contact** — consultation builder → review step → pre-filled WhatsApp/email. No storage, no third party. Direct channels work with JS disabled.

**Verification** — 10 harnesses, all green (§5).

---

## 3. What is NOT done

### Blocked on Gate 2 approval (do not start)
| Item | Phase |
|---|---|
| E-commerce Conversion case study | 4 |
| Alpha Capital case study | 4 |
| Commercial Growth case study | 4 |
| Four full transformation playbooks | 5 |
| `/for-businesses`, `/for-employers` | 6 |
| Standalone `/about` | 6 |
| Independent audit framework + `/audits` | 7 |
| Both PDFs (recruiter + business capabilities) | 8 |
| Insights publishing system, article template, category filtering, RSS | 11 |
| Search Console / Bing onboarding, IndexNow | 10 |

### Known, accepted, not yet addressed
- **The capability hierarchy is too broad.** The current site presents nine domains and ten capabilities at near-equal weight. This creates incorrect expectations around UI/UX, advanced analytics, product management, AI architecture, and consulting depth. V4 replaces this with four core capability groups plus bounded supporting lenses.
- **The two audience pathways remain.** They will become real employer and business decision paths, not duplicate decorative choices. Employer ordering prioritizes Alpha Capital; business ordering prioritizes Formula4You.
- **The page is visually uneven.** The Intro is the new editorial language; sections 2–10 are still the older card-and-border language Ahmed objected to. **This is the largest outstanding visual debt.**
- **Home length:** 12,476px ≈ 13.9 screens at 1440 (was 13,180px). Mobile 21,201px ≈ 25 screens. Long. Shortening further should come from making sections *feel* different, not from cutting capability coverage.
- `/review/gate-2-1` still contains the older `SeamHeroV2` prototype. Delete or promote once Gate 2 closes.
- Lighthouse **SEO 63–66** — entirely the deliberate `noindex`. Verified 100 with indexing on.
- Mobile performance **98** (LCP ~2.1s) — the cost of the eager portrait. Desktop 100.

---

## 4. Public routes

| Route | State |
|---|---|
| `/` | Live |
| `/work` | Live — flagship + 3 marked "in preparation" |
| `/work/formula4you` | Live |
| `/contact` | Live |
| `/404` | Live |
| `/review/gate-2-1` | Live, **noindex**, out of sitemap, unlinked |
| `/robots.txt`, `/sitemap-index.xml`, `/sitemap-0.xml` | Generated |
| `/assets/ahmed-hamdy-cv.pdf` | Live |

**Nav destinations:** Playbooks → `/#capabilities` · Insights → `/#insights` · How I Work → `/#how-i-work` · About → `/#about`. These are home-page previews until their routes ship in Phase 4–6. **Nothing 404s; nothing is faked.**

---

## 5. Verification — all reproducible

```bash
npm run preview          # serves dist/ on :4330 — required by every check below
npm run verify:all       # everything except Lighthouse
```

| Command | Asserts | Result |
|---|---|---|
| `verify` | 6 breakpoints × 4 routes: no overflow, no console errors, links, images, alt text, reduced motion, no-JS, base path | **14/14** |
| `verify:arrival` | Portrait, name, role, claim, CTA on the first screen at 7 sizes | **PASS** |
| `verify:motion` | How much of the diagram is visible **at the instant it fires** | **PASS** — 100% |
| `verify:motion-duration` | The `.play` window outlasts the last keyframe | **PASS** |
| `verify:reduced-motion` | Autoplays when allowed · never when reduced · Replay still works · override never lingers | **PASS** |
| `verify:contact` | Drives the builder, asserts the real `wa.me` + `mailto` payloads | **16/16** |
| `verify:header` | CTA 283×44px fixed, nav does not move, at 5 widths | **PASS** |
| `verify:fonts` | Families load, zero external requests, base path, CLS | **PASS**, CLS 0 |
| `verify:a11y` | axe WCAG 2.2 AA × 5 routes × 2 viewports + keyboard + invisible-label check | **0 violations** |
| `verify:lh` | Lighthouse | 100/100/100 desktop · 98 perf mobile |
| `check:links` | No hard-coded host, base path, or contact outside `config/site.ts` | **PASS** |

**Diagnostics** (observe only): `diagnose:motion`, `diagnose:frozen`.
**Artefacts:** `shots`, `shots:review`, `record` → `verification/` (gitignored).

### Traps these encode — do not "simplify" them away
- `elementHandle.screenshot()` **restarts the SVG animation clock** → every frame returns the same early state → reports a working animation as frozen. Use viewport capture.
- Playwright `reducedMotion: null` = *system default*, and headless Chromium's default is **reduce**. Always state the mode.
- `page.click()` auto-scrolls to the target; if the control sits below the diagram it moves the diagram off-screen mid-measurement.
- Measure the **diagram** (`[data-seam-stage]`), not the `<figure>` — the figure includes findings and reports ~34% when the diagram is fully visible.

---

## 6. Outstanding

### Implementation and review
1. **Implement Gate 2.3** — apply the V4 hierarchy, terminology, case order, contribution model, and two-audience architecture to the existing site.
2. **Gate 2 visual approval** — review the new Intro together with the reworked content sections rather than approving the Intro in isolation.
3. **Roll the editorial language through sections 2–10** while the V4 content refactor is implemented.
4. **Audits:** V4 resolves the launch decision — omit the public route until the first complete sourced audit exists; keep the method inside How I Work / Insights.

### Evidence — see `02-EVIDENCE-REGISTER.md`
Still missing and therefore **not published**: Employee of the Month proof · Trustpilot/300+ reviews proof · defensible completed-order totals · Formula4You logo · Formula4You roadmap/user stories/QA plan · anonymized client screens · testimonials · audit research.

### Flagged, unresolved
- **Alpha Capital title and progression proof** — Ahmed states that he worked as Customer Support Specialist and was promoted after two years to Customer Manager. Drafting may use this as user-confirmed experience; documentary proof is still needed for Verified Evidence treatment and exact dates.
- **CV vs site conflict (C2)** — the approved CV states "thousands of completed orders"; the site uses the safe fallback. A recruiter reads both. Unresolved.
- **ORion** — used only as evidence of a storefront built on Formula4You, never named as Ahmed's project. The brief excludes "ORion" from V1 as a project; confirm the overlap is understood.

---

## 7. Document map

| File | Purpose | State |
|---|---|---|
| `00-STATUS.md` | **This file.** Where we are. | Current |
| `01-PLAN.md` | Phase 0/1 plan | **Historical.** Its light-theme palette and D-1…D-5 decisions were superseded at Gate 1/2.2. |
| `02-EVIDENCE-REGISTER.md` | Claims, gaps, conflicts | Current |
| `03-GATE-2-REPORT.md` | Gate 2 submission | **Historical.** Predates deployment, fonts, the merge, and the visual rework. |
| `04-PORTFOLIO-DIRECTION-V4.md` | **Current positioning, content hierarchy, scope language, routes, and implementation sequence.** | Current and binding. |
| `05-DESIGN-AND-VOICE-SYSTEM.md` | **Current visual direction, Formula4You weighting, human-voice rules, and experience-quality bar.** | Current and binding. |
| `phase-1/gate-1-creative-direction.html` | Gate 1 artefact | Historical |
| `README.md` | Setup, architecture, deployment | Current |
