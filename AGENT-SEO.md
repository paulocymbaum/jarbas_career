# AGENT-SEO — Strategy: agents & robots finding `/freelance`

**Question this answers:** when a human asks an AI agent (ChatGPT, Claude, Perplexity, Gemini,
MCP tooling) *"find me a freelance developer for modern web & AI products"*, or a crawler robot indexes the
web — how does `/freelance` get found, understood, extracted and recommended?

**Date:** 2026-11-15 · **Page:** `/freelance` (+ parity items on `/`)

---

## 1. Two audiences, two optimisation models

| Audience | Examples | How they read the page | What makes them recommend/quote it |
|---|---|---|---|
| **Indexer robots** | Googlebot, Bingbot, Applebot | Render JS (Google) or don't (Bing partially); index text, links, structured data | Keywords/entity match, canonical cleanliness, sitemap, external links |
| **AI crawlers** (training/RAG corpora) | GPTBot, ClaudeBot, PerplexityBot, Google-Extended, cohere-ai, Diffbot, Bytespider | **Fetch raw HTML, no JS execution**; chunk by headings; store for retrieval | Self-contained, quotable passages; explicit entity + offer statements |
| **Answer agents** (live retrieval) | ChatGPT search, Perplexity, Copilot, Claude web tools, MCP fetch | Fetch page (or its markdown), extract structured facts, cite sources | Structured data (schema.org), FAQ/offer extraction, availability + contact clarity, third-party corroboration |

**The critical asymmetry:** AI crawlers and most live-retrieval agents **do not execute
JavaScript**. Today `/freelance` is client-rendered: the raw HTML contains head metadata +
JSON-LD but the body content (services, offers, skills, FAQ answers) renders only in a browser.
**To Google you exist; to the agent ecosystem you are a business card without the business.**

---

## 2. The #1 structural move — prerender the page at build time

Ship **static, fully-populated HTML** in `dist/freelance.html` so every fetcher (no-JS crawlers,
LLM extractors, link-preview bots) sees the entire offer without executing anything.

**Spec — `scripts/prerender.ts`** (Playwright is already a devDependency):

1. Run **after** `vite build` (`npm run build` = build:content → build:resumes → tsc → vite build → prerender).
2. Launch headless Chromium against `dist/freelance.html` (file:// with the dist base, or via
   `vite preview`), `waitUntil: "networkidle"`.
3. Strip the `<script type="module">` tags (JS not needed in the artifact), keep head + DOM.
4. Serialize `document.documentElement.outerHTML` → write back to `dist/freelance.html`.
5. Same treatment optional for `dist/index.html` (main CV has the same CSR limitation).

**Acceptance:** `curl dist/freelance.html | grep "Sound familiar?"` succeeds; `curl | grep RAG`
returns services content; WAVE/reader tools can parse it; no-JS browser shows the full offer.

**Zero risk to UX:** visitors still get the animated React build (hydration over static HTML is
not required — the script tags are stripped, browsers show the static DOM; interactive build is
served by the same file for JS-capable agents because we only strip the module script from the
*artifact copy* — decision below).

> Implementation decision to make: **option A** — strip scripts (fully static page; interactions
> like showcase/toggle stop working) vs **option B — keep scripts** (React re-renders on top;
> static DOM visible to no-JS fetchers, hydration doubles the paint). For an agent-facing page:
> **option B** (scripts kept, static DOM present) is the safe default; option A only if we split
> a dedicated no-JS mirror.

---

## 3. Shipped today (this pass)

1. **`public/robots.txt`** — explicit `Allow: /` for GPTBot, OAI-SearchBot, ChatGPT-User,
   ClaudeBot, PerplexityBot, Google-Extended, Applebot(-Extended), cohere-ai, Diffbot.
   (The blanket `*` already allowed them; the explicit list documents intent and future-proofs.)
2. **`meta robots: index, follow, max-image-preview:large, max-snippet:-1`** on `freelance.html`
   (explicit indexing statement agents parse from head).
3. **`FAQPage` JSON-LD** on `freelance.html` — the 4 client questions + answers as structured
   `Question/AcceptedAnswer` entities. This is prime agent-extraction material: "how much does a
   freelance developer cost / how does handoff work" map directly to these answers.

---

## 4. On-page agent signals (next pass — copy & schema)

| Signal | Status | Action |
|---|---|---|
| Entity consistency (`sameAs`: GitHub, LinkedIn) | ✅ both pages | keep `sameAs` in sync with any new profile (Upwork/Cal) |
| Machine-readable offers (`makesOffer` ×5) | ✅ `/freelance` | add `areaServed: "Worldwide"`, `availableLanguage: [en, pt, es]` |
| Explicit availability | ✅ badge + process note | add `availability` statement in JSON-LD (`hoursAvailable`/text) once slots model exists |
| Contact machine-readable | ✅ email in JSON-LD | add **`contact.vcf`** (vCard) at `/your-slug.vcf` + reference in `llms.txt` — agents love a downloadable contact |
| Q&A phrasing (how agents chunk) | ✅ FAQPage + FAQ section | extend FAQ with query-phrased items: "Can you build a RAG pipeline on my data?", "Do you work with Early access startups?" |
| Freshness | ❌ | add `datePublished/dateModified` to JSON-LD (inject from build timestamp) |
| Rate signal | ⏳ owner decision (REVAMP §3.3) | `priceRange: "$$"` or a range in FAQ — the #1 field agents filter by |

---

## 5. `llms.txt` + markdown mirror (the agent-native surface)

The emerging `llms.txt` convention is a **markdown sitemap for LLMs** at the site root, plus a
full markdown mirror of key pages. Both can be **generated from `freelanceContent`** at build
time (single source of truth, zero drift):

> **Status:** this section is the approved spec for rollout Phase 2 (see §8). The generator
> (`scripts/generate-agent-files.ts`) and the output files (`public/llms.txt`, `public/freelance.md`)
> are **not yet implemented** — Phase 2 is pending.

**Spec — `scripts/generate-agent-files.ts`** (runs after `build:content`):
- `public/llms.txt`:
  ```
  # Your Name — Freelance Developer

  > Freelance developer and consultant (Your City, UTC−3, remote worldwide).
  > RAG pipelines, AI agents, React/TypeScript apps, FastAPI APIs, automation. Fixed-scope,
  > weekly demos, full handoff. Contact: you@example.com

  ## Services
  - [AI & LLM Features](https://<domain>/freelance): …one-liners per service…
  ## Engagement
  - [How it works](https://<domain>/freelance#process): …
  ## FAQ
  - [Pricing](https://<domain>/freelance#faq): …
  ```
- `public/freelance.md`: full markdown mirror of hero + services (with deliverables) + skills +
  process + FAQ + contact — the page an agent can read in one fetch.
- Rebuild on every `build:content` run; add both lines to `robots.txt` Sitemap TODO.

**Why:** agents that fetch `/llms.txt` get a clean, citation-ready brief without parsing HTML at
all — the lowest-friction path from "agent asked" to "Your Name recommended".

---

## 6. Off-page corroboration (the lever agents weigh most)

Agents cross-check claims against third-party sources before recommending. Highest-leverage
actions, in order:

1. **GitHub profile README** (`your-username/your-username`): link `/freelance` with the same
   positioning line + availability. GitHub raw content is heavily RAG'd.
2. **LinkedIn**: add the production URL as the profile "Website"; keep headline aligned with the
   H1 claim (freelance developer + AI, fixed scope).
3. **Upwork profile** (already curated in the recruitment pack): mirror the services one-liners.
4. **Directories/communities** where clients ask for professionals: Concierge-style AI dev
   directories, Brazilian freelance registries, local tech directories (Your City).
5. **Citation-worthy artifacts**: the MCP/Pixelanea/Praxis repos get a one-line "Hire the author"
   footer linking `/freelance` — repos are the strongest third-party corroboration you control.

> Consistency rule: the same name, title, timezone, and contact everywhere. Agents reconcile
> entities across sources; contradictions lower recommendation confidence.

---

## 7. Measurement

- **Umami** already splits pages by URL and tracks `outbound_click` destinations
  (`schedule`/`brief`) — watch these as the agent-conversion signals. Add a saved view filtering
  referrers `chat.openai.com | perplexity.ai | claude.ai | copilot.microsoft.com | gemini.google.com`
  to measure AI-referred sessions (Umami reports referrers natively).
- **Prompt tracking (manual, monthly):** run a fixed prompt battery across ChatGPT/Perplexity/
  Claude — *"freelance developer Your City"*, *"hire freelance developer"*, *"full-stack
  freelancer AI integrations remote LATAM"* — and log whether `/freelance` is cited. This is the
  GEO KPI.
- **GSC**: after domain + sitemap land, watch queries containing "freelance", "developer",
  "RAG developer" for `/freelance` impressions.

---

## 8. Rollout

| Phase | Deliverable | Depends on |
|---|---|---|
| ✅ Done | robots.txt AI allows · meta robots · FAQPage JSON-LD | — |
| ✅ Done | **Prerender pipeline** — `scripts/prerender.ts` wired into `npm run build` (after `vite build`): renders `dist/freelance.html` + `dist/index.html` in headless Chromium and writes the fully-populated DOM back (option B — module scripts kept, React re-hydrates for visitors). External requests (umami/fonts) aborted during prerender so analytics stay unpolluted and runs are offline-safe. Best-effort: failures warn and exit 0, never breaking a deploy. | — |
| 2 | `llms.txt` + `freelance.md` generator + vCard | Phase 1 wiring (or standalone static) |
| 3 | FAQ expansion with query-phrased items + availability/`dateModified` in JSON-LD | copy pass |
| 4 | Off-page corroboration sweep (GitHub README, LinkedIn, repos footers, directories) | owner actions |

**Verification (2026-11-15):** prerendered `dist/freelance.html` = 96.3 kB (was 4.86 kB CSR shell);
`dist/index.html` = 357.4 kB (was 3.27 kB). Content grep checks pass (services deliverables,
outcomes, ICP line, objection pains). `curl <host>/freelance` without JS now serves the full
offer to every AI crawler, answer-engine fetcher and link-preview bot.

**Acceptance (end state):** `curl <domain>/freelance` (no JS) shows the full offer ·
`curl <domain>/llms.txt` returns the agent brief · FAQPage validates in Rich Results Test ·
fixed prompt battery cites `/freelance` in ≥1 of the 3 major engines · Umami shows first
AI-referrer sessions hitting `outbound_click brief`.

