// Social Links Management Routes (T015)
// Handles CRUD operations for social profiles and custom links

const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const db = require('../config/database');

// ============================================================================
// T082: Create Social Link (POST /api/profiles/me/social-links)
// ============================================================================
router.post('/me/social-links', auth, (req, res) => {
  const { platform, url, displayLabel, customLogo, isFeatured, displayOrder } = req.body;
  const userId = req.user.id;

  try {
    // Validate required fields
    if (!url || !url.trim()) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format (must be HTTPS)
    if (!url.startsWith('https://')) {
      return res.status(400).json({ error: 'URL must use HTTPS protocol' });
    }

    // Get user's profile ID
    const profileStmt = db.prepare('SELECT id FROM profiles WHERE user_id = ?');
    const profile = profileStmt.get(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found. Create a profile first.' });
    }

    // T087: Check featured links limit (max 5)
    if (isFeatured) {
      const countStmt = db.prepare(
        'SELECT COUNT(*) as count FROM social_profiles WHERE profile_id = ? AND is_featured = 1'
      );
      const { count } = countStmt.get(profile.id);

      if (count >= 5) {
        return res.status(400).json({ 
          error: 'Maximum 5 featured links allowed. Remove a featured link or add as custom link.',
          maxFeaturedLinks: 5,
          currentFeatured: count
        });
      }
    }

    // Determine next display order if not provided
    let finalDisplayOrder = displayOrder;
    if (finalDisplayOrder === undefined || finalDisplayOrder === null) {
      const orderStmt = db.prepare(
        'SELECT MAX(display_order) as maxOrder FROM social_profiles WHERE profile_id = ?'
      );
      const { maxOrder } = orderStmt.get(profile.id);
      finalDisplayOrder = (maxOrder || 0) + 1;
    }

    // Insert social link
    const insertStmt = db.prepare(`
      INSERT INTO social_profiles (
        profile_id, platform_name, platform_url, logo_url, is_featured, display_order
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      profile.id,
      platform || 'Custom',
      url,
      customLogo || '/assets/social-logos/default-link.svg',
      isFeatured ? 1 : 0,
      finalDisplayOrder
    );

    // Fetch the created link
    const selectStmt = db.prepare('SELECT * FROM social_profiles WHERE id = ?');
    const newLink = selectStmt.get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Social link created successfully',
      link: {
        id: newLink.id,
        platform: newLink.platform_name,
        url: newLink.platform_url,
        displayLabel: displayLabel,
        customLogo: newLink.logo_url,
        isFeatured: newLink.is_featured === 1,
        displayOrder: newLink.display_order
      }
    });

  } catch (error) {
    console.error('Error creating social link:', error);
    res.status(500).json({ error: 'Failed to create social link' });
  }
});

// ============================================================================
// T083: Get All Social Links (GET /api/profiles/me/social-links)
// ============================================================================
router.get('/me/social-links', auth, (req, res) => {
  const userId = req.user.id;

  try {
    // Get user's profile ID
    const profileStmt = db.prepare('SELECT id FROM profiles WHERE user_id = ?');
    const profile = profileStmt.get(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Fetch all social links ordered by display_order
    const linksStmt = db.prepare(`
      SELECT * FROM social_profiles 
      WHERE profile_id = ? 
      ORDER BY display_order ASC
    `);
    const links = linksStmt.all(profile.id);

    // Separate featured and custom links
    const featured = [];
    const custom = [];

    links.forEach(link => {
      const linkData = {
        id: link.id,
        platform: link.platform_name,
        url: link.platform_url,
        displayLabel: link.platform_name, // Use platform_name as display label
        customLogo: link.logo_url,
        isFeatured: link.is_featured === 1,
        displayOrder: link.display_order
      };

      if (link.is_featured === 1) {
        featured.push(linkData);
      } else {
        custom.push(linkData);
      }
    });

    res.json({
      featured,
      custom,
      total: links.length,
      featuredCount: featured.length,
      customCount: custom.length
    });

  } catch (error) {
    console.error('Error fetching social links:', error);
    res.status(500).json({ error: 'Failed to fetch social links' });
  }
});

// ============================================================================
// T084: Update Social Link (PUT /api/profiles/me/social-links/:id)
// ============================================================================
router.put('/me/social-links/:id', auth, (req, res) => {
  const { id } = req.params;
  const { platform, url, displayLabel, customLogo, isFeatured, displayOrder } = req.body;
  const userId = req.user.id;

  try {
    // Verify ownership
    const ownershipStmt = db.prepare(`
      SELECT sp.* FROM social_profiles sp
      JOIN profiles p ON sp.profile_id = p.id
      WHERE sp.id = ? AND p.user_id = ?
    `);
    const link = ownershipStmt.get(id, userId);

    if (!link) {
      return res.status(404).json({ error: 'Social link not found or access denied' });
    }

    // T087: If changing to featured, check limit and assign display_order
    let finalDisplayOrder = displayOrder;
    if (isFeatured && link.is_featured === 0) {
      const countStmt = db.prepare(`
        SELECT COUNT(*) as count FROM social_profiles 
        WHERE profile_id = ? AND is_featured = 1
      `);
      const { count } = countStmt.get(link.profile_id);

      if (count >= 5) {
        return res.status(400).json({ 
          error: 'Maximum 5 featured links allowed. Remove a featured link first.',
          maxFeaturedLinks: 5,
          currentFeatured: count
        });
      }

      // If no display_order specified, assign next available position (1-5)
      if (!displayOrder) {
        finalDisplayOrder = count + 1;
      }
    }

    // Validate URL if provided
    if (url && !url.startsWith('https://')) {
      return res.status(400).json({ error: 'URL must use HTTPS protocol' });
    }

    // Update link - only update fields that are provided
    const updateStmt = db.prepare(`
      UPDATE social_profiles 
      SET platform_name = COALESCE(?, platform_name),
          platform_url = COALESCE(?, platform_url),
          logo_url = COALESCE(?, logo_url),
          is_featured = COALESCE(?, is_featured),
          display_order = COALESCE(?, display_order)
      WHERE id = ?
    `);

    updateStmt.run(
      platform || null,
      url || null,
      customLogo || null,
      isFeatured !== undefined ? (isFeatured ? 1 : 0) : null,
      finalDisplayOrder || null,
      id
    );

    // Fetch updated link
    const selectStmt = db.prepare('SELECT * FROM social_profiles WHERE id = ?');
    const updated = selectStmt.get(id);

    res.json({
      message: 'Social link updated successfully',
      link: {
        id: updated.id,
        platform: updated.platform_name,
        url: updated.platform_url,
        displayLabel: updated.platform_name,
        customLogo: updated.logo_url,
        isFeatured: updated.is_featured === 1,
        displayOrder: updated.display_order
      }
    });

  } catch (error) {
    console.error('Error updating social link:', error);
    res.status(500).json({ error: 'Failed to update social link' });
  }
});

// ============================================================================
// T085: Delete Social Link (DELETE /api/profiles/me/social-links/:id)
// ============================================================================
router.delete('/me/social-links/:id', auth, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Verify ownership
    const ownershipStmt = db.prepare(`
      SELECT sp.id FROM social_profiles sp
      JOIN profiles p ON sp.profile_id = p.id
      WHERE sp.id = ? AND p.user_id = ?
    `);
    const link = ownershipStmt.get(id, userId);

    if (!link) {
      return res.status(404).json({ error: 'Social link not found or access denied' });
    }

    // Delete link
    const deleteStmt = db.prepare('DELETE FROM social_profiles WHERE id = ?');
    deleteStmt.run(id);

    res.json({ 
      message: 'Social link deleted successfully',
      deletedId: parseInt(id)
    });

  } catch (error) {
    console.error('Error deleting social link:', error);
    res.status(500).json({ error: 'Failed to delete social link' });
  }
});

// ============================================================================
// T086: Reorder Social Links (POST /api/profiles/me/social-links/reorder)
// ============================================================================
router.post('/me/social-links/reorder', auth, (req, res) => {
  const { linkIds } = req.body;
  const userId = req.user.id;

  try {
    // Validate input
    if (!Array.isArray(linkIds) || linkIds.length === 0) {
      return res.status(400).json({ error: 'linkIds must be a non-empty array' });
    }

    // Get user's profile ID
    const profileStmt = db.prepare('SELECT id FROM profiles WHERE user_id = ?');
    const profile = profileStmt.get(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Verify all links belong to user
    const placeholders = linkIds.map(() => '?').join(',');
    const ownershipStmt = db.prepare(`
      SELECT COUNT(*) as count FROM social_profiles sp
      JOIN profiles p ON sp.profile_id = p.id
      WHERE sp.id IN (${placeholders}) AND p.user_id = ?
    `);
    const { count } = ownershipStmt.get(...linkIds, userId);

    if (count !== linkIds.length) {
      return res.status(403).json({ error: 'One or more links do not belong to you' });
    }

    // Update display order for each link
    const updateStmt = db.prepare('UPDATE social_profiles SET display_order = ? WHERE id = ?');
    
    linkIds.forEach((linkId, index) => {
      updateStmt.run(index + 1, linkId);
    });

    res.json({ 
      message: 'Social links reordered successfully',
      newOrder: linkIds
    });

  } catch (error) {
    console.error('Error reordering social links:', error);
    res.status(500).json({ error: 'Failed to reorder social links' });
  }
});

// ============================================================================
// T090: Detect Logo (POST /api/profiles/me/social-links/detect-logo)
// ============================================================================
router.post('/me/social-links/detect-logo', auth, (req, res) => {
  const { url } = req.body;

  try {
    if (!url || !url.trim()) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // T089: Logo detection patterns for 15+ platforms
    const logoPatterns = [
      { platform: 'LinkedIn', pattern: /linkedin\.com/i, logo: '/assets/social-logos/linkedin.svg' },
      { platform: 'Twitter', pattern: /twitter\.com|x\.com/i, logo: '/assets/social-logos/twitter.svg' },
      { platform: 'GitHub', pattern: /github\.com/i, logo: '/assets/social-logos/github.svg' },
      { platform: 'Instagram', pattern: /instagram\.com/i, logo: '/assets/social-logos/instagram.svg' },
      { platform: 'Facebook', pattern: /facebook\.com/i, logo: '/assets/social-logos/facebook.svg' },
      { platform: 'TikTok', pattern: /tiktok\.com/i, logo: '/assets/social-logos/tiktok.svg' },
      { platform: 'YouTube', pattern: /youtube\.com|youtu\.be/i, logo: '/assets/social-logos/youtube.svg' },
      { platform: 'Spotify', pattern: /spotify\.com/i, logo: '/assets/social-logos/spotify.svg' },
      { platform: 'Medium', pattern: /medium\.com/i, logo: '/assets/social-logos/medium.svg' },
      { platform: 'Behance', pattern: /behance\.net/i, logo: '/assets/social-logos/behance.svg' },
      { platform: 'Dribbble', pattern: /dribbble\.com/i, logo: '/assets/social-logos/dribbble.svg' },
      { platform: 'Twitch', pattern: /twitch\.tv/i, logo: '/assets/social-logos/twitch.svg' },
      { platform: 'Discord', pattern: /discord\.gg|discord\.com/i, logo: '/assets/social-logos/discord.svg' },
      { platform: 'Telegram', pattern: /t\.me|telegram\.org/i, logo: '/assets/social-logos/telegram.svg' },
      { platform: 'WhatsApp', pattern: /wa\.me|whatsapp\.com/i, logo: '/assets/social-logos/whatsapp.svg' }
    ];

    // Find matching platform
    const match = logoPatterns.find(p => p.pattern.test(url));

    if (match) {
      res.json({
        detected: true,
        platform: match.platform,
        logoPath: match.logo
      });
    } else {
      res.json({
        detected: false,
        platform: null,
        logoPath: '/assets/social-logos/default-link.svg'
      });
    }

  } catch (error) {
    console.error('Error detecting logo:', error);
    res.status(500).json({ error: 'Failed to detect logo' });
  }
});

module.exports = router;
