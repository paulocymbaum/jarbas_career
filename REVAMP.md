# REVAMP — `/freelance` Landing Page

**Role:** UX/UI review of the Chris Voss critique (`docs/freelance-page-critique-chris-voss.md`),
cross-checked against the founder-operator response (`Cross-Critique.md`).
**Scope:** decide what to adopt, reshape, or reject — with implementation specs.
**Source of truth for copy:** `src/content/freelance.ts` · **Page:** `src/pages/FreelancePage.tsx`
**Constraints:** keep the deterministic SEO audit at 100 (`scripts/lib/scoring/seo-freelance.ts` scores
`freelance.html` head + `freelanceContent` fields); keep light/dark themes, analytics IDs, and the
DB-driven stacks flow intact.

---

## 1. Triage — Voss recommendation × UX verdict

| # | Voss recommendation | UX verdict | Why |
|---|---|---|---|
| 1 | Accusation Audit paragraph right under the hero | **Adopt, reshaped** | Objection-handling raises trust, but a wall of negative copy above the value props breaks the 5-second scan and punishes warm visitors (referral/LinkedIn traffic). Use a compact 3-bullet "sound familiar?" block placed *after* the proof strip, not a paragraph above services. |
| 2 | Mirror the buyer's situation (pain-echo line) | **Merge into #1** | Same job as the audit; two negative blocks = double negativity. One block, three mirrored bullets, one reassurance line. |
| 3 | Calibrated question in contact ("What does done look like…") | **Adopt, as form microcopy** | As static prose it does nothing. Implemented as a *prefilled mailto* (subject + 3-question body template) it guides the brief quality with zero backend. |
| 4 | Anchor price in FAQ ("$Xk–$Yk per milestone") | **Adopt, business decision pending** | Price transparency is standard best practice for freelance landing pages (filters unqualified leads, cuts "how much?" emails). Blocked only on the owner's comfort/real numbers. Drop the "used car vs junior hire" metaphor — gimmicky, culturally unstable; a plain range reads calmer. |
| 5 | Unbury the teaching decade (Black Swan) | **Adopt, reframed** | Strongest differentiator for the real buyer fear ("brilliant engineer who can't communicate"). Belongs in the **Process** section (empathy proof where logistics are promised), 2 sentences max — not as a new "About" section that lengthens the page. |
| 6 | Translate AI-card jargon into outcomes | **Adopt, hybrid format** | Non-technical buyers need outcomes; technical buyers scan for keywords (RAG, MCP, LangChain). Solution is term → outcome pairing, *not* removing the terms: `**Context engineering** — your AI stops hallucinating because we control exactly what it reads.` |
| 7 | Rename email CTA to a deliverable promise; promote Calendly to primary | **Adopt, reshaped (rev. 2 — cross-critique §4)** | The call is the conversion event, so Calendly goes primary. But the mailto label is **"Start the brief"**, not "Get a fixed-scope plan" — free written plans attract plan collectors. See §3.5. |

---

## 1.1 Rejected / deferred (with reasons)

| Idea | Decision | Reason |
|---|---|---|
| Loss-framed headline replacement ("This is the other version…") | **Reject for now** | The current gain headline passes the 5-second test and pairs with the accent span. Negativity belongs in the audit block (#1), not in H1. Revisit only if conversion data says the hero underperforms. |
| Testimonials / client quotes | **Adopted as P1 (rev. 2 — cross-critique override)** | One anonymized stakeholder line ("shipped releases on our core banking migration") is the highest conversion-per-word item on the page, and consent is a single Slack message away. Spec in §3.8; blocked only on owner sourcing + consent. |
| Live chat widget | **Reject** | Ownership cost and reply latency contradict the "reply within one business day" promise; async channels already covered. |
| Guarantee ("miss a demo → week free") | **Park — owner decision** | Powerful loss-reversal, but it's a legal/ops commitment, not a design choice. Drafted in §3.6 as optional. |

---

## 2. Information architecture after the revamp

```
Nav (sticky) · Hero (gain frame + photo + CTAs) · Proof strip
  → Services (flagship AI card wide)
  → Objection block (NEW, compact)      ← Voss #1+#2
  → Work (Commercial engagements band + 7 products)
  → Process (adds the teaching decade)  ← Voss #5
  → FAQ (adds pricing anchor answer)    ← Voss #4
  → Contact CTA (calibrated mailto)     ← Voss #3+#7
Footer
```

Rationale: services before objections keeps the positive frame first; the objection block
lands *after* proof strip + services (buyer already saw value, now handles doubt) and
*before* work/process (where trust is cashed). FAQ stays adjacent to the final CTA.

---

## 3. Implementation spec

### 3.1 Objection block (Voss #1 + #2) — NEW compact section

- Placement: own thin section (`id="objections"`, not in nav) between Services and Work.
- Layout: bordered panel, `max-w-3xl` centered — visually quieter than services cards.
- Copy (goes to `freelanceContent.objections`, new field):
  - Title: `Sound familiar?`
  - Bullets (3, mirrored pains):
    - `The last freelancer ghosted at 70% of the project.`
    - `Hours you couldn't trace, demos that died on Monday.`
    - `An AI feature that worked until a real user touched it.`
  - Reassurance line: `Every engagement here is fixed-scope, demo'd weekly, and handed off with the repo, docs, and tests. That's the whole pitch.`
- SEO note: text lives in `freelanceContent`; the audit reads services/skills/engagement/cta
  fields, so no floor impact either way. Keep ≥1 instance of "fixed-scope" in page text (already present).

### 3.2 Process section gains the teaching decade (Voss #5)

- Replace/extend the engagement `note` (rendered as the section subtitle):
  `Remote from Your City (UTC−3). English, Portuguese, and Spanish. Fixed-scope projects and monthly retainers. Before engineering: a decade teaching and running a school — which is why stakeholder fear and moving requirements are the calm part of the job.`
- No new section; no layout change.

### 3.3 FAQ — pricing anchor (Voss #4)

- Rewrite answer 2 in `freelanceContent.faq`:
  `Most fixed-scope engagements land between $[owner: range] per milestone — agreed in one call, before you owe anything. No hourly meters, no surprise invoices.`
- Marked `[owner]` until real numbers are confirmed; ship only with real values (never fake ranges).
- Rewrite Q3/Q4 as No-oriented (Voss-style; answers stay concrete):
  - `Would it be unreasonable to expect weekly demos and a clean handoff?` → current Q3 answer.
  - `Is a retainer out of the question for ongoing work?` → current Q4 answer.

### 3.4 AI card — term → outcome pairing (Voss #6)

- `deliverables` become `{ label, outcome? }[]` in `freelanceContent.services` (card renders the
  outcome as a muted second line — backwards-compatible with plain strings where absent).
- AI & LLM card items:
  - `RAG pipelines & semantic search` → `answers grounded in your documents, not vibes`
  - `Agent architecture & agent tooling (LangChain / LangGraph, MCP)` → `agents that use the right tool instead of guessing`
  - `Prompt & context engineering` → `your AI stops hallucinating because we control what it reads`
  - `Harness engineering & quality gates (EvalGates, agentic SDLC)` → `nothing ships if it violates the architecture — gates fire first`
  - `Multi-provider LLM integrations (OpenAI, Claude, Gemini, OpenRouter)` → `no vendor lock-in; fallbacks when a provider has a bad day`
- Other cards: outcomes only where they add clarity (Automation: `manual work deleted, not moved`).

### 3.5 CTA ladder (Voss #7 + #3 · revised by cross-critique §4)

- Nav + hero: **primary = "Schedule a call" (Calendly)**; secondary = **"Start the brief"** (mailto).
- Final CTA section: same order; LinkedIn tertiary.
- Mailto gets the calibrated template (no backend needed):
  - Subject: `Freelance project — what does done look like?`
  - Body template (URL-encoded):
    1. `What are you building, and for whom?`
    2. `What does "done" look like in 8 weeks?`
    3. `What does it cost you if it ships late?`
  - Preserve `trackOutbound("email", …)`; analytics id `freelance-mailto-plan`.
- **Rev. 2 — cross-critique override:** the label is **"Start the brief"**, NOT
  "Get a fixed-scope plan". Free written plans attract plan collectors (2–4 unpaid hours
  per lead, and leads who won't take a 30-minute call will happily take the free doc).
  Briefs are cheap to read; plans are expensive to write. Rule: unpaid deliverable work
  only after voice contact.
- Add one line above the email in the Contact panel:
  `Three questions, one email — and a straight answer on whether this is a fit.`

### 3.6 Optional (parked, owner decision)

- Loss-reversal guarantee line under the final CTA:
  `If I miss a weekly demo window, that week is free.` — needs owner sign-off (ops/legal) before shipping.
- Honest scarcity alternative (cross-critique §10): `1 slot open for Q1 2027.` on the hero badge —
  the strongest genuine urgency device available, and also an ops commitment; same sign-off rule.

### 3.7 ICP line under the hero (cross-critique §6, P0)

- One line directly under the hero CTAs:
  `Built for founders who need it shipped, and CTOs who need it to survive their review.`
- Style: `text-sm text-muted-foreground` — quiet and qualifying, not a badge.
- Why: the page serves two ICPs with different fears; the line makes each self-select
  (founders → objection block + teaching decade; CTOs → stack keywords + governance band).

### 3.8 One anonymized stakeholder quote (cross-critique §8, P1)

- Single line rendered near the Commercial engagements band:
  `"Shipped releases on our core banking migration." — Engineering lead, YourClient | YourClient (YourClient)`
- Blocked on owner sourcing + consent; ship nothing invented. Format: quiet quote panel,
  no photo needed at v1.
- Highest conversion-per-word change available; do this before any further copy passes.

### 3.9 Differentiation line vs. agency / marketplace (cross-critique §7, P2)

- Fold into the Objection block reassurance (§3.1) or the Services subtitle:
  `Agency-grade process — fixed scope, gates, docs — without agency overhead or agency timelines.`
- The Commercial engagements band already *shows* the process; this line only names it.

### 3.10 Instrumentation baseline (cross-critique §9, P2)

- Tag CTAs distinctly in Umami **before** further copy swings: `schedule` (Calendly) vs
  `brief` (mailto), segmented by referrer (LinkedIn = warm, organic = cold).
- Two-week baseline decides whether the objection-block placement holds and whether the
  hero headline experiment is ever needed.
- Acceptance: two labelled events visible in Umami; no PII beyond what Umami already collects.

---

## 4. Explicitly not changing

- Hero headline (gain frame stays; the objection block carries the loss frame).
- Skills/work/proof-strip structure (recently rebuilt with the commercial-first curation).
- SEO scoring model — audit stays at 100; new copy fields are additive and remove no scored text.
- Theme system, tokens, analytics conventions (`freelance-*` IDs), DB-driven stacks flow.

---

## 5. Acceptance criteria

- [ ] Objection block renders between Services and Work with 3 mirrored pains + reassurance line.
- [ ] Process subtitle includes the teaching-decade sentence (contrast passes in light + dark).
- [ ] FAQ shows a real price range (owner-confirmed) + 2 No-oriented questions.
- [ ] AI card shows term → outcome pairs; keywords (RAG, MCP, quality gates) still present for technical scanning.
- [ ] Primary CTA is Calendly in nav, hero, and final panel; mailto reads "Start the brief" with the 3-question body template; analytics events fire.
- [ ] ICP line visible under the hero CTAs (§3.7).
- [ ] Anonymized stakeholder quote rendered near the Commercial engagements band — only after owner sourcing + consent (§3.8).
- [ ] Umami records separate, labelled events for `schedule` vs `brief` CTAs (§3.10).
- [ ] `npm run audit:content` → freelance SEO ≥ 99 (floor), target 100 · `npm test` 61/61 · `tsc -b` clean · `vite build` OK · visual pass light + dark, mobile ≥ 360px.

## 6. Open questions for the owner

1. Real price range per milestone (or a "starting at $X") to unblock §3.3 — nothing ships with invented numbers.
2. Approve the optional demo-guarantee line (§3.6)?
3. Keep "Start the brief" as a mailto (no backend), or move to a tiny form provider later?
4. Source + consent for one anonymized stakeholder quote (§3.8) — highest conversion-per-word item.
5. Add honest scarcity to the hero badge ("1 slot open for Q1 2027")? (§3.6)

---

## 7. Merged priorities (Voss × UX × founder)

Consensus sequence across all three documents — ship in this order:

| Priority | Item | Origin | Spec |
|---|---|---|---|
| P0 | FAQ price range + "starting at" on a service card | Voss #4 + cross-critique §1 | §3.3 |
| P0 | ICP line under the hero | Cross-critique §6 | §3.7 |
| P1 | Objection block ("Sound familiar?", compact placement) | Voss #1+#2, reshaped by UX | §3.1 |
| P1 | Teaching decade in the Process subtitle | Voss #5 | §3.2 |
| P1 | One anonymized stakeholder quote | Cross-critique §8 | §3.8 |
| P2 | AI card term → outcome pairs | Voss #6 | §3.4 |
| P2 | Calibrated mailto as "Start the brief" | Voss #3, revised by cross-critique §4 | §3.5 |
| P2 | Differentiation line vs. agency/marketplace | Cross-critique §7 | §3.9 |
| P2 | Umami CTA segmentation → 2-week baseline | Cross-critique §9 | §3.10 |
| Park | Demo guarantee / honest scarcity slot | Owner decision | §3.6 |

Dependency notes: §3.3 and §3.8 are owner-blocked (numbers, consent). Everything else is
unblocked and touches only `src/content/freelance.ts` + `src/pages/FreelancePage.tsx` —
no schema, no build-pipeline, no audit-model changes.


