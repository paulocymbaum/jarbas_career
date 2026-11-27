# Portfolio / CV

**Your Name — Personal Portfolio & Freelance Developer** in one fast, static page: your story,
your proof, your pitch — built for both **recruiters** and **clients hiring you**.

## 🤖 Prompt for your AI agent (start here)

Copy the prompt below and paste it into your AI coding agent (Claude Code, Cursor, Copilot, …)
with this project open in your IDE:

```text
You are a senior software engineering agent working inside this GitHub repository:
https://github.com/paulocymbaum/jarbas_career

This project is a
personal portfolio + freelance website: one fast static page with two doors — the CV at `/`
(for recruiters) and the freelance page at `/freelance` (for clients). Stack: SQLite (source of
truth) → typed content → static site (Vite) → prerendered HTML deployed to Vercel.

Your mission: help the repository owner turn this template into their own personal portfolio.

Non-negotiable rules:
1. The database is the single source of truth. Never hand-edit generated files
   (src/content/site.ts, recruitment.ts, github-activity.ts, project-readmes.ts).
   Edit db/seed.sql, then run `npm run db:reset` and `npm run build:content`.
2. Read DESIGN.md, ARCHITECTURE.md and BACKEND.md before changing anything.
3. Onboard through this project's agentic skills, in this order: `harness-quality` first
   (audits the harness itself: skills, rules and hooks), then `interview` (structured
   professional-story interview → complete page customization plan), then `deploy-setup`
   (Vercel / GitHub / env setup). Later: `job-application`, `faq`, `design-taste-frontend`.
4. Drift-prevention hooks run automatically — do not bypass them; if one fails, fix the
   underlying issue. Agent hooks registered in `.claude/settings.json` (scripts in
   `scripts/harness/hooks/`): `post-tool-check.sh` on PostToolUse, `stop-gate-check.sh` and
   `deploy-env-check.sh` on Stop. Git hooks `pre-commit` and `pre-push` are installed by
   `npm run prepare` → `scripts/install-git-hooks.mjs`.
5. Validate every change with `npm run audit:content` and `npm run build` before finishing.
6. Respect the design gates (DESIGN.md, `design-taste-frontend` skill) and the SEO/ATS rules
   (AGENT-SEO.md, `.claude/rules/seo.mdc`).

Start by asking the owner which step they want, or run `harness-quality` and then the
`interview` skill if this is a fresh start.
```

## 📦 Get the project into your IDE — fork or download

Choose one option:

| Option | How | Best for |
|---|---|---|
| **🍴 Fork** | [Fork this repository on GitHub](https://github.com/paulocymbaum/jarbas_career/fork), then `git clone https://github.com/YOUR-USER/jarbas_career.git` | Keeping your own Git history on GitHub |
| **⬇️ Download** | [Download the ZIP from GitHub](https://github.com/paulocymbaum/jarbas_career/archive/refs/heads/main.zip) or [open directly in VS Code](https://vscode.dev/redirect?url=https%3A%2F%2Fgithub.com%2Fpaulocymbaum%2Fjarbas_career), then open the folder in your IDE | Quick start, no fork |

Either way, the next step is `npm install` → see [Quick start](#quick-start).

## What is this product?

It is a **personal portfolio + freelance website** for any professional who needs an online presence
who wants one fast, static page to hold their professional story, proof, and pitch.

- **Who it's for:** the owner (any professional) who wants recruiters and
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
| The Freelance page | `/freelance` | Clients hiring work — gain-framed headline, services, objections, work, process, FAQ, proof, CTAs |

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

- **Main CV (`/`)** — hero, professional profiles (Fullstack · Software · Product) with per-profile
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
- **`faq`** — answers configuration & functionality questions from the repo's own docs.

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
- [ANALYTICS.md](./ANALYTICS.md) — Umami visitor-event tracking: wiring, event taxonomy, dashboard recipes
- [DATA-EXTRACTION.md](./DATA-EXTRACTION.md) — how deploy (Vercel) + structured data + Umami analytics make the site machine-readable for agents

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
- `faq` — configuration & functionality Q&A from repo docs.

Suggested flow: `harness-quality` → `interview` → `deploy-setup`.
