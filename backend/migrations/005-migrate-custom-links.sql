-- Migration: Migrate existing custom_links to link_items
-- Converts legacy custom_links (CLASSIC type only) to new link_items table
-- Does NOT drop custom_links table (kept for rollback safety)

-- Migrate existing custom_links to link_items as CLASSIC type
INSERT INTO link_items (profile_id, type, title, url, is_active, display_order, created_at, updated_at)
SELECT
  profile_id,
  'CLASSIC' as type,
  link_title as title,
  link_url as url,
  is_public as is_active,
  display_order,
  created_at,
  updated_at
FROM custom_links
WHERE NOT EXISTS (
  SELECT 1 FROM link_items li
  WHERE li.profile_id = custom_links.profile_id
  AND li.title = custom_links.link_title
  AND li.type = 'CLASSIC'
);

-- Validation query (for manual verification)
-- Run these after migration to verify:
-- SELECT 'custom_links count:', COUNT(*) FROM custom_links;
-- SELECT 'link_items (CLASSIC) count:', COUNT(*) FROM link_items WHERE type='CLASSIC';
-- Counts should match if migration is successful
