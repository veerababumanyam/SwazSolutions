/**
 * Digital Invitation Gallery API Routes
 * Photo gallery management for invitations
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Middleware
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'gallery');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `gallery_${Date.now()}_${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
  }
});

const createInviteGalleryRoutes = (db) => {
  const router = express.Router();

  /**
   * @route   POST /api/invites/:id/gallery
   * @desc    Upload photo to gallery
   * @access  Private
   */
  router.post('/:id/gallery', authenticateToken, upload.single('photo'), async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Verify ownership
      const invite = await db.get(
        'SELECT * FROM digital_invites WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No photo uploaded'
        });
      }

      // Get current gallery
      const galleryImages = JSON.parse(invite.gallery_images || '[]');

      // Create new photo entry
      const photo = {
        id: uuidv4(),
        url: `/uploads/gallery/${req.file.filename}`,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        caption: req.body.caption || '',
        isCover: galleryImages.length === 0, // First photo is cover
        order: galleryImages.length,
        uploadedAt: new Date().toISOString()
      };

      // Add to gallery
      galleryImages.push(photo);

      // Update invite
      await db.run(
        'UPDATE digital_invites SET gallery_images = ?, updated_at = datetime(\'now\') WHERE id = ?',
        [JSON.stringify(galleryImages), id]
      );

      res.json({
        success: true,
        data: photo
      });

    } catch (error) {
      console.error('Error uploading photo:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload photo'
      });
    }
  });

  /**
   * @route   GET /api/invites/:id/gallery
   * @desc    Get gallery photos
   * @access  Private
   */
  router.get('/:id/gallery', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Verify ownership
      const invite = await db.get(
        'SELECT * FROM digital_invites WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Parse gallery images
      const galleryImages = JSON.parse(invite.gallery_images || '[]');

      // Sort by order
      galleryImages.sort((a, b) => a.order - b.order);

      res.json({
        success: true,
        data: galleryImages
      });

    } catch (error) {
      console.error('Error fetching gallery:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch gallery'
      });
    }
  });

  /**
   * @route   PUT /api/invites/:id/gallery/:photoId
   * @desc    Update photo details
   * @access  Private
   */
  router.put('/:id/gallery/:photoId', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id, photoId } = req.params;
      const { caption, isCover } = req.body;

      // Verify ownership
      const invite = await db.get(
        'SELECT * FROM digital_invites WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Get gallery
      const galleryImages = JSON.parse(invite.gallery_images || '[]');
      const photoIndex = galleryImages.findIndex(p => p.id === photoId);

      if (photoIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Photo not found'
        });
      }

      // Update photo
      if (caption !== undefined) {
        galleryImages[photoIndex].caption = caption;
      }

      if (isCover !== undefined) {
        // Remove cover from all photos
        galleryImages.forEach(p => p.isCover = false);
        // Set new cover
        galleryImages[photoIndex].isCover = isCover;
      }

      galleryImages[photoIndex].updatedAt = new Date().toISOString();

      // Update invite
      await db.run(
        'UPDATE digital_invites SET gallery_images = ?, updated_at = datetime(\'now\') WHERE id = ?',
        [JSON.stringify(galleryImages), id]
      );

      res.json({
        success: true,
        data: galleryImages[photoIndex]
      });

    } catch (error) {
      console.error('Error updating photo:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update photo'
      });
    }
  });

  /**
   * @route   DELETE /api/invites/:id/gallery/:photoId
   * @desc    Delete photo from gallery
   * @access  Private
   */
  router.delete('/:id/gallery/:photoId', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id, photoId } = req.params;

      // Verify ownership
      const invite = await db.get(
        'SELECT * FROM digital_invites WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Get gallery
      const galleryImages = JSON.parse(invite.gallery_images || '[]');
      const photoIndex = galleryImages.findIndex(p => p.id === photoId);

      if (photoIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Photo not found'
        });
      }

      const photo = galleryImages[photoIndex];

      // Delete file from disk
      try {
        const filePath = path.join(process.cwd(), 'uploads', 'gallery', photo.filename);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue even if file deletion fails
      }

      // Remove from gallery
      galleryImages.splice(photoIndex, 1);

      // If cover was deleted, set first photo as new cover
      if (photo.isCover && galleryImages.length > 0) {
        galleryImages[0].isCover = true;
      }

      // Update invite
      await db.run(
        'UPDATE digital_invites SET gallery_images = ?, updated_at = datetime(\'now\') WHERE id = ?',
        [JSON.stringify(galleryImages), id]
      );

      res.json({
        success: true,
        message: 'Photo deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting photo:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete photo'
      });
    }
  });

  /**
   * @route   PUT /api/invites/:id/gallery/reorder
   * @desc    Reorder gallery photos
   * @access  Private
   */
  router.put('/:id/gallery/reorder', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { photoIds } = req.body;

      // Verify ownership
      const invite = await db.get(
        'SELECT * FROM digital_invites WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      if (!Array.isArray(photoIds)) {
        return res.status(400).json({
          success: false,
          error: 'photoIds must be an array'
        });
      }

      // Get gallery
      const galleryImages = JSON.parse(invite.gallery_images || '[]');

      // Create a map for quick lookup
      const photoMap = new Map(galleryImages.map(p => [p.id, p]));

      // Reorder based on provided order
      const reorderedImages = [];
      for (let i = 0; i < photoIds.length; i++) {
        const photo = photoMap.get(photoIds[i]);
        if (photo) {
          photo.order = i;
          reorderedImages.push(photo);
          photoMap.delete(photoIds[i]);
        }
      }

      // Add any remaining photos (shouldn't happen, but safety check)
      for (const [id, photo] of photoMap) {
        reorderedImages.push(photo);
      }

      // Update invite
      await db.run(
        'UPDATE digital_invites SET gallery_images = ?, updated_at = datetime(\'now\') WHERE id = ?',
        [JSON.stringify(reorderedImages), id]
      );

      res.json({
        success: true,
        data: reorderedImages
      });

    } catch (error) {
      console.error('Error reordering gallery:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reorder gallery'
      });
    }
  });

  /**
   * @route   POST /api/invites/:id/gallery/batch
   * @desc    Upload multiple photos at once
   * @access  Private
   */
  router.post('/:id/gallery/batch', authenticateToken, upload.array('photos', 20), async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Verify ownership
      const invite = await db.get(
        'SELECT * FROM digital_invites WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No photos uploaded'
        });
      }

      // Get current gallery
      const galleryImages = JSON.parse(invite.gallery_images || '[]');

      // Create photo entries for each uploaded file
      const uploadedPhotos = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const photo = {
          id: uuidv4(),
          url: `/uploads/gallery/${file.filename}`,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
          caption: '',
          isCover: galleryImages.length === 0 && i === 0, // First photo is cover
          order: galleryImages.length + i,
          uploadedAt: new Date().toISOString()
        };
        uploadedPhotos.push(photo);
        galleryImages.push(photo);
      }

      // Update invite
      await db.run(
        'UPDATE digital_invites SET gallery_images = ?, updated_at = datetime(\'now\') WHERE id = ?',
        [JSON.stringify(galleryImages), id]
      );

      res.json({
        success: true,
        data: uploadedPhotos
      });

    } catch (error) {
      console.error('Error uploading batch photos:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload photos'
      });
    }
  });

  return router;
};

module.exports = createInviteGalleryRoutes;
