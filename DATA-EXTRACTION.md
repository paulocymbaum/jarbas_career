# DATA-EXTRACTION — how agents & analytics read this site

**Question this answers:** once the site is deployed, *what makes it readable —
and measurable — by machines?* Crawlers, AI agents (ChatGPT, Claude, Perplexity,
Gemini, MCP tooling) and analytics all consume the same deployed artifact. This
doc explains that structure, why it exists, and where each piece is operated.

**Companion docs:** deploy → [VERCEL.md](./VERCEL.md) · agent-visibility strategy
→ [AGENT-SEO.md](./AGENT-SEO.md) · event/analytics parity review →
[docs/analytics-umami-review.md](./docs/analytics-umami-review.md).

---

## Why this structure matters

A portfolio that only humans can read caps its own reach. The same page is now
consumed by three audiences, and each one reads it differently:

1. **Recruiters & clients (humans)** — fast static HTML, scan in 5 seconds.
2. **Crawlers / ATS** — no JavaScript execution; they read the **prerendered**
   HTML, `<head>` metadata and JSON-LD structured data.
3. **AI agents (the new entry point)** — when someone asks ChatGPT or Perplexity
   *"find me a freelance developer for web & AI products"*, the agent fetches
   pages, extracts entities and **recommends**. It can only recommend what it can
   extract: explicit `Person` / `FAQPage` entities, a `llms.txt` summary, and a
   fully-rendered DOM with no JS gate.

That is the point of this structure: **every claim on the page is duplicated as
machine-readable data, from one source of truth**, so any extraction — human,
robot or LLM — tells the same story.

## The pipeline (one artifact, three readers)

```
SQLite (single source of truth)
  → npm run build:content     typed content
  → tsc + vite build          SPA bundle
  → npm run prerender         headless Chromium renders the SPA back into
                              dist/index.html + dist/freelance.html
  → Vercel deploy             static output, CDN, custom domain (VERCEL.md)
```

The prerender step (see `scripts/prerender.ts`) is what closes the loop: AI
crawlers and answer engines **do not execute JavaScript**, so the CSR build alone
would look empty to them. Prerendering bakes the fully-populated DOM into the
deployed HTML — best-effort by design (a deploy never breaks because of it).

## Extraction surfaces (what machines actually parse)

| Surface | Where | Who consumes it |
|---|---|---|
| Prerendered full DOM | `dist/*.html` (via `npm run build`) | no-JS crawlers, AI fetchers, answer engines |
| `<title>` / meta description / OG & Twitter cards | both pages' `<head>` | link previews, SERPs, social scrapers |
| `JSON-LD` `schema.org/Person` | `index.html` head | entity extraction (name, jobTitle, email, profiles) |
| `JSON-LD` `FAQPage` | `freelance.html` head | prime agent-extraction material ("how much / how does handoff work") |
| `<meta name="robots" content="index, follow…">` | both pages | explicit indexing statement agents parse |
| `robots.txt` + `llms.txt` | `public/` (generated post-build) | crawlers + LLM-oriented indexers (`llms.txt` = concise site summary for LLMs) |
| Semantic landmarks & `data-analytics-id` | markup | both DOM-based agents and the analytics pipeline |

## Measurement (Umami analytics)

Deployment without measurement is flying blind. Umami (cloud, cookieless) is
injected into every built HTML and answers three questions:

- **Humans:** sessions, referrers (LinkedIn vs organic), device/theme split.
- **Conversion events:** `element_click` auto-tracks every
  `a/button/[data-analytics-id]`; outbound labels (`schedule` vs `brief`) fire on
  the `/freelance` CTA ladder.
- **AI referrals:** referrers such as `chat.openai.com`, `perplexity.ai`,
  `claude.ai`, `copilot.microsoft.com`, `gemini.google.com` are reported
  natively — this is the GEO (generative-engine optimization) signal: *are agents
  actually sending people here?*

The full event-parity contract between pages is reviewed in
[docs/analytics-umami-review.md](./docs/analytics-umami-review.md); the monthly
manual prompt battery that complements it is specified in [AGENT-SEO.md](./AGENT-SEO.md).

## Runbook

| Task | Doc |
|---|---|
| Deploy / redeploy, env vars, GitHub secrets | [VERCEL.md](./VERCEL.md) + `deploy-setup` skill |
| Change what agents extract (positioning, entities, llms.txt) | [AGENT-SEO.md](./AGENT-SEO.md) + content in `db/seed.sql` |
| Verify the analytics contract after copy/CTA changes | [docs/analytics-umami-review.md](./docs/analytics-umami-review.md) |
| Inspect what a no-JS reader sees | `npm run build` → open `dist/index.html` / `dist/freelance.html` |

**Golden rule:** if you change positioning or copy, re-run `npm run build` (never
hand-edit generated files) so the prerendered DOM, JSON-LD and `llms.txt` stay in
sync with the SQLite source of truth — all three readers must extract the same story.
