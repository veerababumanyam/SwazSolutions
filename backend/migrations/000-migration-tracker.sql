-- Migration Tracker Table
-- This table tracks which migrations have been applied to the database

CREATE TABLE IF NOT EXISTS migration_tracker (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migration_name TEXT NOT NULL UNIQUE,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  checksum TEXT
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_migration_tracker_name ON migration_tracker(migration_name);
