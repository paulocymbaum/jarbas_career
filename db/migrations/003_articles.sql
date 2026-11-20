CREATE TABLE IF NOT EXISTS article (
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
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_article_sort ON article (featured DESC, sort_order ASC, id DESC);
