// T013: Public profile routes (no authentication required)
const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Helper to hash IP for privacy
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

// T035: GET /api/public/profile/:username - Fetch public profile
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const db = require('../config/database');

    // T037: Check if profile exists and is published
    const profile = db.prepare(
      `SELECT * FROM profiles WHERE username = ? AND published = 1`
    ).get(username);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not available' });
    }

    // Get social profiles (featured links)
    const socialProfiles = db.prepare(
      `SELECT * FROM social_profiles 
       WHERE profile_id = ? AND is_public = 1 
       ORDER BY display_order ASC`
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
      `SELECT * FROM custom_links 
       WHERE profile_id = ? AND is_public = 1 
       ORDER BY display_order ASC`
    ).all(profile.id);

    // Get active theme
    let theme = null;
    if (profile.active_theme_id) {
      theme = db.prepare(
        `SELECT * FROM themes WHERE id = ?`
      ).get(profile.active_theme_id);
    }

    // Get appearance settings (crucial for public profile rendering to match preview)
    let appearance = null;
    const appearanceRow = db.prepare(
      `SELECT appearance_settings FROM profile_appearance WHERE profile_id = ?`
    ).get(profile.id);
    if (appearanceRow && appearanceRow.appearance_settings) {
      try {
        appearance = JSON.parse(appearanceRow.appearance_settings);
      } catch (e) {
        console.error('Error parsing appearance settings:', e);
      }
    }

    // Helper to check visibility (default to true if column doesn't exist yet)
    const isVisible = (val) => val === undefined || val === null || val !== 0;

    // Build response with ONLY visible data - don't expose hidden fields
    const profileResponse = {
      username: profile.username,
      displayName: profile.display_name,
      firstName: profile.first_name,
      lastName: profile.last_name,
      avatarUrl: profile.avatar_url,
      logoUrl: profile.logo_url,
      headline: profile.headline,
      company: profile.company,
      pronouns: profile.pronouns,
      timezone: profile.timezone,
      profileTags: profile.profile_tags ? JSON.parse(profile.profile_tags) : [],
      languages: profile.languages ? JSON.parse(profile.languages) : [],
    };

    // Only include contact fields if visible
    if (isVisible(profile.show_bio)) {
      profileResponse.bio = profile.bio;
      profileResponse.showBio = true;
    }
    if (isVisible(profile.show_email) && profile.public_email) {
      profileResponse.publicEmail = profile.public_email;
      profileResponse.showEmail = true;
    }
    if (isVisible(profile.show_phone) && profile.public_phone) {
      profileResponse.publicPhone = profile.public_phone;
      profileResponse.showPhone = true;
    }
    if (isVisible(profile.show_website) && profile.website) {
      profileResponse.website = profile.website;
      profileResponse.showWebsite = true;
    }
    if (isVisible(profile.show_company_email) && profile.company_email) {
      profileResponse.companyEmail = profile.company_email;
      profileResponse.showCompanyEmail = true;
    }
    if (isVisible(profile.show_company_phone) && profile.company_phone) {
      profileResponse.companyPhone = profile.company_phone;
      profileResponse.showCompanyPhone = true;
    }

    // Personal address - only include visible fields
    if (isVisible(profile.show_address_line1) && profile.address_line1) {
      profileResponse.addressLine1 = profile.address_line1;
      profileResponse.showAddressLine1 = true;
    }
    if (isVisible(profile.show_address_line2) && profile.address_line2) {
      profileResponse.addressLine2 = profile.address_line2;
      profileResponse.showAddressLine2 = true;
    }
    if (isVisible(profile.show_address_city) && profile.address_city) {
      profileResponse.addressCity = profile.address_city;
      profileResponse.showAddressCity = true;
    }
    if (isVisible(profile.show_address_state) && profile.address_state) {
      profileResponse.addressState = profile.address_state;
      profileResponse.showAddressState = true;
    }
    if (isVisible(profile.show_address_postal_code) && profile.address_postal_code) {
      profileResponse.addressPostalCode = profile.address_postal_code;
      profileResponse.showAddressPostalCode = true;
    }
    if (isVisible(profile.show_address_country) && profile.address_country) {
      profileResponse.addressCountry = profile.address_country;
      profileResponse.showAddressCountry = true;
    }

    // Company address - only include visible fields
    if (isVisible(profile.show_company_address_line1) && profile.company_address_line1) {
      profileResponse.companyAddressLine1 = profile.company_address_line1;
      profileResponse.showCompanyAddressLine1 = true;
    }
    if (isVisible(profile.show_company_address_line2) && profile.company_address_line2) {
      profileResponse.companyAddressLine2 = profile.company_address_line2;
      profileResponse.showCompanyAddressLine2 = true;
    }
    if (isVisible(profile.show_company_address_city) && profile.company_address_city) {
      profileResponse.companyAddressCity = profile.company_address_city;
      profileResponse.showCompanyAddressCity = true;
    }
    if (isVisible(profile.show_company_address_state) && profile.company_address_state) {
      profileResponse.companyAddressState = profile.company_address_state;
      profileResponse.showCompanyAddressState = true;
    }
    if (isVisible(profile.show_company_address_postal_code) && profile.company_address_postal_code) {
      profileResponse.companyAddressPostalCode = profile.company_address_postal_code;
      profileResponse.showCompanyAddressPostalCode = true;
    }
    if (isVisible(profile.show_company_address_country) && profile.company_address_country) {
      profileResponse.companyAddressCountry = profile.company_address_country;
      profileResponse.showCompanyAddressCountry = true;
    }

    res.json({
      id: profile.id, // T140: Added for share tracking
      profile: profileResponse,
      socialProfiles: transformedSocialProfiles,
      customLinks,
      appearance, // Include appearance settings for public profile rendering
      theme: theme ? {
        ...theme,
        colors: JSON.parse(theme.colors),
        typography: JSON.parse(theme.typography),
        layout: JSON.parse(theme.layout),
        avatar: JSON.parse(theme.avatar)
      } : null
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// T254: POST /api/public/profile/:username/view - Track profile view
router.post('/profile/:username/view', async (req, res) => {
  try {
    const { username } = req.params;
    const db = require('../config/database');

    const profile = db.prepare(
      `SELECT id FROM profiles WHERE username = ? AND published = 1`
    ).get(username);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // T255: Hash IP for privacy
    const ipHash = hashIP(req.ip || req.connection.remoteAddress || 'unknown');

    // T256: Extract device type and referrer
    const userAgent = req.headers['user-agent'] || '';
    const deviceType = /mobile/i.test(userAgent) ? 'mobile' : 
                      /tablet/i.test(userAgent) ? 'tablet' : 'desktop';
    const referrer = req.headers.referer || req.headers.referrer || null;

    // T257: Insert view event
    db.prepare(
      `INSERT INTO profile_views 
       (profile_id, viewer_ip_hash, referrer, device_type, viewed_at) 
       VALUES (?, ?, ?, ?, datetime('now'))`
    ).run(profile.id, ipHash, referrer, deviceType);

    res.json({ tracked: true });
  } catch (error) {
    console.error('Error tracking profile view:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// T287: GET /api/public/directory - Public profile directory search
router.get('/directory', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const db = require('../config/database');

    let query = `
      SELECT username, display_name, headline, company, avatar_url, profile_tags
      FROM profiles 
      WHERE published = 1 AND indexing_opt_in = 1
    `;
    const params = [];

    // T290: Text search if provided
    const searchTerm = search ? `%${search}%` : null;
    if (search) {
      query += ` AND (
        username LIKE ? OR 
        display_name LIKE ? OR 
        headline LIKE ? OR 
        bio LIKE ? OR 
        profile_tags LIKE ?
      )`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const profiles = db.prepare(query).all(...params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM profiles WHERE published = 1 AND indexing_opt_in = 1`;
    if (search) {
      countQuery += ` AND (username LIKE ? OR display_name LIKE ? OR headline LIKE ? OR bio LIKE ? OR profile_tags LIKE ?)`;
    }
    const countResult = db.prepare(countQuery).get(...(search ? [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm] : []));

    res.json({
      profiles: profiles.map(p => ({
        ...p,
        profileTags: p.profile_tags ? JSON.parse(p.profile_tags) : []
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching directory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
