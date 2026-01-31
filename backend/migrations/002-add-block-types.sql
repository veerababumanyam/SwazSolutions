-- Migration: Add new block types for Phase 3
-- Supports CONTACT_FORM, FILE_DOWNLOAD, MAP_LOCATION block types
-- Schema includes contact form submissions, file uploads, and map analytics

-- Add new columns to link_items table for styling and metadata
ALTER TABLE link_items ADD COLUMN metadata TEXT; -- JSON field for block-specific config
ALTER TABLE link_items ADD COLUMN backgroundColor TEXT;
ALTER TABLE link_items ADD COLUMN textColor TEXT;
ALTER TABLE link_items ADD COLUMN borderRadius INTEGER;

-- Contact form submissions table
CREATE TABLE IF NOT EXISTS contact_form_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id INTEGER NOT NULL,
  profile_id INTEGER NOT NULL,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  ip_hash TEXT, -- SHA256 hash of IP
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME,

  FOREIGN KEY (link_id) REFERENCES link_items(id) ON DELETE CASCADE,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_contact_form_submissions_link ON contact_form_submissions(link_id);
CREATE INDEX IF NOT EXISTS idx_contact_form_submissions_profile ON contact_form_submissions(profile_id);
CREATE INDEX IF NOT EXISTS idx_contact_form_submissions_created ON contact_form_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_form_submissions_email ON contact_form_submissions(email);

-- File downloads tracking table
CREATE TABLE IF NOT EXISTS file_downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id INTEGER NOT NULL,
  profile_id INTEGER NOT NULL,
  downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_hash TEXT,
  user_agent TEXT,

  FOREIGN KEY (link_id) REFERENCES link_items(id) ON DELETE CASCADE,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_file_downloads_link ON file_downloads(link_id);
CREATE INDEX IF NOT EXISTS idx_file_downloads_profile ON file_downloads(profile_id);
CREATE INDEX IF NOT EXISTS idx_file_downloads_date ON file_downloads(downloaded_at DESC);

-- Uploaded files storage table
CREATE TABLE IF NOT EXISTS file_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id INTEGER NOT NULL,
  profile_id INTEGER NOT NULL,
  file_url TEXT NOT NULL, -- S3 or local path
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  password_hash TEXT, -- bcrypt hash if password protected
  expires_at DATETIME,
  download_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (link_id) REFERENCES link_items(id) ON DELETE CASCADE,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_file_uploads_link ON file_uploads(link_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_profile ON file_uploads(profile_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created ON file_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_uploads_expires ON file_uploads(expires_at);

-- Map location analytics table
CREATE TABLE IF NOT EXISTS map_location_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id INTEGER NOT NULL,
  profile_id INTEGER NOT NULL,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_hash TEXT,
  device_type TEXT,

  FOREIGN KEY (link_id) REFERENCES link_items(id) ON DELETE CASCADE,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_map_location_views_link ON map_location_views(link_id);
CREATE INDEX IF NOT EXISTS idx_map_location_views_profile ON map_location_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_map_location_views_date ON map_location_views(viewed_at DESC);
