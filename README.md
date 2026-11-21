# Portfolio / CV

**Your Name — AI Engineer & Full-Stack Developer** in one fast, static page: your story,
your proof, your pitch — built for both **recruiters** and **clients hiring you**.

## What is this product?

It is a **personal portfolio + freelance website** for an AI engineer / full-stack developer
who wants one fast, static page to hold their professional story, proof, and pitch.

- **Who it's for:** the owner (AI engineer / full-stack developer) who wants recruiters and
  clients to read one consistent story instead of hunting through scattered documents.
- **What it does:** tells the professional story, lists experience / skills / projects,
  proves work (GitHub heatmap, project showcases, freelance services), and pitches freelance
  engagement.
- **How it works:** SQLite (source of truth) → typed content → static site (Vite) → prerendered
  HTML deployed to Vercel.

It is deliberately content-driven: the owner fills the professional story; the system renders it.

Two doors into the same house:

| Door | Path | Who it's for |
|---|---|---|
| The CV | `/` | Recruiters — hero, experience, skills, projects, writing, certifications, education, GitHub heatmap, contact |
| The Freelance page | `/freelance` | Clients hiring AI / full-stack work — gain-framed headline, services, objections, work, process, FAQ, proof, CTAs |

Both doors are fed from a single source of truth (SQLite) and baked into a static site at
build time.

## Quick start

You need Node 22+, npm, and Chromium (only for the resume PDFs).

```bash
npm install
npm run db:reset      # create your database
npm run build:content # turn the database into typed content
npm run build:resumes # render ATS resume PDFs (needs Chromium)
npm run build         # full production build
npm run dev           # local dev server
```

## What's inside

- **Main CV (`/`)** — hero, professional profiles (Fullstack · AI · Product) with per-profile
  resume downloads, experience, skills, writing, education, certifications, projects, GitHub
  contribution heatmap, contact + footer.
- **Freelance page (`/freelance`)** — gain-framed hero, services, objection block, work,
  process, FAQ, proof points, calibrated CTAs.

## Where your content lives

- **Database (source of truth):** `db/schema.sql`, `db/migrations/`, `db/seed.sql`.
- **Generated:** `src/content/site.ts`, `recruitment.ts`, `github-activity.ts`, `project-readmes.ts`.
- **Hand-maintained:** `src/content/freelance.ts`, `src/content/types.ts`.

Edit the seed → reset → rebuild. Generated files are not hand-edited.

## Quality gates

- Deterministic SEO/ATS audit: `npm run audit:content`.
- Job-application tailoring CLI: `npm run jd -- …`.
- Design review gate (design-taste-frontend skill).
- Harness drift hooks (stop-gate, post-tool, deploy-env) via the agentic skills.

## Agentic skills — how your AI assistant helps you

- **`harness-quality`** — audits the harness (skills, rules, hooks) itself.
- **`interview`** — structured professional-story interview → complete page customization plan.
- **`deploy-setup`** — Vercel / GitHub / env setup for deployment.
- **`job-application`** — job posting → ATS-gated tailored CV + cover letter.

Suggested flow: `harness-quality` → `interview` → `deploy-setup`.

## Deploy

- `vercel.json`, `.github/workflows/deploy.yml`, `VERCEL.md`, `gh:secrets`.
- Setup instructions live in the `deploy-setup` agent skill.

## Docs

- [DESIGN.md](./DESIGN.md) — UI and content requirements
- [ARCHITECTURE.md](./ARCHITECTURE.md) — schema and data model
- [BACKEND.md](./BACKEND.md) — build pipeline, scripts, operations
- [GITHUB.md](./GITHUB.md) — GitHub activity heatmap sync
- [VERCEL.md](./VERCEL.md) — Vercel deploy + GitHub secrets
- [EXTERNAL.md](./EXTERNAL.md) — LinkedIn / Upwork integrations
- [AGENT-SEO.md](./AGENT-SEO.md) — AI-agent / crawler SEO strategy for `/freelance`

## Project structure

```
db/                     schema, migrations, seed SQL
data/                   portfolio.db (generated, gitignored), github-activity.json
scripts/                db-reset, build-content, build-resumes, prerender, audit, jd, lib/, …
public/resumes/         generated ATS PDFs (gitignored)
src/content/            types.ts (hand), site.ts + recruitment.ts + github-activity.ts + project-readmes.ts (generated), freelance.ts (hand)
src/                    React app (index.html = main CV, freelance.html = /freelance)
static-html/            ephemeral local static mirror (gitignored)
```

## Harnesses & automation

- **Git hooks** — `npm run prepare` → `scripts/install-git-hooks.mjs`.
- **CI** — `.github/workflows/build.yml`.
- **Deploy** — `.github/workflows/deploy.yml`.
- **Agent harnesses / skills** — `.claude/`, `.cursor/`, `.agents/` (+ `.cursor/rules/seo.mdc`).
- **RTK** — token-optimized CLI proxy.

## Agentic skill prompts (canonical)

- Harness quality: *"Audit the quality of this system's harness components (skills, rules and hooks) using prompt engineering, harness engineering and context engineering best practices."*
- Interview: *"Run the structured professional-story interview with me, one step at a time, waiting for each step's input before moving to the next."*
- Deploy setup: *"Guide me through Vercel account/project creation, generate the Vercel variables for the deploy pipeline, add them to the .env file, and set up GitHub auth for this project if missing."*

## Agentic skills — induction & onboarding

- `harness-quality` — audits the harness.
- `interview` — professional-story interview → complete page plan.
- `deploy-setup` — deployment setup.
- `job-application` — JD → ATS-gated tailoring.

Suggested flow: `harness-quality` → `interview` → `deploy-setup`.
