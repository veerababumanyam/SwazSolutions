/**
 * File Upload Routes
 * Handles avatar and logo uploads for profiles
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authenticateToken);

// Ensure upload directories exist
const UPLOAD_DIRS = {
  avatars: path.join(__dirname, '../../public/uploads/avatars'),
  logos: path.join(__dirname, '../../public/uploads/logos'),
  backgrounds: path.join(__dirname, '../../public/uploads/backgrounds')
};

Object.values(UPLOAD_DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Helper to parse base64 image data
 * @param {string} dataUrl - The base64 data URL
 * @returns {{extension: string, data: Buffer}}
 */
const parseBase64Image = (dataUrl) => {
  const matches = dataUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid image data');
  }
  return {
    extension: matches[1] === 'jpeg' ? 'jpg' : matches[1],
    data: Buffer.from(matches[2], 'base64')
  };
};

/**
 * Generate unique filename
 * @param {string} extension - File extension
 * @returns {string}
 */
const generateFilename = (extension) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}.${extension}`;
};

/**
 * POST /api/uploads/avatar
 * Upload a profile avatar image
 */
router.post('/avatar', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Parse the base64 image
    const { extension, data } = parseBase64Image(image);

    // Validate file size (max 5MB)
    if (data.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image size must be less than 5MB' });
    }

    // Validate extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!allowedExtensions.includes(extension.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid image format. Allowed: JPG, PNG, GIF, WebP' });
    }

    // Generate filename and save
    const filename = generateFilename(extension);
    const filepath = path.join(UPLOAD_DIRS.avatars, filename);

    fs.writeFileSync(filepath, data);

    // Update user's profile with new avatar URL
    const db = require('../config/database');
    const avatarUrl = `/uploads/avatars/${filename}`;

    db.prepare(
      `UPDATE profiles SET avatar_url = ?, updated_at = datetime('now') WHERE user_id = ?`
    ).run(avatarUrl, req.user.id);

    res.json({
      success: true,
      url: avatarUrl,
      message: 'Avatar uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

/**
 * POST /api/uploads/logo
 * Upload a profile logo image
 */
router.post('/logo', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Parse the base64 image
    const { extension, data } = parseBase64Image(image);

    // Validate file size (max 2MB for logos)
    if (data.length > 2 * 1024 * 1024) {
      return res.status(400).json({ error: 'Logo size must be less than 2MB' });
    }

    // Validate extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    if (!allowedExtensions.includes(extension.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid image format. Allowed: JPG, PNG, GIF, WebP, SVG' });
    }

    // Generate filename and save
    const filename = generateFilename(extension);
    const filepath = path.join(UPLOAD_DIRS.logos, filename);

    fs.writeFileSync(filepath, data);

    // Update user's profile with new logo URL
    const db = require('../config/database');
    const logoUrl = `/uploads/logos/${filename}`;

    db.prepare(
      `UPDATE profiles SET logo_url = ?, updated_at = datetime('now') WHERE user_id = ?`
    ).run(logoUrl, req.user.id);

    res.json({
      success: true,
      url: logoUrl,
      message: 'Logo uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

/**
 * POST /api/uploads/background
 * Upload a profile background image
 */
router.post('/background', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Parse the base64 image
    const { extension, data } = parseBase64Image(image);

    // Validate file size (max 10MB for backgrounds)
    if (data.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Background image size must be less than 10MB' });
    }

    // Validate extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!allowedExtensions.includes(extension.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid image format. Allowed: JPG, PNG, GIF, WebP' });
    }

    // Generate filename and save
    const filename = generateFilename(extension);
    const filepath = path.join(UPLOAD_DIRS.backgrounds, filename);

    fs.writeFileSync(filepath, data);

    // Update user's profile with new background URL
    const db = require('../config/database');
    const backgroundUrl = `/uploads/backgrounds/${filename}`;

    db.prepare(
      `UPDATE profiles SET background_image_url = ?, updated_at = datetime('now') WHERE user_id = ?`
    ).run(backgroundUrl, req.user.id);

    res.json({
      success: true,
      url: backgroundUrl,
      message: 'Background uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading background:', error);
    res.status(500).json({ error: 'Failed to upload background' });
  }
});

/**
 * DELETE /api/uploads/avatar
 * Remove profile avatar
 */
router.delete('/avatar', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const db = require('../config/database');

    // Get current avatar URL to delete the file
    const profile = db.prepare('SELECT avatar_url FROM profiles WHERE user_id = ?').get(req.user.id);

    if (profile && profile.avatar_url && profile.avatar_url.startsWith('/uploads/')) {
      const filepath = path.join(__dirname, '../../public', profile.avatar_url);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    // Clear avatar URL in database
    db.prepare(
      `UPDATE profiles SET avatar_url = NULL, updated_at = datetime('now') WHERE user_id = ?`
    ).run(req.user.id);

    res.json({ success: true, message: 'Avatar removed' });

  } catch (error) {
    console.error('Error removing avatar:', error);
    res.status(500).json({ error: 'Failed to remove avatar' });
  }
});

/**
 * DELETE /api/uploads/logo
 * Remove profile logo
 */
router.delete('/logo', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const db = require('../config/database');

    // Get current logo URL to delete the file
    const profile = db.prepare('SELECT logo_url FROM profiles WHERE user_id = ?').get(req.user.id);

    if (profile && profile.logo_url && profile.logo_url.startsWith('/uploads/')) {
      const filepath = path.join(__dirname, '../../public', profile.logo_url);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    // Clear logo URL in database
    db.prepare(
      `UPDATE profiles SET logo_url = NULL, updated_at = datetime('now') WHERE user_id = ?`
    ).run(req.user.id);

    res.json({ success: true, message: 'Logo removed' });

  } catch (error) {
    console.error('Error removing logo:', error);
    res.status(500).json({ error: 'Failed to remove logo' });
  }
});

module.exports = router;
