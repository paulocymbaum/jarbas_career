# Portfolio / CV

Single-page portfolio for **Your Name — AI Engineer & Full-Stack Developer**, built with React, Vite, shadcn/ui, Tailwind CSS, anime.js, and a SQLite → typed-TypeScript content pipeline. The deployed site is fully static (no runtime database).

Two public entries:

| Entry | HTML entry | React entry | Audience |
|---|---|---|---|
| Main CV | `index.html` | `src/main.tsx` → `src/App.tsx` | Recruiters (`/#…` anchors) |
| Freelance | `freelance.html` | `src/freelance-main.tsx` → `src/pages/FreelancePage.tsx` | Clients hiring freelance work (`/freelance`) |

Local-dev-only surfaces (stripped from production builds via `import.meta.env.DEV`): content admin (`#admin` hash route) and recruitment toolkit (`#recruitment` hash route).

## Quick start

```bash
npm install
npm run db:reset      # create data/portfolio.db from db/schema.sql + migrations + db/seed.sql
npm run build:content # generate src/content/site.ts (+ recruitment.ts, project readmes) from the DB
npm run build:resumes # render profile-specific ATS PDFs into public/resumes/ (needs Chromium)
npm run dev           # start Vite dev server
```

Production build:

```bash
npm run build         # build:content → build:resumes → tsc -b → vite build → prerender
```

## Features

### Main CV (`/`)
- Hero / parallax intro with staggered anime.js entrance.
- Professional profiles (Fullstack · AI · Product) with per-profile resume downloads; deep link via `/?profile=<slug>`.
- Experience (highlights + tech tags), Skills (grouped chips), Writing, Education, Certifications, Projects (featured first, demo/GitHub/links, README modal), GitHub contribution heatmap, Contact + Footer.

### Freelance page (`/freelance`)
- Hero with gain-framed headline, services (5 `makesOffer`), objection block ("Sound familiar?"), work (commercial engagements + product showcase), process (incl. teaching-decade), FAQ (pricing anchor), proof points, calibrated CTAs (Calendly `schedule` primary / email `brief` secondary).

### Content sources & generation
- **SQLite** (`db/schema.sql`, `db/migrations/`, `db/seed.sql`) → **generated TS**: `src/content/site.ts`, `src/content/recruitment.ts`, `src/content/github-activity.ts`, `src/content/project-readmes.ts`.
- **Hand-maintained**: `src/content/freelance.ts`, `src/content/types.ts`.

### Quality gates
- Deterministic SEO/ATS audit: `npm run audit:content` → report in `data/seo-ats-report.json` (site SEO + freelance positioning + ATS must-have coverage).
- Job-application tailoring CLI: `npm run jd -- <extract|match|gate|qualitative|score|pdf|html|deliver>`.
- Design review gate (design-taste-frontend skill, `.taste-skill/`).

### Integrations
- GitHub: contribution heatmap sync, project README sync.
- LinkedIn: OAuth (`linkedin:auth`) + sync (`sync:linkedin`).
- Upwork: OAuth (`upwork:auth`) + push sync (`sync:upwork`).
- Vercel deploy + GitHub secrets (`gh:secrets`).

### Analytics
- Umami (`VITE_UMAMI_WEBSITE_ID`, `VITE_UMAMI_URL`; optional, dev-off).

## Editing content

| Method | Workflow |
|--------|----------|
| **SQL seed** | Edit `db/seed.sql` → `npm run db:reset` → `npm run build:content` |
| **SQLite GUI** | Open `data/portfolio.db` in DB Browser / TablePlus → `npm run build:content` |
| **Hand-editing TS** | Not recommended for DB-sourced content — `src/content/site.ts` is auto-generated |

The database file (`data/portfolio.db`) is gitignored. Only `db/schema.sql`, `db/migrations/`, and `db/seed.sql` are versioned.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | `build:content` + `build:resumes` + `tsc -b` + `vite build` + `prerender` |
| `npm run build:content` | Read SQLite → write generated content modules |
| `npm run db:reset` | Recreate database from schema + migrations + seed |
| `npm run db:dump-seed` | Dump current DB → `db/seed.sql` |
| `npm run db:sync-seed` | `db:dump-seed` + `build:content` (DB → seed → content) |
| `npm run generate:resume-variants` | Regenerate ATS resume variants into `db/seed.sql` |
| `npm run build:resumes` | Render profile-specific ATS PDFs to `public/resumes/` |
| `npm run build:static-html` | Static HTML mirror of the portfolio → `static-html/` |
| `npm run prerender` | Render `dist/index.html` + `dist/freelance.html` into fully-populated static HTML (AI crawlers / no-JS fetchers) |
| `npm run audit:content` | Deterministic SEO/ATS audit → console + `data/seo-ats-report.json` |
| `npm run jd` | Job-application tailoring CLI (extract/match/gate/score/qualitative/pdf/html/deliver) |
| `npm run sync:github-activity` | Fetch contribution calendar → `data/github-activity.json` + `src/content/github-activity.ts` |
| `npm run sync:github-projects` | Fetch project READMEs → `content/projects/` |
| `npm run sync:project-assets` | Sync project images/assets |
| `npm run sync:linkedin` | OAuth + sync LinkedIn profile/posts → snapshot → DB |
| `npm run sync:upwork` | Dry-run/push Upwork experience + projects from DB |
| `npm run gh:secrets` | Push `.env` secrets to GitHub Actions (Vercel + GitHub PAT) |
| `npm run linkedin:auth` | LinkedIn OAuth flow → tokens in `.env` |
| `npm run upwork:auth` | Upwork OAuth flow → tokens in `.env` |
| `npm run lint` | ESLint |
| `npm run test` | Node test runner for scripts (`scripts/tests/*.test.ts`) |
| `npm run preview` | Vite preview server (serves `dist/`) |
| `npm run push` | `git pull --rebase --autostash && git push` |
| `npm run prepare` | Install git hooks (`scripts/install-git-hooks.mjs` → `scripts/git-hooks/*`) |

## ATS resume PDFs

Each professional profile has a tailored ATS resume in SQLite (`professional_profile_cv` + related tables) and renders to `public/resumes/{slug}.pdf` at build time (max 2 A4 pages):

```bash
npm run db:reset
npm run generate:resume-variants   # edit scripts/resumes/profile-scopes.mjs first
npm run build:resumes
npm run build
```

Generated PDFs are gitignored; CI installs Chromium and builds them on every run.

## Freelance page (`/freelance`)

`/freelance` is a separate Vite entry (`freelance.html` → `src/freelance-main.tsx` → `src/pages/FreelancePage.tsx`) with its own `<head>` (title, description, OG/Twitter, JSON-LD `Person` + `makesOffer`). Vercel rewrites `/freelance` → `/freelance.html`; dev/preview do the same via a Vite plugin. Copy lives in `src/content/freelance.ts` (hand-maintained). Its SEO is scored separately in `npm run audit:content`.

## Architecture

- [DESIGN.md](./DESIGN.md) — UI and content requirements
- [ARCHITECTURE.md](./ARCHITECTURE.md) — SQLite schema and data model
- [BACKEND.md](./BACKEND.md) — build pipeline, scripts, and operations
- [GITHUB.md](./GITHUB.md) — GitHub activity heatmap sync
- [VERCEL.md](./VERCEL.md) — Vercel deploy + GitHub secrets setup
- [EXTERNAL.md](./EXTERNAL.md) — LinkedIn / Upwork integrations
- [AGENT-SEO.md](./AGENT-SEO.md) — AI-agent / crawler SEO strategy for `/freelance`

## Project structure

```
db/                     schema, migrations, seed SQL
data/                   portfolio.db (generated, gitignored), github-activity.json
scripts/                db-reset, build-content, build-resumes, prerender, audit, jd, lib/, resumes/, content/, dev/, integrations/, git-hooks/, tests/
public/resumes/         generated ATS PDFs (gitignored)
src/content/            types.ts (hand), site.ts + recruitment.ts + github-activity.ts + project-readmes.ts (generated), freelance.ts (hand)
src/                    React app (index.html = main CV, freelance.html = /freelance)
static-html/            ephemeral local static mirror (gitignored)
```

## Harnesses & automation

- **Git hooks** — installed via `npm run prepare` (`scripts/install-git-hooks.mjs`) → copies `scripts/git-hooks/{pre-commit,pre-push}` into `.git/hooks/`:
  - `pre-commit`: blocks staging of ephemeral dirs (`applications/`, `static-html/`); regenerates `db/seed.sql` from `data/portfolio.db` when the DB changes.
  - `pre-push`: auto-rebases onto upstream before pushing (handles bot activity commits).
- **CI** — `.github/workflows/build.yml` (PRs + manual): `npm ci` → Playwright Chromium → `db:reset` → `build` → upload `dist`.
- **Deploy** — `.github/workflows/deploy.yml`: push to `main` / daily cron `0 7 * * *` UTC (04:00 Your City) / manual → sync GitHub activity → build PDFs → build site → prerender → `vercel deploy --prebuilt --prod`.
- **Agent harnesses / skills** — `.claude/skills/job-application`, `.cursor/skills/{design-taste-frontend,linkedin-refresh,no-ai-slop}`, `.agents/skills/{design-taste-frontend,no-ai-slop}`, `.cursor/rules/seo.mdc`, design gate in `.taste-skill/`.
- **RTK** — token-optimized CLI proxy (`rtk …`) wraps bash commands; see `/home/your-user/.claude/RTK.md`.
- **Agent skill prompts** — canonical prompts to invoke the agentic skills of this system:

  - **Harness quality audit**: "Audit the quality of this system's harness components (skills, rules and hooks) using prompt engineering, harness engineering and context engineering best practices."
  - **Interview / storytelling**: "Run the structured professional-story interview with me, one step at a time, waiting for each step's input before moving to the next."
  - **Deploy setup**: "Guide me through Vercel account/project creation, generate the Vercel variables for the deploy pipeline, add them to the .env file, and set up GitHub auth for this project if missing."

## Agentic skills — induction & onboarding

How to use the agentic skills of this system and what they do.

### `harness-quality` — harness component auditor

**What it does:** audits the quality of this system's harness components (skills, rules, hooks) through the combined lenses of prompt engineering, harness engineering, and context engineering; scores each audit dimension, emits findings and recommendations, and defines evals.

**How to use:** invoke with the canonical prompt ("Audit the quality of this system's harness components…"). Run it before creating a new agent component, after writing/editing one, or when behavior looks under-triggered, over-triggered, inconsistent, bloated or context-starved.

**Induction:** structural drift nudges are enforced by hooks (`scripts/harness/hooks/stop-gate-check.sh`, `post-tool-check.sh`, `deploy-env-check.sh`).

### `interview` — professional-story interviewer

**What it does:** runs a structured professional-story interview, one step at a time, always waiting for the user's input before moving to the next step; ends by producing the complete plan to customize the page from the user's professional information.

**How to use:** invoke with the canonical prompt; answer Step 1 (LinkedIn URL + LinkedIn PDF), then Step 2 (professional profile + latest CVs), Step 3 (personal story per experience → `STORYTELLING.md`), Step 4 (plan: data to include / what to change in pages), and receive the final complete plan.

### `deploy-setup` — deployment setup guide

**What it does:** walks the user through Vercel account/project creation, generation of the Vercel variables the deploy pipeline needs, adding them to the `.env` file, and the GitHub account setup step (create account + authenticate on the agentic IDE if missing).

**How to use:** invoke with the canonical prompt; run before the first Vercel deploy, when deploy env vars are missing, or when the user asks to ship to production.

### Suggested onboarding flow

1. Start with `harness-quality` to audit the current harness state.
2. Run `interview` to collect the professional story before filling page content.
3. Run `deploy-setup` before deploying (env vars, GitHub auth).
