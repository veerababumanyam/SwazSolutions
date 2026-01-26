const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

/**
 * POST /api/profiles/me/avatar/crop
 * Save avatar crop settings
 *
 * This endpoint stores:
 * - avatarUrl: The cropped/final avatar image URL
 * - avatarSource: The original uncropped image URL
 * - cropSettings: JSON with { x, y, scale } for the crop operation
 */
router.post('/me/avatar/crop', authenticateToken, async (req, res) => {
  try {
    await db.ready;

    const { avatarUrl, avatarSource, cropSettings } = req.body;

    // Validate required fields
    if (!avatarUrl) {
      return res.status(400).json({ error: 'avatarUrl is required' });
    }

    if (!avatarSource) {
      return res.status(400).json({ error: 'avatarSource is required' });
    }

    // Validate cropSettings structure
    if (!cropSettings ||
        typeof cropSettings.x !== 'number' ||
        typeof cropSettings.y !== 'number' ||
        typeof cropSettings.scale !== 'number') {
      return res.status(400).json({
        error: 'Invalid crop settings. Must include x, y, and scale as numbers'
      });
    }

    // Validate crop values are reasonable
    if (cropSettings.scale <= 0 || cropSettings.scale > 10) {
      return res.status(400).json({ error: 'Scale must be between 0 and 10' });
    }

    // Update profile with avatar crop data
    const result = db.prepare(`
      UPDATE profiles
      SET
        avatar_url = ?,
        avatar_source = ?,
        avatar_crop = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(
      avatarUrl,
      avatarSource,
      JSON.stringify(cropSettings),
      req.user.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Fetch updated profile
    const updatedProfile = db.prepare(`
      SELECT avatar_url, avatar_source, avatar_crop
      FROM profiles
      WHERE user_id = ?
    `).get(req.user.id);

    res.json({
      message: 'Avatar crop settings saved successfully',
      avatarUrl: updatedProfile.avatar_url,
      avatarSource: updatedProfile.avatar_source,
      cropSettings: JSON.parse(updatedProfile.avatar_crop || '{}')
    });
  } catch (error) {
    console.error('Error saving avatar crop:', error);
    res.status(500).json({ error: 'Failed to save avatar crop settings' });
  }
});

/**
 * GET /api/profiles/me/avatar/crop
 * Get current avatar crop settings
 */
router.get('/me/avatar/crop', authenticateToken, async (req, res) => {
  try {
    await db.ready;

    const profile = db.prepare(`
      SELECT avatar_url, avatar_source, avatar_crop
      FROM profiles
      WHERE user_id = ?
    `).get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      avatarUrl: profile.avatar_url,
      avatarSource: profile.avatar_source,
      cropSettings: profile.avatar_crop ? JSON.parse(profile.avatar_crop) : null
    });
  } catch (error) {
    console.error('Error fetching avatar crop:', error);
    res.status(500).json({ error: 'Failed to fetch avatar crop settings' });
  }
});

module.exports = router;
