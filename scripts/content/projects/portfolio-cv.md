# Portfolio / CV

Single-page portfolio built with React, Vite, shadcn/ui, and Tailwind. Content is stored in SQLite and compiled into a typed TypeScript module at build time — the deployed site is fully static.

## Quick start

```bash
npm install
npm run db:reset      # create data/portfolio.db from schema + seed
npm run build:content # generate src/content/site.ts from the database
npm run build:resumes # generate ATS PDFs in public/resumes/
npm run dev           # start Vite dev server
```

Production build:

```bash
npm run build
```

## Editing content

| Method | Workflow |
|--------|----------|
| **SQL seed** | Edit `db/seed.sql` → `npm run db:reset` → `npm run build:content` |
| **SQLite GUI** | Open `data/portfolio.db` in DB Browser / TablePlus → `npm run build:content` |
| **Hand-editing TS** | Not recommended — `src/content/site.ts` is auto-generated |

The database file (`data/portfolio.db`) is gitignored. Only `db/schema.sql`, `db/migrations/`, and `db/seed.sql` are versioned.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run db:reset` | Recreate database from schema, migrations, and seed |
| `npm run build:content` | Read SQLite → write `src/content/site.ts` |
| `npm run sync:github-projects` | Fetch READMEs from GitHub → `content/projects/` |
| `npm run sync:github-activity` | Fetch contribution calendar → `data/github-activity.json` |
| `npm run gh:secrets` | Push `.env` secrets to GitHub Actions (Vercel + GitHub PAT) |
| `npm run build:resumes` | Render profile-specific ATS PDFs to `public/resumes/` |
| `npm run build` | `build:content` + `build:resumes` + TypeScript check + Vite production build |
| `npm run dev` | Vite dev server |
| `npm run lint` | ESLint |

## ATS resume PDFs

Each professional profile has a tailored ATS resume stored in SQLite (`professional_profile_cv` and related tables) and rendered to `public/resumes/{slug}.pdf` at build time (max 2 A4 pages).

```bash
npm run db:reset
npm run generate:resume-variants   # edit scripts/resumes/profile-scopes.mjs first
npm run build:resumes                # HTML → PDF via Playwright
npm run build
```

Generated PDFs are gitignored; CI installs Chromium and builds them on every run.

## Architecture

- [DESIGN.md](./DESIGN.md) — UI and content requirements
- [ARCHITECTURE.md](./ARCHITECTURE.md) — SQLite schema and data model
- [BACKEND.md](./BACKEND.md) — build pipeline, scripts, and operations
- [GITHUB.md](./GITHUB.md) — GitHub activity heatmap sync
- [VERCEL.md](./VERCEL.md) — Vercel deploy + GitHub secrets setup

## Project structure

```
db/           schema, migrations, seed SQL
data/         portfolio.db (generated, gitignored)
scripts/      db-reset, build-content, build-resumes, lib/
public/resumes/  generated PDFs (gitignored)
src/content/  types.ts (hand-maintained), site.ts (generated)
src/          React app
```
