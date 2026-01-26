-- Migration: Add theme_customizations table
-- Stores user-specific theme customizations separate from base themes

CREATE TABLE IF NOT EXISTS theme_customizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER NOT NULL UNIQUE,
  theme_id TEXT NOT NULL,
  custom_config TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_theme_customizations_profile ON theme_customizations(profile_id);
