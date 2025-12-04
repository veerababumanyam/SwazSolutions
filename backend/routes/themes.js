// Theme Management Routes (T016)
// Handles system themes and custom theme CRUD operations

const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const db = require('../config/database');

// ============================================================================
// T150: Get System Themes (GET /api/themes/system)
// ============================================================================
router.get('/system', (req, res) => {
  try {
    // Fetch all system themes including wallpaper and headerBackground for visual themes
    const themesStmt = db.prepare(`
      SELECT id, name, category, colors, typography, layout, avatar, wallpaper, header_background
      FROM themes 
      WHERE is_system = 1 
      ORDER BY category, name
    `);
    const themes = themesStmt.all();

    // Parse JSON fields
    const parsed = themes.map(theme => ({
      id: theme.id,
      name: theme.name,
      category: theme.category,
      colors: JSON.parse(theme.colors),
      typography: JSON.parse(theme.typography),
      layout: JSON.parse(theme.layout),
      avatar: JSON.parse(theme.avatar),
      wallpaper: theme.wallpaper || null,
      headerBackground: theme.header_background ? JSON.parse(theme.header_background) : null,
      isSystem: true
    }));

    // Group by category
    const grouped = parsed.reduce((acc, theme) => {
      if (!acc[theme.category]) {
        acc[theme.category] = [];
      }
      acc[theme.category].push(theme);
      return acc;
    }, {});

    res.json({
      themes: parsed,
      grouped,
      total: parsed.length
    });

  } catch (error) {
    console.error('Error fetching system themes:', error);
    res.status(500).json({ error: 'Failed to fetch system themes' });
  }
});

// ============================================================================
// T151: Get User's Custom Themes (GET /api/themes/me)
// ============================================================================
router.get('/me', auth, (req, res) => {
  const userId = req.user.id;

  try {
    // Get user's profile ID
    const profileStmt = db.prepare('SELECT id FROM profiles WHERE user_id = ?');
    const profile = profileStmt.get(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Fetch custom themes (already using correct column names)
    const themesStmt = db.prepare(`
      SELECT id, name, category, colors, typography, layout, avatar, created_at
      FROM themes 
      WHERE profile_id = ? AND is_system = 0
      ORDER BY created_at DESC
    `);
    const themes = themesStmt.all(profile.id);

    // Parse JSON fields
    const parsed = themes.map(theme => ({
      id: theme.id,
      name: theme.name,
      category: theme.category || 'custom',
      colors: JSON.parse(theme.colors),
      typography: JSON.parse(theme.typography),
      layout: JSON.parse(theme.layout),
      avatar: JSON.parse(theme.avatar),
      isSystem: false,
      createdAt: theme.created_at
    }));

    res.json({
      themes: parsed,
      total: parsed.length
    });

  } catch (error) {
    console.error('Error fetching custom themes:', error);
    res.status(500).json({ error: 'Failed to fetch custom themes' });
  }
});

// ============================================================================
// T152: Create Custom Theme (POST /api/themes)
// ============================================================================
router.post('/', auth, (req, res) => {
  const { name, category, colors, typography, layout, avatar } = req.body;
  const userId = req.user.id;

  try {
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Theme name is required' });
    }

    if (!colors || !typography || !layout || !avatar) {
      return res.status(400).json({
        error: 'Theme must include colors, typography, layout, and avatar settings'
      });
    }

    // Get user's profile ID
    const profileStmt = db.prepare('SELECT id FROM profiles WHERE user_id = ?');
    const profile = profileStmt.get(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found. Create a profile first.' });
    }

    // T156: Validate theme structure (basic validation)
    if (!colors.background || !colors.primary || !colors.text) {
      return res.status(400).json({
        error: 'Theme colors must include background, primary, and text'
      });
    }

    // Insert theme
    const insertStmt = db.prepare(`
      INSERT INTO themes (
        profile_id, name, category, colors, typography, layout, avatar, is_system
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `);

    const result = insertStmt.run(
      profile.id,
      name.trim(),
      category || 'custom',
      JSON.stringify(colors),
      JSON.stringify(typography),
      JSON.stringify(layout),
      JSON.stringify(avatar)
    );

    // Fetch the created theme
    const selectStmt = db.prepare('SELECT * FROM themes WHERE id = ?');
    const newTheme = selectStmt.get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Custom theme created successfully',
      theme: {
        id: newTheme.id,
        name: newTheme.name,
        category: newTheme.category,
        colors: JSON.parse(newTheme.colors),
        typography: JSON.parse(newTheme.typography),
        layout: JSON.parse(newTheme.layout),
        avatar: JSON.parse(newTheme.avatar),
        isSystem: false,
        createdAt: newTheme.created_at
      }
    });

  } catch (error) {
    console.error('Error creating custom theme:', error);
    res.status(500).json({ error: 'Failed to create custom theme' });
  }
});

// ============================================================================
// T153: Update Custom Theme (PUT /api/themes/:id)
// ============================================================================
router.put('/:id', auth, (req, res) => {
  const { id } = req.params;
  const { name, category, colors, typography, layout, avatar } = req.body;
  const userId = req.user.id;

  try {
    // Verify ownership and ensure it's not a system theme
    const ownershipStmt = db.prepare(`
      SELECT t.* FROM themes t
      JOIN profiles p ON t.profile_id = p.id
      WHERE t.id = ? AND p.user_id = ? AND t.is_system = 0
    `);
    const theme = ownershipStmt.get(id, userId);

    if (!theme) {
      return res.status(404).json({
        error: 'Custom theme not found or access denied. System themes cannot be edited.'
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name.trim());
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (colors !== undefined) {
      updates.push('colors = ?');
      values.push(JSON.stringify(colors));
    }
    if (typography !== undefined) {
      updates.push('typography = ?');
      values.push(JSON.stringify(typography));
    }
    if (layout !== undefined) {
      updates.push('layout = ?');
      values.push(JSON.stringify(layout));
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(JSON.stringify(avatar));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Update theme
    const updateStmt = db.prepare(`
      UPDATE themes SET ${updates.join(', ')} WHERE id = ?
    `);
    updateStmt.run(...values, id);

    // Fetch updated theme
    const selectStmt = db.prepare('SELECT * FROM themes WHERE id = ?');
    const updated = selectStmt.get(id);

    res.json({
      message: 'Custom theme updated successfully',
      theme: {
        id: updated.id,
        name: updated.name,
        category: updated.category,
        colors: JSON.parse(updated.colors),
        typography: JSON.parse(updated.typography),
        layout: JSON.parse(updated.layout),
        avatar: JSON.parse(updated.avatar),
        isSystem: false,
        createdAt: updated.created_at
      }
    });

  } catch (error) {
    console.error('Error updating custom theme:', error);
    res.status(500).json({ error: 'Failed to update custom theme' });
  }
});

// ============================================================================
// T154: Delete Custom Theme (DELETE /api/themes/:id)
// ============================================================================
router.delete('/:id', auth, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Verify ownership and ensure it's not a system theme
    const ownershipStmt = db.prepare(`
      SELECT t.id FROM themes t
      JOIN profiles p ON t.profile_id = p.id
      WHERE t.id = ? AND p.user_id = ? AND t.is_system = 0
    `);
    const theme = ownershipStmt.get(id, userId);

    if (!theme) {
      return res.status(404).json({
        error: 'Custom theme not found or access denied. System themes cannot be deleted.'
      });
    }

    // Check if theme is currently active on any profile
    const activeStmt = db.prepare(`
      SELECT COUNT(*) as count FROM profiles WHERE active_theme_id = ?
    `);
    const { count } = activeStmt.get(id);

    if (count > 0) {
      return res.status(400).json({
        error: 'Cannot delete active theme. Switch to a different theme first.'
      });
    }

    // Delete theme
    const deleteStmt = db.prepare('DELETE FROM themes WHERE id = ?');
    deleteStmt.run(id);

    res.json({
      message: 'Custom theme deleted successfully',
      deletedId: parseInt(id)
    });

  } catch (error) {
    console.error('Error deleting custom theme:', error);
    res.status(500).json({ error: 'Failed to delete custom theme' });
  }
});

// ============================================================================
// T155: Apply Theme to Profile (POST /api/themes/:id/apply)
// ============================================================================
router.post('/:id/apply', auth, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Verify theme exists
    const themeStmt = db.prepare('SELECT id, name FROM themes WHERE id = ?');
    const theme = themeStmt.get(id);

    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    // Get user's profile
    const profileStmt = db.prepare('SELECT id FROM profiles WHERE user_id = ?');
    const profile = profileStmt.get(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Apply theme to profile
    const updateStmt = db.prepare('UPDATE profiles SET active_theme_id = ? WHERE id = ?');
    updateStmt.run(id, profile.id);

    res.json({
      message: 'Theme applied successfully',
      themeId: parseInt(id),
      themeName: theme.name
    });

  } catch (error) {
    console.error('Error applying theme:', error);
    res.status(500).json({ error: 'Failed to apply theme' });
  }
});

module.exports = router;
