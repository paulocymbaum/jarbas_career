# Deploy setup — Step 4/4: Deploy readiness

**Goal:** deployment readiness verified — content build passes, env complete, secrets pushed.

**Handoff state at this step:**

- Content: `npm run build` passes (requires `site_profile` + CV profiles; run
  `npm run db:reset` → fill `db/seed.sql` → `npm run build:content` → `npm run build`).
- Vercel: `npx vercel link` OK; `.env` complete (Vercel/GitHub + Umami credentials);
  `npm run gh:secrets` pushed.
- Umami: snippet verified in built HTML (`grep -l 'data-website-id' dist/*.html`).

**Final deliverable:** complete deploy readiness state — Vercel account/project/token,
env vars in `.env`, Umami website registered and snippet verified, GitHub auth, deploy
status.

**Next:** deploy (`npx vercel deploy --prebuilt --prod` after CI build) / user decision.
