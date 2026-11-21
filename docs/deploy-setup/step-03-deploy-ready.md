# Deploy setup — Step 3/3: Deploy readiness

**Goal:** deployment readiness verified — content build passes, env complete, secrets pushed.

**Handoff state at this step:**

- Content: `npm run build` passes (requires `site_profile` + CV profiles; run
  `npm run db:reset` → fill `db/seed.sql` → `npm run build:content` → `npm run build`).
- Vercel: `npx vercel link` OK; `.env` complete; `npm run gh:secrets` pushed.

**Final deliverable:** complete deploy readiness state — Vercel account/project/token,
env vars in `.env`, GitHub auth, deploy status.

**Next:** deploy (`npx vercel deploy --prebuilt --prod` after CI build) / user decision.
