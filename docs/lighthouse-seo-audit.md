# Lighthouse SEO Audit — `/` and `/freelance`

**Method:** Lighthouse 12 (category: SEO only), run against the **production build** served by
`vite preview` (both pages are separate documents — `/` via `index.html`, `/freelance` via
`freelance.html`), headless Chromium (Playwright). Run date: 2026-11-15.

---

## 1. Results

| Page | Before | After | Failing audits (before) |
|---|---|---|---|
| `/freelance` | **92/100** | **100/100** | `robots-txt` — "robots.txt is not valid" (78 parse errors) |
| `/` (main CV) | **92/100** | **100/100** | `robots-txt` — same root cause |

**What passed on both pages (before and after):** `document-title`, `meta-description`,
`http-status-code`, `image-alt`, `link-text` (descriptive anchors), `crawlable-anchors`,
`is-crawlable` (no `noindex`), `hreflang` (single-locale → N/A pass).

## 2. Root cause of the 92 → the robots.txt trap

Neither page had a `robots.txt`, so every crawler request fell into the **SPA catch-all
rewrite** (`vercel.json`: everything not under `assets/` → `index.html`). Locally the preview
returned a 404 HTML page; in production it would return **`index.html` with status 200** —
crawlers would parse HTML as robots directives ("78 errors") and, worse, `Disallow` rules
could never be trusted. Same would happen to any future `sitemap.xml`, `llms.txt`, etc.

**Fix shipped:** `public/robots.txt` (User-agent * · Allow / · TODO comment for the Sitemap
line). Vercel serves static files from the output **before** applying rewrites, so the file
wins over the catch-all. Verified: `GET /robots.txt → 200 (text/plain)`, Lighthouse
`robots-txt` passes, score **100/100 on both pages**.

---

## 3. Improvement plan (what remains — blocked on the production domain)

Lighthouse's SEO category is now maxed. The items below are **beyond the Lighthouse score**
(Google Search Console / rich results territory) and all require the production URL:

| # | Improvement | Where | Blocked on |
|---|---|---|---|
| 1 | `<link rel="canonical">` on both pages (e.g. `<domain>/` and `<domain>/freelance`) — prevents the `/` vs `/freelance` duplication signal issues and matches the umami page split | `index.html`, `freelance.html` | production domain |
| 2 | `<meta property="og:url">` on both pages (crawlers use it to pick the canonical share URL) | same files | production domain |
| 3 | `sitemap.xml` with both URLs + `lastmod`; then uncomment the `Sitemap:` line in `public/robots.txt` | `public/sitemap.xml`, `public/robots.txt` | production domain |
| 4 | Submit both URLs in Google Search Console (and request indexing for `/freelance`) | GSC | domain + deploy |
| 5 | Optional: `hreflang` only if a Portuguese locale of `/freelance` ever ships (single-locale pages should NOT have hreflang) | — | product decision |

**JSON-LD status (not scored by Lighthouse, validated manually):** both pages ship structured
data — `Person` + `knowsAbout` on `/`; `Person` + `makesOffer` (5 services) on `/freelance`.
Keep them in sync when services change.

---

## 4. Non-SEO-core notes captured during the run

- **Performance/a11y were not part of this run** (SEO-only category). The scroll FX build keeps
  LCP-safe patterns (transform/opacity only, eager hero image with dimensions, no scroll hijack);
  a full four-category Lighthouse pass (Performance/Accessibility/Best Practices/SEO) is worth
  running after Phase 3 motion work settles.
- The `robots.txt` catch-all trap applies to **any future root-level static file**
  (`llms.txt`, `ads.txt`, `security.txt`): drop them in `public/` — filesystem wins over rewrites.

---

## 5. Re-run recipe

```bash
npx vite build                       # public/robots.txt lands in dist/
npx vite preview --port 4173 &       # serve the build (serves /freelance via plugin)
CHROME_PATH=~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome \
npx lighthouse@12 http://localhost:4173/freelance \
  --only-categories=seo --output=json --output-path=/tmp/lh.json \
  --quiet --chrome-flags="--headless=new --no-sandbox"
```

Raw run artifacts: `/tmp/lh-freelance.json`, `/tmp/lh-main.json` (before),
`/tmp/lh-f2.json`, `/tmp/lh-m2.json` (after).

