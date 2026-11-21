---
name: deploy-setup
description: >-
  Guide the user through deployment setup for this project: create a Vercel account and
  project, generate the Vercel variables the deploy pipeline needs, and add them to the
  .env file; plus set up the GitHub account for this project if it does not exist yet
  (create the account and authenticate on the agentic IDE). Use before the first Vercel
  deploy, when deploy env vars are missing, or when the user asks to ship to production.
hooks:
  Stop:
    - hooks:
        - type: command
          command: 'bash "$CLAUDE_PROJECT_DIR/scripts/harness/hooks/deploy-env-check.sh"'
          timeout: 30
---

# Deploy setup

You are the deployment setup guide. Your job: walk the user through getting this project
deployed, step by step, with each step gated and handoff written to markdown.

## Context

- Deploy pipeline: `.github/workflows/deploy.yml` (push to `main` / daily cron / manual
  dispatch → build → deploy to Vercel).
- One-time setup: `VERCEL.md`; env template: `.env.example`.
- Build gate: the pipeline runs `npm run build`, which runs `build:content` → `build:resumes`
  → `tsc -b` → `vite build` → `prerender`. **Content is required** (`site_profile` + CV
  profiles); run `npm run db:reset` → fill `db/seed.sql` (or follow the interview skill's
  content plan) → `npm run build:content` → `npm run build` before deploying.

## Steps

### Step 1 — GitHub (project)

**Prompt to present:**

> Before deploying, make sure this project is on GitHub. Check the remote
> (`git remote -v`) and GitHub auth (`gh auth status`). If the project has no GitHub
> account/repo yet, the user must create one at github.com/signup and authenticate on the
> agentic IDE (Claude Code: `gh auth login`; OpenCode: GitHub auth / `gh auth login`).

**Wait** for the user's input.

**Handoff:** `docs/deploy-setup/step-01-github.md`

### Step 2 — Vercel + env vars

**Prompt to present:**

> Set up Vercel for this project: create a Vercel account (vercel.com/signup), create the
> project (import this repo / `npx vercel link`), create a Vercel token
> (vercel.com/account/tokens), and add the variables the deploy pipeline needs to the
  `.env` file (from `.env.example`): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`,
  `GITHUB_TOKEN`, `VITE_BASE_PATH`, `VITE_UMAMI_WEBSITE_ID`, `VITE_UMAMI_URL — plus the
  GitHub/GitHub-Actions secrets via `npm run gh:secrets`.

**Wait** for the user's input.

**Handoff:** `docs/deploy-setup/step-02-vercel.md`

### Step 3 — Deploy readiness

**Prompt to present:**

> Verify deployment readiness: `npx vercel link`, env vars in `.env`, and secrets pushed
> (`npm run gh:secrets`). Also verify the production build passes (`npm run build`) — it
> requires content (site_profile + CV profiles), so run `npm run db:reset` → fill
> `db/seed.sql` → `npm run build:content` → `npm run build` before deploying.

**Handoff:** `docs/deploy-setup/step-03-deploy-ready.md`

## Final

At the end of this flow the agent must provide the complete deploy readiness state for
the project: Vercel account/project/token, env vars in `.env`, GitHub auth, and deploy
status.

## Guardrails

- Never fabricate Vercel tokens or secrets; instruct the user to create them.
- Never commit `.env` or `.vercel/`.
- Maintain the step order and handoff chain.
