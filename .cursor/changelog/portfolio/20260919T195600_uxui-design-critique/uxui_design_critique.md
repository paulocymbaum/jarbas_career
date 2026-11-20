# UX/UI Design Critique — Public portfolio (single-page site)

## Meta

| Field | Value |
|-------|-------|
| **Date** | 2026-09-19 |
| **Target** | Public site: Header, ParallaxIntro/Hero, About, Professional Profiles, Experience, Writing, Education, Certifications, Projects, GitHub activity, Contact, Footer, Skills drawer. Admin and recruitment routes ignored. |
| **Persona** | Recruiter / hiring manager (primary); engineers as secondary skim |
| **Scope** | Implemented UI (`src/App.tsx` `PortfolioSite`) |

## Job statement

When I land on this site with 30–90 seconds, I want to know who this person is, whether they fit the role, and how to get a resume or email — so I can decide to shortlist or bounce.

## Golden path

Read name + role + one-line proof → scan current job + 2–3 metrics → glance featured work → pick the matching resume or email → done.

**What happens now:** Header (glass) → hero card + featured-project cards + 3D GitHub heatmap (same viewport) → About + hover-to-preview profiles → hover-to-expand jobs → collapsed Writing → Education/Certs cards → auto-scrolling project marquee → 2D heatmap again → “Let's connect”. Skills and the polar chart sit in a modal drawer, not on the page.

## Dialogue summary

**Round 1 — Job & golden path.** Maya: a recruiter needs role, current company, impact, and a resume in five seconds. The first screen is a product dashboard — `HeroContent` + `FeaturedProjects` + `GithubIntroPanel` 3D — so the name competes with physics bars. Hero CTAs are “See Skills” and “Choose resume”; DESIGN.md §4.1 asked for “View projects” + resume. Leo: the stacked `contentPanelClass` cards (`rounded-2xl` + `shadow-sm`) read as a SaaS landing, not an editorial CV. Name size is fine; the typeface (DM Sans) and cool blue primary (`213 94% 68%`) are the 2024–26 AI-portfolio default.

**Round 2 — Mistakes audit.** Unclear primary action (skills drawer vs resume vs projects vs GitHub). Hidden state: job highlights, education summaries, and cert verify links live in `ExpandableHoverCard` and vanish on mouse-out. Cognitive overload on first visit (mistake 5): nine nav items including “Git”, plus a skills modal. Weak hierarchy (7): three `h2`s in the intro (`featured-projects-heading`, `github-intro-heading`, `about-heading`) before the reader finishes the `h1`. Beauty without function (11): 3D heatmap with Cannon physics, 70s marquee, glass header, rainbow profile accents, Sparkles/Rocket/Layers icons. Writing is `collapsible` with `defaultOpen` false — a whole section is a closed accordion.

**Round 3 — Practices & polish.** Progressive disclosure is inverted: proof is hidden, decoration is shown. Put chips and one highlight line on the job row; keep the rest open or behind an explicit “More”. Leo: drop the 8px `h-0.5 w-10 bg-primary` underline on every section (`Section.tsx`, About, Featured Projects). Drop uppercase mono eyebrows (“Portfolio”, “GitHub”). Replace DM Sans with an editorial pair (e.g. a real text face + a restrained display). Use one ink accent — paper, ink, one warm or olive mark — not violet/cyan/lime gradients on every profile and project. Maya: keep the resume menu; make “View projects” the filled button; skills become an on-page chip list, drawer optional.

**Round 4 — Edge cases & synthesis.** Reduced motion already kills the marquee and drawer slide, but the 3D scene is still the hero for everyone else — and DESIGN.md §1 listed “complex animations or 3D” as a v1 non-goal. Empty GitHub state mentions `GITHUB_TOKEN` (jargon leak). Hover-only expand fails the keyboard-first recruiter on desktop (`canHover` collapses bodies). Duplicate heatmap (`GithubIntroPanel` + `#activity`) wastes scroll. Agree P0 = first viewport + visible experience + CTA/copy. Unresolved: whether a *small* 2D heatmap may stay below the fold as a personality beat (Maya: only after the CV job is done; Leo: yes, as a quiet figure, not a WebGL demo).

## Findings

### Critical (P0) — blocks task completion or trust

- **First viewport is a feature dump, not a CV.** `ParallaxIntro` grids hero (2 cols) + featured projects (1 col), then a full-bleed 3D contribution scene (`GithubContributionHeatmap3d`, Cannon + Three). Recruiter proof (current role, impact) is below the fold. Violates DESIGN.md “first impression in < 5 seconds” and “no gimmicks”; violates ux-seamless-flows mistakes 5 and 7.
- **Experience proof is hover-gated.** `Experience` wraps highlights, summary, and tech in `ExpandableHoverCard`. On `(hover: hover)` the body starts collapsed (`aria-hidden` when not expanded). A hiring manager who does not hover sees title/company/dates only — the LinkedIn-template chrome without the bullets they came for.
- **Wrong primary action.** Hero filled button is “Choose resume”; the first button is “See Skills” (opens `SkillsDrawer` + `SkillsPolarChart`). DESIGN.md §4.1: primary = View projects, secondary = Choose resume. Skills are a keyword check, not the opening move.
- **About copy reads as generated LinkedIn.** `siteContent.aboutParagraphs` includes “passionate about leveraging”, “real-world problems”, “cutting-edge projects”, and a four-paragraph dump (~150-word DESIGN.md cap exceeded). Same voice as the banned no-ai-slop list. Trust drops before Experience.

### Warnings (P1) — meaningful friction or inconsistency

- **Skills are off-page.** DESIGN.md §4.5: grouped chips on the page for ATS-minded skim. Implementation: nav “Skills” opens a modal drawer with a polar chart. Recruiters cannot Cmd-F the stack from the main scroll. Hash `#skills` is an `sr-only` stub in About.
- **Projects are a 70s auto-marquee.** `Projects` duplicates the list and uses `.projects-marquee-track`. Hard to compare, pause (hover-only), or cite a card. Featured work already appeared in the intro, so the section feels like a screensaver.
- **AI-slop visual system.** DM Sans + JetBrains Mono (`index.html`, `tailwind.config.js`); generic blue `--primary`; sticky header `bg-background/85 backdrop-blur-md`; uppercase mono eyebrows; 8px primary pills under every `h2`; profile accents `from-violet-700 via-purple-500 to-fuchsia-400` / cyan / lime; `Sparkles` / `Rocket` / `Layers`; writing cards with `from-violet-600 via-fuchsia-500 to-orange-400` hairlines; project placeholder gradients spanning the rainbow. DESIGN.md §5.1 asked for “quiet confidence” and “one accent used sparingly.”
- **Nested panels.** Intro wraps hero, featured, GitHub, and About each in `contentPanelClass` (card-in-card-in-muted-band). Editorial layouts use type and rules, not a stack of shadcn surfaces.
- **Professional profiles hide the resume job.** Desktop default `displayedSlug` is `null` until hover (`canHover ? null : defaultSlug`). Empty dashed box: “Hover a role to preview.” The thing the hero promised (“Choose resume”) is a hover puzzle.
- **Writing starts closed.** `Section` `collapsible` without `defaultOpen` — articles never enter the skim path unless someone expands a chevron.
- **GitHub twice.** 3D teaser in intro + full 2D `GithubActivity` section. Nav label “Git” is cute, not clear.
- **Contact subtitle** is “Let's connect — I'm always open to interesting conversations.” Portable filler; no role, city, or response expectation.
- **Nav density.** Nine anchors (About, Skills, Experience, Writing, Education, Certifications, Projects, Git, Contact) plus Resume + theme. No way to tell what is required vs optional. DESIGN.md nav was five links.

### Suggestions (P2) — polish and delight

- Footer “Built with React, shadcn/ui, and anime.js.” advertises the template stack — the opposite of quiet confidence.
- Unused `Hero` wrapper still ships a `bg-primary/10 blur-3xl` orb (classic AI landing leftover) even though `App` mounts `ParallaxIntro` only.
- Certification grid is identical 2–5 column cards; verify link only after expand. Show issuer + year as the scan line; keep verify as a text link always visible.
- `SkillsPolarChart` is a novelty graphic recruiters will not parse. If skills stay visual, use a simple category list.
- Timeline dots use a glowing `shadow-[0_0_0_2px_hsl(var(--primary))]` — another “startup landing” cue. A 1px rule + filled tick is enough.
- Photo is good (real face). Keep it; give it a quiet border, not a gradient placeholder fallback language.

## Mistakes checklist (ux-seamless-flows)

- [ ] Primary action obvious? — No. Skills vs resume vs projects vs heatmap compete.
- [ ] State visible (loading/saved/error)? — Partial. GitHub empty state leaks `GITHUB_TOKEN`. Heatmap hover is the only live state.
- [ ] Modals justified? — No. Skills drawer and profile-skills modal interrupt a skim. README modal is acceptable for depth.
- [ ] Patterns consistent? — Mixed. Some sections always-open, some hover-expand, some accordion, some marquee.
- [ ] Overwhelming on first visit? — Yes. Intro is three products stacked.
- [ ] Edge cases designed? — Partial. Reduced-motion on marquee/drawer; 3D has 2D fallback; hover expand is a desktop trap.
- [ ] Hierarchy matches priority? — No. Decoration (3D, marquee, polar) outranks job bullets.
- [ ] Beauty serves clarity? — No. Chrome and motion are the brand.

## Practices applied

| Practice | Status | Notes |
|----------|--------|-------|
| Golden path first | ❌ | Recruiter path starts after GitHub theater and About essay |
| One decision per step | ❌ | Hero asks skills *and* resume; intro shows three jobs at once |
| Progressive disclosure | ⚠️ | Inverted: hides proof, shows toys. Writing collapse is the wrong disclosure |
| Immediate feedback | ⚠️ | Hover expand / 3D drag feel responsive but do not confirm the CV job |
| Forgiving (undo/autosave) | ✅ | N/A for a brochure; skip link and theme persist |
| Visual hierarchy | ❌ | Equal-weight cards, underlines, and gradients; no editorial focus |
| Flow tested end-to-end | ⚠️ | Keyboard/reduced-motion considered in spots; first-visit skim fails |

## Agreed recommendations

1. **Rebuild the first screen as an editorial hero** (`ux` + `ui`, **L**): Name, title, one-sentence pitch, city. One column. No GitHub 3D, no featured-project column, no nested `contentPanelClass` stack. Optional small photo. This is the 5-second job.
2. **Fix hero CTAs** (`ux`, **S**): Primary filled “View projects” → `#projects`. Secondary “Choose resume” → `#section-professional-profiles`. Remove or demote “See Skills”.
3. **Show job proof without hover** (`eng` + `ux`, **M**): Always show role, company, dates, 2–3 highlights, and tech chips. Optional “More” for the rest. Stop using `ExpandableHoverCard` as the default for Experience (and Education if the summary is the only content — just show it).
4. **Strip the AI-slop skin** (`ui`, **M**): Replace DM Sans with a distinctive editorial pair; change `--primary` off generic bright blue (DESIGN.md already allows teal/amber — pick one ink and use it for links/focus only). Solid header, no backdrop-blur. Delete mono uppercase eyebrows and the 8px underline on every heading.
5. **Put skills on the page** (`ux` + `eng`, **M**): 4–6 category chip groups as DESIGN.md §4.5. Kill or bury the polar-chart drawer. Nav “Skills” scrolls to `#skills`.
6. **Replace the project marquee with a scannable grid** (`ui` + `eng`, **M**): Featured first (1–3), then the rest. Static. Images or one quiet placeholder — not a rainbow `via-*` per card.
7. **Rewrite About and Contact in a human voice** (`ux`, **S**): Two short paragraphs, concrete nouns (YourCompany hours→seconds, YourCompany, FEI). Cut “passionate about leveraging”, “cutting-edge”, “Let's connect”. Contact subtitle: what you want and how fast you reply.
8. **Flatten profiles and chrome** (`ui` + `eng`, **M**): Show all three profile cards (title, one line, stack, Download resume) — no hover preview, no Sparkles/Rocket, no rainbow top bars. Drop Writing rainbow hairlines. One GitHub figure below the fold as a 2D heatmap or omit it. Open Writing by default or drop the accordion.

## Unresolved tension

**Maya** wants GitHub activity off the first two screens entirely — it is not a hiring signal compared to YourCompany / YourCompany. **Leo** will allow a small 2D heatmap after Projects if it is captioned like a figure (“2025–26, public + private”) and never WebGL. Product call: keep 2D below the fold or delete `#activity` from nav.

**Leo** wants a serif display for the name (magazine). **Maya** only cares that it is not DM Sans/Inter and that body stays ≥16px. Either is fine if contrast holds.

## Files reviewed

- `DESIGN.md` §§1–5, 4.1–4.7 (quiet confidence, IA, hero CTAs, skills-on-page, no 3D in v1)
- `src/App.tsx` — public composition
- `src/index.css`, `tailwind.config.js`, `index.html` — tokens, glass, marquee, DM Sans
- `src/lib/panel.ts` — nested card language
- `src/components/layout/Header.tsx`, `Section.tsx`, `Footer.tsx`
- `src/components/sections/ParallaxIntro.tsx`, `Hero.tsx`, `About.tsx`, `ProfessionalProfiles.tsx`, `Experience.tsx`, `Writing.tsx`, `Education.tsx`, `Certifications.tsx`, `Projects.tsx`, `FeaturedProjects.tsx`, `GithubIntroPanel.tsx`, `GithubActivity.tsx`, `Contact.tsx`
- `src/components/ExpandableHoverCard.tsx`, `SkillsDrawer.tsx`, `WritingShowcase.tsx`, `ProjectCard.tsx`, `GithubContributionHeatmap.tsx`, `GithubContributionHeatmap3d.tsx`
- `src/content/site.ts` — copy, accents, `navItems`

## References

- `.cursor/skills/ux-seamless-flows/SKILL.md` — 12 mistakes, top 10 practices
- `.cursor/skills/no-ai-slop/SKILL.md` — leverage / cutting-edge / portable filler
- `DESIGN.md` — “Quiet confidence”, first impression < 5s, one accent, skills as chips, 3D listed as non-goal
