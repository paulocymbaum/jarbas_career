# ANALYTICS — Umami visitor-event tracking

**Question this answers:** how are visitors measured on `/` (CV) and `/freelance`,
what exactly gets recorded, and how do I read it back in the Umami dashboard?

**Companion docs:** what this is *for* (agents + extraction) →
[DATA-EXTRACTION.md](./DATA-EXTRACTION.md) · event-parity audit & known gaps →
[docs/analytics-umami-review.md](./docs/analytics-umami-review.md) · GEO measurement →
[AGENT-SEO.md](./AGENT-SEO.md) § 7 · first-time account setup → the `deploy-setup`
skill, **Step 3 (Umami analytics)**.

---

## 1. Model in one paragraph

The site uses **Umami** (cookieless, privacy-first). **One Umami website** tracks
**both pages** — pageviews split naturally by URL (`/` vs `/freelance`). The tracking
snippet is injected into every built HTML page at build time and a small shared
library (`src/lib/analytics.ts`) turns raw clicks into structured events with a
visit-stitching context, so every Umami row can be replayed as a journey.

## 2. Wiring (source of truth: the code)

```
.env / GitHub secrets: VITE_UMAMI_WEBSITE_ID + VITE_UMAMI_URL (no trailing slash)
        ↓ build time
vite.config.ts → umamiAnalyticsPlugin(): injects into every built page
  <script defer src="$VITE_UMAMI_URL/script.js" data-website-id="…">
        ↓ runtime
initAnalytics() in src/main.tsx and src/freelance-main.tsx
  gate: isAnalyticsEnabled() = production build AND both env vars present
        ↓ every interaction
track(event, payload) → window.umami.track(...) with pending-queue + retry
  (50 ms interval, up to 200 attempts) to survive slow script loads
```

- **Dev is silent:** `npm run dev` never loads the script nor sends events — the gate
  requires a production build. Production-only, no local noise.
- **Deploy path:** `deploy.yml` reads `VITE_UMAMI_WEBSITE_ID` / `VITE_UMAMI_URL` from
  repository secrets; `npm run gh:secrets` pushes them from `.env`.
- **First-time setup:** create the Umami account (Cloud `<https://cloud.umami.is>` or
  self-hosted), add the website, save the two vars in `.env`, push secrets, verify —
  the `deploy-setup` skill **Step 3** walks all of it.

## 3. Event model

Every event payload carries a **visit context** so rows can be stitched into one
journey: `visit_id` (UUID per tab session, in `sessionStorage`), `event_index`
(1, 2, 3 … within the visit), `theme` (light/dark), `viewport` (desktop/tablet/mobile).

| Event | Kind | Where | Extra payload |
|---|---|---|---|
| pageview | Umami auto | both pages, split by URL | — |
| `element_click` | auto, every clickable (`a`, `button`, `[role=button/menuitem/tab]`, `[data-analytics-id]`) | both pages | `analytics_id`, `element_id`, `element_tag`, `element_type`, `label` (≤120 chars, from `aria-label`/`aria-labelledby`/text), `href`, `section_id` |
| `outbound_click` | semantic (`trackOutbound`) | CTA links | `destination`: `calendly`/`email` (main), `schedule`/`brief`/`linkedin` (freelance), `github`, `demo` |
| `scroll_depth` | auto milestones | both | `depth` = 25/50/75/100 |
| `client_error` | auto (`error`/`promise`) | both | error details |
| `section_view` / `section_engaged` | semantic | `/` main sections | `section`, `order` / `seconds` |
| `resume_download` | semantic | `/` resumes menu | per profile |
| `github_navigation` | semantic | `/` footer/projects | — |
| `profile_deep_link`, `skills_drawer_open`, `article_open`, `project_readme_open`, `filter_change`, `praxis_project_click` | semantic | `/` recruiter features | per feature |

Semantic events mark the native click (`__semanticAnalytics`) so the auto
`element_click` never double-counts them.

## 4. `analytics_id` conventions

- Stable, hand-placed ids: `header-schedule`, `nav-<section>`, `contact-*`,
  `professional-profile-*`, `footer-*` on `/`; everything on `/freelance` is
  `freelance-`-prefixed (`freelance-hero-schedule`, `freelance-contact-brief`,
  `freelance-showcase-<slug>`, `freelance-work-portfolio`, …).
- **New UI controls need zero extra code** — the auto tracker captures any new
  clickable; add a `data-analytics-id` only when you want a stable, greppable name.
- Escape hatch: wrap noise in `[data-analytics-ignore]` to exclude a subtree.

---

## 5. Reading the dashboard (recipes)

| Question | Umami filter/recipe |
|---|---|
| Did visitors reach the freelance CTAs? | `outbound_click` where `destination ∈ {schedule, brief}` — compare with `element_click` where `analytics_id = freelance-hero-*` |
| Which sections hold attention (main)? | `section_view` / `section_engaged` per `section` |
| How deep do people scroll? | `scroll_depth` per milestone (filter by page URL) |
| What did one visitor do? | group by `visit_id`, order by `event_index` (`/freelance` → `outbound brief` → `/`) |
| Light vs dark / device? | every event carries `theme` and `viewport` |
| **Are AI agents sending people here? (GEO)** | saved view filtering referrers `chat.openai.com \| perplexity.ai \| claude.ai \| copilot.microsoft.com \| gemini.google.com`; watch those sessions hitting `outbound_click brief` — see [AGENT-SEO.md](./AGENT-SEO.md) § 7 for the monthly prompt-battery KPI |

## 6. Ops contract

- **Every event carries visit context** — never strip `visit_id`/`event_index`; the
  journey stitching depends on them.
- **Renaming a `data-analytics-id` breaks chart continuity** — treat ids as a public
  API; prefer adding new ids over renaming.
- **Contract changes go through the parity review** — update
  [docs/analytics-umami-review.md](./docs/analytics-umami-review.md) when adding
  semantic events or changing destinations.
- **Verify after any build change:** `npm run build` →
  `grep -l 'data-website-id' dist/index.html dist/freelance.html` (both must match);
  then one live visit should register a pageview + an `element_click`.

## 7. Known gaps (tracked, not silent)

The parity review ([docs/analytics-umami-review.md](./docs/analytics-umami-review.md))
holds the full audit. Headlines:

- **P0** — `section_id` resolution doesn't match freelance section ids
  (`services|objections|work|process|faq` missing from `SECTION_ID_PATTERN`) →
  `element_click` payloads carry empty `section_id` on `/freelance`.
- **P1** — no `section_view`/`section_engaged` observer on `/freelance`; destination
  vocabulary split (`calendly` vs `schedule`, `email` vs `brief`).
- **P2** — showcase interactions only auto-tracked; `scroll_depth` has no explicit
  `page` field.
- One website for both audiences is intentional (F6); split later only if retention
  or access separation is ever needed.

Fix priorities live in the review doc § 5.

