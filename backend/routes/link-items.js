const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

/**
 * GET /api/profiles/me/links
 * Get all link items for authenticated user's profile
 */
router.get('/me/links', authenticateToken, async (req, res) => {
  try {
    await db.ready;

    // Get user's profile
    const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Fetch all link items
    const links = db.prepare(`
      SELECT * FROM link_items
      WHERE profile_id = ?
      ORDER BY display_order ASC
    `).all(profile.id);

    // For GALLERY type links, fetch gallery images
    for (const link of links) {
      if (link.type === 'GALLERY') {
        link.galleryImages = db.prepare(`
          SELECT * FROM gallery_images
          WHERE link_item_id = ?
          ORDER BY display_order ASC
        `).all(link.id);
      }
    }

    res.json(links);
  } catch (error) {
    console.error('Error fetching link items:', error);
    res.status(500).json({ error: 'Failed to fetch link items' });
  }
});

/**
 * POST /api/profiles/me/links
 * Create new link item
 */
router.post('/me/links', authenticateToken, async (req, res) => {
  try {
    await db.ready;

    const { type, title, url, thumbnail, platform, layout, scheduleEnabled, scheduleStartTime, scheduleEndTime } = req.body;

    // Validation
    const validTypes = ['CLASSIC', 'GALLERY', 'VIDEO_EMBED', 'HEADER', 'BOOKING', 'VIDEO_UPLOAD'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid link type. Must be one of: ' + validTypes.join(', ') });
    }

    if (!title || title.length > 200) {
      return res.status(400).json({ error: 'Title is required and must be <= 200 characters' });
    }

    // URL required for most types (except HEADER)
    if (type !== 'HEADER' && !url) {
      return res.status(400).json({ error: 'URL is required for this link type' });
    }

    // Validate layout for GALLERY type
    if (type === 'GALLERY' && layout && !['grid', 'carousel', 'list'].includes(layout)) {
      return res.status(400).json({ error: 'Invalid layout. Must be one of: grid, carousel, list' });
    }

    // Get user's profile
    const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get max display_order
    const maxOrderRow = db.prepare('SELECT MAX(display_order) as maxOrder FROM link_items WHERE profile_id = ?').get(profile.id);
    const displayOrder = (maxOrderRow?.maxOrder || 0) + 1;

    // Insert link item
    const result = db.prepare(`
      INSERT INTO link_items (
        profile_id, type, title, url, thumbnail, platform, layout,
        display_order, schedule_enabled, schedule_start_time, schedule_end_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      profile.id,
      type,
      title,
      url || null,
      thumbnail || null,
      platform || null,
      layout || null,
      displayOrder,
      scheduleEnabled ? 1 : 0,
      scheduleStartTime || null,
      scheduleEndTime || null
    );

    // Fetch created link item
    const createdLink = db.prepare('SELECT * FROM link_items WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(createdLink);
  } catch (error) {
    console.error('Error creating link item:', error);
    res.status(500).json({ error: 'Failed to create link item' });
  }
});

/**
 * PUT /api/profiles/me/links/:id
 * Update link item
 */
router.put('/me/links/:id', authenticateToken, async (req, res) => {
  try {
    await db.ready;

    const linkId = req.params.id;
    const { type, title, url, thumbnail, isActive, platform, layout, scheduleEnabled, scheduleStartTime, scheduleEndTime } = req.body;

    // Get user's profile
    const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Verify link belongs to user's profile
    const existingLink = db.prepare('SELECT * FROM link_items WHERE id = ? AND profile_id = ?').get(linkId, profile.id);

    if (!existingLink) {
      return res.status(404).json({ error: 'Link item not found' });
    }

    // Validation (if fields provided)
    if (type) {
      const validTypes = ['CLASSIC', 'GALLERY', 'VIDEO_EMBED', 'HEADER', 'BOOKING', 'VIDEO_UPLOAD'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid link type' });
      }
    }

    if (title !== undefined && (title.length === 0 || title.length > 200)) {
      return res.status(400).json({ error: 'Title must be 1-200 characters' });
    }

    if (layout && !['grid', 'carousel', 'list'].includes(layout)) {
      return res.status(400).json({ error: 'Invalid layout' });
    }

    // Build UPDATE query dynamically (only update provided fields)
    const updates = [];
    const values = [];

    if (type !== undefined) { updates.push('type = ?'); values.push(type); }
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (url !== undefined) { updates.push('url = ?'); values.push(url); }
    if (thumbnail !== undefined) { updates.push('thumbnail = ?'); values.push(thumbnail); }
    if (isActive !== undefined) { updates.push('is_active = ?'); values.push(isActive ? 1 : 0); }
    if (platform !== undefined) { updates.push('platform = ?'); values.push(platform); }
    if (layout !== undefined) { updates.push('layout = ?'); values.push(layout); }
    if (scheduleEnabled !== undefined) { updates.push('schedule_enabled = ?'); values.push(scheduleEnabled ? 1 : 0); }
    if (scheduleStartTime !== undefined) { updates.push('schedule_start_time = ?'); values.push(scheduleStartTime); }
    if (scheduleEndTime !== undefined) { updates.push('schedule_end_time = ?'); values.push(scheduleEndTime); }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(linkId);

    if (updates.length === 1) { // Only updated_at
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Execute update
    db.prepare(`
      UPDATE link_items
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    // Fetch updated link
    const updatedLink = db.prepare('SELECT * FROM link_items WHERE id = ?').get(linkId);

    // Include gallery images if GALLERY type
    if (updatedLink.type === 'GALLERY') {
      updatedLink.galleryImages = db.prepare(`
        SELECT * FROM gallery_images
        WHERE link_item_id = ?
        ORDER BY display_order ASC
      `).all(updatedLink.id);
    }

    res.json(updatedLink);
  } catch (error) {
    console.error('Error updating link item:', error);
    res.status(500).json({ error: 'Failed to update link item' });
  }
});

/**
 * DELETE /api/profiles/me/links/:id
 * Delete link item
 */
router.delete('/me/links/:id', authenticateToken, async (req, res) => {
  try {
    await db.ready;

    const linkId = req.params.id;

    // Get user's profile
    const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Verify link belongs to user's profile
    const existingLink = db.prepare('SELECT * FROM link_items WHERE id = ? AND profile_id = ?').get(linkId, profile.id);

    if (!existingLink) {
      return res.status(404).json({ error: 'Link item not found' });
    }

    // Delete link (CASCADE will delete gallery_images automatically)
    db.prepare('DELETE FROM link_items WHERE id = ?').run(linkId);

    res.json({ message: 'Link item deleted successfully' });
  } catch (error) {
    console.error('Error deleting link item:', error);
    res.status(500).json({ error: 'Failed to delete link item' });
  }
});

/**
 * POST /api/profiles/me/links/reorder
 * Bulk reorder link items
 * Body: [{ id, displayOrder }, ...]
 */
router.post('/me/links/reorder', authenticateToken, async (req, res) => {
  try {
    await db.ready;

    const reorderData = req.body;

    // Validation
    if (!Array.isArray(reorderData)) {
      return res.status(400).json({ error: 'Request body must be an array' });
    }

    // Get user's profile
    const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Verify all links belong to user and update order
    for (const item of reorderData) {
      if (!item.id || typeof item.displayOrder !== 'number') {
        return res.status(400).json({ error: 'Each item must have id and displayOrder' });
      }

      // Verify ownership
      const link = db.prepare('SELECT id FROM link_items WHERE id = ? AND profile_id = ?').get(item.id, profile.id);

      if (!link) {
        return res.status(404).json({ error: `Link item ${item.id} not found` });
      }

      // Update display order
      db.prepare('UPDATE link_items SET display_order = ? WHERE id = ?').run(item.displayOrder, item.id);
    }

    // Fetch updated links
    const updatedLinks = db.prepare(`
      SELECT * FROM link_items
      WHERE profile_id = ?
      ORDER BY display_order ASC
    `).all(profile.id);

    res.json(updatedLinks);
  } catch (error) {
    console.error('Error reordering link items:', error);
    res.status(500).json({ error: 'Failed to reorder link items' });
  }
});

module.exports = router;
