/**
 * Block Types API Routes
 * Handles CONTACT_FORM, FILE_DOWNLOAD, and MAP_LOCATION block types
 * Phase 3: New block types for modern vCard suite
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const db = require('../config/database');
const contactFormService = require('../services/contactFormService');
const fileUploadService = require('../services/fileUploadService');
const mapLocationService = require('../services/mapLocationService');
const crypto = require('crypto');

// Configure multer for file uploads (in-memory for flexibility)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = fileUploadService.ALLOWED_MIME_TYPES;
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

// Helper: Get client IP and hash
function getClientIPHash(req) {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  return contactFormService.hashIP(ip);
}

// ========================================
// CONTACT FORM ENDPOINTS
// ========================================

/**
 * POST /api/profiles/:username/links/:linkId/contact-form/submit
 * Public endpoint for form submissions (no auth required)
 * Rate limited to 5 per hour per IP
 */
router.post('/:username/links/:linkId/contact-form/submit', optionalAuth, async (req, res) => {
  try {
    await db.ready;

    const { username, linkId } = req.params;
    const { name, email, phone, subject, message } = req.body;

    // Get profile by username
    const profile = db
      .prepare('SELECT p.* FROM profiles p WHERE p.username = ?')
      .get(username);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get link item
    const link = db
      .prepare('SELECT * FROM link_items WHERE id = ? AND profile_id = ? AND type = ?')
      .get(linkId, profile.id, 'CONTACT_FORM');

    if (!link) {
      return res.status(404).json({ error: 'Contact form not found' });
    }

    // Check rate limit
    const ipHash = getClientIPHash(req);
    const rateLimit = contactFormService.checkRateLimit(ipHash, linkId);

    if (rateLimit.isRateLimited) {
      return res.status(429).json({
        error: 'Too many form submissions',
        message: `Maximum 5 submissions per hour. Please try again later.`,
        remainingAttempts: 0,
        retryAfter: 3600
      });
    }

    // Parse form config from metadata
    const formConfig = link.metadata ? JSON.parse(link.metadata) : {};

    // Sanitize input
    const sanitizedData = {
      name: name ? contactFormService.sanitizeInput(name) : null,
      email: contactFormService.sanitizeInput(email),
      phone: phone ? contactFormService.sanitizeInput(phone) : null,
      subject: subject ? contactFormService.sanitizeInput(subject) : null,
      message: contactFormService.sanitizeInput(message)
    };

    // Validate fields
    const validationErrors = contactFormService.validateFormFields(formConfig, sanitizedData);

    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    // Store submission
    const submission = contactFormService.storeSubmission(linkId, profile.id, sanitizedData, ipHash, req.headers['user-agent']);

    // Send email notification asynchronously
    setImmediate(() => {
      contactFormService.sendFormSubmissionEmail(profile, sanitizedData, link.title).catch(error => {
        console.error('Failed to send form submission email:', error);
      });
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your submission',
      submissionId: submission.id,
      confirmationEmail: sanitizedData.email
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

/**
 * GET /api/profiles/me/links/:linkId/submissions
 * Get contact form submissions for authenticated user
 * Supports pagination and filtering
 */
router.get('/me/links/:linkId/submissions', authenticateToken, async (req, res) => {
  try {
    await db.ready;

    const { linkId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    // Get user's profile
    const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Verify link exists and belongs to user
    const link = db
      .prepare('SELECT * FROM link_items WHERE id = ? AND profile_id = ? AND type = ?')
      .get(linkId, profile.id, 'CONTACT_FORM');

    if (!link) {
      return res.status(404).json({ error: 'Contact form not found' });
    }

    // Get submissions
    const result = contactFormService.getSubmissions(linkId, profile.id, { page, limit, unreadOnly });

    // Get analytics
    const analytics = contactFormService.getSubmissionAnalytics(linkId, profile.id);

    res.json({
      submissions: result.submissions,
      pagination: result.pagination,
      analytics
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

/**
 * PATCH /api/profiles/me/submissions/:submissionId
 * Mark submission as read or update status
 */
router.patch('/me/submissions/:submissionId', authenticateToken, async (req, res) => {
  try {
    await db.ready;

    const { submissionId } = req.params;
    const { read } = req.body;

    // Get user's profile
    const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Verify submission belongs to user's profile
    const submission = db
      .prepare('SELECT * FROM contact_form_submissions WHERE id = ? AND profile_id = ?')
      .get(submissionId, profile.id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (read === true) {
      contactFormService.markAsRead(submissionId, profile.id);
    }

    // Fetch updated submission
    const updated = db
      .prepare('SELECT * FROM contact_form_submissions WHERE id = ?')
      .get(submissionId);

    res.json(updated);
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ error: 'Failed to update submission' });
  }
});

/**
 * DELETE /api/profiles/me/submissions/:submissionId
 * Delete form submission
 */
router.delete('/me/submissions/:submissionId', authenticateToken, async (req, res) => {
  try {
    await db.ready;

    const { submissionId } = req.params;

    // Get user's profile
    const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    contactFormService.deleteSubmission(submissionId, profile.id);

    res.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

// ========================================
// FILE DOWNLOAD ENDPOINTS
// ========================================

/**
 * POST /api/profiles/me/links/:linkId/files/upload
 * Upload file to link (authenticated)
 */
router.post('/me/links/:linkId/files/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    await db.ready;

    const { linkId } = req.params;
    const { password } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Get user's profile
    const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Verify link exists and belongs to user
    const link = db
      .prepare('SELECT * FROM link_items WHERE id = ? AND profile_id = ? AND type = ?')
      .get(linkId, profile.id, 'FILE_DOWNLOAD');

    if (!link) {
      return res.status(404).json({ error: 'File download link not found' });
    }

    // Upload file
    const uploadedFile = await fileUploadService.uploadFile(req.file, linkId, profile.id, password || null);

    res.status(201).json(uploadedFile);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(400).json({ error: error.message || 'Failed to upload file' });
  }
});

/**
 * GET /api/profiles/:username/links/:linkId/files
 * Get files for download link (public)
 */
router.get('/:username/links/:linkId/files', optionalAuth, async (req, res) => {
  try {
    await db.ready;

    const { username, linkId } = req.params;

    // Get profile by username
    const profile = db
      .prepare('SELECT p.* FROM profiles p WHERE p.username = ?')
      .get(username);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get link
    const link = db
      .prepare('SELECT * FROM link_items WHERE id = ? AND profile_id = ? AND type = ?')
      .get(linkId, profile.id, 'FILE_DOWNLOAD');

    if (!link) {
      return res.status(404).json({ error: 'File download link not found' });
    }

    // Get files
    const files = db
      .prepare(
        `
      SELECT id, file_name, file_size, mime_type, download_count, created_at, password_hash
      FROM file_uploads
      WHERE link_id = ? AND profile_id = ?
      ORDER BY created_at DESC
    `
      )
      .all(linkId, profile.id);

    // Hide password_hash in response, only indicate if protected
    const filesResponse = files.map(f => ({
      id: f.id,
      fileName: f.file_name,
      fileSize: f.file_size,
      mimeType: f.mime_type,
      downloadCount: f.download_count,
      createdAt: f.created_at,
      isPasswordProtected: !!f.password_hash
    }));

    res.json(filesResponse);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

/**
 * GET /api/profiles/:username/links/:linkId/files/:fileId/download
 * Download file (with optional password verification)
 */
router.get('/:username/links/:linkId/files/:fileId/download', optionalAuth, async (req, res) => {
  try {
    await db.ready;

    const { username, linkId, fileId } = req.params;
    const { password } = req.query;

    // Get profile
    const profile = db
      .prepare('SELECT id FROM profiles WHERE username = ?')
      .get(username);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get file
    const file = fileUploadService.getFileForDownload(fileId, profile.id);

    // Check password if required
    if (file.password_hash) {
      if (!password) {
        return res.status(403).json({ error: 'Password required' });
      }

      const passwordValid = await fileUploadService.verifyFilePassword(fileId, password);

      if (!passwordValid) {
        return res.status(403).json({ error: 'Invalid password' });
      }
    }

    // Track download
    const ipHash = getClientIPHash(req);
    fileUploadService.trackDownload(linkId, profile.id, ipHash, req.headers['user-agent']);

    // Return file URL or redirect
    res.json({
      success: true,
      fileUrl: file.file_url,
      fileName: file.file_name
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: error.message || 'Failed to download file' });
  }
});

/**
 * DELETE /api/profiles/me/files/:fileId
 * Delete uploaded file
 */
router.delete('/me/files/:fileId', authenticateToken, async (req, res) => {
  try {
    await db.ready;

    const { fileId } = req.params;

    // Get user's profile
    const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    fileUploadService.deleteFile(fileId, profile.id);

    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: error.message || 'Failed to delete file' });
  }
});

/**
 * GET /api/profiles/me/links/:linkId/files/analytics
 * Get file analytics for link
 */
router.get('/me/links/:linkId/files/analytics', authenticateToken, async (req, res) => {
  try {
    await db.ready;

    const { linkId } = req.params;

    // Get user's profile
    const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Verify link belongs to user
    const link = db
      .prepare('SELECT * FROM link_items WHERE id = ? AND profile_id = ?')
      .get(linkId, profile.id);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const analytics = fileUploadService.getFileAnalytics(linkId, profile.id);

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching file analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ========================================
// MAP LOCATION ENDPOINTS
// ========================================

/**
 * POST /api/profiles/me/links/:linkId/map/address
 * Update map location address (authenticated)
 */
router.post('/me/links/:linkId/map/address', authenticateToken, async (req, res) => {
  try {
    await db.ready;

    const { linkId } = req.params;
    const { address } = req.body;

    if (!address || address.trim().length === 0) {
      return res.status(400).json({ error: 'Address is required' });
    }

    // Get user's profile
    const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Verify link exists
    const link = db
      .prepare('SELECT * FROM link_items WHERE id = ? AND profile_id = ? AND type = ?')
      .get(linkId, profile.id, 'MAP_LOCATION');

    if (!link) {
      return res.status(404).json({ error: 'Map location link not found' });
    }

    // Validate address
    const validation = await mapLocationService.validateAddress(address);

    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Update map metadata
    const mapData = mapLocationService.updateMapLocationMetadata(
      linkId,
      validation.formattedAddress,
      validation.lat,
      validation.lng,
      15
    );

    res.json(mapData);
  } catch (error) {
    console.error('Error updating map address:', error);
    res.status(500).json({ error: error.message || 'Failed to update address' });
  }
});

/**
 * GET /api/profiles/:username/links/:linkId/map
 * Get map location details (public)
 */
router.get('/:username/links/:linkId/map', optionalAuth, async (req, res) => {
  try {
    await db.ready;

    const { username, linkId } = req.params;

    // Get profile
    const profile = db
      .prepare('SELECT id FROM profiles WHERE username = ?')
      .get(username);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get link
    const link = db
      .prepare('SELECT * FROM link_items WHERE id = ? AND profile_id = ? AND type = ?')
      .get(linkId, profile.id, 'MAP_LOCATION');

    if (!link) {
      return res.status(404).json({ error: 'Map location not found' });
    }

    // Parse metadata
    const metadata = link.metadata ? JSON.parse(link.metadata) : {};
    const mapLocation = metadata.mapLocation || {};

    // Track view
    mapLocationService.trackMapView(linkId, profile.id, req.ip, req.headers['user-agent']);

    // Build response
    const response = {
      title: link.title,
      address: mapLocation.address,
      lat: mapLocation.lat,
      lng: mapLocation.lng,
      zoom: mapLocation.zoom || 15
    };

    // Add embed code if coordinates available
    if (mapLocation.lat && mapLocation.lng) {
      response.embedHTML = mapLocationService.getEmbeddedMapHTML(
        mapLocation.lat,
        mapLocation.lng,
        mapLocation.address,
        mapLocation.zoom || 15
      );
      response.directionsURL = mapLocationService.getDirectionsURL(
        mapLocation.lat,
        mapLocation.lng,
        mapLocation.address
      );
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching map location:', error);
    res.status(500).json({ error: 'Failed to fetch map location' });
  }
});

/**
 * GET /api/profiles/me/links/:linkId/map/analytics
 * Get map location analytics
 */
router.get('/me/links/:linkId/map/analytics', authenticateToken, async (req, res) => {
  try {
    await db.ready;

    const { linkId } = req.params;

    // Get user's profile
    const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Verify link belongs to user
    const link = db
      .prepare('SELECT * FROM link_items WHERE id = ? AND profile_id = ?')
      .get(linkId, profile.id);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const analytics = mapLocationService.getMapAnalytics(linkId, profile.id);

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching map analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
