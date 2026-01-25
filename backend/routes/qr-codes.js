// QR Code Generation Routes (T017)
// Handles QR code generation and caching for profiles

const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const db = require('../config/database');
const QRCode = require('qrcode');
const crypto = require('crypto');

// ============================================================================
// T119: Get QR Code (GET /api/profiles/me/qr-code)
// ============================================================================
const { generateVCard, generateQRVCard } = require('../services/vCardGenerator');

// Helper function to validate hex color
const isValidHexColor = (color) => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

// ============================================================================
// T119: Get QR Code (GET /api/profiles/me/qr-code)
// ============================================================================
router.get('/me/qr-code', auth, async (req, res) => {
  const {
    format = 'png',
    size = 1000,
    content = 'url',
    fgColor = '#000000',
    bgColor = '#FFFFFF'
  } = req.query;
  const userId = req.user.id;

  try {
    // Validate colors
    const validFgColor = isValidHexColor(fgColor) ? fgColor : '#000000';
    const validBgColor = isValidHexColor(bgColor) ? bgColor : '#FFFFFF';

    // Get user's profile with all fields needed for vCard
    const profileStmt = db.prepare('SELECT * FROM profiles WHERE user_id = ?');
    const profile = profileStmt.get(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Determine QR data based on content type
    let qrInputData;
    if (content === 'vcard') {
      // Use minimal vCard for QR codes to ensure scannability
      qrInputData = generateQRVCard(profile);
    } else {
      // Default to URL
      const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
      qrInputData = `${baseUrl}/u/${profile.username}`;
    }

    // Check cache - include colors in cache key
    const cacheKey = `${profile.id}-${format}-${size}-${content}-${validFgColor}-${validBgColor}`;
    const cacheStmt = db.prepare(`
      SELECT qr_data, format FROM qr_codes
      WHERE profile_id = ? AND cache_key = ? AND expires_at > datetime('now')
    `);
    const cached = cacheStmt.get(profile.id, cacheKey);

    if (cached) {
      // Return cached QR code
      const contentType = format === 'svg' ? 'image/svg+xml' : 'image/png';
      const buffer = format === 'svg'
        ? Buffer.from(cached.qr_data, 'utf-8')
        : Buffer.from(cached.qr_data, 'base64');

      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=2592000'); // 30 days
      return res.send(buffer);
    }

    // Generate new QR code with color customization
    const qrOptions = {
      errorCorrectionLevel: 'M',
      type: format === 'svg' ? 'svg' : 'png',
      width: parseInt(size),
      margin: 1,
      color: {
        dark: validFgColor,  // Foreground (dots) color
        light: validBgColor  // Background color
      }
    };

    let qrData;
    if (format === 'svg') {
      qrData = await QRCode.toString(qrInputData, { ...qrOptions, type: 'svg' });
    } else {
      const dataUrl = await QRCode.toDataURL(qrInputData, qrOptions);
      qrData = dataUrl.split(',')[1]; // Remove data:image/png;base64, prefix
    }

    // T122: Cache QR code for 30 days
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO qr_codes (profile_id, cache_key, qr_data, format, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertStmt.run(profile.id, cacheKey, qrData, format, expiresAt);

    // Return QR code
    const contentType = format === 'svg' ? 'image/svg+xml' : 'image/png';
    const buffer = format === 'svg'
      ? Buffer.from(qrData, 'utf-8')
      : Buffer.from(qrData, 'base64');

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=2592000'); // 30 days
    res.send(buffer);

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// ============================================================================
// T120: Regenerate QR Code (POST /api/profiles/me/qr-code/regenerate)
// ============================================================================
router.post('/me/qr-code/regenerate', auth, async (req, res) => {
  const {
    format = 'png',
    size = 1000,
    errorLevel = 'M',
    includeLogo = false,
    fgColor = '#000000',
    bgColor = '#FFFFFF'
  } = req.body;
  const userId = req.user.id;

  try {
    // Validate error correction level
    if (!['L', 'M', 'Q', 'H'].includes(errorLevel)) {
      return res.status(400).json({
        error: 'Invalid error correction level. Use L, M, Q, or H.'
      });
    }

    // Validate size
    const sizeNum = parseInt(size);
    if (sizeNum < 100 || sizeNum > 2000) {
      return res.status(400).json({
        error: 'Size must be between 100 and 2000 pixels.'
      });
    }

    // Validate colors
    const validFgColor = isValidHexColor(fgColor) ? fgColor : '#000000';
    const validBgColor = isValidHexColor(bgColor) ? bgColor : '#FFFFFF';

    // Get user's profile
    const profileStmt = db.prepare('SELECT id, username, avatar_url FROM profiles WHERE user_id = ?');
    const profile = profileStmt.get(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Generate profile URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    const profileUrl = `${baseUrl}/u/${profile.username}`;

    // T123: Invalidate existing cache
    const deleteStmt = db.prepare('DELETE FROM qr_codes WHERE profile_id = ?');
    deleteStmt.run(profile.id);

    // T121: Generate QR code with customization including colors
    const qrOptions = {
      errorCorrectionLevel: errorLevel,
      type: format === 'svg' ? 'svg' : 'png',
      width: sizeNum,
      margin: 1,
      color: {
        dark: validFgColor,  // Foreground (dots) color
        light: validBgColor  // Background color
      }
    };

    let qrData;
    if (format === 'svg') {
      qrData = await QRCode.toString(profileUrl, { ...qrOptions, type: 'svg' });
    } else {
      const dataUrl = await QRCode.toDataURL(profileUrl, qrOptions);
      qrData = dataUrl.split(',')[1];
    }

    // Cache new QR code with colors in cache key
    const cacheKey = `${profile.id}-${format}-${sizeNum}-${errorLevel}-${validFgColor}-${validBgColor}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const insertStmt = db.prepare(`
      INSERT INTO qr_codes (profile_id, cache_key, qr_data, format, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertStmt.run(profile.id, cacheKey, qrData, format, expiresAt);

    res.json({
      message: 'QR code regenerated successfully',
      qrCode: {
        format,
        size: sizeNum,
        errorLevel,
        fgColor: validFgColor,
        bgColor: validBgColor,
        cacheKey,
        dataUrl: format === 'svg'
          ? `data:image/svg+xml;utf8,${encodeURIComponent(qrData)}`
          : `data:image/png;base64,${qrData}`
      }
    });

  } catch (error) {
    console.error('Error regenerating QR code:', error);
    res.status(500).json({ error: 'Failed to regenerate QR code' });
  }
});

// ============================================================================
// Invalidate QR Cache on Username Change (Internal Helper)
// ============================================================================
const invalidateQRCache = (profileId) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM qr_codes WHERE profile_id = ?');
    deleteStmt.run(profileId);
    return true;
  } catch (error) {
    console.error('Error invalidating QR cache:', error);
    return false;
  }
};

module.exports = router;
module.exports.invalidateQRCache = invalidateQRCache;
