-- Migration: Add gallery_images table for GALLERY type link items
-- Supports multiple images per gallery link with captions and ordering

CREATE TABLE IF NOT EXISTS gallery_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_item_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (link_item_id) REFERENCES link_items(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_link ON gallery_images(link_item_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_order ON gallery_images(link_item_id, display_order);
