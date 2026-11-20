# GitHub integration

Syncs your **contribution calendar** (including private repositories) into the portfolio at build time.

> **Deploy** is handled by Vercel — see [VERCEL.md](./VERCEL.md).

---

## 1. What it does

```
GH_CONTRIBUTIONS_TOKEN (GitHub secret)
        │
        ▼
npm run sync:github-activity
        │
        ├── data/github-activity.json
        └── src/content/github-activity.ts
        │
        ▼
npm run build  →  dist/  →  Vercel (see VERCEL.md)
```

The **Activity** section shows a GitHub-style heatmap: one cell per day, color intensity by commit count (public + private).

---

## 2. Local setup

1. Create a [Personal Access Token](https://github.com/settings/tokens) (classic) with `repo` + `read:user`
2. Add to `.env`: `GITHUB_TOKEN=ghp_...`
3. Run: `npm run sync:github-activity`

---

## 3. GitHub Actions secret

```bash
npm run gh:secrets   # pushes GITHUB_TOKEN → GH_CONTRIBUTIONS_TOKEN
```

The automatic Actions `GITHUB_TOKEN` cannot read your personal contribution calendar — you need your own PAT stored as `GH_CONTRIBUTIONS_TOKEN`.

Username in CI comes from `github.actor`; contribution data comes from the PAT's `viewer.login`.

---

## 4. Scripts

| Command | Description |
|---------|-------------|
| `npm run sync:github-activity` | Fetch last 365 days of contributions |
| `npm run gh:secrets` | Push `.env` secrets to GitHub Actions |
| `npm run sync:github-projects` | Sync project READMEs |

---

## 5. Troubleshooting

| Issue | Fix |
|-------|-----|
| Sync fails in CI: `GH_CONTRIBUTIONS_TOKEN is not configured` | `npm run gh:secrets` after adding PAT to `.env` |
| Empty heatmap locally | Set `GITHUB_TOKEN` in `.env` |
| Private commits missing | PAT needs `repo` scope |
