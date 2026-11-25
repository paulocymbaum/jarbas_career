---
name: deploy-setup
description: >-
  Guide the user through deployment setup for this project: create a Vercel account and
  project, generate the Vercel variables the deploy pipeline needs, and add them to the
  .env file; create the Umami analytics account/website and save the tracking credentials
  in .env so visitor events are tracked; plus set up the GitHub account for this project
  if it does not exist yet (create the account and authenticate on the agentic IDE). Use
  before the first Vercel deploy, when deploy env vars are missing, when visitor-event
  tracking is not configured, or when the user asks to ship to production.
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
- One-time setup: `VERCEL.md`; env template: `.env.example`; analytics architecture:
  `DATA-EXTRACTION.md` + `docs/analytics-umami-review.md`.
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
  `GITHUB_TOKEN`, `VITE_BASE_PATH` — plus the GitHub/GitHub-Actions secrets via
  `npm run gh:secrets`. (Umami analytics credentials come in Step 3.)

**Wait** for the user's input.

**Handoff:** `docs/deploy-setup/step-02-vercel.md`

### Step 3 — Umami analytics (visitor-event tracking)

**Prompt to present:**

> Now enable visitor-event tracking. This site measures visitors with **Umami**
> (cookieless analytics): the production build injects `<script defer
> src="$VITE_UMAMI_URL/script.js" data-website-id="…">` into every page
> (`vite.config.ts` → `umamiAnalyticsPlugin`; never loaded in `npm run dev`). Once
> active it records pageviews, an automatic `element_click` event for every
> `a/button/[data-analytics-id]` element, the custom `track()` events documented in
> `docs/analytics-umami-review.md`, and AI-referral segments (`chat.openai.com`,
> `perplexity.ai`, `claude.ai`, … — see `AGENT-SEO.md`).
>
> Setup:
> 1. **Create the account** — Umami Cloud (easiest): sign up at
>    <https://cloud.umami.is> (free tier, no server needed). Self-hosted alternative:
>    run Umami via `docker compose` or on your server (docs: <https://umami.is/docs>).
> 2. **Add the website** — Umami dashboard: *Settings → Websites → Add website*;
>    name it and enter the production domain. Open the site's details and copy the
>    **Website ID** (a UUID). That ID is the tracking credential — it is what the
>    `data-website-id` attribute carries; there is no client-side secret token.
>    Umami API keys exist only for reading data later and are not used by this
>    pipeline.
> 3. **Save the credentials in `.env`** (from `.env.example`):
>    - `VITE_UMAMI_WEBSITE_ID=<the Website ID UUID>`
>    - `VITE_UMAMI_URL=https://cloud.umami.is` (Cloud) or your instance URL, **no
>      trailing slash** (self-hosted: e.g. `http://localhost:3000`)
> 4. **Push them to GitHub secrets** — `deploy.yml` reads `VITE_UMAMI_WEBSITE_ID` and
>    `VITE_UMAMI_URL` from repository secrets, so run `npm run gh:secrets` after saving.
> 5. **Verify the injection** — run `npm run build` and confirm the built pages carry
>    the snippet: `grep -l 'data-website-id' dist/index.html dist/freelance.html`
>    (both must match). After the deploy, visit the site once; the Umami dashboard
>    should register a pageview, and clicking any CTA registers an `element_click`.

**Wait** for the user's input.

**Handoff:** `docs/deploy-setup/step-03-umami.md`

### Step 4 — Deploy readiness

**Prompt to present:**

> Verify deployment readiness: `npx vercel link`, env vars in `.env` (including the
> Umami credentials), and secrets pushed (`npm run gh:secrets`). Also verify the
> production build passes (`npm run build`) — it requires content (site_profile + CV
> profiles), so run `npm run db:reset` → fill `db/seed.sql` → `npm run build:content` →
> `npm run build` before deploying.

**Handoff:** `docs/deploy-setup/step-04-deploy-ready.md`

## Final

At the end of this flow the agent must provide the complete deploy readiness state for
the project: Vercel account/project/token, env vars in `.env` (including the Umami
tracking credentials), Umami website registered and snippet verified in the built HTML,
GitHub auth, and deploy status.

## Guardrails

- Never fabricate Vercel tokens, Umami credentials, or secrets; instruct the user to
  create them.
- Never commit `.env` or `.vercel/`.
- The Umami Website ID is not a secret (it ships in the public HTML as
  `data-website-id`); never place real API keys or tokens in tracked files.
- Maintain the step order and handoff chain.
