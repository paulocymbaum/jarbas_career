# Portfolio / CV — Design Document

A simple, professional web interface to showcase projects, work experience, and expertise. The design prioritizes clarity, fast scanning, and credibility over visual novelty.

---

## 1. Goals

| Goal | How the design supports it |
|------|---------------------------|
| **First impression in &lt; 5 seconds** | Hero states name, role, and one-line value proposition immediately |
| **Easy to scan** | Clear section hierarchy, consistent card patterns, scannable lists |
| **Credible & professional** | Restrained palette, strong typography, no gimmicks |
| **Low maintenance** | Content-driven structure; projects and jobs are data, not bespoke pages |
| **Works everywhere** | Mobile-first layout, readable at all sizes, accessible by default |

### Non-goals (for v1)

- Blog or CMS
- Complex animations or 3D effects
- Authentication or admin panel
- Multi-language support (can be added later)

---

## 2. Target audience

- **Recruiters & hiring managers** — need role fit, timeline, and contact quickly
- **Engineers & collaborators** — want to see projects, stack, and GitHub links
- **General visitors** — should understand who you are without scrolling far

Design for **skim reading**: headings, dates, and tags must carry meaning on their own.

---

## 3. Information architecture

Single-page layout with anchor navigation. All primary content lives on one scrollable page.

```
┌─────────────────────────────────────────────────────────┐
│  [Logo/Name]          About · Experience · Projects ·   │
│                       Skills · Contact        [Resume]  │
├─────────────────────────────────────────────────────────┤
│  HERO                                                   │
│  Name, title, short pitch, primary CTAs                 │
├─────────────────────────────────────────────────────────┤
│  ABOUT                                                  │
│  2–3 paragraphs + optional photo                        │
├─────────────────────────────────────────────────────────┤
│  EXPERIENCE                                             │
│  Reverse-chronological job cards                        │
├─────────────────────────────────────────────────────────┤
│  PROJECTS                                               │
│  Grid of project cards (featured first)                 │
├─────────────────────────────────────────────────────────┤
│  SKILLS / EXPERTISE                                     │
│  Grouped skill tags or compact category blocks          │
├─────────────────────────────────────────────────────────┤
│  CONTACT                                                │
│  Email, LinkedIn, GitHub + simple form or mailto        │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
│  Copyright, optional social links                         │
└─────────────────────────────────────────────────────────┘
```

### Navigation

- **Desktop**: sticky top bar with section links; smooth scroll to anchors
- **Mobile**: hamburger or condensed horizontal scroll; same anchor targets
- **Resume CTA**: dropdown in header listing profile-specific PDFs; each profile card has its own download button

---

## 4. Page sections (content spec)

### 4.1 Hero

**Purpose:** Answer “who are you and what do you do?” instantly.

| Element | Guidance |
|---------|----------|
| Name | Large, highest visual weight |
| Title / role | e.g. “Software Engineer · Backend & Distributed Systems” |
| Pitch | One sentence (max ~120 chars) on what you build or care about |
| Primary CTA | “View projects” → `#projects` |
| Secondary CTA | “Choose resume” → `#profiles` |
| Optional | Subtle background (gradient mesh, noise, or solid); no busy imagery |

### 4.2 About

**Purpose:** Human context beyond the résumé.

- 2–3 short paragraphs: background, current focus, what you’re looking for (if relevant)
- Optional: small circular or rounded-square photo (consistent with overall tone)
- Keep under ~150 words; link out for more (LinkedIn, blog) if needed

#### Professional Profiles (subsection)

Cards directly below the bio that show **how you position yourself** across roles (e.g. Senior Software Engineer, Fullstack Developer, Product Engineer).

Each **profile card** contains:

| Field | Example |
|-------|---------|
| Title | Fullstack Developer |
| Summary | 1–2 lines on scope and focus |
| Stack | Primary technologies — `TypeScript` `React` `Node.js` |
| Skills | Related capabilities — `REST APIs` `System Design` `CI/CD` |
| Resume | Profile-specific PDF — `/resumes/fullstack-developer.pdf` |

**Resume behavior:** No single global resume. Each profile has its own `resumeUrl`. The header **Resume** menu lists available profile PDFs; each card includes a **Download resume** button. Hero CTA links to `#profiles` so visitors pick the role-appropriate CV. Optional deep link: `/?profile={slug}` scrolls to and highlights the matching card.

**Layout:** Responsive grid — 1 col (mobile), 2 cols (tablet), 3 cols (desktop). Stack chips use accent styling; skills use default chip style. Optional colored top border per card for visual distinction.

### 4.3 Experience

**Purpose:** Prove professional trajectory.

Each **job card** contains:

| Field | Example |
|-------|---------|
| Role | Senior Software Engineer |
| Company | Acme Corp |
| Period | Jan 2022 – Present |
| Location / remote | Remote · UTC−3 |
| Summary | 1–2 lines on scope and impact |
| Highlights | 3–5 bullet points (metrics where possible) |
| Tech tags | `Go` `PostgreSQL` `Kubernetes` |

**Layout:** Vertical timeline on desktop (line + dots) or stacked cards on mobile. Most recent job first.

### 4.4 Projects

**Purpose:** Show what you’ve built.

Each **project card** contains:

| Field | Notes |
|-------|-------|
| Title | Project name |
| Description | 1–2 sentences |
| Image / thumbnail | Screenshot or abstract placeholder; 16:9 aspect ratio |
| Tech stack | Tags |
| Links | Live demo, GitHub, case study (icon buttons) |
| Featured flag | 1–3 projects pinned to top, slightly larger cards |

**Layout:** Responsive grid — 1 col (mobile), 2 cols (tablet), 3 cols (desktop). Featured projects span 2 columns on desktop.

### 4.5 Skills / Expertise

**Purpose:** Quick keyword match for recruiters and ATS-minded readers.

Group skills into **4–6 categories**, e.g.:

- Languages
- Frameworks & libraries
- Infrastructure & DevOps
- Databases
- Practices (testing, CI/CD, system design)

**Presentation:** Pill/chip tags per category, or a compact two-column list. Avoid long proficiency bars (subjective and hard to maintain).

### 4.6 Contact

**Purpose:** Lower friction to reach you.

- Email (obfuscated or `mailto:`)
- LinkedIn, GitHub, and other profiles as icon links
- Optional: minimal form (name, email, message) — only if you plan to wire a backend or service; otherwise `mailto:` is enough for v1

### 4.7 Footer

- © Year · Your name
- Repeat key social links
- Optional: “Built with …” one-liner

---

## 5. Visual design

Tokens, type, spacing, and recruiter flow for the public site live in **[revamp.md/](./revamp.md/README.md)**. That folder wins if this section disagrees.

**Direction:** cool slate canvas, navy type, steel-blue actions, IBM Plex Sans + IBM Plex Mono, 8px grid, 72rem shell, 40rem prose. No serif display face, no terracotta, no glass.

See [revamp.md/DESIGN.md](./revamp.md/DESIGN.md) for the palette and type scale, and [revamp.md/SPACING.md](./revamp.md/SPACING.md) for gutters and section rhythm.

### 5.5 Components (inventory)

| Component | Usage |
|-----------|-------|
| `Header` | Sticky nav, logo/name, section links, theme toggle, resume button |
| `Section` | Wrapper with `id`, title, optional subtitle |
| `Button` (shadcn) | Primary, secondary, ghost; `asChild` for anchor links |
| `Card` (shadcn) | Experience, project, education, certification containers |
| `Badge` (shadcn) | Tech stack, skills chips |
| Timeline | Experience vertical line + markers (custom CSS in `Experience`) |
| `Hero` | Hero block with anime.js stagger on load |
| `ProfessionalProfiles` | Profile cards with stack, skills, and per-profile resume download |
| `ResumeMenu` | Header dropdown for profile-specific resume downloads |
| `ResumeDownloadButton` | Per-profile download CTA on profile cards |
| Theme toggle | `useTheme` hook; `dark` class on `<html>` |
| `Footer` | Minimal site footer |

---

## 6. Interaction & motion

Motion is implemented with **anime.js** (v4). Keep it **subtle and purposeful**:

| Interaction | Behavior | anime.js usage |
|-------------|----------|----------------|
| Hero load | Staggered fade-up on name, title, pitch, CTAs | `animate()` with per-item `delay` |
| Section reveal | Fade + slide up when scrolled into view | `useReveal` hook (`src/hooks/scroll/use-reveal.ts`) + IntersectionObserver / `.fx-reveal` |
| Cards | Slight lift + shadow on hover | Tailwind `hover:` (CSS); optional anime on mount |
| Links | Color shift on hover | CSS transitions |
| Theme toggle | Instant swap | `class` toggle on `<html>`; CSS variables |
| Nav | Smooth scroll to anchors | `scroll-behavior: smooth` |

**Respect `prefers-reduced-motion`:** skip anime.js animations and disable CSS transforms when set (`useReducedMotion` hook).

**Guidelines for anime.js:**

- Prefer `outCubic` / `outQuad` easings; avoid bouncy or elastic effects
- Hero stagger total ≤ 500ms; section reveals ≤ 600ms
- Do not animate layout properties that trigger reflow (`width`, `height`, `top`)
- Use `opacity` and `translateY` only for entrance animations

---

## 7. Responsive behavior

| Breakpoint | Width | Layout notes |
|------------|-------|--------------|
| Mobile | &lt; 640px | Single column; hamburger nav; full-width cards |
| Tablet | 640–1024px | 2-column project grid; condensed nav |
| Desktop | &gt; 1024px | Full nav inline; 2–3 column grids; timeline visible |

Touch targets: minimum **44×44px** for buttons and nav items.

---

## 8. Accessibility

- Semantic HTML: `header`, `nav`, `main`, `section`, `article`, `footer`
- One `h1` (hero name); section titles as `h2`
- All images have `alt` text; decorative images use `alt=""`
- Color contrast ≥ **4.5:1** for body text, ≥ **3:1** for large text
- Visible focus rings on all interactive elements
- Skip link: “Skip to main content” as first focusable element
- External links: `rel="noopener noreferrer"` and accessible labels (“GitHub, opens in new tab”)

---

## 9. Content model (data shape)

Store content as structured data (JSON, YAML, or MDX frontmatter) so the UI stays generic.

```yaml
# Example: site.yml
name: "Your Name"
title: "Software Engineer"
pitch: "I build reliable backend systems and developer tools."
email: "you@example.com"
links:
  github: "https://github.com/you"
  linkedin: "https://linkedin.com/in/you"

professional_profiles:
  - title: "Fullstack Developer"
    slug: "fullstack-developer"
    resume: "/resumes/fullstack-developer.pdf"
    stack: ["TypeScript", "React", "Node.js"]
    skills: ["REST APIs", "System Design"]

experience:
  - role: "Senior Engineer"
    company: "Acme"
    start: "2022-01"
    end: null          # null = Present
    location: "Remote"
    summary: "Led platform team for payments API."
    highlights:
      - "Reduced p99 latency by 40%"
      - "Migrated monolith to event-driven services"
    tech: ["Go", "Kafka", "PostgreSQL"]

projects:
  - title: "Project Alpha"
    description: "Open-source CLI for ..."
    image: "/images/alpha.png"
    featured: true
    tech: ["Rust", "CLI"]
    links:
      github: "https://github.com/..."
      demo: "https://..."

skills:
  - category: "Languages"
    items: ["TypeScript", "Go", "Python"]
  - category: "Infrastructure"
    items: ["Docker", "Kubernetes", "Terraform"]
```

---

## 10. Tech stack (implementation)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **React 18** + **Vite** | Fast dev, static export, component model fits section-based UI |
| UI components | **shadcn/ui** (Radix + Tailwind) | Accessible primitives, copy-paste ownership, matches design tokens |
| Styling | **Tailwind CSS** | Utility-first; shadcn theme via CSS variables |
| Animation | **anime.js** v4 | Lightweight entrance/stagger animations; respects reduced-motion |
| Icons | **lucide-react** | Consistent with shadcn; tree-shakeable |
| Content | **SQLite** at build time → generated typed TS modules | See [ARCHITECTURE.md](./ARCHITECTURE.md) + [BACKEND.md](./BACKEND.md); `src/content/site.ts` is generated from the DB (`npm run build:content`) |
| Hosting | **Vercel** (static output via GitHub Actions → prebuilt deploy) | Free tier, custom domain |
| Fonts | IBM Plex Sans + IBM Plex Mono (per [revamp.md/DESIGN.md](./revamp.md/DESIGN.md)) | — |

**Build commands:** `npm run dev` (local), `npm run build` (static output in `dist/`).

The `mock/` folder holds the original plain HTML/CSS reference; the React app in `src/` is the implementation source of truth.

---

## 11. SEO & metadata

- `<title>`: `Your Name — Software Engineer` (or role)
- Meta description: hero pitch (~155 chars)
- Open Graph image: simple branded card (name + title)
- `robots.txt` and `sitemap.xml`
- Structured data: `Person` schema with `sameAs` links

---

## 12. File / route structure (reference)

```
/
├── index.html              → Vite entry
├── src/
│   ├── App.tsx             → page composition
│   ├── components/
│   │   ├── ui/             → shadcn (Button, Card, Badge, …)
│   │   ├── layout/         → Header, Footer, Section
│   │   └── sections/       → Hero, About, Experience, …
│   ├── content/            → site.ts (generated), freelance.ts (hand), types.ts (hand)
│   ├── hooks/              → useTheme, useReveal (anime.js / fx-reveal)
│   └── lib/                → utils, formatPeriod
├── public/resumes/         → profile-specific PDFs (one per professional profile)
└── dist/                   → static build output
```

The main CV is **single-page only** (hash anchors, e.g. `/#projects`); `/freelance` is a separate document (see README). Deep links use hash anchors for the main CV.

---

## 13. v1 scope checklist

- [x] Hero with name, title, pitch, CTAs
- [x] About section
- [x] Experience timeline / cards (data-driven)
- [x] Project grid with featured support
- [x] Skills grouped by category
- [x] Contact + social links
- [x] Sticky navigation with smooth scroll
- [x] Light / dark theme (shadcn CSS variables)
- [x] Responsive down to 320px
- [x] Profile-specific resume PDFs in `public/resumes/`
- [x] Basic SEO meta tags (OG image, structured data)
- [x] SQLite build pipeline (content generated from DB via `npm run build:content`)

### Nice-to-have (post-v1)

- Project detail pages
- Blog
- Analytics (privacy-friendly)
- i18n
- Print stylesheet for resume-like export

---

## 14. Open decisions

Before further implementation, confirm:

1. **Accent color** — default blue (`--primary`), or a personal brand color?
2. **Photo** — include in About or text-only?
3. **Contact** — `mailto:` only, or contact form with a service (Formspree, etc.)?
4. **Project depth** — cards only, or 1–2 flagship case-study pages?

**Resolved:** Tech stack is **React + Vite + shadcn/ui + anime.js + Tailwind** (see §10).

---

## 15. Wireframe (ASCII)

```
┌──────────────────────────────────────────────────────────────────┐
│  Your Name    About  Experience  Projects  Skills  Contact  ⬇ │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│     Your Name                                                 │
│     Software Engineer                                            │
│     I build reliable systems and tools developers love.          │
│                                                                  │
│     [ View projects ]    [ Download resume ]                     │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  About                                                           │
│  ─────                                                           │
│  Short bio paragraph...                                          │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  Experience                                                      │
│  ──────────                                                      │
│  ● Senior Engineer · Acme Corp          2022 – Present         │
│  │   Led platform team...                                        │
│  │   • Highlight one                                             │
│  │   • Highlight two                                             │
│  │   [Go] [Kafka] [PostgreSQL]                                   │
│  │                                                               │
│  ● Engineer · Startup Inc               2019 – 2022            │
│      ...                                                         │
├──────────────────────────────────────────────────────────────────┤
│  Projects                                                        │
│  ────────                                                        │
│  ┌─────────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  [featured image]   │  │  [image]     │  │  [image]     │  │
│  │  Project Alpha      │  │  Project B   │  │  Project C   │  │
│  │  Description...     │  │  ...         │  │  ...         │  │
│  │  [GitHub] [Demo]    │  │  [GitHub]    │  │  [GitHub]    │  │
│  └─────────────────────┘  └──────────────┘  └──────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│  Skills                                                          │
│  ──────                                                          │
│  Languages      [TS] [Go] [Python]                               │
│  Infra          [Docker] [K8s] [AWS]                             │
├──────────────────────────────────────────────────────────────────┤
│  Contact                                                         │
│  ───────                                                         │
│  you@email.com · GitHub · LinkedIn                               │
├──────────────────────────────────────────────────────────────────┤
│  © 2026 Your Name                                             │
└──────────────────────────────────────────────────────────────────┘
```

---

*This document is the source of truth for v1 layout and content. Implementation should follow section order, tokens, and data model above unless explicitly revised.*
