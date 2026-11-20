-- Portfolio / CV — consolidated schema (v1)
-- See ARCHITECTURE.md §4 and BACKEND.md

PRAGMA foreign_keys = ON;

CREATE TABLE schema_migration (
  version     TEXT PRIMARY KEY,
  applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE site_profile (
  id               INTEGER PRIMARY KEY CHECK (id = 1),
  name             TEXT NOT NULL,
  title            TEXT NOT NULL,
  pitch            TEXT NOT NULL,
  about_paragraphs TEXT NOT NULL,
  photo_url        TEXT,
  email            TEXT NOT NULL,
  city             TEXT NOT NULL,
  country          TEXT NOT NULL,
  github_url       TEXT,
  linkedin_url     TEXT,
  website_url      TEXT,
  twitter_url      TEXT,
  footer_note      TEXT,
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE professional_profile (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  summary     TEXT,
  description TEXT,
  accent      TEXT,
  resume_url  TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  archived    INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE professional_profile_chip (
  profile_id  INTEGER NOT NULL REFERENCES professional_profile(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('stack', 'skill')),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (profile_id, label, kind)
);

CREATE TABLE experience (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  role        TEXT NOT NULL,
  company     TEXT NOT NULL,
  start_date  TEXT NOT NULL,
  end_date    TEXT,
  location    TEXT,
  summary     TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  archived    INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
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

CREATE TABLE professional_profile_cv (
  profile_id      INTEGER PRIMARY KEY REFERENCES professional_profile(id) ON DELETE CASCADE,
  headline        TEXT,
  summary         TEXT NOT NULL,
  keywords        TEXT,
  target_role     TEXT,
  locale            TEXT NOT NULL DEFAULT 'en',
  pdf_path          TEXT,
  page_count        INTEGER,
  generated_at      TEXT,
  content_version   INTEGER NOT NULL DEFAULT 1,
  education_ids     TEXT,
  certification_ids TEXT
);

CREATE TABLE professional_profile_experience (
  profile_id       INTEGER NOT NULL REFERENCES professional_profile(id) ON DELETE CASCADE,
  experience_id    INTEGER NOT NULL REFERENCES experience(id) ON DELETE CASCADE,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  include          INTEGER NOT NULL DEFAULT 1 CHECK (include IN (0, 1)),
  role_override    TEXT,
  summary_override TEXT,
  tech_override    TEXT,
  PRIMARY KEY (profile_id, experience_id)
);

CREATE TABLE professional_profile_experience_highlight (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id          INTEGER NOT NULL REFERENCES professional_profile(id) ON DELETE CASCADE,
  experience_id       INTEGER NOT NULL REFERENCES experience(id) ON DELETE CASCADE,
  body                TEXT NOT NULL,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  source_highlight_id INTEGER REFERENCES experience_highlight(id) ON DELETE SET NULL
);

CREATE TABLE professional_profile_cv_skill (
  profile_id  INTEGER NOT NULL REFERENCES professional_profile(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  label       TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (profile_id, category, label)
);

CREATE TABLE project (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url   TEXT,
  gradient    TEXT NOT NULL,
  featured    INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  private_repo INTEGER NOT NULL DEFAULT 0 CHECK (private_repo IN (0, 1)),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  archived    INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE project_link (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL CHECK (kind IN ('github', 'demo', 'case_study', 'other')),
  url        TEXT NOT NULL,
  label      TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE project_tech (
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, label)
);

CREATE TABLE professional_profile_cv_project (
  profile_id INTEGER NOT NULL REFERENCES professional_profile(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (profile_id, project_id)
);

CREATE TABLE education (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  institution  TEXT NOT NULL,
  degree       TEXT NOT NULL,
  field        TEXT,
  start_date   TEXT,
  end_date     TEXT,
  location     TEXT,
  summary      TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  archived     INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE certification (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  issuer        TEXT NOT NULL,
  issued_date   TEXT,
  expiry_date   TEXT,
  credential_id TEXT,
  verify_url    TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  archived      INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE skill_category (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  archived   INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1))
);

CREATE TABLE skill_item (
  category_id INTEGER NOT NULL REFERENCES skill_category(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (category_id, label)
);

CREATE TABLE article (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  kind        TEXT NOT NULL CHECK (kind IN ('article', 'post')),
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  author      TEXT,
  source      TEXT,
  read_time   TEXT,
  reactions   INTEGER,
  comments    INTEGER,
  external_id TEXT,
  featured    INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  archived    INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_professional_profile_sort ON professional_profile (sort_order);
CREATE INDEX idx_profile_cv_experience ON professional_profile_experience (profile_id, sort_order);
CREATE INDEX idx_profile_cv_highlight ON professional_profile_experience_highlight (profile_id, experience_id, sort_order);
CREATE INDEX idx_profile_cv_skill ON professional_profile_cv_skill (profile_id, sort_order);
CREATE INDEX idx_profile_cv_project ON professional_profile_cv_project (profile_id, sort_order);
CREATE INDEX idx_experience_sort ON experience (sort_order DESC, start_date DESC);
CREATE INDEX idx_project_featured ON project (featured DESC, sort_order);
CREATE INDEX idx_education_sort ON education (sort_order DESC, end_date DESC);
CREATE INDEX idx_certification_sort ON certification (sort_order);
CREATE INDEX idx_article_sort ON article (featured DESC, sort_order ASC, id DESC);
