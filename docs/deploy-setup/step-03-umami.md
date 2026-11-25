# Deploy setup — Step 3/4: Umami analytics (visitor-event tracking)

**Goal:** Umami account/website created, tracking credentials saved in `.env` and pushed
to GitHub secrets, snippet verified in the production build — visitor events tracked.

**Handoff state at this step:**

- Umami: account created (Cloud <https://cloud.umami.is> or self-hosted), website added
  for the production domain, **Website ID** copied (the tracking credential carried by
  `data-website-id`; no client-side secret token exists).
- `.env` vars: `VITE_UMAMI_WEBSITE_ID=<Website ID UUID>`, `VITE_UMAMI_URL=<instance URL,
  no trailing slash — Cloud: https://cloud.umami.is>`.
- GitHub Actions secrets: `VITE_UMAMI_WEBSITE_ID` + `VITE_UMAMI_URL` pushed via
  `npm run gh:secrets` (read by `deploy.yml`).
- Verified: `npm run build` → `grep -l 'data-website-id' dist/index.html
  dist/freelance.html` matches both; after deploy, a visit registers a pageview and CTA
  clicks register `element_click` events (event contract:
  `docs/analytics-umami-review.md`; AI-referral segments: `AGENT-SEO.md`).

**Next:** Step 4/4 — Deploy readiness.