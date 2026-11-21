# Deploy setup — Step 2/3: Vercel + env vars

**Goal:** Vercel project linked, token created, env vars in `.env`, GitHub Actions secrets pushed.

**Handoff state at this step:**

- Vercel: account/project created (`npx vercel link`), token from `vercel.com/account/tokens`.
- `.env` vars: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `GITHUB_TOKEN`,
  `VITE_BASE_PATH`, `VITE_UMAMI_WEBSITE_ID`, `VITE_UMAMI_URL.
- GitHub Actions secrets: pushed via `npm run gh:secrets`.

**Next:** Step 3/3 — Deploy readiness.
