---
name: Your Name Portfolio
colors:
  background: '#F4F7FA'
  surface: '#FFFFFF'
  surface-muted: '#E8EEF4'
  on-surface: '#141C2B'
  on-surface-muted: '#4F5C6D'
  outline: '#D4DCE6'
  primary: '#1E55AE'
  on-primary: '#F8FAFC'
  ring: '#1E55AE'
  background-dark: '#0C121B'
  surface-dark: '#141B28'
  surface-muted-dark: '#121925'
  on-surface-dark: '#F1F5F9'
  on-surface-muted-dark: '#A8B4C4'
  outline-dark: '#2A3544'
  primary-dark: '#5FA3F0'
  on-primary-dark: '#0F172A'
typography:
  display:
    fontFamily: IBM Plex Sans
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 52px
    letterSpacing: -0.035em
  headline:
    fontFamily: IBM Plex Sans
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 34px
    letterSpacing: -0.025em
  title:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.015em
  body:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: '0'
  label:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: '0'
  meta:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.375rem
  md: 0.375rem
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  section: 64px
  section-lg: 96px
  gutter: 20px
  gutter-lg: 24px
  content: 1152px
  prose: 640px
---

# Design system: Your Name — public CV

## 1. Visual Theme & Atmosphere

A working engineer’s site. Cool slate canvas, navy type, steel-blue actions, hairline borders, no atmosphere gradients. The page should feel like a well-typeset spec: IBM Plex, consistent measure, one blue for interactive emphasis. Dark mode is the same system inverted — navy canvas, light type, lighter blue primary — not a second brand.

This is **not** glass, not terracotta paper, not a display serif, not a rainbow. Competence is communicated by alignment, measure, and restraint.

## 2. Color Palette & Roles

### Primary Foundation

- **Canvas** `#F4F7FA` / `#0C121B` — page background, cool blue-gray
- **Surface** `#FFFFFF` / `#141B28` — cards, header, dialogs
- **Muted band** `#E8EEF4` / `#121925` — alternating sections only (`alt`), at 100% — no 30% overlays. In dark, muted sits between canvas and card so tiles still lift.

### Accent & Interactive

- **Steel blue** `#1E55AE` light / `#5FA3F0` dark — primary buttons, links, focus rings, timeline dots
- Body type stays navy (`#141C2B` / `#F1F5F9`), not blue
- Secondary buttons: transparent surface, `outline` border, navy label
- Links: steel blue, underline on hover (`underline-offset: 4px`)
- Focus ring: 2px steel blue, 2px offset matching canvas

One blue family. Do not add terracotta, violet, or a second accent.

### Typography & Text Hierarchy

- **Primary text** `#141C2B` / `#F1F5F9`
- **Secondary text** `#4F5C6D` / `#A8B4C4` — pitch, bullets, meta
- Contrast: body ≥ 4.5:1 on canvas

### Functional States

- Error: default browser / `#DC2626` only in admin forms
- Success: not used on the public brochure

## 3. Typography Rules

**IBM Plex Sans** for all UI and reading. Humanist grotesque with an engineering association; tabular-friendly; not Inter, not DM Sans, not Newsreader.

**IBM Plex Mono** for tech chips and dates only — 12px, weight 400–500. Never uppercase tracked “PORTFOLIO” eyebrows.

| Role | Size | Weight | Tracking | Use |
|------|------|--------|----------|-----|
| Display | 36–48px | 500 | -0.035em | Hero name only |
| Headline | 24–28px | 500 | -0.025em | Section `h2` |
| Title | 16px | 500 | -0.015em | Job, project, profile titles |
| Body | 16px / 26px | 400 | 0 | Bio, bullets, pitch |
| Label | 14px / 20px | 500 | 0 | Nav, buttons |
| Meta | 12px / 16px | 400 mono | 0.01em | Tags, dates |

Hero name is medium, not bold. Section titles are the same family at 28px, not a second display face.

### Spacing Principles

Line length for prose: **40rem (640px)** ≈ 65 characters. Do not let about-copy grow with the 72rem shell.

Space after a heading: 8px to subtitle, 32px to body. Space between body paragraphs: 16px.

## 4. Component Stylings

### Buttons

- Height 40px (`h-10`), horizontal padding 16px, radius 6px, label 14px/500
- Primary: steel-blue fill, snow text. Hover: 90% blue
- Secondary: 1px outline, transparent fill. Hover: muted surface, blue border
- Ghost: no border until hover muted fill (theme icon only)
- Icon buttons: 40×40, outline

### Cards & lists

- Default: **no card**. Experience, education, certifications are typographic lists with a 1px divider or a 1px timeline.
- Project grid tiles: 1px `outline`, 0 shadow, 20px inner padding, radius 6px. Hover: border color → ink, no lift.
- Resume tiles: same as project tiles. All three visible. Download PDF is a filled primary, full width, spacing on a wrapper — never `pt-*` on the button itself.

### Navigation

- Height 64px, bottom 1px outline, solid canvas (no blur)
- Name: 14px/500, left
- Links: 14px/500, muted, ink on hover. No background pills on desktop
- Inline from `lg` (1024px) — five links fit
- Mobile: full-width panel under header, 8px item gap, 44px rows

### Inputs

Admin/recruitment only: 40px height, 1px outline, ink focus ring. Not on the public brochure.

### Project / README dialog

- Centered, max 48rem, 1px outline, no gradient hairline, no drop shadow beyond a 1px border
- Title uses Headline style (Plex Sans 24/500)

## 5. Layout Principles

See [SPACING.md](./SPACING.md).

- Shell: centered, `max-width: 72rem`, gutter 20px / 24px
- Hero and about: single column, prose-width text
- Projects: 1 / 2 / 3 columns, 16px gap
- Resumes: 1 / 2 / 3 columns, 16px gap
- Skills: 1 / 2 columns, 32px column gap, 8px chip gap

## 6. Notes for generation and agents

Language: “slate canvas, steel-blue buttons, IBM Plex, 8px grid, 72rem shell, 40rem prose, no serif, no glass.”

Do not generate: Inter, DM Sans, Newsreader, purple/blue gradients, `rounded-2xl`, `shadow-xl`, backdrop-blur, uppercase mono eyebrows, 8px primary underlines, 90rem content width.
