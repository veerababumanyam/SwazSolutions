-- ============================================================================
-- Digital Invitations Database Schema Migration
-- SwazSolutions - Digital Invitation Feature
-- ============================================================================

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================================================
-- DIGITAL INVITATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS digital_invites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('wedding', 'engagement', 'housewarming', 'birthday', 'anniversary', 'baby-shower', 'corporate', 'festival', 'custom')),

  -- Host Information
  host_name TEXT NOT NULL,

  -- Language Configuration
  primary_lang TEXT NOT NULL DEFAULT 'en',
  secondary_lang TEXT,
  bilingual_enabled INTEGER NOT NULL DEFAULT 0 CHECK(bilingual_enabled IN (0, 1)),
  bilingual_layout TEXT CHECK(bilingual_layout IN ('sideBySide', 'stacked', 'tabs')),

  -- Single Event Fields
  event_date TEXT,
  event_time TEXT,
  venue TEXT,
  map_link TEXT,
  details TEXT,

  -- Multi-Event Itinerary (JSON)
  multi_event_enabled INTEGER NOT NULL DEFAULT 0 CHECK(multi_event_enabled IN (0, 1)),
  events_json TEXT, -- SubEvent[] as JSON

  -- Card Sections (JSON)
  sections_json TEXT, -- CardSection[] as JSON

  -- Cultural Configuration (JSON)
  indian_config_json TEXT, -- IndianEventConfig as JSON

  -- Media Configuration (JSON)
  media_config_json TEXT, -- MediaConfig as JSON

  -- Visual Settings
  template_id TEXT,
  custom_bg TEXT,
  custom_font TEXT,

  -- Features
  show_qr INTEGER NOT NULL DEFAULT 0 CHECK(show_qr IN (0, 1)),
  show_countdown INTEGER NOT NULL DEFAULT 1 CHECK(show_countdown IN (0, 1)),
  show_rsvp INTEGER NOT NULL DEFAULT 1 CHECK(show_rsvp IN (0, 1)),
  auto_expiry INTEGER NOT NULL DEFAULT 0 CHECK(auto_expiry IN (0, 1)),

  -- Generated Content
  generated_text TEXT,
  ai_tone TEXT CHECK(ai_tone IN ('Formal', 'Casual', 'Poetic', 'Witty', 'Traditional', 'Modern')),

  -- Gallery Images (JSON array)
  gallery_images TEXT, -- string[] as JSON

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'expired', 'archived')),
  slug TEXT UNIQUE,

  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- Foreign Key
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for digital_invites
CREATE INDEX IF NOT EXISTS idx_invites_user_id ON digital_invites(user_id);
CREATE INDEX IF NOT EXISTS idx_invites_status ON digital_invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_slug ON digital_invites(slug);
CREATE INDEX IF NOT EXISTS idx_invites_created_at ON digital_invites(created_at DESC);

-- ============================================================================
-- INVITE GUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS invite_guests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  invite_id TEXT,

  -- Guest Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  category TEXT NOT NULL CHECK(category IN ('Family', 'Friends', 'Work', 'VIP', 'Other')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Accepted', 'Declined')),
  plus_ones INTEGER NOT NULL DEFAULT 0 CHECK(plus_ones >= 0),
  dietary TEXT,
  is_invited INTEGER NOT NULL DEFAULT 0 CHECK(is_invited IN (0, 1)),

  -- Engagement Tracking
  last_contacted TEXT,
  open_count INTEGER NOT NULL DEFAULT 0 CHECK(open_count >= 0),
  last_open TEXT,
  device_info TEXT,
  location TEXT,

  -- Timestamp
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (invite_id) REFERENCES digital_invites(id) ON DELETE CASCADE
);

-- Indexes for invite_guests
CREATE INDEX IF NOT EXISTS idx_guests_user_id ON invite_guests(user_id);
CREATE INDEX IF NOT EXISTS idx_guests_invite_id ON invite_guests(invite_id);
CREATE INDEX IF NOT EXISTS idx_guests_email ON invite_guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_status ON invite_guests(status);
CREATE INDEX IF NOT EXISTS idx_guests_category ON invite_guests(category);

-- ============================================================================
-- GUEST GROUPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS invite_guest_groups (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  guest_ids TEXT, -- JSON array of guest IDs
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- Foreign Key
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for invite_guest_groups
CREATE INDEX IF NOT EXISTS idx_groups_user_id ON invite_guest_groups(user_id);

-- ============================================================================
-- SAVED TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS invite_templates (
  id TEXT PRIMARY KEY,
  user_id TEXT, -- NULL for system templates
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT, -- JSON array
  thumbnail_url TEXT,
  is_public INTEGER NOT NULL DEFAULT 0 CHECK(is_public IN (0, 1)),
  rating REAL DEFAULT 0 CHECK(rating >= 0 AND rating <= 5),
  downloads INTEGER NOT NULL DEFAULT 0 CHECK(downloads >= 0),
  data TEXT NOT NULL, -- Full template configuration as JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- Foreign Key
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for invite_templates
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON invite_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON invite_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON invite_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_rating ON invite_templates(rating DESC);

-- ============================================================================
-- RSVP RESPONSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS invite_rsvps (
  id TEXT PRIMARY KEY,
  invite_id TEXT NOT NULL,
  guest_id TEXT NOT NULL,
  response TEXT NOT NULL CHECK(response IN ('Accepted', 'Declined')),
  plus_ones INTEGER NOT NULL DEFAULT 0 CHECK(plus_ones >= 0),
  dietary TEXT,
  message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- Foreign Keys
  FOREIGN KEY (invite_id) REFERENCES digital_invites(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES invite_guests(id) ON DELETE CASCADE
);

-- Indexes for invite_rsvps
CREATE INDEX IF NOT EXISTS idx_rsvps_invite_id ON invite_rsvps(invite_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_guest_id ON invite_rsvps(guest_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_response ON invite_rsvps(response);

-- ============================================================================
-- ANALYTICS EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS invite_analytics (
  id TEXT PRIMARY KEY,
  invite_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('open', 'click', 'rsvp', 'view', 'share')),
  guest_id TEXT,
  metadata TEXT, -- JSON: device, location, referrer
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- Foreign Keys
  FOREIGN KEY (invite_id) REFERENCES digital_invites(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES invite_guests(id) ON DELETE SET NULL
);

-- Indexes for invite_analytics
CREATE INDEX IF NOT EXISTS idx_analytics_invite_id ON invite_analytics(invite_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON invite_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON invite_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_guest_id ON invite_analytics(guest_id);

-- ============================================================================
-- CHECK-INS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS invite_checkins (
  id TEXT PRIMARY KEY,
  invite_id TEXT NOT NULL,
  guest_id TEXT NOT NULL,
  checked_in_at TEXT NOT NULL DEFAULT (datetime('now')),
  checked_in_by TEXT NOT NULL,

  -- Foreign Keys
  FOREIGN KEY (invite_id) REFERENCES digital_invites(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES invite_guests(id) ON DELETE CASCADE,
  FOREIGN KEY (checked_in_by) REFERENCES users(id)
);

-- Indexes for invite_checkins
CREATE INDEX IF NOT EXISTS idx_checkins_invite_id ON invite_checkins(invite_id);
CREATE INDEX IF NOT EXISTS idx_checkins_guest_id ON invite_checkins(guest_id);
CREATE INDEX IF NOT EXISTS idx_checkins_checked_in_at ON invite_checkins(checked_in_at DESC);

-- ============================================================================
-- REMINDER RULES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS invite_reminders (
  id TEXT PRIMARY KEY,
  invite_id TEXT NOT NULL,
  name TEXT NOT NULL,
  days_offset INTEGER NOT NULL,
  offset_type TEXT NOT NULL CHECK(offset_type IN ('before', 'after')),
  trigger_event TEXT NOT NULL CHECK(trigger_event IN ('event_date', 'rsvp_deadline')),
  target_audience TEXT NOT NULL CHECK(target_audience IN ('all', 'pending', 'accepted', 'declined')),
  channels TEXT NOT NULL, -- JSON: {email, sms, whatsapp, push}
  message TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
  next_run TEXT,

  -- Foreign Key
  FOREIGN KEY (invite_id) REFERENCES digital_invites(id) ON DELETE CASCADE
);

-- Indexes for invite_reminders
CREATE INDEX IF NOT EXISTS idx_reminders_invite_id ON invite_reminders(invite_id);
CREATE INDEX IF NOT EXISTS idx_reminders_is_active ON invite_reminders(is_active);

-- ============================================================================
-- NOTIFICATION LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS invite_notifications (
  id TEXT PRIMARY KEY,
  invite_id TEXT NOT NULL,
  recipient TEXT NOT NULL,
  channel TEXT NOT NULL CHECK(channel IN ('email', 'sms', 'whatsapp', 'push')),
  status TEXT NOT NULL CHECK(status IN ('sent', 'delivered', 'read', 'failed')),
  campaign TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- Foreign Key
  FOREIGN KEY (invite_id) REFERENCES digital_invites(id) ON DELETE CASCADE
);

-- Indexes for invite_notifications
CREATE INDEX IF NOT EXISTS idx_notifications_invite_id ON invite_notifications(invite_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON invite_notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON invite_notifications(created_at DESC);

-- ============================================================================
-- USER QUOTA EXTENSIONS
-- ============================================================================

-- Add invitation quota columns to users table (if not exists)
-- This extends the existing users table with invitation-related quotas

-- Check if columns exist, add if they don't
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we need to be careful
-- The migration script should handle this appropriately

-- ============================================================================
-- INSERT DEFAULT TEMPLATES
-- ============================================================================

-- Insert some default templates for new users
INSERT OR IGNORE INTO invite_templates (id, user_id, name, description, category, tags, thumbnail_url, is_public, rating, downloads, data)
VALUES
  ('tpl_floral_gold', NULL, 'Royal Rajasthani', 'A luxurious gold and red theme inspired by Udaipur palaces.', 'Wedding', '["royal", "traditional", "gold", "floral"]', 'https://images.unsplash.com/photo-1583934555972-9c50de1c6b1a?q=80&w=600', 1, 4.8, 1240, '{"templateId": "wc1", "style": "Floral"}'),
  ('tpl_minimal_chic', NULL, 'Minimalist Chic', 'Clean lines and modern typography for the contemporary couple.', 'Wedding', '["modern", "minimal", "clean"]', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600', 1, 4.5, 850, '{"templateId": "mm1", "style": "Minimal"}'),
  ('tpl_garden_party', NULL, 'Garden Party', 'Floral accents and soft pastels perfect for outdoor events.', 'Birthday', '["floral", "nature", "pastel"]', 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?q=80&w=600', 1, 4.9, 2100, '{"templateId": "bd1", "style": "Floral"}'),
  ('tpl_neon_nights', NULL, 'Neon Nights', 'Dark mode with vibrant neon gradients for parties.', 'custom', '["neon", "dark", "party"]', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600', 1, 4.2, 430, '{"templateId": "custom", "style": "Neon"}'),
  ('tpl_vintage_vows', NULL, 'Vintage Vows', 'Sepia tones and typewriter fonts for a nostalgic feel.', 'Wedding', '["vintage", "classic", "sepia"]', 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600', 1, 4.7, 920, '{"templateId": "wc2", "style": "Vintage"}'),
  ('tpl_corporate', NULL, 'Corporate Summit', 'Professional blue and grey palette for business events.', 'corporate', '["professional", "business", "clean"]', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=600', 1, 4.0, 300, '{"templateId": "custom", "style": "Corporate"}');

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Create triggers to automatically update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_invites_updated_at
AFTER UPDATE ON digital_invites
FOR EACH ROW
BEGIN
  UPDATE digital_invites SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for invitation statistics
CREATE VIEW IF NOT EXISTS v_invite_stats AS
SELECT
  di.id,
  di.user_id,
  di.event_type,
  di.status,
  di.host_name,
  di.event_date,
  COUNT(DISTINCT ig.id) as total_guests,
  SUM(CASE WHEN ig.status = 'Accepted' THEN 1 ELSE 0 END) as accepted_guests,
  SUM(CASE WHEN ig.status = 'Declined' THEN 1 ELSE 0 END) as declined_guests,
  SUM(CASE WHEN ig.status = 'Pending' THEN 1 ELSE 0 END) as pending_guests,
  SUM(CASE WHEN ig.is_invited = 1 THEN 1 + ig.plus_ones ELSE 0 END) as expected_attendees
FROM digital_invites di
LEFT JOIN invite_guests ig ON di.id = ig.invite_id AND ig.is_invited = 1
GROUP BY di.id;

-- View for analytics summary
CREATE VIEW IF NOT EXISTS v_analytics_summary AS
SELECT
  ia.invite_id,
  ia.event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT ia.guest_id) as unique_guests,
  MIN(ia.created_at) as first_event,
  MAX(ia.created_at) as last_event
FROM invite_analytics ia
GROUP BY ia.invite_id, ia.event_type;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables were created
SELECT 'Digital Invites tables created successfully' as status;
