# Missing Evidence & Asset Register
**Required by:** Codex Master Prompt v3 — *"Create a written Missing Evidence and Asset Register before implementation."*
**Originally audited:** 2026-07-16 · **Last reconciled:** 2026-07-16, commit `bdfa50b`
**Sources audited:** Master Brief v3 (2,850 lines, complete) · Codex Master Prompt v3 (complete) · `Ahmed_Hamdy_Business_Growth_Operations_CV_Final_Approved.docx` (complete, text-extracted) · the approved portrait (viewed) · six real Formula4You screens (each viewed before use)

**Governing rule:** *A smaller verified result is stronger than a larger unsupported result.* Missing proof produces a safe statement, never a fabricated metric.

---

## A. Priority 1 — blocks a credible launch

| # | Item | Status | Consequence / where it landed |
|---|---|---|---|
| A1 | **Formula4You live production URL** | ✅ **RESOLVED** — https://www.formula4you.com/ | Published as live and founder-led. **No scale, revenue, traffic, or supplier count inferred from it.** |
| A2 | **Formula4You screenshots** | ✅ **RESOLVED** — 6 real screens supplied | All six inspected individually and placed at the reasoning stage each proves — not a gallery. Every one answers `proves`. |
| A3 | **Formula4You logo** (SVG or transparent PNG) | ❌ **Still missing** | Case-study header + PDF covers use a text treatment. Low impact. |
| A4 | **Portrait approval** | ✅ **RESOLVED** — approved at Gate 1 §3 | Now the lead element of the home Intro, plus About and both PDFs. Source normalized to `ahmed-hamdy-portrait-approved.png` (double extension removed). |
| A5 | **GitHub account + repo + URL** | ✅ **RESOLVED** — `ahmedeldep30-ship-it` / `ahmed-hamdy-portfolio` | Project-site base path configured; deploying. Provisional until Gate 4. |
| A6 | **Alpha Capital — Employee of the Month proof** | ❌ **Still missing** | Claim is `EVIDENCE REQUIRED`. **Omitted entirely** — not softened. |
| A7 | **Alpha Capital — Trustpilot / 300+ reviews proof** | ❌ **Still missing** | Fallback in use verbatim: **"hundreds of five-star reviews"** — no number, no metric card. |
| A8 | **Alpha Capital — actual formal job title** | ⚠️ **Partially resolved** | Gate 1 §5 supplied the *case-study framing* ("Operational, Growth & Customer Experience Contributions") and confirmed "Business Operations Specialist" must not be presented as a documented title. **The actual contractual title is still unrecorded.** Needed before the Phase 4 case study. |

---

## B. Metrics — evidence required before publication

Every item below is `EVIDENCE REQUIRED`. Each needs **source + baseline + date range + calculation**, or the approved fallback is used verbatim.

| Claim | Publish only with | Approved fallback if not evidenced |
|---|---|---|
| **300+ verified five-star reviews** | Trustpilot profile/screenshot or equivalent | "hundreds of five-star reviews" |
| **Employee of the Month** | Certificate / announcement / manager confirmation | Omit |
| **Thousands of completed orders** | Defensible aggregate + explanation + role + whether collective | *"Supported high-volume retail initiatives by improving offer structure, purchase journeys, campaign-to-page consistency, and order handling before acquisition spend was scaled."* |
| **Improved conversion** | Baseline + period + source | *"Simplified the journey and strengthened conversion drivers."* |
| **Reduced cost or time** | Explicit calculation | Describe the eliminated step / standardized process |
| **Formula4You scale** (suppliers, listings, sign-ups, traffic, transactions, revenue, engagement) | Documentation | **Omit entirely.** Describe designed user groups + current platform capability; do not imply active scale for every group. |
| **Client company names** | Written permission | Sector + business type only ("Multi-Product Retail Websites", "apparel and consumer-product brands") |
| **Testimonials** | Real wording + permission | **Omit.** Testimonial copy will never be generated. |
| **Exact conversion lift / CPO / revenue / ROAS / abandonment reduction** | — | **Never used without proof.** |

---

## C. Conflicts found between sources — need your decision

### C1 — Alpha Capital job title *(highest-impact conflict)*
- **CV says:** *"Business Operations & Customer Experience Improvement Contributions | Remote, United Kingdom"*
- **Brief §11 says:** *"Operational and customer-experience contribution, **not a claim that Business Operations was the formal job title**."*
- **Prompt says:** *"Do not imply Business Operations was Ahmed's formal title if it was not."*

The approved CV's own heading reads as a title line. The brief forbids the site from implying it. **What was the actual formal title?** The site will use contribution framing regardless; I need the real title on record so the site and the downloadable CV don't contradict each other in front of the same recruiter.

### C2 — "Thousands of completed orders" appears unqualified in the approved CV
- **CV, Selected Business Impact:** *"Contributed to retail and e-commerce initiatives that collectively generated thousands of completed orders…"*
- **Brief §14:** `EVIDENCE REQUIRED` — use only with a defensible aggregate; otherwise the safe fallback.

The CV is downloadable **from** the site. If the site uses the safe fallback while the linked CV states the claim outright, a recruiter reads both. Three options:
1. Supply the evidence → both use the claim. *(Best.)*
2. Accept the split: CV is Ahmed's own asserted document; site holds the stricter line. *(Defensible but visibly inconsistent.)*
3. Revise the CV to the fallback wording. *(Requires re-approving a "Final Approved" document.)*
**Recommendation: 1, else 2.** Your call.

### C3 — Same pattern, smaller: `300+ reviews` and `Employee of the Month` are stated in the CV but gated on the site.
Resolved automatically by supplying A6/A7. Otherwise same three options as C2.

### C4 — Public email vs account email
✅ **RESOLVED.** Confirmed at Gate 1 §4: **`ahmedeldep30@gmail.com`** is the published address. In use across the site, JSON-LD, and both PDFs when they ship.

### C5 — `/audits` has nothing publishable at launch
⏳ **Still open.** Zero eligible content (Amouage is research-concept-only and must stay noindex). Gate 1 §7 decided the Strategic Audit Method may be reached via Insights/Playbooks and **must not be presented as a populated audit library** — implemented. The remaining question is whether `/audits` ships as a method page or waits for the first real audit. See Plan **D-1**.

### C6 — Capability 10 ("AI-aware business and product decision-making") had no proof surface
✅ **RESOLVED.** Gate 1 §11 approved the **Simplify → Automate → Build** framework. Implemented on the home page with all ten evaluation criteria, plus Intervention Compression, in which the chatbot is rejected on evidence. The restraint is the proof. Nothing invented.

### C7 — ORion appears in a published screenshot *(new)*
The customer-view storefront is branded **ORION**, and the Master Brief §01 excludes "ORion" from V1 as an Ahmed *project*. Gate 1 §5 / Gate 2 approved it **solely as evidence of a storefront built through Formula4You**. Implemented accordingly: ORion is **never named anywhere in the site source**; the caption reads *"a brand storefront created through Formula4You… branding belongs to the merchant, not the platform."* Flagged so the overlap is a knowing decision, not an oversight.

### C8 — The "90%" supplier-onboarding claim *(new)*
The supplied filename asserts *"~90% of the essential supplier information"*. **Not published.** No baseline or calculation exists behind it, so it is recorded `user_asserted` with a fallback, and the case study publishes only what the screen itself shows — **two steps, seven fields, five required** — and states out loud why it will not publish the other number.

---

## D. Priority 2 — strengthens case studies (not launch-blocking)

| Item | Status | Use |
|---|---|---|
| Formula4You market map / framing notes | ❌ | Market-gap artifact (§09 required evidence) |
| Formula4You roadmap, feature priorities, user stories, acceptance criteria | ❌ | Product-strategy proof (capability 6) — **the single best evidence for the product-thinking gap** |
| Formula4You QA plan / SEO-GEO plan | ❌ | Cross-functional execution proof (capability 9) |
| Anonymized e-commerce before/after screens | ❌ | Journey map + annotated interface |
| Checkout/ordering flow showing removed steps | ❌ | Before/after process morph |
| Behavior-trigger offer logic diagram | ❌ | The exit-intent/margin-guardrail CRO artifact |
| Paid-campaign + completed-order evidence with date range | ❌ | Would resolve C2 |
| Anonymized customer objection / issue patterns | ❌ | Alpha Capital issue taxonomy |
| Recommendations from a manager, founder, developer, or designer | ❌ | Only permissible route to a testimonial |
| **Which playbook scenarios are real vs experience-based composite vs illustrative** | ❌ **Decision needed** | Brief §21.9. Default: **all illustrative**, visibly labelled. |
| Verified real support case to replace/supplement the 1,000→100 scenario | ❌ | Until then it stays **visibly labelled illustrative** |
| Fresh audit research (sources, observation dates, screenshots, market evidence) | ❌ | Nothing publishable in `/audits` |

---

## E. Confirmed available

| Asset | Status |
|---|---|
| Master Brief v3 | ✅ Read complete (2,850 lines) |
| Codex Master Prompt v3 | ✅ Read complete |
| Approved CV (`.docx` + `.pdf`) | ✅ Read complete → ships to `/assets/ahmed-hamdy-cv.pdf` |
| Portrait `صورتي.png` | ⚠️ Present, **approval pending** (A4) |
| WhatsApp `https://wa.me/201040020093` | ✅ Approved |
| Phone `+20 104 002 0093` | ✅ Approved |
| Email `ahmedeldep30@gmail.com` | ✅ Approved (confirm C4) |
| LinkedIn `.../in/ahmed-hamdy-growth-operations` | ✅ Approved (unverified as live) |
| Facebook `.../brocopra/` | ✅ Approved (unverified as live) |
| Formula4You founder + live status | ✅ LOCKED as publishable claim — **but see A1** |
| Career narrative, positioning, all copy | ✅ Supplied in brief |
| All four case studies, four playbooks | ✅ Structure + content supplied |
| Excluded from V1 | ✅ ORion, Konfirmly — not built |

---

## F. What I will do when evidence is missing

1. **Use the exact approved fallback wording** from the brief. Never a softened invention.
2. **Ship the evidence slot visibly empty** rather than fill it. No fake screens, dashboards, logos, testimonials, or historical interfaces.
3. **Label every illustrative scenario unmistakably** — it can never be mistaken for a client result.
4. **Omit rather than imply.** No metric card without `claim_status: verified`.
5. **Register every gap here** and surface it at the relevant gate, not at launch.

---

## G. Outstanding — current

Gate 1's four blockers are all resolved (A1 URL · A5 GitHub · A4 portrait · C4 email), and
Gate 1 §6 confirmed the evidence-status system stays enforced with the safe wording used
consistently until proof arrives.

**Still needed — each currently costs a real claim:**

| # | Item | What it unlocks |
|---|---|---|
| 1 | Employee of the Month proof *(A6)* | Currently **omitted entirely** |
| 2 | Trustpilot / 300+ reviews proof *(A7)* | Unlocks the number; today it reads "hundreds of five-star reviews" |
| 3 | Defensible completed-order totals *(B)* | Unlocks the claim and resolves **C2** |
| 4 | Alpha Capital contractual job title *(A8)* | Blocks the Phase 4 case study |
| 5 | Formula4You logo *(A3)* | Low impact — text treatment in use |
| 6 | Formula4You roadmap / user stories / QA plan *(D)* | **The single best evidence for the product-strategy claim** |
| 7 | Anonymized client screens, campaign evidence, objection patterns *(D)* | Phase 4 case studies |
| 8 | Recommendations from a manager / founder / developer *(D)* | The only permissible route to a testimonial |
| 9 | Audit research *(D)* | Nothing publishable in `/audits` — see **C5** |
| 10 | Playbook scenarios: real / composite / illustrative *(D)* | Default remains **all illustrative**, visibly labelled |

**Decisions still open:** **C2** (CV vs site conflict) · **C5 / Plan D-1** (`/audits` treatment).

**Governing behaviour, unchanged:** where evidence is missing the approved fallback is used
verbatim, the evidence slot ships visibly empty rather than filled with invention, and the
Formula4You case study publishes each held-back claim **next to the fallback that replaced
it** — so the omission is visible rather than quietly absent.
