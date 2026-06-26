CREATE TABLE IF NOT EXISTS members (
  discord_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  warning_count INTEGER NOT NULL DEFAULT 0,
  github_username TEXT,
  joined_at TEXT NOT NULL,
  last_xp_at TEXT
);

CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id TEXT NOT NULL UNIQUE,
  opener_id TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  closed_at TEXT,
  transcript_html TEXT
);

CREATE TABLE IF NOT EXISTS warnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  mod_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS faq_hits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  faq_id TEXT,
  confidence REAL NOT NULL,
  channel_id TEXT NOT NULL,
  message_id TEXT,
  helped INTEGER,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mod_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  mod_id TEXT,
  target_id TEXT NOT NULL,
  reason TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS release_posts (
  notification_id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  posted_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS github_links (
  discord_id TEXT PRIMARY KEY,
  github_username TEXT NOT NULL,
  verify_code TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  linked_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS kv_store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_warnings_user ON warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_opener ON tickets(opener_id);
CREATE INDEX IF NOT EXISTS idx_faq_hits_created ON faq_hits(created_at);
