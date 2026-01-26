// T014: Authenticated profile routes (requires auth middleware)
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const encryption = require('../services/encryptionService');

// Sensitive profile fields that should be encrypted at rest
const PROFILE_ENCRYPTED_FIELDS = [
  'public_email', 'public_phone',
  'company_email', 'company_phone',
  'address_line1', 'address_line2', 'address_city', 'address_state', 'address_postal_code', 'address_country',
  'company_address_line1', 'company_address_line2', 'company_address_city', 'company_address_state', 'company_address_postal_code', 'company_address_country'
];

/**
 * Decrypt sensitive profile fields from database record
 * @param {Object} profile - Raw profile from database
 * @returns {Object} - Profile with decrypted sensitive fields
 */
function decryptProfileFields(profile) {
  if (!profile) return profile;

  const decrypted = { ...profile };
  for (const field of PROFILE_ENCRYPTED_FIELDS) {
    if (decrypted[field]) {
      decrypted[field] = encryption.decrypt(decrypted[field]);
    }
  }
  return decrypted;
}

/**
 * Encrypt sensitive profile fields for database storage
 * @param {Object} data - Profile data to encrypt
 * @returns {Object} - Data with encrypted sensitive fields
 */
function encryptProfileFields(data) {
  if (!data) return data;

  const encrypted = { ...data };
  const fieldMapping = {
    publicEmail: 'public_email',
    publicPhone: 'public_phone',
    companyEmail: 'company_email',
    companyPhone: 'company_phone',
    addressLine1: 'address_line1',
    addressLine2: 'address_line2',
    addressCity: 'address_city',
    addressState: 'address_state',
    addressPostalCode: 'address_postal_code',
    addressCountry: 'address_country',
    companyAddressLine1: 'company_address_line1',
    companyAddressLine2: 'company_address_line2',
    companyAddressCity: 'company_address_city',
    companyAddressState: 'company_address_state',
    companyAddressPostalCode: 'company_address_postal_code',
    companyAddressCountry: 'company_address_country'
  };

  for (const [camelCase, snakeCase] of Object.entries(fieldMapping)) {
    if (encrypted[camelCase] !== undefined && encrypted[camelCase] !== null) {
      encrypted[camelCase] = encryption.encrypt(encrypted[camelCase]);
    }
  }
  return encrypted;
}

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

    const rawProfile = db.prepare(
      `SELECT * FROM profiles WHERE user_id = ?`
    ).get(req.user.id);

    if (!rawProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Decrypt sensitive fields before returning
    const profile = decryptProfileFields(rawProfile);

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

    // Get link items (modern vCard links)
    const linkItems = db.prepare(
      `SELECT * FROM link_items WHERE profile_id = ? ORDER BY display_order ASC`
    ).all(profile.id);

    // For GALLERY type link items, fetch gallery images
    for (const linkItem of linkItems) {
      if (linkItem.type === 'GALLERY') {
        linkItem.galleryImages = db.prepare(
          `SELECT * FROM gallery_images WHERE link_item_id = ? ORDER BY display_order ASC`
        ).all(linkItem.id);
      }
    }

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
        showEmail: profile.show_email !== 0,
        showPhone: profile.show_phone !== 0,
        showWebsite: profile.show_website !== 0,
        showBio: profile.show_bio !== 0,
        companyEmail: profile.company_email,
        companyPhone: profile.company_phone,
        showCompanyEmail: profile.show_company_email !== 0,
        showCompanyPhone: profile.show_company_phone !== 0,
        // Personal address fields
        addressLine1: profile.address_line1,
        addressLine2: profile.address_line2,
        addressCity: profile.address_city,
        addressState: profile.address_state,
        addressPostalCode: profile.address_postal_code,
        addressCountry: profile.address_country,
        showAddressLine1: profile.show_address_line1 !== 0,
        showAddressLine2: profile.show_address_line2 !== 0,
        showAddressCity: profile.show_address_city !== 0,
        showAddressState: profile.show_address_state !== 0,
        showAddressPostalCode: profile.show_address_postal_code !== 0,
        showAddressCountry: profile.show_address_country !== 0,
        // Company address fields
        companyAddressLine1: profile.company_address_line1,
        companyAddressLine2: profile.company_address_line2,
        companyAddressCity: profile.company_address_city,
        companyAddressState: profile.company_address_state,
        companyAddressPostalCode: profile.company_address_postal_code,
        companyAddressCountry: profile.company_address_country,
        showCompanyAddressLine1: profile.show_company_address_line1 !== 0,
        showCompanyAddressLine2: profile.show_company_address_line2 !== 0,
        showCompanyAddressCity: profile.show_company_address_city !== 0,
        showCompanyAddressState: profile.show_company_address_state !== 0,
        showCompanyAddressPostalCode: profile.show_company_address_postal_code !== 0,
        showCompanyAddressCountry: profile.show_company_address_country !== 0,
        languages: profile.languages ? JSON.parse(profile.languages) : [],
        pronouns: profile.pronouns,
        timezone: profile.timezone,
        contactPreferences: profile.contact_preferences,
        published: Boolean(profile.published),
        indexingOptIn: Boolean(profile.indexing_opt_in),
        // Additional field visibility toggles
        showHeadline: profile.show_headline !== 0,
        showCompany: profile.show_company !== 0,
        showFirstName: profile.show_first_name !== 0,
        showLastName: profile.show_last_name !== 0,
        showPronouns: profile.show_pronouns !== 0,
        activeThemeId: profile.active_theme_id,
        backgroundImageUrl: profile.background_image_url,
        logoUrl: profile.logo_url,
        // Modern vCard fields
        profession: profile.profession,
        seo: {
          title: profile.seo_title,
          description: profile.seo_description,
          keywords: profile.seo_keywords
        },
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      },
      socialProfiles: transformedSocialProfiles,
      customLinks,
      linkItems
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
      showEmail,
      showPhone,
      showWebsite,
      showBio,
      companyEmail,
      companyPhone,
      showCompanyEmail,
      showCompanyPhone,
      // Personal address fields
      addressLine1,
      addressLine2,
      addressCity,
      addressState,
      addressPostalCode,
      addressCountry,
      showAddressLine1,
      showAddressLine2,
      showAddressCity,
      showAddressState,
      showAddressPostalCode,
      showAddressCountry,
      // Company address fields
      companyAddressLine1,
      companyAddressLine2,
      companyAddressCity,
      companyAddressState,
      companyAddressPostalCode,
      companyAddressCountry,
      showCompanyAddressLine1,
      showCompanyAddressLine2,
      showCompanyAddressCity,
      showCompanyAddressState,
      showCompanyAddressPostalCode,
      showCompanyAddressCountry,
      languages,
      pronouns,
      timezone,
      contactPreferences,
      published,
      indexingOptIn,
      // Additional field visibility toggles
      showHeadline,
      showCompany,
      showFirstName,
      showLastName,
      showPronouns,
      // Modern vCard fields
      profession,
      seo
    } = req.body;

    // Helper function to encrypt value if provided, otherwise use existing (which may already be encrypted)
    const encryptIfProvided = (newValue, existingValue) => {
      if (newValue !== undefined) {
        return newValue ? encryption.encrypt(newValue) : newValue;
      }
      return existingValue; // Keep existing (already encrypted) value
    };

    db.prepare(
      `UPDATE profiles SET
        display_name = ?, first_name = ?, last_name = ?, avatar_url = ?,
        headline = ?, company = ?, bio = ?, profile_tags = ?,
        public_email = ?, public_phone = ?, website = ?,
        show_email = ?, show_phone = ?, show_website = ?, show_bio = ?,
        company_email = ?, company_phone = ?,
        show_company_email = ?, show_company_phone = ?,
        address_line1 = ?, address_line2 = ?, address_city = ?, address_state = ?, address_postal_code = ?, address_country = ?,
        show_address_line1 = ?, show_address_line2 = ?, show_address_city = ?, show_address_state = ?, show_address_postal_code = ?, show_address_country = ?,
        company_address_line1 = ?, company_address_line2 = ?, company_address_city = ?, company_address_state = ?, company_address_postal_code = ?, company_address_country = ?,
        show_company_address_line1 = ?, show_company_address_line2 = ?, show_company_address_city = ?, show_company_address_state = ?, show_company_address_postal_code = ?, show_company_address_country = ?,
        languages = ?, pronouns = ?, timezone = ?, contact_preferences = ?,
        published = ?, indexing_opt_in = ?,
        show_headline = ?, show_company = ?, show_first_name = ?, show_last_name = ?, show_pronouns = ?,
        profession = ?, seo_title = ?, seo_description = ?, seo_keywords = ?,
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
      // Encrypt sensitive contact fields
      encryptIfProvided(publicEmail, profile.public_email),
      encryptIfProvided(publicPhone, profile.public_phone),
      website !== undefined ? website : profile.website,
      showEmail !== undefined ? (showEmail ? 1 : 0) : (profile.show_email ?? 1),
      showPhone !== undefined ? (showPhone ? 1 : 0) : (profile.show_phone ?? 1),
      showWebsite !== undefined ? (showWebsite ? 1 : 0) : (profile.show_website ?? 1),
      showBio !== undefined ? (showBio ? 1 : 0) : (profile.show_bio ?? 1),
      encryptIfProvided(companyEmail, profile.company_email),
      encryptIfProvided(companyPhone, profile.company_phone),
      showCompanyEmail !== undefined ? (showCompanyEmail ? 1 : 0) : (profile.show_company_email ?? 1),
      showCompanyPhone !== undefined ? (showCompanyPhone ? 1 : 0) : (profile.show_company_phone ?? 1),
      // Personal address - encrypt all fields
      encryptIfProvided(addressLine1, profile.address_line1),
      encryptIfProvided(addressLine2, profile.address_line2),
      encryptIfProvided(addressCity, profile.address_city),
      encryptIfProvided(addressState, profile.address_state),
      encryptIfProvided(addressPostalCode, profile.address_postal_code),
      encryptIfProvided(addressCountry, profile.address_country),
      showAddressLine1 !== undefined ? (showAddressLine1 ? 1 : 0) : (profile.show_address_line1 ?? 0),
      showAddressLine2 !== undefined ? (showAddressLine2 ? 1 : 0) : (profile.show_address_line2 ?? 0),
      showAddressCity !== undefined ? (showAddressCity ? 1 : 0) : (profile.show_address_city ?? 0),
      showAddressState !== undefined ? (showAddressState ? 1 : 0) : (profile.show_address_state ?? 0),
      showAddressPostalCode !== undefined ? (showAddressPostalCode ? 1 : 0) : (profile.show_address_postal_code ?? 0),
      showAddressCountry !== undefined ? (showAddressCountry ? 1 : 0) : (profile.show_address_country ?? 0),
      // Company address - encrypt all fields
      encryptIfProvided(companyAddressLine1, profile.company_address_line1),
      encryptIfProvided(companyAddressLine2, profile.company_address_line2),
      encryptIfProvided(companyAddressCity, profile.company_address_city),
      encryptIfProvided(companyAddressState, profile.company_address_state),
      encryptIfProvided(companyAddressPostalCode, profile.company_address_postal_code),
      encryptIfProvided(companyAddressCountry, profile.company_address_country),
      showCompanyAddressLine1 !== undefined ? (showCompanyAddressLine1 ? 1 : 0) : (profile.show_company_address_line1 ?? 0),
      showCompanyAddressLine2 !== undefined ? (showCompanyAddressLine2 ? 1 : 0) : (profile.show_company_address_line2 ?? 0),
      showCompanyAddressCity !== undefined ? (showCompanyAddressCity ? 1 : 0) : (profile.show_company_address_city ?? 0),
      showCompanyAddressState !== undefined ? (showCompanyAddressState ? 1 : 0) : (profile.show_company_address_state ?? 0),
      showCompanyAddressPostalCode !== undefined ? (showCompanyAddressPostalCode ? 1 : 0) : (profile.show_company_address_postal_code ?? 0),
      showCompanyAddressCountry !== undefined ? (showCompanyAddressCountry ? 1 : 0) : (profile.show_company_address_country ?? 0),
      languages !== undefined ? JSON.stringify(languages) : profile.languages,
      pronouns !== undefined ? pronouns : profile.pronouns,
      timezone !== undefined ? timezone : profile.timezone,
      contactPreferences !== undefined ? contactPreferences : profile.contact_preferences,
      published !== undefined ? (published ? 1 : 0) : profile.published,
      indexingOptIn !== undefined ? (indexingOptIn ? 1 : 0) : profile.indexing_opt_in,
      // Additional field visibility toggles
      showHeadline !== undefined ? (showHeadline ? 1 : 0) : (profile.show_headline ?? 1),
      showCompany !== undefined ? (showCompany ? 1 : 0) : (profile.show_company ?? 1),
      showFirstName !== undefined ? (showFirstName ? 1 : 0) : (profile.show_first_name ?? 1),
      showLastName !== undefined ? (showLastName ? 1 : 0) : (profile.show_last_name ?? 1),
      showPronouns !== undefined ? (showPronouns ? 1 : 0) : (profile.show_pronouns ?? 1),
      // Modern vCard fields
      profession !== undefined ? profession : profile.profession,
      seo?.title !== undefined ? seo.title : profile.seo_title,
      seo?.description !== undefined ? seo.description : profile.seo_description,
      seo?.keywords !== undefined ? seo.keywords : profile.seo_keywords,
      profile.id
    );

    const rawUpdated = db.prepare(`SELECT * FROM profiles WHERE id = ?`).get(profile.id);
    // Decrypt sensitive fields before returning
    const updated = decryptProfileFields(rawUpdated);

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
        showEmail: updated.show_email !== 0,
        showPhone: updated.show_phone !== 0,
        showWebsite: updated.show_website !== 0,
        showBio: updated.show_bio !== 0,
        companyEmail: updated.company_email,
        companyPhone: updated.company_phone,
        showCompanyEmail: updated.show_company_email !== 0,
        showCompanyPhone: updated.show_company_phone !== 0,
        // Personal address fields
        addressLine1: updated.address_line1,
        addressLine2: updated.address_line2,
        addressCity: updated.address_city,
        addressState: updated.address_state,
        addressPostalCode: updated.address_postal_code,
        addressCountry: updated.address_country,
        showAddressLine1: updated.show_address_line1 !== 0,
        showAddressLine2: updated.show_address_line2 !== 0,
        showAddressCity: updated.show_address_city !== 0,
        showAddressState: updated.show_address_state !== 0,
        showAddressPostalCode: updated.show_address_postal_code !== 0,
        showAddressCountry: updated.show_address_country !== 0,
        // Company address fields
        companyAddressLine1: updated.company_address_line1,
        companyAddressLine2: updated.company_address_line2,
        companyAddressCity: updated.company_address_city,
        companyAddressState: updated.company_address_state,
        companyAddressPostalCode: updated.company_address_postal_code,
        companyAddressCountry: updated.company_address_country,
        showCompanyAddressLine1: updated.show_company_address_line1 !== 0,
        showCompanyAddressLine2: updated.show_company_address_line2 !== 0,
        showCompanyAddressCity: updated.show_company_address_city !== 0,
        showCompanyAddressState: updated.show_company_address_state !== 0,
        showCompanyAddressPostalCode: updated.show_company_address_postal_code !== 0,
        showCompanyAddressCountry: updated.show_company_address_country !== 0,
        languages: updated.languages ? JSON.parse(updated.languages) : [],
        pronouns: updated.pronouns,
        timezone: updated.timezone,
        contactPreferences: updated.contact_preferences,
        published: Boolean(updated.published),
        indexingOptIn: Boolean(updated.indexing_opt_in),
        // Additional field visibility toggles
        showHeadline: updated.show_headline !== 0,
        showCompany: updated.show_company !== 0,
        showFirstName: updated.show_first_name !== 0,
        showLastName: updated.show_last_name !== 0,
        showPronouns: updated.show_pronouns !== 0,
        activeThemeId: updated.active_theme_id,
        backgroundImageUrl: updated.background_image_url,
        logoUrl: updated.logo_url,
        // Modern vCard fields
        profession: updated.profession,
        seo: {
          title: updated.seo_title,
          description: updated.seo_description,
          keywords: updated.seo_keywords
        },
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
