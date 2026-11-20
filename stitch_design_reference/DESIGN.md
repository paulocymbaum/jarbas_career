---
name: Executive Engineering & Product Bento
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0f131c'
  on-background: '#dfe2ef'
  surface-variant: '#31353f'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.04em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  title-lg:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  title-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  metric-display:
    fontFamily: Geist
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  code-xs:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 4rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4.5rem
---

## Brand & Style

This design system is tailored for an elite Senior AI, Full-Stack & Product Engineer portfolio. It merges high-velocity Silicon Valley craft (evoking Linear, Stripe, and Vercel) with an uncompromising "proof-first" narrative. The aesthetic is ultra-precise, technical, and executive-level—shifting the focus from subjective resumes to undeniable engineering output, quantitative impact metrics, systems architecture, and production telemetry.

### Personality & Tone
- **Authoritative & Technical:** Direct, data-dense, and transparent. Every claim is anchored by visible proof tokens: commits, latency reductions, live demo environments, and system throughput.
- **Architectural & Sculpted:** Emphasizes structural discipline, crisp alignments, subtle specular highlights, and deep-space dark layers.
- **Fast & Responsive:** Visually communicates near-zero latency, low cognitive load, and frictionless interaction.

### Visual Style Direction
The aesthetic fuses **Precision Dark Surface Minimalism** with **Subtle Specular Edge Glassmorphism**:
- Multi-tiered deep obsidian and carbon slates (`#090d16` through `#1e293b`).
- Razor-thin, semi-translucent 1px boundaries (`rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.15)`) replicating high-grade monitor hardware and premium developer terminals.
- Targeted kinetic energy via Electric Indigo, Hyper Cyan, and Operational Emerald accents, used strictly for status indicators, active states, and focal metrics.

## Colors

The palette establishes an ultra-refined, high-contrast dark foundation. It avoids muddy pitch-black `#000000` in favor of rich deep-slate graphite tones, providing natural ambient contrast for electric data streams and neon accents.

### Color Tiers & Semantic Usage
- **Primary (`#2563eb` - Electric Indigo):** The primary engine. Applied to active role switches, key interactive links, major CTA triggers, and active focus rings. Supported by `#3b82f6` for hover luminance.
- **Secondary (`#06b6d4` - Hyper Cyan):** The AI & intelligence vector. Used for neural architecture callouts, LLM execution pipelines, latency tags, and token consumption graphs.
- **Tertiary (`#10b981` - Operational Emerald):** The runtime health & proof vector. Denotes live production states, positive deltas (`+94% throughput`), uptime counters, and GitHub activity heatmaps.
- **Neutral Palette (`#090d16` to `#f8fafc`):**
  - **Canvas Base:** `#090d16` (Deep Obsidian Blue)
  - **Surface Level 1 (Bento Container):** `#0e1422`
  - **Surface Level 2 (Nested Card / Elevated Module):** `#161f33`
  - **Surface Level 3 (Pill Bar / Inset Well / Code Box):** `#1e293b`
  - **Border Base:** `rgba(255, 255, 255, 0.08)`
  - **Border Hover / Specular:** `rgba(255, 255, 255, 0.18)`
  - **Text High-Contrast:** `#f8fafc` (Titles, headers, key metric digits)
  - **Text Muted:** `#94a3b8` (Body, architectural diagrams, system descriptions)
  - **Text Subtle:** `#64748b` (Meta timestamps, code line numbers, inactive tabs)

## Typography

The typographic hierarchy is calibrated for crisp legibility and technical rigour.

- **Primary & Interface (`Geist`):** Delivers clean geometry, compact character widths, and neutral neutrality reminiscent of modern terminal interfaces and cloud control planes. Negative tracking is applied systematically to headlines to keep large titles taut and commanding.
- **Monospace & Metadata (`JetBrains Mono`):** Deployed for all operational metadata, verification timestamps, git hashes, architecture badges, metric units, and status indicators. It visually grounds the portfolio as an engineer's workbench.
- **Metric Displays:** Numbers paired with performance achievements use tight negative tracking (`-0.03em`) and heavy weights (`700`), ensuring that stats like `99.99%` or `12ms` anchor their respective Bento cells.

## Layout & Spacing

The portfolio is structured around an asymmetrical **Bento Grid Engine** that fluidly reconfigures between 12-column desktop arrays and condensed mobile vertical feeds.

### Grid Anatomy
- **Desktop (>=1200px):** 12-column fluid grid, max container width `1280px`, `1.5rem` gutters, and `4rem` outer canvas padding. Bento tiles use 3, 4, 6, 8, or 12 column widths.
- **Tablet (768px - 1199px):** 6-column fluid grid, `1.25rem` gutters, `2rem` outer padding. Wide tiles stack into double-column sets.
- **Mobile (<768px):** Single-column stacked stream, `1rem` margins, `1rem` gaps. Bento tiles span 100% width with vertical prioritization: Identity -> Role Switcher -> Proof Counters -> Live Demos -> Technical Specs.

### Rhythm & Proportions
- Internal Bento card padding standardizes to `space-lg` (`1.5rem`) on desktop and `space-md` (`1rem`) on mobile.
- Dense micro-modules (e.g., metric counters, badge clusters) use compact `space-xs` and `space-sm` gaps to convey density and systems mastery without visual noise.

## Elevation & Depth

Visual hierarchy does not use soft diffuse drop-shadows typical of consumer apps. Depth is achieved via **luminous surface layering and physical specular borders**.

### Hierarchy of Depth
1. **Level 0 (Root Canvas):** Solid `#090d16`. Subdued background ambient gradient mesh with low-opacity radial glows in Indigo (`rgba(37, 99, 235, 0.08)`) and Cyan (`rgba(6, 182, 212, 0.05)`) positioned dynamically behind active Bento quadrants.
2. **Level 1 (Bento Surface):** Background `#0e1422` with a subtle linear background fill `linear-gradient(180deg, rgba(22, 31, 51, 0.6) 0%, rgba(14, 20, 34, 0.8) 100%)`.
3. **Level 2 (Active Cards & Floating Pills):** Background `#161f33` with backdrop filter `blur(12px)`.
4. **Level 3 (Popovers, Tooltips & Overlays):** Background `#1e293b` with a crisp outer shadow: `0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.12)`.

### Border & Highlight Physics
- All surface containers utilize a dual-layer inner border technique:
  - Outer: `1px solid rgba(255, 255, 255, 0.07)`
  - Inner top edge (specular simulation): An inset `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.12)`.
- On cursor proximity or hover, the container border transitions to `rgba(255, 255, 255, 0.2)` while reflecting a localized radial spotlight glow (`rgba(37, 99, 235, 0.15)`).

## Shapes

The design system adopts a balanced **Rounded (`2`)** profile. This standard provides modern high-tech sleekness without softening into playful or consumer-grade bubble forms.

- **Base Radius (`0.5rem` / `8px`):** Used for interactive buttons, inline code blocks, badges, metric cards, and input controls.
- **Container Radius (`rounded-lg` / `1rem` / `16px`):** Standard for all Bento modules, dialogue surfaces, and visual demo viewports.
- **Outer Shell Radius (`rounded-xl` / `1.5rem` / `24px`):** Applied to macro hero groupings and multi-cell wrapper canvases.
- **Pill Geometry (`9999px`):** Reserved exclusively for the **Interactive Role Switcher**, micro status indicators (e.g., "Available for Q3 Advisory"), and compact tech stack chips.

## Components

### 1. Interactive Role-Switcher Pill Bar
- **Container:** Floating horizontal capsule (`border-radius: 9999px`), background `rgba(22, 31, 51, 0.7)`, backdrop blur `16px`, bordered with `rgba(255, 255, 255, 0.1)`. Padding: `4px`.
- **Segment Items:** Monospaced label (`label-caps`), text color `#94a3b8`.
- **Selected State:** Glowing indicator pill with active sliding transition, background `#2563eb`, text `#ffffff`, box shadow `0 0 16px rgba(37, 99, 235, 0.5)`. Dynamic roles: `[AI Architect]`, `[Full-Stack Lead]`, `[Product Engineer]`.

### 2. Bento Proof Metrics Counter
- **Structure:** Level 1 Bento container. Top row features a micro-label (`label-caps` in `#64748b`) paired with a live tertiary status beacon.
- **Metric Core:** Prominent `metric-display` number in `#f8fafc`.
- **Trend/Verification Subtitle:** Inline row with delta tag (e.g., `+340% throughput` in `#10b981`) followed by `body-sm` description in `#94a3b8` referencing the codebase or system.

### 3. Contribution & Telemetry Heatmap Card
- **Grid Structure:** 52-week horizontal matrix of 10x10px micro-squares with `2px` spacing and `2px` corner radius.
- **State Gradients:** Empty cells `#161f33`, low `#064e3b`, medium `#047857`, high `#10b981`, peak `#34d399` with slight outer glow.
- **Interactive Tooltip:** Hovering a cell displays commit count, production pull request link, and verified timestamp formatted in `code-xs`.

### 4. Code & Architecture Badge Tags
- **Base Style:** Rounded `6px`, background `rgba(30, 41, 59, 0.6)`, border `1px solid rgba(255, 255, 255, 0.08)`, font `code-sm`.
- **Variants:**
  - *AI/ML Spec:* Border tinted Cyan (`rgba(6, 182, 212, 0.3)`), label color `#06b6d4`.
  - *Core Systems:* Border tinted Indigo (`rgba(37, 99, 235, 0.3)`), label color `#60a5fa`.
  - *Production Verified:* Tertiary dot prefix `#10b981`, label color `#f8fafc`.

### 5. Primary & Ghost Action Buttons
- **Primary:** Solid `#2563eb`, text `#ffffff`, weight `600`, radius `8px`, hover background `#3b82f6`, hover box-shadow `0 0 20px rgba(37, 99, 235, 0.4)`.
- **Ghost / Terminal Action:** Background `transparent`, border `1px solid rgba(255, 255, 255, 0.15)`, text `#f8fafc`, hover background `rgba(255, 255, 255, 0.05)`, hover border `rgba(255, 255, 255, 0.3)`.

### 6. High-Density Bento Cards
- **Header:** Features an integrated monospace breadcrumb (`path/to/module.ts`) alongside real-time status pills.
- **Body Canvas:** Houses live embedded system demos, interactive latency sliders, or dynamic architecture DAG diagrams.
- **Footer:** Crisp border-top separator `1px solid rgba(255, 255, 255, 0.06)`, padding `0.75rem 1.5rem`, displaying verifiable impact logs and direct repository or live demo links.