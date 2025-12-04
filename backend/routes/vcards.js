// vCard Generation Routes (T018)
// Handles vCard generation and download tracking

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const vCardsJS = require('vcards-js');
const crypto = require('crypto');

// Helper to hash IP for privacy
const hashIP = (ip) => {
  return crypto.createHash('sha256').update(ip).digest('hex');
};

// ============================================================================
// T072: Get vCard (GET /api/public/profile/:username/vcard)
// ============================================================================
router.get('/:username/vcard', (req, res) => {
  const { username } = req.params;

  try {
    // Fetch published profile
    const profileStmt = db.prepare(`
      SELECT * FROM profiles WHERE username = ? AND published = 1
    `);
    const profile = profileStmt.get(username);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // T070: Create vCard 3.0
    const vCard = vCardsJS();

    // T071: Exclude private fields based on privacy toggles
    // Name fields
    vCard.firstName = profile.first_name || '';
    vCard.lastName = profile.last_name || '';
    vCard.formattedName = profile.display_name || `${profile.first_name} ${profile.last_name}`.trim() || username;

    // Contact fields (respect privacy settings)
    if (profile.public_email_visible && profile.public_email) {
      vCard.email = profile.public_email;
    }
    if (profile.public_phone_visible && profile.public_phone) {
      vCard.cellPhone = profile.public_phone;
    }

    // Organization
    if (profile.company) {
      vCard.organization = profile.company;
    }
    if (profile.headline) {
      vCard.title = profile.headline;
    }

    // Website
    if (profile.website_visible && profile.website) {
      vCard.url = profile.website;
    }

    // Profile URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    vCard.workUrl = `${baseUrl}/u/${username}`;

    // Avatar/Photo
    if (profile.avatar) {
      // Note: vCard photo requires base64 or URL
      vCard.photo.attachFromUrl(profile.avatar, 'JPEG');
    }

    // Bio as note
    if (profile.bio) {
      vCard.note = profile.bio;
    }

    // Generate vCard string
    const vCardString = vCard.getFormattedString();

    // T077: Track download event
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const hashedIP = hashIP(ipAddress);
    const userAgent = req.get('user-agent') || 'unknown';
    
    // Detect device type from user agent
    const deviceType = /mobile/i.test(userAgent) ? 'mobile' : 
                       /tablet|ipad/i.test(userAgent) ? 'tablet' : 'desktop';

    const trackStmt = db.prepare(`
      INSERT INTO vcard_downloads (profile_id, ip_hash, device_type, downloaded_at)
      VALUES (?, ?, ?, datetime('now'))
    `);
    trackStmt.run(profile.id, hashedIP, deviceType);

    // T073: Set correct Content-Type and filename
    res.set('Content-Type', 'text/vcard; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="${username}.vcf"`);
    res.send(vCardString);

  } catch (error) {
    console.error('Error generating vCard:', error);
    res.status(500).json({ error: 'Failed to generate vCard' });
  }
});

// ============================================================================
// Get vCard Download Stats (Internal endpoint for analytics)
// ============================================================================
router.get('/:username/vcard/stats', (req, res) => {
  const { username } = req.params;

  try {
    // Get profile
    const profileStmt = db.prepare('SELECT id FROM profiles WHERE username = ?');
    const profile = profileStmt.get(username);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get download count
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total FROM vcard_downloads WHERE profile_id = ?
    `);
    const { total } = countStmt.get(profile.id);

    // Get recent downloads (last 30 days)
    const recentStmt = db.prepare(`
      SELECT COUNT(*) as recent FROM vcard_downloads 
      WHERE profile_id = ? AND downloaded_at > datetime('now', '-30 days')
    `);
    const { recent } = recentStmt.get(profile.id);

    res.json({
      totalDownloads: total,
      last30Days: recent
    });

  } catch (error) {
    console.error('Error fetching vCard stats:', error);
    res.status(500).json({ error: 'Failed to fetch vCard stats' });
  }
});

module.exports = router;
