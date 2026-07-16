# Ahmed Hamdy Portfolio — Phase 0/1 Plan

> ## ⚠️ HISTORICAL RECORD — superseded in part. Do not implement from this file.
>
> This is the Gate 1 submission, kept as a record of what was proposed and why.
> **For current state read [`00-STATUS.md`](00-STATUS.md).** Superseded since:
>
> | This document says | Reality |
> |---|---|
> | **Light institutional theme**, warm ivory canvas, and the §4 contrast table | **Superseded.** Gate 1 approved a **dark-leaning** palette. Every ratio was recomputed against the dark surfaces — two locked colours failed there and needed new variants. See `src/styles/tokens.css`. |
> | §3 hero: copy left, diagram right | **Superseded at Gate 2.2.** The home page opens with the **portrait beside the headline**; the diagnosis moved below it. |
> | 12 home sections | **11.** Capability Proof Map absorbed Transformation Playbooks. |
> | D-1 `/audits` | **Still open.** Gate 1 §7 decided it must not look like a populated library; whether it ships as a method page is undecided. |
> | D-2 header nav | ✅ Approved — 5 links + audience switch + one contextual CTA. |
> | D-3 palette extension | ✅ Approved — `--teal-700` / `--coral-700`. |
> | D-4 Tailwind | ✅ Approved — no Tailwind, hand-authored CSS. |
> | D-5 editorial serif | ✅ Approved — Source Serif 4, ≤1 statement per page. |
>
> §1 (positioning), §2 (capability coverage), and §6 (phases and gates) remain accurate.

**Status:** Awaiting Gate 1 approval. No implementation started.
**Authority:** `Ahmed_Hamdy_Portfolio_Master_Brief_v3.md` (source of truth) + `Ahmed_Hamdy_Codex_Master_Prompt_v3.md` (binding execution). V3 supersedes all prior briefs, prompts, prototypes.
**Repository state at audit:** `D:\portfolio` contains only source documents. Not a git repository. No prior code, config, or assets to preserve. Greenfield build.

---

## 1. Positioning — confirmed understanding

**Role (LOCKED):** Business Growth & Operations Specialist
**Supporting line (LOCKED):** Business Strategy | Operations | Customer Experience | Conversion & Product Optimization
**Location:** Alexandria, Egypt

**Core narrative (LOCKED):** Ahmed sees the business as one connected system. He turns market gaps, operational friction, and customer-journey problems into executable growth systems.

**Signature statement (LOCKED):** *"I do not optimize the symptom. I trace the system that keeps producing it."*

**The connecting principle** — the thing that stops breadth from reading as a scattered task list:
> Diagnose where the system loses value → trace the root cause → design the simplest effective intervention → measure the commercial or operational effect.

**Core decision principle (LOCKED):** Build only when the problem requires building. The best solution may be a clearer sentence, fewer fields, better ownership, an automated update, a simpler process, or no new feature at all.

### What Ahmed is NOT (positioning exclusions — enforced as a copy rule)
- Not a marketer, UI designer, customer support specialist, or "founder" alone.
- Not a visual designer or software engineer. His UI/UX strength is commercial clarity, customer behaviour, journey logic, and business requirements.
- Not a large-firm consultant; no senior executive title.
- No capability is claimed unless a project, playbook, audit, or artifact demonstrates its application.

### Evidence tiers — kept strictly distinct in schema, badge, and layout
| Tier | Meaning | Where it appears |
|---|---|---|
| **Verified real work** | Source, baseline, date range, calculation explainable | Alpha Capital (pending proof), Formula4You live status |
| **Founder-led project** | Ahmed's direct ownership | Formula4You (flagship) |
| **Anonymized client work** | Real engagement, sector-labelled, no client name | E-commerce Conversion, Commercial Growth |
| **Illustrative scenario** | Hypothetical, visibly labelled, never a historical claim | Playbook scenarios (incl. the 1,000→100 support example) |
| **Independent public audit** | Public info only, unaffiliated, disclaimed, dated | `/audits` — none publishable at launch |

`claim_status` enum implemented in content schema: `verified | user_asserted | illustrative | proposed | public_observation | confidential`.
Only `verified` may appear in a prominent metric card. This is enforced at the component level: `<MetricCard>` throws a build error on any non-`verified` claim.

---

## 2. Capability coverage verification

The user requires proof that the planned structure represents **all ten** core capabilities. Verified below. Every capability has **≥3 independent proof surfaces**; none depends on a single page.

| # | Capability | Primary proof | Secondary | Tertiary |
|---|---|---|---|---|
| 1 | **Business growth & strategy** | `/work/formula4you` — market gap → vertical strategy → business model | `/playbooks/growth-market-expansion` | `/work/commercial-growth`, home §3 system map, `/for-businesses` |
| 2 | **Operations & process improvement** | `/playbooks/operations-workflows` | `/work/formula4you` — admin ops, listing lifecycle, governance | `/work/alpha-capital`, `/work/ecommerce-conversion` (operational readiness as part of CRO) |
| 3 | **CX & customer support transformation** | `/playbooks/customer-support-cx` | `/work/alpha-capital` — contact drivers → operational insight | `/work/ecommerce-conversion` (post-purchase clarity, preventable contact) |
| 4 | **Conversion-focused UI/UX** | `/work/ecommerce-conversion` | `/playbooks/ecommerce-conversion` | `/work/formula4you` (discovery/storefront UX requirements) |
| 5 | **Customer journey optimization** | `/playbooks/ecommerce-conversion` — current→future-state journey | `/work/ecommerce-conversion` | `/playbooks/customer-support-cx` (service blueprint), `/work/commercial-growth` |
| 6 | **Product & feature strategy** | `/work/formula4you` — prioritization, feature-bloat prevention, user stories, acceptance criteria | Playbook intervention ranking (simplest non-technical → larger product change) | `/about` working method, `/for-employers` capability matrix |
| 7 | **Go-to-market planning** | `/work/formula4you` — supply-first launch sequence (4 phases) | `/playbooks/growth-market-expansion` — entry pilot, stop/scale criteria | `/work/commercial-growth`, method 30/60/90 |
| 8 | **Market-gap analysis & market expansion** | `/work/formula4you` (flagship — the gap *is* the case study) | `/playbooks/growth-market-expansion` — market-expansion diagnostic | `/audits` framework (market-entry hypotheses) |
| 9 | **Cross-functional execution** | `/work/formula4you` — coordination of design, content, technical, QA, SEO/GEO | `/work/commercial-growth` — campaign ↔ page ↔ order ops feedback loop | `/about` method stage 4, `/for-employers` |
| 10 | **AI-aware business & product decision-making** | `/playbooks/customer-support-cx` — *"leadership considers adding agents or a chatbot"* → traced to a content root cause. The decision **not** to deploy AI is the proof. | `/work/formula4you` — AI-assisted research/documentation/QA/product-planning in execution (per CV), plus build-vs-simplify gate | `/insights` category "AI, Product & Business Decisions"; `/about` automate-vs-simplify decision gate |

### ⚠ Structural finding — capability 10 needs a deliberate proof surface
The Master Brief gives "AI, Product & Business Decisions" only an **Insights category** and a **tools line** in the CV. There is no case study or playbook section that carries it. Since you named it a core capability, it must be proven, not listed.

**Proposal (no invention required — all drawn from existing approved material):**
1. Make the *chatbot-vs-content* decision in the Support & CX playbook an explicit, named decision gate rather than a passing sentence. It is already the strongest AI-judgment artifact in the brief: the disciplined answer is "fix the article, don't buy the bot."
2. Add an **"Automate / Build / Simplify"** decision gate to the Working Method (`/about`), directly extending the LOCKED core decision principle.
3. Formula4You's cross-functional execution section names AI-assisted research, documentation, QA, and product planning as *tools used*, not as a claim of AI product features.
This requires **no new claim** and no fabricated capability. Flagged for Gate 1 approval.

### Editorial balance enforcement (brief §13A)
- No more than two consecutive homepage sections may focus on the same functional domain — enforced by a lint check over the homepage section manifest.
- Across any three adjacent major sections, ≥3 distinct capability domains must appear.
- Support = one source of operational intelligence, never the lead identity.
- UI/UX = conversion, clarity, trust, operating consequence — never visual taste.
- Growth ≠ advertising alone. Operations ≠ documentation alone.

---

## 3. Sitemap and page hierarchy

### Public routes (all LOCKED by brief §07)
```
/                                      Home — positioning, audience gateway, system map, selected proof
/work                                  Case-study index
/work/formula4you                      ★ FLAGSHIP — founder-led
/work/ecommerce-conversion             Anonymized — journey, UI/UX, conversion
/work/alpha-capital                    Verified — customer evidence → operations
/work/commercial-growth                Anonymized — offer, funnel, order operations
/playbooks                             Transformation playbook index
/playbooks/customer-support-cx         Support & CX transformation
/playbooks/ecommerce-conversion        Digital buying-system transformation
/playbooks/operations-workflows        Operating model & workflow transformation
/playbooks/growth-market-expansion     Growth readiness & market expansion
/audits                                Independent strategic audits — method + standard (see decision D-1)
/insights                              Knowledge hub index
/insights/[slug]                       Article
/insights/category/[category]          Category filtering (6 categories)
/for-businesses                        Founder/company pathway + Business Diagnostic
/for-employers                         Role fit, capability matrix, proof, CV
/about                                 Story, Formula4You ownership, career shift, method, values
/contact                               Consultation request builder + direct channels
/portfolio-print?mode=career           Recruiter PDF source (noindex)
/portfolio-print?mode=business         Business capabilities PDF source (noindex)
/404                                   Custom 404
```

### Draft / excluded
```
/audits/amouage-egypt      DRAFT — unlisted, noindex, absent from nav, excluded from sitemap & both PDFs
ORion, Konfirmly           EXCLUDED from V1 entirely
```

### Generated artifacts
```
/sitemap-index.xml, /sitemap-0.xml     Drafts filtered out
/robots.txt                            Points to sitemap
/rss.xml                               Insights feed
/assets/ahmed-hamdy-cv.pdf             Approved CV download
/assets/Ahmed_Hamdy_Business_Growth_Operations_Portfolio.pdf
/assets/Ahmed_Hamdy_Business_Transformation_Capabilities.pdf
/og/*.png                              Open Graph images
```

### Header navigation — recommendation requiring approval
The brief locks **eight** primary-nav entries. Eight top-level links plus a CTA does not survive the 5-second role-clarity gate, and collapses badly at 360px.

**Recommended treatment** (keeps all 8 IA entries, all reachable at depth ≤1):
```
[Ahmed Hamdy]   Work   Playbooks   Audits   Insights   About     [◐ For Businesses / For Employers]   [CTA]
```
- **Contact** is the persistent CTA (audience-aware: *Request a Business Diagnostic* on company-facing pages, *Discuss a Role* on employer-facing pages) + full channel grid in footer + `/contact`.
- **For Businesses / For Employers** become a compact audience switch (the brief's Audience Gateway, promoted to persistent) rather than two competing nav links.
- Mobile: 5 links + audience switch + CTA in a disclosure panel.
- The switch curates labels/CTAs via `localStorage` only. **All content remains directly accessible and indexable** — no content is gated, hidden from crawlers, or duplicated per audience.

*Deviation flagged for Gate 1: this presents the 8 locked IA entries in 5 links + 1 switch + 1 CTA. If you want all eight rendered literally in the header, say so and I will.*

### Home-page sequence (LOCKED, 12 sections) + capability-balance check
| # | Section | Dominant capability domain |
|---|---|---|
| 1 | Navigation + transformation hero | — (positioning) |
| 2 | Audience gateway | — (routing) |
| 3 | One connected business-system map | Cross-functional / system |
| 4 | Selected real work | Market · Product · CX · Growth (mixed) |
| 5 | Capability proof matrix | All (map) |
| 6 | Transformation playbooks | Operations · CX · Conversion · Growth |
| 7 | Independent strategic audits preview | Market strategy — **see D-1** |
| 8 | Latest Insights + applied frameworks | Mixed (incl. AI decisions) |
| 9 | Working method + sample deliverables | Execution · measurement |
| 10 | Credibility & evidence strip | Proof |
| 11 | About / career narrative | Narrative |
| 12 | Context-aware CTA + contact | Conversion |

Balance rule satisfied: no two consecutive sections share a dominant domain.

### Page-system requirements (applied to every route)
- Every page opens with a **business question**, not a project title.
- Case studies follow: **Context → Evidence → Diagnosis → Root Cause → Decision → Rejected Alternative → Implementation → Business Effect → Artifacts → Evidence Status.** No "I did" lists.
- Playbooks follow the 10-part structure (purpose → symptoms → inputs → diagnostic model → root-cause patterns → ranked interventions → deliverables → metrics → illustrative scenario → CTA).
- Audits follow the 10-part structure with mandatory disclaimer, observation date, facts-vs-hypotheses separation, limitations, risks.
- Long pages: anchored nav + sticky project summary. Mobile preserves reasoning order; wide diagrams become stacked steps.

---

## 4. Design system and visual concept

### Concept: **From Noise to System**

Not a slogan — a construction rule applied consistently and sparingly.

**The motif:** a field of scattered signal marks — short strokes at irregular angles, varied weights, unaligned — resolving into an orthogonal node-and-line system. Left/before = noise (irregular, coral-tinted where friction is evidenced). Right/after = system (aligned to the 12-column grid, teal connections, navy nodes).

This is the *same* geometry everywhere, at different scales:
- **Hero:** the transformation plays once, 700–1200ms, resolving *around* the headline — never delaying reading.
- **Section dividers:** a "resolution rule" — a hairline that begins broken/irregular at the left and resolves to continuous at the right. Static, one per major boundary.
- **Diagrams:** every process map, root-cause tree, and journey map is drawn in this node-and-line language, so the site's decoration and its evidence are literally the same system.
- **Evidence rail:** a vertical structural line down each case study carrying Real asset · Ahmed's role · Decision · Implementation status · Metric status · Confidentiality.

**Why this is the right concept:** it makes the visual system *the argument*. A visitor who understands the picture has already understood the positioning. It is also cheap to render (authored SVG, no libraries) and degrades to a clean static diagram with reduced motion.

### Colour tokens — with measured WCAG 2.2 contrast

Locked palette, verified against the warm-ivory canvas. **Ratios computed, not assumed:**

| Token | Hex | On ivory `#F7F6F2` | Verdict |
|---|---|---|---|
| `--navy-900` Midnight navy | `#102A43` | **13.54:1** | ✅ AAA — headings, nav, evidence panels |
| `--charcoal-800` Charcoal | `#1D2A35` | **13.53:1** | ✅ AAA — body, dense information |
| `--slate-500` Slate | `#617181` | **4.64:1** | ✅ AA (thin margin) — captions/metadata ≥14px only. Fails AAA; never below 14px or at light weight. |
| `--teal-500` Signal teal | `#0B8F8A` | **3.66:1** | ⚠️ **Fails AA for normal text.** Fills, strokes, diagram connections, active states, large text (≥24px), UI borders only. |
| `--coral-500` Friction coral | `#D76555` | **3.30:1** | ⚠️ **Fails AA for normal text.** Fills, strokes, risk markers, large text only. Used sparingly. |

**Two additions required to satisfy the brief's own WCAG 2.2 AA gate.** These extend the locked palette; they do not replace it:

| New token | Hex | On ivory | Purpose |
|---|---|---|---|
| `--teal-700` | `#08716D` | **5.40:1** ✅ AA | Teal *text*, links, and button fills carrying ivory labels |
| `--coral-700` | `#B44636` | **5.02:1** ✅ AA | Coral *text* and friction labels |

> **Critical catch:** ivory text on the locked signal teal `#0B8F8A` is **3.66:1** — a primary teal button with an ivory label **fails AA**. Ivory on `--teal-700` `#08716D` reaches **5.40:1** ✅. Without this addition the brief's own Accessibility 95+ / WCAG 2.2 AA gate cannot pass. Flagged for Gate 1.
>
> *All ratios above independently recomputed from the WCAG 2.2 formula (sRGB→linear, L = 0.2126R + 0.7152G + 0.0722B, (L1+0.05)/(L2+0.05)) — not estimated.*

> **Hierarchy note:** navy (L≈0.02171) and charcoal (L≈0.02174) are luminance-identical. Heading-vs-body hierarchy therefore **cannot** rely on contrast — it must come from size, weight, and spacing. Hue separation only reads in large type. This is designed for, not discovered late.

### Typography
- **Manrope** — headings, interface, data labels. Weights 500/600/700. Self-hosted, subset.
- **Inter** — body, captions, long-form. Weights 400/500/600. Self-hosted, subset.
- **Editorial serif (optional, ≤1 use per page)** — one-line strategic statements only (e.g. the signature statement). Never in UI. Candidate: Source Serif 4 (SIL OFL). Subject to Gate 1.
- No Google Fonts CDN — self-hosted woff2, `preload`, `font-display: swap`, explicit metrics to prevent CLS.

**Scale** (Manrope headings / Inter body):
| Role | Size / line-height | Notes |
|---|---|---|
| Display | 56/60 (clamp → 36/40 mobile) | Hero only |
| H1 | 44/48 → 32/36 | One per page |
| H2 | 32/38 → 26/32 | Section |
| H3 | 24/30 | ≥24px permits `--teal-500` |
| H4 | 20/26 | |
| Body | 17/28 | Measure capped 64–72ch (~680px) |
| Small | 15/24 | |
| Caption | 14/22 | Slate floor — never smaller |

### Grid, space, shape
- 12-column desktop, max content **1280px**, text column **680px**, evidence rail as a distinct outer column.
- Spacing scale (4px base): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128.
- Radius: 10 (chips/badges) · 12 (cards, default) · 16 (large panels). Never more.
- **Elevation: hairline borders and tint fills, not shadows.** 1px `rgba(16,42,67,0.10)` borders + 2–4% navy/teal tint fills. This is the single biggest defence against the "AI template" look — shadows and glass are what make generated portfolios legible as generated.
- Breakpoints: 360 · 390 · 768 · 1024 · 1440 · wide.

### Motion
- Animation must explain **transformation, hierarchy, cause, or relationship**. If it does not improve understanding, it is removed.
- Core transitions **160–260ms**. Hero transformation **700–1200ms, once**, non-blocking.
- No continuous float, autoplay loop, parallax, or scroll hijack.
- `prefers-reduced-motion` → complete static equivalent (the resolved system state, not a blank frame).
- Never animate body copy while it is being read.
- CSS-first; Motion One only if an interaction cannot be done accessibly otherwise.

### Explicitly banned (design gate)
Dark-gradient heroes · glassmorphism · floating 3D cubes/panels · fake code · fake dashboards · meaningless charts · stock handshakes/rockets/chess/skylines/office teams · fabricated logos · invented testimonials · unverified stat cards · teal-gradient overuse · excessive rounding · huge centred paragraphs · animation added to look expensive.

### Component system
`HeroTransformation` · `AudienceGateway` · `BusinessSystemMap` · `CapabilityProofMap` · `CaseStudyCard` · `PlaybookCard` · `AuditCard` · `InsightCard` · `ProjectSnapshot` · `EvidenceRail` · `RootCauseTree` · `ProcessMap` · `BeforeAfterFlow` · `DecisionTradeoff` · `MetricCard` · `ClaimBadge` · `AnnotatedScreenshot` · `DeliverableGallery` · `StickyCaseNav` · `SourceList` · `DisclaimerPanel` · `ContextualCTA` · `ContactPanel` · `ConsultationRequestBuilder` · `StructuredMessagePreview` · `ContactChannelGrid` · `ArticleHeader` · `ArticleSourceNotes` · `RelatedContent` · `PrintSection` · `PageBreak` · `PrintEvidenceCaption` + 2 print composition modes.

All diagrams are **authored SVG** with `<title>`/`<desc>` — crawlable, accessible, zero-dependency, responsive (wide diagrams reflow to stacked steps at ≤768px).

---

## 5. Technical architecture and hosting

### Stack
| Layer | Decision | Rationale |
|---|---|---|
| Framework | **Astro 5 + TypeScript (strict)**, static output | LOCKED by brief. Zero JS by default protects CWV. |
| Content | **Content Layer collections + MDX**, Zod-validated | Types: `work · playbook · audit · insight · method · evidence-asset`. Schema enforces claim/evidence metadata at build time. |
| Styling | **Design tokens as CSS custom properties + hand-authored CSS**, `@layer`, component-scoped | **Recommend against Tailwind.** The brief permits it only if output stays intentional; hand-authored CSS is the stronger guarantee the result reads as authored, not generated. |
| Islands | **Vanilla TS custom elements** for hero transformation, diagnostic lens, audience gateway, capability map. **Preact (~4KB) only for `ConsultationRequestBuilder`** (multi-step state). | Ships no framework runtime on 95% of routes. Preact loads only on `/contact`. |
| Images | `astro:assets`, explicit dimensions, lazy below fold, AVIF/WebP | CLS + LCP protection |
| Fonts | Self-hosted subset woff2, preload | Privacy + no third-party blocking request |

### Configuration — single source of truth
`src/config/site.ts` centralizes: canonical URL · base path · author identity · contact channels · social `sameAs` · default metadata · feature flags.

**Base-path portability (hard requirement):**
- `astro.config.mjs` reads `SITE_URL` + `BASE_PATH` from env.
- Every internal link/asset goes through a `withBase()` helper. **No hard-coded absolute paths anywhere** — enforced by an ESLint rule + a CI grep gate.
- Works identically for a **user site** (`ahmedhamdy.github.io`) and a **project site** (`ahmedhamdy.github.io/portfolio`).
- Custom-domain migration later = change one config value + add `CNAME` + DNS. **Route paths never change**, so search equity is preserved.

### Deployment
- One GitHub repo → GitHub Actions (`withastro/action` + `actions/deploy-pages`) → GitHub Pages. Zero cost, no paid plan.
- Custom 404 (`404.astro` → `404.html`, which GH Pages serves natively).
- `/source-assets/` (original private evidence) is **gitignored**. Only optimized, cleared assets in `/public/assets/`. No secrets, keys, or confidential evidence ever committed.

### Contact & conversion (static-host constraint)
`ConsultationRequestBuilder` → structured fields → **visible review step** → generates a professional pre-filled message → opens WhatsApp or email.

```ts
interface ConsultationAdapter { submit(p: ConsultationPayload): Promise<Result> }
// V1: WhatsAppAdapter | MailtoAdapter   — no data stored, no third party
// Later: HttpAdapter                    — drop-in, no redesign
```
- Nothing sent to or stored by any third party.
- **Direct WhatsApp + email buttons render server-side and work with JavaScript disabled.** No dead form.
- Form values never enter analytics.

**Approved channels (from brief — used verbatim):**
WhatsApp `https://wa.me/201040020093` · Phone `+20 104 002 0093` · Email `ahmedeldep30@gmail.com` · LinkedIn `https://www.linkedin.com/in/ahmed-hamdy-growth-operations` · Facebook `https://www.facebook.com/brocopra/`

**CTAs:** *Request a Business Diagnostic* (companies) · *Discuss a Role* (employers) · *Message on WhatsApp* · *Email Ahmed*.
CTA placement follows brief rules: one restrained header CTA; case-study CTA **after** the business effect, never a popup mid-read; mobile sticky action only after meaningful scroll, never covering content.

### SEO / GEO — architectural, not bolted on
- `sitemap.xml` (drafts filtered) · `robots.txt` · RSS · canonicals · descriptive URLs · breadcrumbs · custom 404 · OG images · favicons · correct `noindex` on drafts and both print routes.
- **JSON-LD only where it matches visible content:** `WebSite`, `ProfilePage`+`Person`, `BreadcrumbList`, `Article`/`BlogPosting` (Insights), `CreativeWork` (case studies). **No** fabricated review/rating/FAQ/Organization markup.
- Search Console + Bing verification slots + launch checklist. IndexNow script prepared but **inactive** until the canonical host is stable.
- Core answers and reasoning stay in crawlable semantic HTML — never dependent on canvas, animation, client-only rendering, or text-in-images.
- CWV: minimal JS, optimized media, explicit dimensions, font strategy, no blocking hero animation.
- Future Arabic: route/component architecture supports localized routes, `hreflang`, RTL. **No machine-translated duplicates.**

### PDF system
Two print modes from one content source, exported via **Playwright** against a local preview server:
1. `Ahmed_Hamdy_Business_Growth_Operations_Portfolio.pdf` — 14–16 A4pp. Cover; positioning; capability matrix; method; Formula4You (4–5pp); e-commerce; Alpha Capital; commercial growth; playbook excerpts; evidence; contact.
2. `Ahmed_Hamdy_Business_Transformation_Capabilities.pdf` — 12–16 A4pp. Cover; problems Ahmed solves; diagnostic method; 4 playbooks; sample deliverables; Formula4You proof; Business Diagnostic; contact.

Shared tokens, **different documents** — not reordered copies; each serves a different decision. One question/conclusion per page. Clickable links embedded. Legible at 100% on a laptop **and in grayscale**. No draft audit, unverified metric, placeholder, or internal note may enter either PDF. Every page verified after export.

### Quality targets
Lighthouse ≥90 Perf / ≥95 A11y / ≥95 BP / ≥95 SEO · WCAG 2.2 AA · keyboard + touch + visible focus + reduced motion · responsive QA at 360/390/768/1024/1440/wide with zero horizontal overflow · no console errors · draft routes noindex and absent from nav and sitemap.

---

## 6. Phased implementation plan with approval gates

| Phase | Work | Gate |
|---|---|---|
| **0 — Source audit** ✅ *complete* | Brief, prompt, CV, assets read. Conflicts + missing evidence registered. | **→ GATE 0: this document** |
| **1 — Creative direction** | Design tokens; desktop + mobile wireframes for home; one high-fidelity home concept; hero transformation motion study; AudienceGateway + EvidenceRail specimens. | **→ GATE 1: Ahmed approves positioning, routes, visual language, typography, hero interaction, audience gateway. Nothing else is built first.** |
| **2 — Foundation** | Repo + git init; Astro/TS architecture; content collections + claim/evidence schema; component library; nav; responsive system; metadata; draft controls; GH Actions → Pages. | — |
| **3 — Home + Formula4You** | Full home page + flagship case study with real or clearly-marked evidence slots. Contact system. Live GH Pages deploy. Desktop/tablet/mobile previews rendered. | **→ GATE 2: Ahmed approves narrative, visual quality, Formula4You framing, evidence treatment.** |
| **4 — Supporting real work** | E-commerce Conversion · Alpha Capital · Commercial Growth. | — |
| **5 — Playbooks** | Support & CX · E-commerce · Operations · Growth/Expansion, with root-cause diagrams + illustrative labels. | — |
| **6 — Audience pathways** | For Employers · For Businesses · contextual CTAs · capability proof map · sample deliverables · full contact system. | — |
| **7 — Audit framework** | Audit structure + private draft route. **Amouage stays unpublished.** | — |
| **8 — PDF system** | Both print modes, page-break components, Playwright exports, every page verified. | **→ GATE 3: Ahmed approves both PDFs.** |
| **9 — QA + launch** | Strategic · content · credibility · design · technical · a11y · contact · responsive · print · SEO/GEO · human-review gates. | **→ GATE 4: Ahmed approves claims, copy, screenshots, contacts, CV, PDFs, visual quality. Only then deploy publicly.** |
| **10 — Search onboarding** | Search Console + Bing, submit sitemap, validate structured data, record indexing baseline. | — |
| **11 — Publishing** | First approved Insights articles + reusable editorial workflow. No bulk AI content. No AdSense. | — |
| **12 — Evidence upgrades** | Replace safe wording with verified metrics/testimonials/artifacts/audits as evidence arrives. | — |

**Nothing is built before Gate 1.** No route beyond home + Formula4You before Gate 2. Nothing is published before Gate 4.

### Documentation deliverables (Phase 2 onward)
README (setup, architecture, content types, deployment) · custom-domain migration guide · content editing guide · evidence registry · claims registry · asset guide · SEO launch checklist · Insights publishing workflow · design-system + component docs.

---

## 7. Open decisions requiring your call

**D-1 — `/audits` launches with zero publishable audits.**
`/audits` is a locked route and homepage §7 is an "audits preview", but the only audit (Amouage × Egypt) is research-concept-only and must stay noindex. The brief also wants ≤3 complete audits, each proving a different strength — none exist yet.
**Recommendation:** publish `/audits` as the **audit method and publishing standard** (the 10-part structure, the unaffiliated disclaimer, the facts-vs-hypotheses discipline, what Ahmed will and won't claim) with an honest "first audits in preparation" state. This proves judgment and rigour without fabricating an audit, and gives the route real content on day one. Homepage §7 previews the *standard*, not a fake audit. Alternative: drop §7 and `/audits` from nav until the first audit ships.

**D-2 — Header navigation.** See §3. Recommend 5 links + audience switch + CTA over 8 literal links.

**D-3 — Palette extension.** `--teal-700` / `--coral-700` for accessible text. Required to pass the brief's own AA gate. See §4.

**D-4 — Tailwind.** Recommend no. Hand-authored CSS with tokens.

**D-5 — Editorial serif.** Recommend Source Serif 4 (SIL OFL), ≤1 line per page, or drop entirely.
