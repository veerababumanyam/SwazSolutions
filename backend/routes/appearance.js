/**
 * Profile Appearance Routes
 * Handles CRUD operations for profile appearance settings
 * Replaces localStorage with persistent backend storage
 */

const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const db = require('../config/database');

// ============================================================================
// GET /api/profiles/me/appearance - Get user's appearance settings
// ============================================================================
router.get('/me/appearance', auth, (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's profile ID
    const profileStmt = db.prepare('SELECT id FROM profiles WHERE user_id = ?');
    const profile = profileStmt.get(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Fetch appearance settings
    const appearanceStmt = db.prepare(`
      SELECT appearance_settings, updated_at
      FROM profile_appearance 
      WHERE profile_id = ?
    `);
    const appearance = appearanceStmt.get(profile.id);

    if (!appearance) {
      // Return default appearance settings if none exist
      return res.json({
        settings: null,
        isDefault: true
      });
    }

    // Parse JSON settings
    const settings = JSON.parse(appearance.appearance_settings);

    res.json({
      settings,
      updatedAt: appearance.updated_at,
      isDefault: false
    });

  } catch (error) {
    console.error('Error fetching appearance settings:', error);
    res.status(500).json({ error: 'Failed to fetch appearance settings' });
  }
});

// ============================================================================
// PUT /api/profiles/me/appearance - Save/update appearance settings
// ============================================================================
router.put('/me/appearance', auth, (req, res) => {
  try {
    const userId = req.user.id;
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({ error: 'Settings are required' });
    }

    // Get user's profile ID
    const profileStmt = db.prepare('SELECT id FROM profiles WHERE user_id = ?');
    const profile = profileStmt.get(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Stringify settings for storage
    const settingsJson = JSON.stringify(settings);

    // Check if appearance record exists
    const existingStmt = db.prepare('SELECT id FROM profile_appearance WHERE profile_id = ?');
    const existing = existingStmt.get(profile.id);

    if (existing) {
      // Update existing record
      db.prepare(`
        UPDATE profile_appearance 
        SET appearance_settings = ?, updated_at = datetime('now')
        WHERE profile_id = ?
      `).run(settingsJson, profile.id);
    } else {
      // Insert new record
      db.prepare(`
        INSERT INTO profile_appearance (profile_id, appearance_settings, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `).run(profile.id, settingsJson);
    }

    res.json({
      success: true,
      message: 'Appearance settings saved',
      settings
    });

  } catch (error) {
    console.error('Error saving appearance settings:', error);
    res.status(500).json({ error: 'Failed to save appearance settings' });
  }
});

// ============================================================================
// DELETE /api/profiles/me/appearance - Reset to default appearance
// ============================================================================
router.delete('/me/appearance', auth, (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's profile ID
    const profileStmt = db.prepare('SELECT id FROM profiles WHERE user_id = ?');
    const profile = profileStmt.get(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Delete appearance record
    db.prepare('DELETE FROM profile_appearance WHERE profile_id = ?').run(profile.id);

    res.json({
      success: true,
      message: 'Appearance settings reset to default'
    });

  } catch (error) {
    console.error('Error resetting appearance settings:', error);
    res.status(500).json({ error: 'Failed to reset appearance settings' });
  }
});

// ============================================================================
// GET /api/public/profile/:username/appearance - Get public appearance settings
// (No auth required - for public profile viewing)
// ============================================================================
router.get('/public/:username/appearance', (req, res) => {
  try {
    const { username } = req.params;

    // Get profile by username
    const profileStmt = db.prepare(`
      SELECT id FROM profiles 
      WHERE username = ? AND published = 1
    `);
    const profile = profileStmt.get(username);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Fetch appearance settings
    const appearanceStmt = db.prepare(`
      SELECT appearance_settings
      FROM profile_appearance 
      WHERE profile_id = ?
    `);
    const appearance = appearanceStmt.get(profile.id);

    if (!appearance) {
      return res.json({ settings: null });
    }

    const settings = JSON.parse(appearance.appearance_settings);
    res.json({ settings });

  } catch (error) {
    console.error('Error fetching public appearance settings:', error);
    res.status(500).json({ error: 'Failed to fetch appearance settings' });
  }
});

module.exports = router;
