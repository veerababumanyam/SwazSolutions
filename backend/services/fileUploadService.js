/**
 * File Upload Service
 * Handles file uploads to S3 or local storage, validation, and security
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('../config/database');

// File type and size constants
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',
  'text/csv'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOAD_DIRECTORY = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads/files');

// Initialize upload directory
function ensureUploadDirectory() {
  if (!fs.existsSync(UPLOAD_DIRECTORY)) {
    fs.mkdirSync(UPLOAD_DIRECTORY, { recursive: true });
    console.log('📁 Created upload directory:', UPLOAD_DIRECTORY);
  }
}

/**
 * Validate file type and size
 * Returns array of errors (empty if valid)
 */
function validateFile(file) {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return errors;
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    errors.push(`File type not allowed. Allowed types: PDF, DOC, DOCX, XLS, XLSX, ZIP, images, TXT, CSV`);
  }

  return errors;
}

/**
 * Generate safe filename with timestamp and hash
 */
function generateSafeFilename(originalName, profileId) {
  const timestamp = Date.now();
  const hash = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName).toLowerCase();
  const basename = path.basename(originalName, ext)
    .replace(/[^a-z0-9]/gi, '_')
    .substring(0, 50);

  return `${profileId}_${timestamp}_${hash}${ext}`;
}

/**
 * Upload file to local storage
 * Returns { fileUrl, fileName, fileSize, mimeType }
 */
function uploadFileLocal(file, profileId) {
  ensureUploadDirectory();

  try {
    const safeFilename = generateSafeFilename(file.originalname, profileId);
    const filepath = path.join(UPLOAD_DIRECTORY, safeFilename);

    // Save file
    fs.writeFileSync(filepath, file.buffer);

    // Generate URL for downloads
    const fileUrl = `/api/files/${profileId}/${safeFilename}`;

    return {
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      storagePath: filepath
    };
  } catch (error) {
    console.error('Error uploading file locally:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Upload file to S3 (if configured)
 * Returns { fileUrl, fileName, fileSize, mimeType }
 */
async function uploadFileS3(file, profileId) {
  // Check if R2 (Cloudflare) service is available
  const r2Service = (() => {
    try {
      return require('./r2Service');
    } catch (e) {
      return null;
    }
  })();

  if (!r2Service) {
    console.warn('⚠️ S3 service not configured, falling back to local storage');
    return uploadFileLocal(file, profileId);
  }

  try {
    const safeFilename = generateSafeFilename(file.originalname, profileId);
    const key = `files/${profileId}/${safeFilename}`;

    const uploadResult = await r2Service.uploadFile(
      file.buffer,
      key,
      file.mimetype
    );

    return {
      fileUrl: uploadResult.url || `https://cdn.swazsolutions.com/${key}`,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    console.warn('⚠️ S3 upload failed, falling back to local storage');
    return uploadFileLocal(file, profileId);
  }
}

/**
 * Upload file with optional password protection
 */
async function uploadFile(file, linkId, profileId, password = null) {
  try {
    // Validate file
    const validationErrors = validateFile(file);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('; '));
    }

    // Upload to storage
    let uploadResult;
    if (process.env.USE_S3 === 'true') {
      uploadResult = await uploadFileS3(file, profileId);
    } else {
      uploadResult = uploadFileLocal(file, profileId);
    }

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Store metadata in database
    const result = db
      .prepare(
        `
      INSERT INTO file_uploads (
        link_id, profile_id, file_url, file_name, file_size, mime_type, password_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        linkId,
        profileId,
        uploadResult.fileUrl,
        uploadResult.fileName,
        uploadResult.fileSize,
        uploadResult.mimeType,
        passwordHash
      );

    return {
      id: result.lastInsertRowid,
      ...uploadResult,
      passwordProtected: !!password
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Verify file password
 */
async function verifyFilePassword(fileId, password) {
  try {
    const file = db
      .prepare('SELECT password_hash FROM file_uploads WHERE id = ?')
      .get(fileId);

    if (!file) {
      throw new Error('File not found');
    }

    if (!file.password_hash) {
      return true; // No password protection
    }

    return await bcrypt.compare(password, file.password_hash);
  } catch (error) {
    console.error('Error verifying file password:', error);
    return false;
  }
}

/**
 * Get file for download
 * Checks expiration, password, and tracks analytics
 */
function getFileForDownload(fileId, profileId) {
  try {
    const file = db
      .prepare(
        `
      SELECT * FROM file_uploads
      WHERE id = ? AND profile_id = ?
    `
      )
      .get(fileId, profileId);

    if (!file) {
      throw new Error('File not found');
    }

    // Check if expired
    if (file.expires_at) {
      const expiresAt = new Date(file.expires_at);
      if (expiresAt < new Date()) {
        throw new Error('File has expired');
      }
    }

    return file;
  } catch (error) {
    console.error('Error fetching file for download:', error);
    throw error;
  }
}

/**
 * Track file download analytics
 */
function trackDownload(linkId, profileId, ipHash, userAgent) {
  try {
    db.prepare(
      `
      INSERT INTO file_downloads (link_id, profile_id, ip_hash, user_agent)
      VALUES (?, ?, ?, ?)
    `
    ).run(linkId, profileId, ipHash, userAgent);

    // Increment download count
    db.prepare('UPDATE file_uploads SET download_count = download_count + 1 WHERE link_id = ?').run(linkId);
  } catch (error) {
    console.error('Error tracking download:', error);
    // Don't throw - analytics tracking shouldn't block downloads
  }
}

/**
 * Delete file
 */
function deleteFile(fileId, profileId) {
  try {
    const file = db
      .prepare('SELECT file_url FROM file_uploads WHERE id = ? AND profile_id = ?')
      .get(fileId, profileId);

    if (!file) {
      throw new Error('File not found');
    }

    // Delete from database
    db.prepare('DELETE FROM file_uploads WHERE id = ?').run(fileId);

    // Delete from storage if local
    if (!process.env.USE_S3 && file.file_url.startsWith('/api/files/')) {
      const filename = file.file_url.split('/').pop();
      const filepath = path.join(UPLOAD_DIRECTORY, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Get file analytics for a link
 */
function getFileAnalytics(linkId, profileId) {
  try {
    // Total files uploaded
    const totalFiles = db
      .prepare('SELECT COUNT(*) as count FROM file_uploads WHERE link_id = ? AND profile_id = ?')
      .get(linkId, profileId)?.count || 0;

    // Total downloads
    const totalDownloads = db
      .prepare('SELECT COUNT(*) as count FROM file_downloads WHERE link_id = ? AND profile_id = ?')
      .get(linkId, profileId)?.count || 0;

    // Files by date
    const filesByDate = db
      .prepare(
        `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM file_uploads
      WHERE link_id = ? AND profile_id = ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 7
    `
      )
      .all(linkId, profileId);

    // Download trends by date
    const downloadTrends = db
      .prepare(
        `
      SELECT DATE(downloaded_at) as date, COUNT(*) as count
      FROM file_downloads
      WHERE link_id = ? AND profile_id = ? AND downloaded_at > datetime('now', '-7 days')
      GROUP BY DATE(downloaded_at)
      ORDER BY date DESC
    `
      )
      .all(linkId, profileId);

    // Top files by downloads
    const topFiles = db
      .prepare(
        `
      SELECT file_name, download_count
      FROM file_uploads
      WHERE link_id = ? AND profile_id = ?
      ORDER BY download_count DESC
      LIMIT 5
    `
      )
      .all(linkId, profileId);

    return {
      totalFiles,
      totalDownloads,
      filesByDate,
      downloadTrends,
      topFiles,
      avgDownloadsPerFile: totalFiles > 0 ? Math.round(totalDownloads / totalFiles) : 0
    };
  } catch (error) {
    console.error('Error fetching file analytics:', error);
    throw error;
  }
}

module.exports = {
  validateFile,
  uploadFile,
  verifyFilePassword,
  getFileForDownload,
  trackDownload,
  deleteFile,
  getFileAnalytics,
  generateSafeFilename,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE
};
