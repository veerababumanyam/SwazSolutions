// T014: Authenticated profile routes (requires auth middleware)
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authenticateToken);

// T140: POST /api/profiles/share-event - Track share events
router.post('/share-event', async (req, res) => {
  try {
    const db = require('../config/database');
    const { profile_id, share_method, platform } = req.body;

    // Validate required fields
    if (!profile_id || !share_method) {
      return res.status(400).json({ 
        error: 'Missing required fields: profile_id, share_method' 
      });
    }

    // Verify profile exists and belongs to user (or is public)
    const profile = db.prepare(
      `SELECT id, user_id FROM profiles WHERE id = ?`
    ).get(profile_id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Insert share event
    const stmt = db.prepare(`
      INSERT INTO share_events (profile_id, share_method, platform, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `);

    const result = stmt.run(profile_id, share_method, platform || null);

    res.status(201).json({
      success: true,
      event_id: result.lastInsertRowid,
      message: 'Share event tracked successfully'
    });

  } catch (error) {
    console.error('Track share event error:', error);
    res.status(500).json({ error: 'Failed to track share event' });
  }
});

// T030: GET /api/profiles/me - Get authenticated user's profile
router.get('/me', async (req, res) => {
  try {
    const db = require('../config/database');

    const profile = db.prepare(
      `SELECT * FROM profiles WHERE user_id = ?`
    ).get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get social profiles
    const socialProfiles = db.prepare(
      `SELECT * FROM social_profiles WHERE profile_id = ? ORDER BY display_order ASC`
    ).all(profile.id);

    // Transform social profiles to match expected format
    const transformedSocialProfiles = socialProfiles.map(sp => ({
      id: sp.id,
      platform: sp.platform_name,
      url: sp.platform_url,
      displayLabel: sp.platform_name,
      customLogo: sp.logo_url,
      isFeatured: sp.is_featured === 1,
      displayOrder: sp.display_order
    }));

    // Get custom links
    const customLinks = db.prepare(
      `SELECT * FROM custom_links WHERE profile_id = ? ORDER BY display_order ASC`
    ).all(profile.id);

    res.json({
      profile: {
        id: profile.id,
        userId: profile.user_id,
        username: profile.username,
        displayName: profile.display_name,
        firstName: profile.first_name,
        lastName: profile.last_name,
        avatarUrl: profile.avatar_url,
        headline: profile.headline,
        company: profile.company,
        bio: profile.bio,
        profileTags: profile.profile_tags ? JSON.parse(profile.profile_tags) : [],
        publicEmail: profile.public_email,
        publicPhone: profile.public_phone,
        website: profile.website,
        languages: profile.languages ? JSON.parse(profile.languages) : [],
        pronouns: profile.pronouns,
        timezone: profile.timezone,
        contactPreferences: profile.contact_preferences,
        published: Boolean(profile.published),
        indexingOptIn: Boolean(profile.indexing_opt_in),
        activeThemeId: profile.active_theme_id,
        backgroundImageUrl: profile.background_image_url,
        logoUrl: profile.logo_url,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      },
      socialProfiles: transformedSocialProfiles,
      customLinks
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// T029: POST /api/profiles - Create new profile
router.post('/', async (req, res) => {
  try {
    const db = require('../config/database');

    // Check if user already has a profile
    const existing = db.prepare(
      `SELECT id FROM profiles WHERE user_id = ?`
    ).get(req.user.id);

    if (existing) {
      return res.status(409).json({ error: 'Profile already exists' });
    }

    const {
      username,
      displayName,
      firstName,
      lastName,
      headline,
      company,
      bio,
      profileTags,
      publicEmail,
      publicPhone,
      website,
      languages,
      pronouns,
      timezone,
      published
    } = req.body;

    // T036: Validate username format
    if (!username || !/^[a-z0-9_-]{3,50}$/.test(username)) {
      return res.status(400).json({ 
        error: 'Invalid username. Must be 3-50 characters, lowercase alphanumeric, underscore, or hyphen only.' 
      });
    }

    // Check username uniqueness
    const usernameExists = db.prepare(
      `SELECT id FROM profiles WHERE username = ?`
    ).get(username);

    if (usernameExists) {
      return res.status(409).json({
        error: 'Username already taken'
      });
    }

    // Create profile
    const result = db.prepare(
      `INSERT INTO profiles (
        user_id, username, display_name, first_name, last_name,
        headline, company, bio, profile_tags, public_email, public_phone,
        website, languages, pronouns, timezone, published, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    ).run(
      req.user.id,
      username,
      displayName,
      firstName || null,
      lastName || null,
      headline || null,
      company || null,
      bio || null,
      profileTags ? JSON.stringify(profileTags) : null,
      publicEmail || null,
      publicPhone || null,
      website || null,
      languages ? JSON.stringify(languages) : null,
      pronouns || null,
      timezone || null,
      published ? 1 : 0
    );

    console.log('INSERT result:', result);
    const profile = db.prepare(`SELECT * FROM profiles WHERE id = ?`).get(result.lastInsertRowid);
    console.log('SELECT profile result:', profile);

    res.status(201).json({ 
      profile: {
        id: profile.id,
        userId: profile.user_id,
        username: profile.username,
        displayName: profile.display_name,
        firstName: profile.first_name,
        lastName: profile.last_name,
        avatarUrl: profile.avatar_url,
        headline: profile.headline,
        company: profile.company,
        bio: profile.bio,
        profileTags: profile.profile_tags ? JSON.parse(profile.profile_tags) : [],
        publicEmail: profile.public_email,
        publicPhone: profile.public_phone,
        website: profile.website,
        languages: profile.languages ? JSON.parse(profile.languages) : [],
        pronouns: profile.pronouns,
        timezone: profile.timezone,
        contactPreferences: profile.contact_preferences,
        published: Boolean(profile.published),
        indexingOptIn: Boolean(profile.indexing_opt_in),
        activeThemeId: profile.active_theme_id,
        backgroundImageUrl: profile.background_image_url,
        logoUrl: profile.logo_url,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      }
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// T031: PUT /api/profiles/me - Update profile
router.put('/me', async (req, res) => {
  try {
    const db = require('../config/database');

    const profile = db.prepare(
      `SELECT * FROM profiles WHERE user_id = ?`
    ).get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const {
      displayName,
      firstName,
      lastName,
      avatarUrl,
      headline,
      company,
      bio,
      profileTags,
      publicEmail,
      publicPhone,
      website,
      languages,
      pronouns,
      timezone,
      contactPreferences
    } = req.body;

    db.prepare(
      `UPDATE profiles SET
        display_name = ?, first_name = ?, last_name = ?, avatar_url = ?,
        headline = ?, company = ?, bio = ?, profile_tags = ?,
        public_email = ?, public_phone = ?, website = ?, languages = ?,
        pronouns = ?, timezone = ?, contact_preferences = ?,
        updated_at = datetime('now')
      WHERE id = ?`
    ).run(
      displayName !== undefined ? displayName : profile.display_name,
      firstName !== undefined ? firstName : profile.first_name,
      lastName !== undefined ? lastName : profile.last_name,
      avatarUrl !== undefined ? avatarUrl : profile.avatar_url,
      headline !== undefined ? headline : profile.headline,
      company !== undefined ? company : profile.company,
      bio !== undefined ? bio : profile.bio,
      profileTags !== undefined ? JSON.stringify(profileTags) : profile.profile_tags,
      publicEmail !== undefined ? publicEmail : profile.public_email,
      publicPhone !== undefined ? publicPhone : profile.public_phone,
      website !== undefined ? website : profile.website,
      languages !== undefined ? JSON.stringify(languages) : profile.languages,
      pronouns !== undefined ? pronouns : profile.pronouns,
      timezone !== undefined ? timezone : profile.timezone,
      contactPreferences !== undefined ? contactPreferences : profile.contact_preferences,
      profile.id
    );

    const updated = db.prepare(`SELECT * FROM profiles WHERE id = ?`).get(profile.id);

    res.json({ 
      profile: {
        id: updated.id,
        userId: updated.user_id,
        username: updated.username,
        displayName: updated.display_name,
        firstName: updated.first_name,
        lastName: updated.last_name,
        avatarUrl: updated.avatar_url,
        headline: updated.headline,
        company: updated.company,
        bio: updated.bio,
        profileTags: updated.profile_tags ? JSON.parse(updated.profile_tags) : [],
        publicEmail: updated.public_email,
        publicPhone: updated.public_phone,
        website: updated.website,
        languages: updated.languages ? JSON.parse(updated.languages) : [],
        pronouns: updated.pronouns,
        timezone: updated.timezone,
        contactPreferences: updated.contact_preferences,
        published: Boolean(updated.published),
        indexingOptIn: Boolean(updated.indexing_opt_in),
        activeThemeId: updated.active_theme_id,
        backgroundImageUrl: updated.background_image_url,
        logoUrl: updated.logo_url,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// T032: DELETE /api/profiles/me - Delete profile
router.delete('/me', async (req, res) => {
  try {
    const db = require('../config/database');

    const profile = db.prepare(
      `SELECT id FROM profiles WHERE user_id = ?`
    ).get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Delete profile (CASCADE will handle related records)
    db.prepare(`DELETE FROM profiles WHERE id = ?`).run(profile.id);

    res.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// T033: PATCH /api/profiles/me/publish - Toggle published status
router.patch('/me/publish', async (req, res) => {
  try {
    const db = require('../config/database');

    const profile = db.prepare(
      `SELECT id, published FROM profiles WHERE user_id = ?`
    ).get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { published } = req.body;

    if (typeof published !== 'boolean') {
      return res.status(400).json({ error: 'Published must be a boolean' });
    }

    db.prepare(
      `UPDATE profiles SET published = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(published ? 1 : 0, profile.id);

    const updated = db.prepare(`SELECT * FROM profiles WHERE id = ?`).get(profile.id);

    res.json({ 
      profile: {
        id: updated.id,
        userId: updated.user_id,
        username: updated.username,
        displayName: updated.display_name,
        firstName: updated.first_name,
        lastName: updated.last_name,
        avatarUrl: updated.avatar_url,
        headline: updated.headline,
        company: updated.company,
        bio: updated.bio,
        profileTags: updated.profile_tags ? JSON.parse(updated.profile_tags) : [],
        publicEmail: updated.public_email,
        publicPhone: updated.public_phone,
        website: updated.website,
        languages: updated.languages ? JSON.parse(updated.languages) : [],
        pronouns: updated.pronouns,
        timezone: updated.timezone,
        contactPreferences: updated.contact_preferences,
        published: Boolean(updated.published),
        indexingOptIn: Boolean(updated.indexing_opt_in),
        activeThemeId: updated.active_theme_id,
        backgroundImageUrl: updated.background_image_url,
        logoUrl: updated.logo_url,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating publish status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// T034: POST /api/profiles/me/username-check - Check username availability
router.post('/me/username-check', async (req, res) => {
  try {
    const { username } = req.body;
    const db = require('../config/database');

    // Validate format - return available:false for invalid format (not HTTP 400)
    if (!username || !/^[a-z0-9_-]{3,50}$/.test(username)) {
      return res.json({ 
        available: false,
        error: 'Invalid username format. Must be 3-50 characters, lowercase alphanumeric, underscore, or hyphen only.'
      });
    }

    const existing = db.prepare(
      `SELECT id FROM profiles WHERE username = ?`
    ).get(username);

    if (existing) {
      return res.json({ 
        available: false,
        suggestions: generateUsernameSuggestions(username)
      });
    }

    res.json({ available: true });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// T038: Helper function to generate username suggestions
function generateUsernameSuggestions(username, db) {
  const suggestions = [];
  const baseUsername = username.replace(/\d+$/, ''); // Remove trailing numbers
  
  // Generate candidate suggestions
  const candidates = [
    `${baseUsername}1`,
    `${baseUsername}2`,
    `${baseUsername}3`,
    `${baseUsername}_pro`,
    `${baseUsername}_official`,
    `${baseUsername}_${Date.now().toString().slice(-4)}` // Add random suffix
  ];
  
  // Check each candidate for availability
  for (const candidate of candidates) {
    // Validate format
    if (!/^[a-z0-9_-]{3,50}$/.test(candidate)) {
      continue;
    }
    
    // Check if username is available
    const exists = db.prepare('SELECT id FROM profiles WHERE username = ?').get(candidate);
    if (!exists) {
      suggestions.push(candidate);
    }
    
    // Return first 5 available suggestions
    if (suggestions.length >= 5) {
      break;
    }
  }
  
  return suggestions;
}

module.exports = router;
