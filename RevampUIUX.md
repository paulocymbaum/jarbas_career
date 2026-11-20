# RevampUIUX — Immersive Scroll Experience for `/freelance`

**Role:** modern product designer — scroll choreography & transition systems
**Inputs:** current build (`src/pages/FreelancePage.tsx`), `REVAMP.md` (copy decisions), `Cross-Critique.md`
**Output:** a completely different, immersive build of the freelance experience — same content, same SEO contract, new body language.
**Stack rules:** React + Vite + Tailwind; **animejs v4** (already a vendor chunk) + **CSS scroll-driven animations** (progressive). **Zero new runtime dependencies.**

---

## 1. Concept — "The Scroll Is the Brief"

The page currently scrolls like a document. This build scrolls like **a project engagement unfolding**:
each segment is a phase of working with Your Name, and the scrollbar is the project timeline.

| Scroll position | Narrative phase | Segment |
|---|---|---|
| 0–12% | The meeting | Hero |
| 12–18% | Credentials on the table | Proof strip |
| 18–24% | What gets built | Services (pinned horizontal gallery) |
| 24–30% | Name the fear | Objection block |
| 30–38% | The toolkit wall | Skills |
| 38–55% | The evidence | Work |
| 55–70% | The journey | Process (timeline draw) |
| 70–80% | Cross-examination | FAQ |
| 80–100% | The handshake | Contact + Footer |

A persistent **progress rail** (2px, top) shows the phase in mono micro-type
(`PHASE 02 — SERVICES`) and fills with scroll — the page literally tracks the project.

---

## 2. Motion principles

1. **Scroll is input, never a cage.** Native scrolling is never hijacked; scrubbing only
   drives `transform/opacity` of layered content. One pinned section max (Services).
2. **Enter with intent, exit with a promise.** Every segment enters with one signature
   move and hands off to the next with a matching exit — no dead scrolls between sections.
3. **Depth over decoration.** 3 visual depths only: ambient (bg grid/glow, slowest),
   stage (content), accent (photo, chips — fastest). Parallax deltas: 0.35 / 0.6 / 1.2.
4. **One showpiece per viewport.** Only one motion "event" competes for attention at a time.
5. **Reduced motion = same story, zero theatre.** Every behaviour has a static or 160ms-fade
   equivalent. Nothing essential is conveyed by motion alone.

## 3. Motion tokens (add to `index.css` as `:root` vars + Tailwind-arbitrary values)

```css
--fx-in:    cubic-bezier(0.22, 1, 0.36, 1);   /* easeOutQuint — entrances */
--fx-scrub: linear;                            /* scroll-linked, no easing */
--fx-out:   cubic-bezier(0.4, 0, 1, 1);       /* exits */
--fx-fast: 180ms;  --fx-base: 480ms;  --fx-slow: 900ms;
--fx-rise:  28px;                              /* default rise distance */
--fx-stagger: 70ms;                            /* list stagger */
```

Utility classes: `.fx-reveal` (hidden pre-view), `.fx-in-view` (animated in),
`.fx-parallax[data-depth]`, `.fx-tilt`, `.fx-magnetic`. All transforms are GPU-only
(`translate3d`/`scale`/`opacity`/`filter: blur()` — blur capped at 12px).

---

## 4. Technical foundation

| Need | Mechanism | Notes |
|---|---|---|
| Scroll-linked scrub | **CSS scroll-driven animations** (`animation-timeline: view()/scroll()`) behind `@supports` | Chromium 115+, Safari 26+, Firefox 140+. Zero JS cost. |
| Fallback scrub | `useSectionProgress(ref)` hook — rAF + `IntersectionObserver`, writes `--progress` custom property on the section element | Same visuals, JS-driven, ~1 rAF per visible section |
| Entrances | animejs v4 (`animate`) orchestrated on `IntersectionObserver` via new `useReveal(ref, opts)` | Replaces ad-hoc classes; stagger lists |
| Counters | `useCountUp(target, { duration })` with `anime` number tween | Proof strip values |
| Pinned horizontal | `useHorizontalPin(trackRef)` — sticky `h-screen` wrapper + `translate3d(-p * (trackWidth - vw))` from section progress | Desktop ≥1024px only |
| Parallax | `useParallax(depth)` — same rAF loop, `translate3d(y * depth)` | Photo, chips, bg glows |
| Magnetic CTAs | `useMagnetic(ref, { radius: 90, pull: 8 })` — pointer-only (`matchMedia('(pointer: fine)')`) | Primary buttons |
| Reduced motion | existing `useReducedMotion()` — gates every hook; CSS side: `@media (prefers-reduced-motion: reduce)` kills `--fx-*` durations | Hard contract (§6) |
| Cross-page transition | **View Transitions API** (`document.startViewTransition`) on the `/` ↔ `/freelance` links | Progressive: browsers without it just navigate |

New files: `src/hooks/scroll/{use-section-progress,use-reveal,use-count-up,use-horizontal-pin,use-parallax,use-magnetic}.ts`,
`src/components/freelance/ProgressRail.tsx`, motion tokens + keyframes (`--fx-*` vars, `.fx-reveal*` classes) in `src/index.css`.

---

## 5. Segment blueprint — entry · scroll behaviour · handoff

Each segment: **Entry** (one signature move), **While scrolling** (scrubbed), **Handoff**
(the transition *between segments* — the heart of this build).

### 5.1 Hero — "The meeting"
- **Load:** badge drops in (y 12→0, 180ms); headline lines mask-reveal upward
  (`clip-path: inset(0 0 100% 0)` → `inset(0)`, staggered 90ms, 640ms); sub fades (y 10);
  CTAs rise; photo scale 1.06→1 + border glow bloom (900ms, `--fx-in`).
- **Scrub:** ambient grid translates at 0.35 depth; glows drift at 0.6; photo gains
  `scale 1 → 1.04` and `blur 0 → 6px` as it exits (depth cue — it recedes).
- **Handoff → Proof strip:** proof strip is a **docked card**: `-mt-10` overlap rising
  40px with shadow bloom; hero content parallaxes out at 0.6 (the meeting table slides
  away).

### 5.2 Proof strip — "Credentials on the table"
- **Entry:** docked-card rise. Values **count up** on first view (`8 teams`,
  `4 LLM providers`; "hours → seconds" swaps word, not number).
- **Scrub:** cells drift ±8px alternating at 0.35 depth — a row "breathing" apart.
- **Handoff → Services (pinned):** strip fades/blurs back (blur 0→4px, scale 0.98) as
  Services **covers it with rounded top corners** (`rounded-t-[2.5rem]`, negative margin
  overlap) — the first "panel stack" move; page background resolves to `bg-muted/30`.

### 5.3 Services — "What gets built" (THE showpiece — pinned horizontal gallery)
- Desktop ≥1024px: section pins `h-screen`; the 5 cards sit on a horizontal track that
  **scrubs left with scroll** (pin length ≈ 1.6 viewports). The flagship AI card is the
  first panel — its gradient washes in as the pin starts.
- A mono readout (`01 — 05`) and a 4px track under the cards fill with progress.
- Cards enter with `rotateY(8deg) → 0` (perspective on the track) and `scale 0.96 → 1` —
  a deal-file being flipped through.
- **Mobile / reduced motion / no-JS:** static vertical grid (current build), standard rise.
- **Handoff → Objection:** as the track ends it decelerates (`--fx-in` on the last 12%)
  and the objection panel **crossfades over the pinned frame** (opacity scrub) — the
  meeting gets serious.

### 5.4 Objection block — "Name the fear"
- **Entry:** title mask-reveal; the three pains **strike-in** sequentially (each fades in
  then gets a strike-through line drawn via `scaleX` pseudo-element, 160ms apart) — the
  fears being crossed off, literally.
- **Scrub:** the reassurance divider draws left→right with progress.
- **Handoff → Skills:** reassurance "lifts" (scale 1.02, brightness up) while the Skills
  band slides up behind it as the next backdrop.

### 5.5 Skills — "The toolkit wall"
- **Entry:** chips cascade with 40ms stagger (`scale 0.9, y 8 → 1, 0`).
- **Scrub:** the 4 groups drift at alternating ±0.35/0.6 depths (toolkit wall parallax).
- **Handoff → Work:** the band exits slower than its content — the wall falls behind.

### 5.6 Work — "The evidence"
- **Entry:** engagement cards stagger-rise; project cards enter with **3D tilt**
  (`rotateX 4° → 0`) + shadow bloom, 80ms stagger per row.
- **Hover (desktop):** existing hover + `fx-tilt` (±3° following pointer); image scales
  1.03 inside its mask.
- **Scrub:** nothing pinned — evidence shouldn't be gimmicked; this section scrolls honestly.
- **Handoff → Process:** the Process **timeline line pre-draws** from 0 as this section
  leaves — the journey line reaching for the next screen.

### 5.7 Process — "The journey" (timeline draw)
- Vertical center line (desktop) / left rail (mobile) with `scaleY` **scrubbed by scroll
  progress** across the section; each step activates (number fills primary, border
  brightens) as the line passes it.
- **Handoff → FAQ:** the line completes with a pulse dot; FAQ items crossfade in.

### 5.8 FAQ — "Cross-examination"
- Native `<details>` kept; open/close animated via `grid-template-rows 0fr→1fr` (no JS
  measuring), chevron rotates 180°, open item brightens.
- Entry: items cascade at 60ms.
- **Handoff → Contact:** the Contact panel **rises like a handshake** — scale 0.96→1,
  both glow orbs bloom; email fades in letter-by-letter (reduced-motion: plain fade).

### 5.9 Contact — "The handshake"
- Primary **Schedule a call** is magnetic (desktop, fine pointer); "Start the brief"
  gets a shine sweep on hover. At full scroll, the glow orbs reach full brightness.

### 5.10 Global chrome
- **Progress rail:** fixed top, 2px fill + mono label `PHASE 03 — SERVICES` right-aligned;
  driven by global progress; hidden on print.
- **Background mesh:** the glows become page-level layers whose position/opacity scrub
  with global progress (hue stays within ±8° — brand-safe).
- **View Transitions:** `/ ↔ /freelance` links wrap navigation in
  `document.startViewTransition` — cross-fade + 12px slide; fallback = plain navigation.

## 6. Reduced-motion & accessibility contract

- `prefers-reduced-motion: reduce` (via `useReducedMotion()` + CSS media query):
  - All scrubbing off; entrances become **opacity-only 160ms fades** (no y/scale/blur/clip-path).
  - Counters render final values instantly; horizontal pin becomes the vertical grid;
    parallax, tilt, magnetic, letter-fade, strike-draw → static states.
  - View Transitions skipped; progress rail remains (1px fill — informational, not motion).
- Keyboard: tab order unchanged; magnetic/tilt never intercept focus or click targets;
  `:focus-visible` rings unchanged.
- Screen readers: nothing enters/leaves the DOM based on scroll; all content stays in the
  accessibility tree at all times.
- No scroll hijack: native scrollbar, native inertia; `history.scrollRestoration` untouched.

## 7. Performance budget & guards

| Guard | Rule |
|---|---|
| Properties | `transform`, `opacity`, `clip-path`, `filter: blur(≤12px)` only. No layout props animated. |
| rAF discipline | One shared rAF loop per page (context in `src/hooks/scroll/`); hooks subscribe/unsubscribe on IO. |
| Visibility | Below-fold sections get `content-visibility: auto` + IO `rootMargin: 25%` — offscreen = zero work. |
| Mobile (<1024px) | No horizontal pin; tilt/magnetic off; parallax depths halved; blur ≤ 8px. |
| LCP | Hero headline is the LCP — its reveal runs on CSS (paint-ready), never gated on JS/anime; content is server-static in the HTML. |
| CLS | Zero: all animated props are transforms; photo has width/height attrs (already set). |
| Bundle | +0 dependencies; hooks ≤ 4 kB min; animejs chunk already cached. |

## 8. Implementation plan (phases, each shippable alone)

- **Phase 1 — Foundation (low risk):** motion tokens + `.fx-*` classes in `src/index.css`; hooks
  `use-section-progress`, `use-reveal`, `use-count-up`; ProgressRail; hero load
  orchestration; proof counters; standard rise reveals everywhere.
- **Phase 2 — Handoffs:** panel-stack cover (proof→services, skills band), objection
  strike-in, timeline draw in Process, FAQ `grid-rows` animation, contact rise + orb bloom.
- **Phase 3 — Showpieces:** pinned horizontal Services (desktop), parallax depths on
  hero/skills, magnetic CTAs, fx-tilt on work cards, mesh scrub, View Transitions on
  cross-page links.

## 9. Acceptance criteria

- [ ] 60fps scroll on a mid-tier Android (profile with DevTools; no long frames > 32ms during pin).
- [ ] `prefers-reduced-motion` pass: zero scrub, zero transform entrances; all content visible.
- [ ] CLS = 0; LCP element (H1) paints without JS gating; no horizontal overflow at 360px.
- [ ] Keyboard-only walkthrough unchanged; focus rings untouched by fx layers.
- [ ] SEO audit still 100 (content untouched — only presentation); `data-analytics-id` preserved; `schedule`/`brief` outbound labels still fire.
- [ ] One pinned section maximum (Services); native scroll feel preserved everywhere.
- [ ] Works with animations disabled (CSS unsupported / no-JS): full content, zero blocking.

## 10. Risks & mitigations

| Risk | Mitigation |
|---|---|
| "Scroll-jacked" feel annoys buyers | Pin only Services; scrub never blocks native scroll; every pin length ≤ 1.6 viewports |
| Safari/Firefox lack scroll-driven animations | `@supports` gates + JS `useSectionProgress` fallback — identical visuals |
| Motion improves vibe but not conversion | Phase gate after Phase 1: compare Umami `schedule`/`brief` CTR 2 weeks pre/post (REVAMP §3.10 baseline) |
| Complexity creep | Phases ship independently; Phase 3 items are additive cosmetic layers, removable in one commit |
| Motion sickness for sensitive users | Reduced-motion contract §6 is the default for them; distances capped at 28px |

---

**Design north star:** every scroll pixel either builds trust, removes doubt, or moves
the buyer one step closer to the call — if an animation does none of those three, it
doesn't ship.




