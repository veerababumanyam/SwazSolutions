// vCard Generation Routes (T018)
// Handles vCard 4.0 generation and download tracking
// Uses custom vCardGenerator for WCAG 2.1 AA compliant contact cards

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { generateVCard, getVCardFilename } = require('../services/vCardGenerator');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

// Rate limiter: 100 requests per IP per hour
const vCardDownloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 downloads per hour per IP
  message: {
    error: 'Too many vCard download requests',
    message: 'You have exceeded the vCard download limit. Please try again later.',
    limit: 100,
    windowHours: 1
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  keyGenerator: (req) => {
    // Hash IP for privacy
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    return crypto.createHash('sha256').update(ip).digest('hex');
  },
  handler: (req, res) => {
    const hashedIP = crypto.createHash('sha256').update(req.ip || 'unknown').digest('hex');
    console.log(`🚫 vCard download rate limit exceeded for IP hash: ${hashedIP.substring(0, 16)}...`);
    res.status(429).json({
      error: 'Too many vCard download requests',
      message: 'You have exceeded the vCard download limit. Please try again in an hour.',
      limit: 100,
      windowHours: 1,
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

// Helper to hash IP for privacy
const hashIP = (ip) => {
  return crypto.createHash('sha256').update(ip).digest('hex');
};

// ============================================================================
// T072: Get vCard 4.0 (GET /api/public/profile/:username/vcard)
// ============================================================================
router.get('/:username/vcard', vCardDownloadLimiter, (req, res) => {
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

    // Fetch social links for X-SOCIALPROFILE fields
    const socialLinks = db.prepare(`
      SELECT platform_name, platform_url
      FROM social_profiles
      WHERE profile_id = ? AND is_public = 1
      ORDER BY display_order ASC
    `).all(profile.id);

    // T070: Generate vCard 4.0 using custom generator
    // The generator respects visibility toggles for:
    // - Personal: show_email, show_phone, show_website
    // - Company: show_company_email, show_company_phone
    // vCard 4.0 includes X-SOCIALPROFILE fields for social media links
    const vCardString = generateVCard(profile, socialLinks);

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
    res.set('Content-Disposition', `attachment; filename="${getVCardFilename(username)}"`);
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
