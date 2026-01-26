-- Migration: Add link_items table for modern vCard suite
-- Supports CLASSIC, GALLERY, VIDEO_EMBED, HEADER, BOOKING, VIDEO_UPLOAD link types

CREATE TABLE IF NOT EXISTS link_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('CLASSIC', 'GALLERY', 'VIDEO_EMBED', 'HEADER', 'BOOKING', 'VIDEO_UPLOAD')),
  title TEXT NOT NULL,
  url TEXT,
  thumbnail TEXT,
  is_active INTEGER DEFAULT 1,
  clicks INTEGER DEFAULT 0,
  platform TEXT,
  layout TEXT CHECK(layout IN ('grid', 'carousel', 'list')),
  display_order INTEGER NOT NULL,
  schedule_enabled INTEGER DEFAULT 0,
  schedule_start_time TEXT,
  schedule_end_time TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_link_items_profile ON link_items(profile_id);
CREATE INDEX IF NOT EXISTS idx_link_items_order ON link_items(profile_id, display_order);
CREATE INDEX IF NOT EXISTS idx_link_items_type ON link_items(type);
CREATE INDEX IF NOT EXISTS idx_link_items_active ON link_items(is_active) WHERE is_active = 1;
