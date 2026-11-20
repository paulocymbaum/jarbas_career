# External integrations — LinkedIn API

How to connect this portfolio to the **LinkedIn API** so you can fetch your own profile and published articles, then import curriculum data into `portfolio.db`.

This document complements [ARCHITECTURE.md](./ARCHITECTURE.md) (schema) and [BACKEND.md](./BACKEND.md) (build pipeline). External calls run **only at development/CI time** — the deployed site stays static.

---

## 1. What the integration does

```
┌─────────────────────┐     OAuth 2.0      ┌──────────────────────┐
│  scripts/           │ ◄────────────────► │  LinkedIn API          │
│  linkedin-auth.ts   │                    │  (userinfo, posts, …)  │
│  sync-linkedin.ts   │                    └──────────────────────┘
└─────────┬───────────┘
          │ writes
          ▼
┌─────────────────────┐     manual / future  ┌──────────────────────┐
│  data/linkedin/     │ ───────────────────► │  data/portfolio.db   │
│  snapshot.json      │     import step      │  (SQLite)            │
└─────────────────────┘                        └──────────┬───────────┘
                                                            │
                                                            ▼
                                                 npm run build:content
                                                            │
                                                            ▼
                                                 src/content/site.ts
```

| Layer | Path | Role |
|-------|------|------|
| Config | `.env` (from `.env.example`) | Credentials and sync toggles |
| Client | `scripts/integrations/linkedin/` | Typed API client, mappers |
| Auth CLI | `scripts/linkedin-auth.ts` | One-time OAuth to obtain tokens |
| Sync CLI | `scripts/sync-linkedin.ts` | Fetch profile + articles → snapshot |
| Staging | `data/linkedin/snapshot.json` | Normalized import payload (gitignored) |

---

## 2. LinkedIn API reality check

LinkedIn restricts member data heavily. Plan accordingly:

| Data | Self-serve (OIDC) | Posts / articles API | Full curriculum |
|------|-------------------|----------------------|-----------------|
| Name, photo, email | ✅ `openid profile email` | — | — |
| Public profile URL | ⚠️ vanity often missing; set `LINKEDIN_VANITY_NAME` manually | — | — |
| Headline | ⚠️ Limited via `/v2/me` | — | — |
| Your posts & articles | — | ⚠️ Needs `r_member_social` (**restricted; not accepting new apps**) | — |
| Experience, education, skills, certs | ❌ Not in self-serve APIs | — | Partner tier or **data export** |

**Implication for this project:** the integration fetches everything LinkedIn allows on a standard developer app. For a **complete CV** (experience, education, skills, certifications), use the [LinkedIn data export](#6-full-curriculum-via-data-export) path documented in §6, then map rows into `db/seed.sql` or edit `portfolio.db` directly.

Official references:

- [Sign In with LinkedIn (OpenID Connect)](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)
- [Authorization Code Flow](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
- [Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api)
- [Profile API](https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api)
- [Full profile fields (closed)](https://learn.microsoft.com/en-us/linkedin/shared/references/v2/profile/full-profile)
- [Verified on LinkedIn Plus tier](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/verified-on-linkedin/guides/plus-tier/quickstart) (enterprise partner)

---

## 3. Prerequisites

1. **LinkedIn account** with the profile and articles you want to import.
2. **LinkedIn Developer application** at [linkedin.com/developers](https://www.linkedin.com/developers/apps).
3. **Node.js 22+** and project dependencies installed (`npm install`).
4. Copy environment template:

   ```bash
   cp .env.example .env
   ```

5. Fill in `.env` — never commit it (see `.gitignore`).

---

## 4. Step 1 — Create the LinkedIn app

### 4.1 Create application

1. Go to [My Apps](https://www.linkedin.com/developers/apps) → **Create app**.
2. Associate it with a LinkedIn Page (required by LinkedIn; a personal page or company page works).
3. Accept the API Terms of Use.

### 4.2 Enable products

Open your app → **Products** tab → request:

| Product | Grants | Needed for |
|---------|--------|------------|
| **Sign In with LinkedIn using OpenID Connect** | `openid`, `profile`, `email` | Profile name, photo, email |
| **Share on LinkedIn** | `w_member_social` | Posting only (not required for read) |
| **Community Management API** | org scopes | Company pages (optional) |

For **reading your articles**, LinkedIn requires `r_member_social` on the Posts API. That scope is **restricted** and LinkedIn is [not accepting new requests](https://learn.microsoft.com/en-us/linkedin/marketing/lms-faq) at the time of writing. If you already have it on an approved app, add `r_member_social` to `LINKEDIN_SCOPES` in `.env`.

### 4.3 Auth settings

**Auth** tab:

| Field | Value |
|-------|-------|
| **Redirect URLs** | `http://localhost:8787/auth/linkedin/callback` (must match `LINKEDIN_REDIRECT_URI`) |
| **Client ID** | → `LINKEDIN_CLIENT_ID` |
| **Client Secret** | → `LINKEDIN_CLIENT_SECRET` (click Show) |

### 4.4 Verify app (if required)

Some scopes (`w_member_social`, partner tiers) require [app verification](https://learn.microsoft.com/en-us/linkedin/shared/api-guide/best-practices/application-development). Follow LinkedIn’s checklist in the Developer Portal.

---

## 5. Step 2 — OAuth: obtain access tokens

The portfolio uses a **3-legged OAuth** flow (you authorize your own app to read your data).

### 5.1 Configure scopes

In `.env`:

```env
LINKEDIN_SCOPES=openid profile email
```

Add `r_member_social` only if your app already has that permission.

### 5.2 Run the auth helper

```bash
npm run linkedin:auth
```

This:

1. Prints an authorization URL — open it in a browser.
2. Starts a local callback server on port `8787`.
3. Exchanges the authorization code for tokens.
4. Prints values to paste into `.env`:

```env
LINKEDIN_ACCESS_TOKEN=...
LINKEDIN_REFRESH_TOKEN=...
LINKEDIN_MEMBER_URN=urn:li:person:...
```

### 5.3 Set vanity name (recommended)

OIDC often does not return your public slug. Set it manually:

```env
LINKEDIN_VANITY_NAME=your-linkedin-slug
```

Your public URL becomes `https://www.linkedin.com/in/your-linkedin-slug` and maps to `site_profile.linkedin_url`.

### 5.4 Token lifetime

| Token | Typical lifetime |
|-------|------------------|
| Access token | ~60 days |
| Refresh token | ~365 days |

Refresh programmatically:

```typescript
const client = new LinkedInClient(config);
const tokens = await client.refreshAccessToken();
// update LINKEDIN_ACCESS_TOKEN (and refresh token if rotated)
```

Re-run `npm run linkedin:auth` if refresh fails.

---

## 6. Step 3 — Sync profile and articles

```bash
npm run sync:linkedin
```

Writes `data/linkedin/snapshot.json`:

```json
{
  "fetchedAt": "2026-07-27T…",
  "memberUrn": "urn:li:person:…",
  "profile": {
    "name": "…",
    "email": "…",
    "headline": "…",
    "photoUrl": "…",
    "vanityName": "…",
    "linkedinUrl": "https://www.linkedin.com/in/…"
  },
  "articles": [
    {
      "id": "…",
      "title": "…",
      "url": "https://www.linkedin.com/pulse/…",
      "summary": "…",
      "publishedAt": "…"
    }
  ],
  "experience": [],
  "education": [],
  "skills": [],
  "certifications": [],
  "warnings": [],
  "source": {
    "profile": "api",
    "articles": "api",
    "curriculum": "unavailable"
  }
}
```

Toggle sections in `.env`:

```env
LINKEDIN_SYNC_PROFILE=true
LINKEDIN_SYNC_ARTICLES=true
LINKEDIN_SYNC_EXPERIENCE=true   # warns if API cannot deliver
LINKEDIN_SYNC_EDUCATION=true
LINKEDIN_SYNC_SKILLS=true
LINKEDIN_SYNC_CERTIFICATIONS=true
```

### 6.1 API endpoints used

| Purpose | Method | Endpoint | Scopes |
|---------|--------|----------|--------|
| Profile (OIDC) | GET | `https://api.linkedin.com/v2/userinfo` | `openid profile email` |
| Lite profile | GET | `https://api.linkedin.com/v2/me?projection=(…)` | `openid profile` |
| Member posts / articles | GET | `https://api.linkedin.com/rest/posts?author={URN}&q=author` | `r_member_social` |

Required headers for REST endpoints:

```
Authorization: Bearer <access_token>
Linkedin-Version: 202509
X-Restli-Protocol-Version: 2.0.0
X-RestLi-Method: FINDER
```

Set `LINKEDIN_API_VERSION` in `.env` to match [LinkedIn’s current version](https://learn.microsoft.com/en-us/linkedin/marketing/versioning).

Articles are detected when a post’s `content.article.source` URL is present (LinkedIn Pulse / newsletter articles).

---

## 7. Full curriculum via data export

When API access is insufficient, LinkedIn’s **Download your data** archive is the compliant way to get complete profile content.

### 7.1 Request export

1. LinkedIn → **Settings & Privacy** → **Data privacy** → **Get a copy of your data**.
2. Select **Want something in particular?** and tick:
   - Profile
   - Positions (experience)
   - Education
   - Skills
   - Certifications
   - Articles (if listed)
3. Request **Larger archive** if you need full history.
4. Download the ZIP when emailed.

### 7.2 Point the project at the export

```env
LINKEDIN_DATA_EXPORT_PATH=/path/to/LinkedInDataExport.zip
```

A future import script can parse CSV/JSON inside the archive. Until then, map manually:

| Export file (typical) | SQLite table | ARCHITECTURE.md |
|-----------------------|--------------|-----------------|
| `Profile.csv` / `profile.json` | `site_profile` | §4.1 |
| `Positions.csv` | `experience`, `experience_highlight` | §4.3 |
| `Education.csv` | `education` | §4.5 |
| `Skills.csv` | `skill_category`, `skill_item` | §4.7 |
| `Certifications.csv` | `certification` | §4.6 |
| Articles / shares | `project` with `project_link.kind = 'case_study'` or future `article` table | §4.4 |

Date fields: convert to `YYYY-MM` before inserting (see BACKEND.md §5.3).

### 7.3 Suggested workflow

```bash
# 1. API sync (profile + articles when permitted)
npm run sync:linkedin

# 2. Complement with data export for experience/education/skills
#    → edit db/seed.sql or portfolio.db in a SQLite GUI

# 3. Rebuild content
npm run db:reset          # if you changed seed.sql
npm run build:content
npm run dev
```

---

## 8. Mapping snapshot → portfolio schema

| Snapshot field | DB target | TS field (`SiteContent`) |
|----------------|-----------|--------------------------|
| `profile.name` | `site_profile.name` | `name` |
| `profile.headline` | `site_profile.title` | `title` |
| `profile.photoUrl` | `site_profile.photo_url` | (About section) |
| `profile.email` | `site_profile.email` | `email` |
| `profile.linkedinUrl` | `site_profile.linkedin_url` | `links.linkedin` |
| `articles[]` | `project` + link `case_study`, or dedicated `article` table | future section |
| `experience[]` | `experience` + children | `experience[]` |
| `education[]` | `education` | `education[]` |
| `skills[]` | `skill_item` | `skills[]` |
| `certifications[]` | `certification` | `certifications[]` |

**About text** (`about_paragraphs`) is not returned by LinkedIn APIs — write it manually in `site_profile` or derive a short pitch from `profile.headline`.

Example SQL after reviewing `snapshot.json`:

```sql
UPDATE site_profile
SET
  name = 'Jane Doe',
  title = 'Senior Software Engineer',
  email = 'jane@example.com',
  photo_url = 'https://media.licdn.com/…',
  linkedin_url = 'https://www.linkedin.com/in/janedoe'
WHERE id = 1;
```

---

## 9. Partner-tier APIs (optional)

If you are approved for **Verified on LinkedIn Plus** or similar enterprise programs, additional scopes unlock structured curriculum via `/identityMe`:

| Scope | Data |
|-------|------|
| `r_profile_basicinfo` | Name, email, photo, profile URL |
| `r_primary_current_experience` | Current role and company |
| `r_most_recent_education` | Latest education entry |

Add approved scopes to `LINKEDIN_SCOPES` and extend `scripts/integrations/linkedin/client.ts` with the partner endpoints documented in your partnership agreement.

**Member Data Portability (DMA)** APIs exist for EEA users under specific regulatory programs — not a global substitute for full profile access.

---

## 10. Security and compliance

| Rule | Implementation |
|------|----------------|
| Never commit secrets | `.env` gitignored; only `.env.example` is tracked |
| Never ship tokens to production | Sync runs locally / in private CI only |
| Do not store other members’ data | This integration is **self-only** |
| Respect LinkedIn retention rules | [Storing member data policy](https://legal.linkedin.com/storing-member-data) |
| Static deploy | `dist/` contains no API keys or tokens (BACKEND.md §13) |

Add to CI only if you inject secrets via protected environment variables and run sync before `build:content`. Public forks should **not** enable LinkedIn sync in GitHub Actions without secret management.

---

## 11. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `LINKEDIN_CLIENT_ID is required` | Missing `.env` | `cp .env.example .env` and fill values |
| `redirect_uri mismatch` | Callback URL not registered | Match Auth tab and `LINKEDIN_REDIRECT_URI` exactly |
| `invalid_scope` | Requesting unavailable permission | Remove `r_member_social` / partner scopes from `LINKEDIN_SCOPES` |
| Posts API `400 Member permissions must be used…` | Missing `r_member_social` | Expected on standard apps; use data export for articles |
| Posts API `403` | Scope not granted | Check Products tab; scope may be closed to new apps |
| `/v2/me` returns minimal fields | Self-serve OIDC limitation | Set vanity manually; use data export for headline |
| `database is locked` | GUI has `portfolio.db` open | Close DB Browser / TablePlus |
| Empty `articles[]` with no error | Posts are not article type | Only Pulse/article posts have `content.article`; regular posts are skipped |

---

## 12. npm scripts reference

| Script | Command | Description |
|--------|---------|-------------|
| `linkedin:auth` | `tsx scripts/linkedin-auth.ts` | OAuth flow → tokens in `.env` |
| `sync:linkedin` | `tsx scripts/sync-linkedin.ts` | Fetch API data → `data/linkedin/snapshot.json` |
| `build:content` | existing | DB → `src/content/site.ts` |
| `build` | existing | Full static build |

---

## 13. Environment variables (complete list)

See [`.env.example`](./.env.example) for defaults and inline comments.

| Variable | Required | Description |
|----------|----------|-------------|
| `LINKEDIN_CLIENT_ID` | Yes | App Client ID |
| `LINKEDIN_CLIENT_SECRET` | Yes | App Client Secret |
| `LINKEDIN_REDIRECT_URI` | Yes | OAuth callback URL |
| `LINKEDIN_SCOPES` | No | Space-separated scopes (default: `openid profile email`) |
| `LINKEDIN_ACCESS_TOKEN` | For sync | Bearer token from OAuth |
| `LINKEDIN_REFRESH_TOKEN` | Recommended | Long-lived refresh token |
| `LINKEDIN_MEMBER_URN` | For posts | `urn:li:person:…` from OAuth |
| `LINKEDIN_VANITY_NAME` | Recommended | Public `/in/` slug |
| `LINKEDIN_API_VERSION` | No | REST version header (`202509`) |
| `LINKEDIN_SNAPSHOT_DIR` | No | Output directory (default: `data/linkedin`) |
| `LINKEDIN_SYNC_*` | No | Boolean toggles per section |
| `LINKEDIN_ARTICLES_PAGE_SIZE` | No | Pagination size (max 100) |
| `LINKEDIN_DATA_EXPORT_PATH` | No | Path to LinkedIn ZIP export |

---

## 14. Future work

- [ ] `scripts/import-linkedin.ts` — snapshot + data export → upsert `portfolio.db`
- [ ] `article` table migration for a dedicated Writing section
- [ ] Automatic token refresh before `sync:linkedin`
- [ ] `npm run build` hook: optional `sync:linkedin` when `LINKEDIN_ACCESS_TOKEN` is set

---

## Upwork — push portfolio to your freelancer profile

Local-only integration that reads `portfolio.db` and pushes **experience** and **projects** to your Upwork freelancer profile via the official GraphQL API.

```
┌─────────────────┐                      ┌──────────────────────┐
│  portfolio.db   │  sync-upwork.ts      │  Upwork GraphQL API  │
│  experience     │ ───────────────────► │  employment records  │
│  project        │                      │  other experience    │
└─────────────────┘                      └──────────────────────┘
          ▲                                         │
          │                                         │
   data/upwork/sync-state.json ◄───────────────────┘
   (maps portfolio IDs → Upwork record IDs)
```

| Portfolio data | Upwork destination | API support |
|----------------|-------------------|-------------|
| `experience` | Employment history | `addFreelancerEmploymentRecord` / `update…` |
| `project` | Other experience (subject + description) | `addFreelancerOtherExperience` / `update…` |
| Title, overview, skills, portfolio gallery | — | Not writable via public API |

Projects are mapped to **Other experience** because Upwork does not expose portfolio-project write mutations. Each entry includes tech stack, links, and a hidden marker (`portfolio-cv:project:<slug>`) for idempotent re-sync.

### Prerequisites

1. **Upwork freelancer account** with a completed profile.
2. **OAuth 2.0 API key** from [Upwork Developer](https://www.upwork.com/developer) with permission **Freelancer Profile - Read And Write Access**.
3. **Node.js 22+** and `npm install`.
4. Local database: `npm run db:reset` (if `data/portfolio.db` is missing).

### Setup

```bash
cp .env.example .env
# Fill UPWORK_CLIENT_ID and UPWORK_CLIENT_SECRET
# Register redirect URL: http://localhost:8788/auth/upwork/callback

npm run upwork:auth
# Paste tokens into .env

npm run sync:upwork          # dry-run (preview only)
npm run sync:upwork -- --apply   # push to Upwork
```

### npm scripts

| Script | Description |
|--------|-------------|
| `upwork:auth` | OAuth flow → tokens in `.env` |
| `sync:upwork` | Dry-run by default; writes `data/upwork/last-sync.json` |
| `sync:upwork -- --apply` | Create/update Upwork records |
| `sync:upwork -- --experience-only` | Skip projects |
| `sync:upwork -- --projects-only` | Skip employment history |

### Environment variables

See [`.env.example`](./.env.example) — `UPWORK_*` block.

### Security

- Tokens and sync state live in `.env` and `data/upwork/` (both gitignored).
- Never run sync in public CI without protected secrets.
- The deployed static site never includes Upwork credentials.

### Limitations

- **Overview, skills, specialized profiles, portfolio gallery** must still be edited manually on Upwork.
- Re-sync is idempotent via `data/upwork/sync-state.json` and embedded markers in descriptions.
- API key scopes are granted by Upwork during key approval — contact support if write mutations fail with permission errors.

---

*Document version: 1.1 — adds `scripts/integrations/upwork/`.*
