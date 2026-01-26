/**
 * File Upload Routes
 * Handles avatar, logo, and background uploads for profiles
 * Supports WebP conversion for optimized photo backgrounds
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');

// Try to load sharp for image optimization (optional dependency)
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not installed - WebP conversion disabled. Run: npm install sharp');
  sharp = null;
}

// Apply auth middleware to all routes
router.use(authenticateToken);

// Ensure upload directories exist
const UPLOAD_DIRS = {
  avatars: path.join(__dirname, '../../public/uploads/avatars'),
  logos: path.join(__dirname, '../../public/uploads/logos'),
  backgrounds: path.join(__dirname, '../../public/uploads/backgrounds'),
  socialLogos: path.join(__dirname, '../../public/uploads/social-logos')
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
 * Safely resolve a file path within the uploads directory
 * Prevents path traversal attacks by validating the resolved path
 * @param {string} userPath - User-provided path (relative to /uploads/)
 * @param {string} uploadDir - Base upload directory (absolute path)
 * @returns {string|null} - Resolved safe path or null if invalid
 */
const safeResolvePath = (userPath, uploadDir) => {
  // Validate inputs
  if (!userPath || typeof userPath !== 'string') {
    return null;
  }

  // Normalize the user path to remove any directory traversal attempts
  const normalizedUserPath = path.normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, '');

  // Check for suspicious patterns
  if (normalizedUserPath.includes('..') || normalizedUserPath.includes('~') || normalizedUserPath.startsWith('/')) {
    console.error('Security Alert: Suspicious path pattern detected:', normalizedUserPath);
    return null;
  }

  // Construct the full file path
  const fullPath = path.join(uploadDir, path.basename(normalizedUserPath));

  // Resolve to absolute path and normalize
  const resolvedPath = path.resolve(fullPath);
  const resolvedUploadDir = path.resolve(uploadDir);

  // Verify the resolved path is within the upload directory
  if (!resolvedPath.startsWith(resolvedUploadDir)) {
    console.error('Security Alert: Path traversal attempt detected:', {
      userPath,
      resolvedPath,
      uploadDir: resolvedUploadDir
    });
    return null;
  }

  return resolvedPath;
};

/**
 * Convert image to WebP format for optimization
 * Only used for header backgrounds to reduce file size while maintaining quality
 * @param {Buffer} imageData - The original image buffer
 * @param {Object} options - Conversion options
 * @param {number} options.quality - WebP quality (0-100), default 85
 * @param {number} options.maxWidth - Maximum width, default 1200
 * @returns {Promise<{data: Buffer, extension: string}>}
 */
const convertToWebP = async (imageData, options = {}) => {
  const quality = options.quality || 85;
  const maxWidth = options.maxWidth || 1200;
  
  if (!sharp) {
    // Sharp not available, return original
    return null;
  }
  
  try {
    const webpData = await sharp(imageData)
      .resize(maxWidth, null, { 
        withoutEnlargement: true,
        fit: 'inside' 
      })
      .webp({ quality })
      .toBuffer();
    
    return {
      data: webpData,
      extension: 'webp'
    };
  } catch (error) {
    console.error('WebP conversion failed:', error);
    return null;
  }
};

/**
 * Resize and convert custom social logo to WebP
 * Resizes to 512x512 and converts to WebP for consistency
 * @param {Buffer} imageData - The original image buffer
 * @returns {Promise<{data: Buffer, extension: string} | null>}
 */
const processCustomLogo = async (imageData) => {
  if (!sharp) {
    // Sharp not available, return original
    return null;
  }
  
  try {
    const webpData = await sharp(imageData)
      .resize(512, 512, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .webp({ quality: 90 })
      .toBuffer();
    
    return {
      data: webpData,
      extension: 'webp'
    };
  } catch (error) {
    console.error('Custom logo processing failed:', error);
    return null;
  }
};

// Ensure social-logos upload directory exists
const SOCIAL_LOGOS_DIR = path.join(__dirname, '../../public/uploads/social-logos');
if (!fs.existsSync(SOCIAL_LOGOS_DIR)) {
  fs.mkdirSync(SOCIAL_LOGOS_DIR, { recursive: true });
}

/**
 * POST /api/uploads/social-logo
 * Upload a custom logo for social links
 * Max 500KB, resizes to 512x512, converts to WebP
 */
router.post('/social-logo', async (req, res) => {
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

    // Validate file size (max 500KB for social logos)
    if (data.length > 500 * 1024) {
      return res.status(400).json({ error: 'Logo size must be less than 500KB' });
    }

    // Validate extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    if (!allowedExtensions.includes(extension.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid image format. Allowed: JPG, PNG, GIF, WebP, SVG' });
    }

    let finalData = data;
    let finalExtension = extension;

    // Process non-SVG images: resize and convert to WebP
    if (extension.toLowerCase() !== 'svg') {
      const processed = await processCustomLogo(data);
      if (processed) {
        finalData = processed.data;
        finalExtension = processed.extension;
        console.log(`Custom logo processed: ${data.length} bytes -> ${finalData.length} bytes`);
      }
    }

    // Generate filename and save
    const filename = generateFilename(finalExtension);
    const filepath = path.join(SOCIAL_LOGOS_DIR, filename);

    fs.writeFileSync(filepath, finalData);

    const logoUrl = `/uploads/social-logos/${filename}`;

    res.json({
      success: true,
      url: logoUrl,
      message: 'Custom logo uploaded successfully',
      processed: finalExtension === 'webp' && extension !== 'webp'
    });

  } catch (error) {
    console.error('Error uploading custom logo:', error);
    res.status(500).json({ error: 'Failed to upload custom logo' });
  }
});

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

    // Convert to WebP for optimization (used as header background in Visual themes)
    // Skip if already WebP or if sharp is not available
    let finalData = data;
    let finalExtension = extension;
    
    if (extension.toLowerCase() !== 'webp' && extension.toLowerCase() !== 'gif') {
      const webpResult = await convertToWebP(data, { quality: 85, maxWidth: 1200 });
      if (webpResult) {
        finalData = webpResult.data;
        finalExtension = webpResult.extension;
        console.log(`Avatar converted to WebP: ${data.length} bytes -> ${finalData.length} bytes`);
      }
    }

    // Generate filename and save
    const filename = generateFilename(finalExtension);
    const filepath = path.join(UPLOAD_DIRS.avatars, filename);

    fs.writeFileSync(filepath, finalData);

    // Update user's profile with new avatar URL
    const db = require('../config/database');
    const avatarUrl = `/uploads/avatars/${filename}`;

    db.prepare(
      `UPDATE profiles SET avatar_url = ?, updated_at = datetime('now') WHERE user_id = ?`
    ).run(avatarUrl, req.user.id);

    res.json({
      success: true,
      url: avatarUrl,
      message: 'Avatar uploaded successfully',
      optimized: finalExtension === 'webp' && extension !== 'webp'
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

    if (profile && profile.avatar_url && profile.avatar_url.startsWith('/uploads/avatars/')) {
      // Extract filename from URL and validate path
      const filename = path.basename(profile.avatar_url);
      const safePath = safeResolvePath(filename, UPLOAD_DIRS.avatars);

      if (safePath && fs.existsSync(safePath)) {
        fs.unlinkSync(safePath);
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

    if (profile && profile.logo_url && profile.logo_url.startsWith('/uploads/logos/')) {
      // Extract filename from URL and validate path
      const filename = path.basename(profile.logo_url);
      const safePath = safeResolvePath(filename, UPLOAD_DIRS.logos);

      if (safePath && fs.existsSync(safePath)) {
        fs.unlinkSync(safePath);
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

/**
 * POST /api/uploads/social-logo
 * Upload a custom logo for social links
 * Resizes to 512x512 and converts to WebP for optimization
 */
router.post('/social-logo', async (req, res) => {
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

    // Validate file size (max 500KB for social logos)
    if (data.length > 500 * 1024) {
      return res.status(400).json({ error: 'Logo size must be less than 500KB' });
    }

    // Validate extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    if (!allowedExtensions.includes(extension.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid image format. Allowed: JPG, PNG, GIF, WebP, SVG' });
    }

    let finalData = data;
    let finalExtension = extension;

    // For non-SVG images, resize to 512x512 and convert to WebP
    if (extension.toLowerCase() !== 'svg' && sharp) {
      try {
        finalData = await sharp(data)
          .resize(512, 512, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .webp({ quality: 90 })
          .toBuffer();
        finalExtension = 'webp';
        console.log(`Social logo converted: ${data.length} bytes -> ${finalData.length} bytes`);
      } catch (sharpError) {
        console.error('Sharp processing failed, using original:', sharpError);
        // Fall back to original if sharp fails
      }
    }

    // Generate filename and save
    const filename = generateFilename(finalExtension);
    const filepath = path.join(UPLOAD_DIRS.socialLogos, filename);

    fs.writeFileSync(filepath, finalData);

    const logoUrl = `/uploads/social-logos/${filename}`;

    res.json({
      success: true,
      url: logoUrl,
      message: 'Social logo uploaded successfully',
      optimized: finalExtension === 'webp' && extension !== 'webp'
    });

  } catch (error) {
    console.error('Error uploading social logo:', error);
    res.status(500).json({ error: 'Failed to upload social logo' });
  }
});

/**
 * DELETE /api/uploads/social-logo
 * Remove a custom social logo
 */
router.delete('/social-logo', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { url } = req.body;

    if (!url || !url.startsWith('/uploads/social-logos/')) {
      return res.status(400).json({ error: 'Invalid logo URL' });
    }

    // Extract filename from URL and validate path
    const filename = path.basename(url);
    const safePath = safeResolvePath(filename, UPLOAD_DIRS.socialLogos);

    if (safePath && fs.existsSync(safePath)) {
      fs.unlinkSync(safePath);
    }

    res.json({ success: true, message: 'Social logo removed' });

  } catch (error) {
    console.error('Error removing social logo:', error);
    res.status(500).json({ error: 'Failed to remove social logo' });
  }
});

module.exports = router;
