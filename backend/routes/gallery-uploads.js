const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

// Configure multer for memory storage (process in-memory before saving)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

/**
 * POST /api/profiles/me/galleries/:linkId/images
 * Upload image to a gallery link item
 */
router.post('/me/galleries/:linkId/images',
  authenticateToken,
  upload.single('image'),
  async (req, res) => {
    try {
      await db.ready;

      const linkId = req.params.linkId;
      const caption = req.body.caption || '';

      // Validate file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // 1. Get user's profile
      const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // 2. Verify link item exists and belongs to user's profile
      const linkItem = db.prepare('SELECT * FROM link_items WHERE id = ? AND profile_id = ?')
        .get(linkId, profile.id);

      if (!linkItem) {
        return res.status(404).json({ error: 'Link item not found' });
      }

      if (linkItem.type !== 'GALLERY') {
        return res.status(400).json({ error: 'Link item is not a gallery type' });
      }

      // 3. Check gallery image count (max 20 per gallery)
      const count = db.prepare('SELECT COUNT(*) as count FROM gallery_images WHERE link_item_id = ?')
        .get(linkId).count;

      if (count >= 20) {
        return res.status(400).json({ error: 'Maximum 20 images per gallery. Delete some images first.' });
      }

      // 4. Optimize image with Sharp
      let optimizedBuffer;
      try {
        optimizedBuffer = await sharp(req.file.buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({
            quality: 85,
            progressive: true
          })
          .toBuffer();
      } catch (sharpError) {
        console.error('Sharp optimization error:', sharpError);
        return res.status(400).json({ error: 'Failed to process image. Invalid image file.' });
      }

      // 5. Convert to base64 for storage (prototype - replace with R2/S3 in production)
      const base64Image = `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`;

      // Check if base64 is too large (> 1MB warns, >5MB rejects)
      const sizeInMB = Buffer.byteLength(base64Image, 'utf8') / (1024 * 1024);
      if (sizeInMB > 5) {
        return res.status(400).json({ error: 'Image too large after optimization. Try a smaller image.' });
      } else if (sizeInMB > 1) {
        console.warn(`⚠️ Large image uploaded: ${sizeInMB.toFixed(2)}MB for gallery ${linkId}`);
      }

      // 6. Get next display order
      const maxOrderRow = db.prepare('SELECT MAX(display_order) as maxOrder FROM gallery_images WHERE link_item_id = ?')
        .get(linkId);
      const displayOrder = (maxOrderRow?.maxOrder || 0) + 1;

      // 7. Insert into gallery_images
      const result = db.prepare(`
        INSERT INTO gallery_images (link_item_id, url, caption, display_order)
        VALUES (?, ?, ?, ?)
      `).run(linkId, base64Image, caption, displayOrder);

      // 8. Return created image
      const createdImage = {
        id: result.lastInsertRowid,
        link_item_id: linkId,
        url: base64Image,
        caption: caption,
        display_order: displayOrder,
        created_at: new Date().toISOString()
      };

      res.status(201).json(createdImage);
    } catch (error) {
      console.error('Error uploading gallery image:', error);

      // Handle multer errors
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: error.message || 'Failed to upload gallery image' });
    }
  });

/**
 * DELETE /api/profiles/me/galleries/:linkId/images/:imageId
 * Delete image from gallery
 */
router.delete('/me/galleries/:linkId/images/:imageId', authenticateToken, async (req, res) => {
  try {
    await db.ready;

    const { linkId, imageId } = req.params;

    // 1. Get user's profile
    const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // 2. Verify link item belongs to user's profile
    const linkItem = db.prepare('SELECT * FROM link_items WHERE id = ? AND profile_id = ?')
      .get(linkId, profile.id);

    if (!linkItem) {
      return res.status(404).json({ error: 'Link item not found' });
    }

    // 3. Verify image exists and belongs to this link item
    const image = db.prepare('SELECT * FROM gallery_images WHERE id = ? AND link_item_id = ?')
      .get(imageId, linkId);

    if (!image) {
      return res.status(404).json({ error: 'Gallery image not found' });
    }

    // 4. Delete image
    db.prepare('DELETE FROM gallery_images WHERE id = ?').run(imageId);

    // 5. Reorder remaining images (fill gap in display_order)
    db.prepare(`
      UPDATE gallery_images
      SET display_order = display_order - 1
      WHERE link_item_id = ? AND display_order > ?
    `).run(linkId, image.display_order);

    res.json({ message: 'Gallery image deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({ error: 'Failed to delete gallery image' });
  }
});

/**
 * POST /api/profiles/me/galleries/:linkId/images/reorder
 * Reorder images in a gallery
 * Body: [{ id, displayOrder }, ...]
 */
router.post('/me/galleries/:linkId/images/reorder', authenticateToken, async (req, res) => {
  try {
    await db.ready;

    const linkId = req.params.linkId;
    const reorderData = req.body;

    // Validation
    if (!Array.isArray(reorderData)) {
      return res.status(400).json({ error: 'Request body must be an array' });
    }

    // Get user's profile
    const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Verify link item belongs to user
    const linkItem = db.prepare('SELECT * FROM link_items WHERE id = ? AND profile_id = ?')
      .get(linkId, profile.id);

    if (!linkItem) {
      return res.status(404).json({ error: 'Link item not found' });
    }

    // Update display orders
    for (const item of reorderData) {
      if (!item.id || typeof item.displayOrder !== 'number') {
        return res.status(400).json({ error: 'Each item must have id and displayOrder' });
      }

      // Verify image belongs to this gallery
      const image = db.prepare('SELECT id FROM gallery_images WHERE id = ? AND link_item_id = ?')
        .get(item.id, linkId);

      if (!image) {
        return res.status(404).json({ error: `Gallery image ${item.id} not found` });
      }

      // Update order
      db.prepare('UPDATE gallery_images SET display_order = ? WHERE id = ?')
        .run(item.displayOrder, item.id);
    }

    // Fetch updated images
    const updatedImages = db.prepare(`
      SELECT * FROM gallery_images
      WHERE link_item_id = ?
      ORDER BY display_order ASC
    `).all(linkId);

    res.json(updatedImages);
  } catch (error) {
    console.error('Error reordering gallery images:', error);
    res.status(500).json({ error: 'Failed to reorder gallery images' });
  }
});

module.exports = router;
