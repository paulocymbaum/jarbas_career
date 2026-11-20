# Portfolio / CV — SQLite Architecture

A simple, content-first data layer for the single-page portfolio described in [DESIGN.md](./DESIGN.md). SQLite holds structured UI content; the web app reads it at **build time** and ships static HTML (no runtime database).

---

## 1. Principles

| Principle | Choice |
|-----------|--------|
| **Single source of truth** | One `portfolio.db` file; no duplicated JSON/YAML |
| **Build-time reads only** | Query SQLite when generating the site; no DB on the server in v1 |
| **UI-shaped schema** | Tables map 1:1 to page sections and card fields |
| **Low ceremony** | Plain SQL + migrations; no ORM required for v1 |
| **Editable** | Seed from SQL, a small CLI, or any SQLite GUI (DB Browser, TablePlus) |

### Non-goals (v1)

- Admin UI or authentication
- Runtime API or live DB connections in production
- Multi-user or multi-tenant content

---

## 2. High-level flow

```
┌──────────────┐     migrations      ┌──────────────┐
│  schema.sql  │ ──────────────────► │ portfolio.db │
└──────────────┘                     └──────┬───────┘
                                            │
┌──────────────┐     seed / edits           │
│  seed.sql    │ ───────────────────────────┤
│  (or GUI)    │                            │
└──────────────┘                            ▼
                                   ┌─────────────────┐
                                   │  Build script   │
                                   │  (Node / tsx)     │
                                   └────────┬────────┘
                                            │ SELECT …
                                            ▼
                                   ┌─────────────────┐
                                   │  Typed TS module│
                                   │  src/content/   │
                                   └────────┬────────┘
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │  React + Vite   │
                                   │  static build   │
                                   │  (dist/)        │
                                   └─────────────────┘
```

At deploy time the site is **fully static** — same as YAML/JSON in DESIGN.md §9, but sourced from SQLite.

---

## 3. Schema overview

```
site_profile (1 row)
    │
    ├── professional_profile
    │       └── professional_profile_chip
    │
    ├── experience
    │       ├── experience_highlight
    │       └── experience_tech
    │
    ├── project
    │       ├── project_link
    │       └── project_tech
    │
    ├── education
    │
    ├── certification
    │
    └── skill_category
            └── skill_item
```

**Shared patterns**

- `sort_order` — display order within a section (lower = first)
- `start_date` / `end_date` — ISO `YYYY-MM` strings; `end_date` NULL = “Present”
- Junction tables (`*_tech`) — reusable tag lists for cards

---

## 4. Table definitions

### 4.1 Site profile (Hero, About, Contact)

One row drives global UI chrome.

```sql
CREATE TABLE site_profile (
  id              INTEGER PRIMARY KEY CHECK (id = 1),
  name            TEXT NOT NULL,
  title           TEXT NOT NULL,           -- hero role line
  pitch           TEXT NOT NULL,           -- hero one-liner (~120 chars)
  about_paragraphs TEXT NOT NULL,          -- JSON array of strings
  photo_url       TEXT,                    -- optional About photo
  email           TEXT NOT NULL,
  github_url      TEXT,
  linkedin_url    TEXT,
  twitter_url     TEXT,
  footer_note     TEXT,                    -- optional "Built with …"
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
```

`about_paragraphs` example: `["Paragraph one.", "Paragraph two."]`

---

### 4.2 Professional profiles

Maps to DESIGN.md §4.2 Professional Profiles subsection (under About).

```sql
CREATE TABLE professional_profile (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  summary     TEXT,
  accent      TEXT,                        -- Tailwind gradient classes, e.g. "from-blue-600 to-cyan-400"
  resume_url  TEXT NOT NULL,                -- e.g. "/resumes/fullstack-developer.pdf"
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE professional_profile_chip (
  profile_id  INTEGER NOT NULL REFERENCES professional_profile(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('stack', 'skill')),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (profile_id, label, kind)
);
```

**UI query:** `ORDER BY sort_order ASC, title ASC`; group chips by `kind`.

---

### 4.3 Experience

Maps to DESIGN.md §4.3 job cards.

```sql
CREATE TABLE experience (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  role        TEXT NOT NULL,
  company     TEXT NOT NULL,
  start_date  TEXT NOT NULL,               -- YYYY-MM
  end_date    TEXT,                        -- NULL = Present
  location    TEXT,
  summary     TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE experience_highlight (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  experience_id INTEGER NOT NULL REFERENCES experience(id) ON DELETE CASCADE,
  body          TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE experience_tech (
  experience_id INTEGER NOT NULL REFERENCES experience(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (experience_id, label)
);
```

**UI query:** `ORDER BY sort_order DESC, start_date DESC` (most recent first).

---

### 4.4 Projects

Maps to DESIGN.md §4.4 project cards.

```sql
CREATE TABLE project (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,        -- for anchors / future detail pages
  description TEXT NOT NULL,
  image_url   TEXT,
  featured    INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE project_link (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL CHECK (kind IN ('github', 'demo', 'case_study', 'other')),
  url        TEXT NOT NULL,
  label      TEXT,                         -- optional override for accessibility
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE project_tech (
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, label)
);
```

**UI query:** `ORDER BY featured DESC, sort_order ASC, title ASC`.

---

### 4.5 Education

Reverse-chronological cards (same visual pattern as experience, lighter content).

```sql
CREATE TABLE education (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  institution  TEXT NOT NULL,
  degree       TEXT NOT NULL,              -- e.g. "B.S. Computer Science"
  field        TEXT,                       -- e.g. "Computer Science"
  start_date   TEXT,                       -- YYYY-MM, optional
  end_date     TEXT,                       -- YYYY-MM or NULL if in progress
  location     TEXT,
  summary      TEXT,                       -- honors, thesis, GPA if desired
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Suggested nav:** add `#education` between Experience and Projects, or group under About — pick one in implementation.

---

### 4.6 Certifications

Compact list or small cards; credentials with issuer and optional expiry.

```sql
CREATE TABLE certification (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  issuer       TEXT NOT NULL,
  issued_date  TEXT,                       -- YYYY-MM
  expiry_date  TEXT,                       -- NULL if no expiry
  credential_id TEXT,                      -- badge / license number
  verify_url   TEXT,                       -- Credly, AWS verify link, etc.
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**UI:** single section or subsection under Skills — badges as links when `verify_url` is set.

---

### 4.7 Skills (unchanged from DESIGN.md §4.5)

```sql
CREATE TABLE skill_category (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE skill_item (
  category_id INTEGER NOT NULL REFERENCES skill_category(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (category_id, label)
);
```

---

### 4.8 Indexes

```sql
CREATE INDEX idx_professional_profile_sort ON professional_profile (sort_order);
CREATE INDEX idx_experience_sort ON experience (sort_order DESC, start_date DESC);
CREATE INDEX idx_project_featured ON project (featured DESC, sort_order);
CREATE INDEX idx_education_sort ON education (sort_order DESC, end_date DESC);
CREATE INDEX idx_certification_sort ON certification (sort_order);
```

---

## 5. Section → table mapping

| DESIGN.md section | Primary tables | Component |
|-------------------|----------------|-----------|
| Hero | `site_profile` | `Header`, `Hero` |
| About | `site_profile.about_paragraphs`, `photo_url` | `About`, `Section` |
| Professional Profiles | `professional_profile`, `professional_profile_chip` | `ProfessionalProfiles`, `ResumeMenu`, `ResumeDownloadButton`, `Card`, `Badge` |
| Experience | `experience`, `experience_highlight`, `experience_tech` | `Experience`, `Card`, `Badge` |
| Education | `education` | `Education`, `Card` |
| Projects | `project`, `project_link`, `project_tech` | `Projects`, `Card` |
| Skills | `skill_category`, `skill_item` | `Skills`, `Badge` |
| Certifications | `certification` | `Certifications`, `Card` |
| Contact / Footer | `site_profile` links + `footer_note` | `Contact`, `Footer` |

---

## 6. Example queries (build script)

### Full page payload (single round-trip per area)

```sql
-- Profile
SELECT * FROM site_profile WHERE id = 1;

-- Experience with nested data (app layer groups children)
SELECT e.*,
       (SELECT json_group_array(json_object('body', h.body, 'sort_order', h.sort_order))
        FROM experience_highlight h
        WHERE h.experience_id = e.id
        ORDER BY h.sort_order) AS highlights,
       (SELECT json_group_array(t.label)
        FROM experience_tech t
        WHERE t.experience_id = e.id
        ORDER BY t.sort_order) AS tech
FROM experience e
ORDER BY e.sort_order DESC, e.start_date DESC;

-- Projects
SELECT p.*,
       (SELECT json_group_array(json_object('kind', l.kind, 'url', l.url, 'label', l.label))
        FROM project_link l WHERE l.project_id = p.id ORDER BY l.sort_order) AS links,
       (SELECT json_group_array(t.label)
        FROM project_tech t WHERE t.project_id = p.id ORDER BY t.sort_order) AS tech
FROM project p
ORDER BY p.featured DESC, p.sort_order, p.title;

-- Education & certifications
SELECT * FROM education ORDER BY sort_order DESC, end_date DESC;
SELECT * FROM certification ORDER BY sort_order, issued_date DESC;

-- Skills
SELECT c.name AS category,
       (SELECT json_group_array(i.label)
        FROM skill_item i
        WHERE i.category_id = c.id
        ORDER BY i.sort_order) AS items
FROM skill_category c
ORDER BY c.sort_order;
```

SQLite 3.38+ `json_group_array` keeps the build script small; alternatively, run separate queries and join in application code.

---

## 7. Repository layout

```
portfolio-cv/
├── DESIGN.md
├── ARCHITECTURE.md          ← this file
├── index.html               ← Vite entry (main CV)
├── freelance.html           ← Vite entry (/freelance)
├── package.json
├── components.json          ← shadcn/ui config
├── tailwind.config.js
├── db/
│   ├── schema.sql           -- CREATE TABLE statements (consolidated)
│   ├── migrations/
│   │   └── 001_initial.sql
│   └── seed.sql             -- starter content (optional)
├── data/
│   └── portfolio.db         -- gitignored locally; CI builds from schema + seed
├── scripts/
│   └── build-content.ts     -- reads DB → generates src/content modules
├── mock/                    -- original HTML/CSS reference mock
└── src/
    ├── App.tsx
    ├── components/
    │   ├── ui/              -- shadcn (Button, Card, Badge, …)
    │   ├── layout/          -- Header, Footer, Section
    │   └── sections/        -- Hero, Experience, Projects, Skills, …
    ├── content/
    │   ├── types.ts         -- hand-maintained types
    │   ├── site.ts          -- generated from DB
    │   └── freelance.ts     -- hand-maintained copy (/freelance)
    ├── hooks/
    │   ├── use-theme.ts
    │   ├── use-anime.ts     -- scroll reveal + stagger (anime.js)
    │   └── use-reduced-motion.ts
    └── lib/
        ├── utils.ts         -- cn() helper
        └── format.ts        -- formatPeriod, formatIssued
```

**Workflow**

1. `sqlite3 data/portfolio.db < db/schema.sql`
2. `sqlite3 data/portfolio.db < db/seed.sql` (first run)
3. `npm run build:content` — query DB, write typed modules (`src/content/site.ts`, `src/content/recruitment.ts`, …)
4. `npm run build` — Vite static site → `dist/` (→ prerender → static HTML)

**Current state:** UI is implemented in React; content lives in generated TypeScript modules from SQLite (see BACKEND.md).

---

## 8. Date & display helpers

Keep formatting out of SQL:

| DB value | UI display |
|----------|------------|
| `start_date = '2022-01'`, `end_date = NULL` | `Jan 2022 – Present` |
| `end_date = '2024-06'` | `Jan 2022 – Jun 2024` |
| `issued_date` only (certs) | `Issued Mar 2023` |
| `expiry_date` set | append `· Expires Dec 2025` |

Implement once in a shared `formatPeriod(start, end)` utility.

---

## 9. Content editing options

| Method | Best for |
|--------|----------|
| **SQL seed files** | Version-controlled bulk updates |
| **SQLite GUI** | Quick one-off edits |
| **Thin CLI** (`portfolio add-project …`) | Repeatable commands without writing SQL |
| **Future: admin UI** | Post-v1; same schema |

---

## 10. Alignment with DESIGN.md

- Replaces §9 YAML example with equivalent relational rows — same fields, same UI.
- Education and certifications extend the IA; suggested nav order:

  `About · Experience · Education · Projects · Skills · Certifications · Contact`

  Certifications can merge into Skills if you prefer fewer nav items.

- Static hosting unchanged: no database in production.
- Frontend stack (DESIGN.md §10): **React + Vite + shadcn/ui + anime.js + Tailwind**.

---

## 11. v1 implementation checklist

- [x] Add `db/schema.sql` from §4
- [x] Add `db/seed.sql` with one row per section for smoke testing
- [x] Build script: DB → typed content module
- [x] React app with shadcn/ui components wired to content module
- [x] anime.js entrance animations (hero stagger, section scroll reveal)
- [x] Add Education + Certifications sections to page and nav
- [x] Document `npm run db:reset` (schema + seed)
- [x] Gitignore `data/portfolio.db`; commit schema + seed only

---

*Schema version: 1.0 — matches DESIGN.md v1 scope plus education and certifications.*
