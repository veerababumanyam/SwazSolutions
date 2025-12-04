// vCard Generation Routes (T018)
// Handles vCard generation and download tracking
// Uses custom vCardGenerator for WCAG 2.1 AA compliant contact cards

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { generateVCard, getVCardFilename } = require('../services/vCardGenerator');
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

    // T070: Generate vCard 3.0 using custom generator
    // The generator respects visibility toggles for:
    // - Personal: show_email, show_phone, show_website
    // - Company: show_company_email, show_company_phone
    const vCardString = generateVCard(profile);

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
