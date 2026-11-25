# Vercel deployment

The portfolio deploys to **Vercel** via GitHub Actions. The site is built in CI (SQLite → content → PDFs → Vite) and the `dist/` folder is uploaded to Vercel.

> After deploying, see [DATA-EXTRACTION.md](./DATA-EXTRACTION.md) for how the deployed
> artifact (prerendered DOM, JSON-LD, `llms.txt`) is consumed by crawlers, AI agents and
> Umami analytics — and why keeping them in sync with the SQLite source of truth matters.

---

## 1. One-time setup

### A. Create the Vercel project

```bash
npm install
npx vercel link
```

Follow the prompts (link to your Vercel account/team, create or select project). This writes `.vercel/project.json` (gitignored) with `orgId` and `projectId`.

### B. Create a Vercel token

1. [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create token with scope for your team/account
3. Add to `.env`:

```bash
VERCEL_TOKEN=...
```

`VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are read automatically from `.vercel/project.json` when you run `npm run gh:secrets`, or add them manually to `.env`.

### C. GitHub PAT (activity heatmap)

```bash
GITHUB_TOKEN=ghp_...   # classic PAT: repo + read:user
```

### D. Push secrets to GitHub

```bash
cp .env.example .env
# fill VERCEL_TOKEN, GITHUB_TOKEN
npx vercel link       # if not done yet
npm run gh:secrets
```

| `.env` variable      | GitHub secret            | Used for                    |
|----------------------|--------------------------|-----------------------------|
| `GITHUB_TOKEN`       | `GH_CONTRIBUTIONS_TOKEN` | Contribution heatmap sync   |
| `VERCEL_TOKEN`       | `VERCEL_TOKEN`           | Deploy to Vercel            |
| `VERCEL_ORG_ID`      | `VERCEL_ORG_ID`          | Target team/account         |
| `VERCEL_PROJECT_ID`  | `VERCEL_PROJECT_ID`      | Target project              |
| `VITE_BASE_PATH`     | `VITE_BASE_PATH`         | Vite asset base path (use `/` on Vercel) |
| `VITE_UMAMI_WEBSITE_ID` | `VITE_UMAMI_WEBSITE_ID` | Umami website ID (optional analytics) |
| `VITE_UMAMI_URL`     | `VITE_UMAMI_URL`         | Umami instance URL (optional analytics) |

Verify: **Settings → Secrets and variables → Actions**

---

## 2. Deploy workflow

File: [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)

| Trigger             | Action                                      |
|---------------------|---------------------------------------------|
| Push to `main` / `master` | Sync activity → build → deploy to Vercel    |
| Daily at 04:00 Your City time (`0 7 * * *` UTC) | Same          |
| Manual dispatch     | Re-deploy on demand                         |

Steps:

1. `npm run sync:github-activity` (needs `GH_CONTRIBUTIONS_TOKEN`)
2. Commit updated `data/github-activity.json` if changed (`[skip ci]`)
3. `npx playwright install chromium` → `npm run db:reset` → `npm run build:content` → `npm run build:resumes` — fresh ATS resume PDFs, kept as the `resumes` artifact on every run
4. `npx tsc -b && npx vite build`
5. `npm run prerender` — renders `dist/freelance.html` + `dist/index.html` into fully-populated static HTML so AI crawlers and no-JS fetchers read the whole offer
6. Package `dist/` as Vercel prebuilt output → `vercel deploy --prebuilt --prod`

---

## 3. Optional: Vercel Git integration

You can **also** connect the repo in the Vercel dashboard for preview deployments on PRs. Production deploys are handled by the GitHub Action above so the full build pipeline (Playwright PDFs, SQLite, GitHub sync) runs in CI.

If you use Vercel's native Git integration for production too, disable one of the two to avoid double deploys.

---

## 4. Local preview

```bash
npm run build
npx vercel deploy dist
```

Production:

```bash
npx vercel deploy dist --prod
```

---

## 5. Troubleshooting

| Issue | Fix |
|-------|-----|
| Deploy fails: missing `VERCEL_*` | Run `npx vercel link` + `npm run gh:secrets` |
| Sync fails: missing `GH_CONTRIBUTIONS_TOKEN` | Add `GITHUB_TOKEN` to `.env`, run `npm run gh:secrets` |
| `vercel deploy` auth error | Regenerate token at vercel.com/account/tokens |
| Wrong team/project | Re-run `npx vercel link` and push secrets again |

---

## 6. Security

- Never commit `.env` or `.vercel/`
- Rotate `VERCEL_TOKEN` and GitHub PAT periodically
- Use fine-grained PATs with minimum scope when possible
