# Analytics Review — Umami across `/` (CV) and `/freelance`

**Lens:** product analytics audit · **Sources:** `src/lib/analytics.ts`, `src/hooks/use-section-tracking.ts`,
`vite.config.ts` (umami plugin), `src/main.tsx` vs `src/freelance-main.tsx`, `.env` · **Date:** 2026-11-15

---

## 1. Setup map (how Umami is wired)

| Piece | Main CV (`/`) | Freelance (`/freelance`) |
|---|---|---|
| Script injection | `umamiAnalyticsPlugin` → every built HTML (incl. `freelance.html`) | same script, same `data-website-id` |
| Website | **one Umami website** (`VITE_UMAMI_WEBSITE_ID`, cloud.umami.is) | **same website** — pages are distinguished only by URL |
| Init | `initAnalytics()` in `main.tsx` | `initAnalytics()` in `freelance-main.tsx` |
| Gate | `isAnalyticsEnabled()` = PROD + env vars; `VITE_UMAMI_DEV=false` → **dev never sends** | same gate |
| Pageview | Umami auto (URL `/`) | Umami auto (URL `/freelance`) — separate documents, so pageviews split correctly |
| Event pipeline | shared `track()` → `window.umami.track(event, payload)` with queue/flush fallback | identical |
| Per-event context | `visit_id`, `event_index`, `theme`, `viewport` + click metadata (`analytics_id`, `element_id`, `label`, `href`, `section_id`) | identical |

**Global listeners installed by `initAnalytics()` (both pages):**
1. `initClickTracking()` — auto event `element_click` for every `a/button/[role=…]/[data-analytics-id]`
   click (deduped against semantic events via `__semanticAnalytics`).
2. `initScrollDepthTracking()` — `scroll_depth` milestones 25/50/75/100%.
3. `initErrorTracking()` — `client_error` (error/promise).

---

## 2. Event inventory — page × page

### Semantic events (explicit `track()` calls)

| Event | Main `/` | `/freelance` | Notes |
|---|---|---|---|
| `outbound_click` (`calendly`) | ✅ header/contact/schedule | — | freelance uses destination **`schedule`** ⚠ vocabulary split |
| `outbound_click` (`email`) | ✅ contact/footer | — | freelance replaced by **`brief`** ⚠ |
| `outbound_click` (`brief`) | — | ✅ hero/contact "Start the brief" | new calibrated-CTA destination |
| `outbound_click` (`schedule`) | — | ✅ nav/hero/contact | new |
| `outbound_click` (`linkedin`/`github`/`demo`…) | ✅ contact/footer/projects | ✅ contact LinkedIn only | |
| `github_navigation` | ✅ footer/projects | — | freelance has no GitHub links (by design) |
| `resume_download` | ✅ ResumeMenu (per profile) | — | no resumes on freelance (by design) |
| `section_view` / `section_engaged` | ✅ 10 sections via `use-section-tracking` | ❌ **missing** | no depth/dwell data for services/work/process/faq |
| `scroll_depth` | ✅ | ✅ (same listener) | splittable only via Umami page context |
| `client_error` | ✅ | ✅ | |
| `element_click` (auto) | ✅ everything | ✅ everything (`freelance-*` analytics_ids) | the workhorse — both pages fully covered here |
| `showcase_select` / media prev-next | — | ❌ only auto `element_click` | no semantic event for showcase interaction |
| `profile_deep_link`, `skills_drawer_open`, `article_open`, `project_readme_open`, `filter_change`, `praxis_project_click` | ✅ | — | recruiter-page features |

### Auto `element_click` analytics_ids

- **Main:** `header-schedule`, `header-resume-*`, `nav-{section}`, `contact-*`, `professional-profile-*`, theme toggles, footer-*
- **Freelance:** `freelance-header-home/schedule/theme-toggle`, `freelance-nav-*`, `freelance-hero-schedule/brief`,
  `freelance-showcase-{slug}/prev/next`, `freelance-contact-schedule/brief(-button)/linkedin`, `freelance-work-portfolio`.

---

## 3. Findings (gaps & divergences)

### F1 — `section_id` resolution is broken on `/freelance` (P0)
`SECTION_ID_PATTERN` in analytics.ts only matches main-site ids:
`^(about|experience|resumes|skills|writing|education|certifications|projects|activity|contact|section-)`.
Freelance sections (`services`, `objections`, `work`, `process`, `faq`) **don't match** → every
`element_click` payload carries `section_id: ""`. Fix: extend the pattern with the freelance ids
(`|services|objections|work|process|faq`) — one-line change, instant segmentation in Umami.

### F2 — No `section_view`/`section_engaged` on `/freelance` (P1)
Main gets per-section views + dwell; freelance gets none, so we can't answer "do visitors reach
Process/FAQ?" — the exact questions the UX revamp was built around. Fix: run a freelance-scoped
section observer with `SECTION_IDS = [services, objections, skills, work, process, faq, contact]`
(pin-safe: observe the section wrapper, not the pinned frame).

### F3 — Destination vocabulary split (P1)
`calendly` (main) vs `schedule` (freelance); `email` (main) vs `brief` (freelance). Umami
`outbound_click` charts will show four destinations for two actions. Either unify
(`calendly`/`email-brief` everywhere — page context distinguishes them) or accept the split
*intentionally* and document it. Recommendation: **unify to `calendly` and `email-brief`** — keeps
the brief distinct (the new CTA) while Calendly aggregates across pages.

### F4 — Showcase has no semantic event (P2)
Rows/prev/next emit only auto `element_click`. A single `showcase_select { project, index }`
would answer "which project attracts attention" without parsing analytics_ids.

### F5 — `scroll_depth` has no page label (P2)
Milestones fire on both pages but the payload is `{ depth }` only. Umami attaches them to the
current pageview URL, so it *is* splittable in the UI — but only if you filter by URL per event.
Low priority; an optional `page` field would make exports self-contained.

### F6 — One Umami website for both audiences (note, not a bug)
Recruiter traffic and client traffic share one dataset. Umami splits by URL fine. If you later want
hard separation (or different stats retention), create a second website id and a second env
(`VITE_UMAMI_WEBSITE_ID_FREELANCE`) — the plugin and `freelance-main.tsx` would each pick their id.
Not needed today.

---

## 4. What's already healthy

- Single init path, PROD-gated, dev silent — no local noise.
- `element_click` auto-tracker means **every** new freelance control (showcase rows, prev/next,
  rail, theme toggle) is captured with zero extra code — adding semantic events later never loses history.
- Visit stitching (`visit_id` + `event_index`) works across both pages in the same tab session —
  you can see "visited /freelance → clicked brief → went to /".
- Pending-queue + retry handles the script race on slow loads.
- `data-analytics-ignore` escape hatch exists for future noise (e.g. hover-only controls).

---

## 5. Recommended actions (priority order)

| P | Action | Effort |
|---|---|---|
| P0 | Extend `SECTION_ID_PATTERN` with `services|objections|work|process|faq` (F1) | 1 line |
| P1 | Freelance section view/engaged observer (F2) | ~30 min |
| P1 | Unify destinations: `schedule`→`calendly`, keep `brief` distinct (F3) | ~15 min |
| P2 | `showcase_select { project, index }` on row click + media arrows (F4) | ~30 min |
| P2 | Optional `page` field in `scroll_depth` (F5) | ~10 min |
| — | Split Umami websites per audience | only if stats separation is ever needed (F6) |

---

## 6. Umami reading guide (how to consume this)

- **CTA funnel (freelance):** filter `outbound_click` where `destination = schedule|brief`,
  compare against `element_click` where `analytics_id = freelance-hero-*`.
- **Section depth (freelance):** `section_view`/`section_engaged` with
  `section ∈ {services, objections, skills, work, process, faq}`.
- **Cross-page journeys:** group by `visit_id`; `event_index` orders the story
  (`/freelance` → `outbound brief` → `/`).
- **Theme/viewport cuts:** every event carries `theme` and `viewport`.


