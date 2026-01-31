const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { apiLimiter, strictAuthLimiter } = require('../middleware/rateLimit');
const { hashIP, logSecurityEvent, SECURITY_EVENT_TYPES } = require('../middleware/securityLogger');

function createSecurityRoutes(db) {
  const router = express.Router();

  // All routes require authentication
  router.use(authenticateToken);

  // ========================================
  // SECURITY ACTIVITY LOG ENDPOINTS
  // ========================================

  /**
   * GET /api/security/activity
   * Get user's security activity log with pagination and filtering
   */
  router.get('/activity', apiLimiter, (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      const offset = parseInt(req.query.offset) || 0;
      const eventType = req.query.eventType || null;

      // Build query
      let query = `
        SELECT event_type, event_description, ip_hash, device_info,
               success, created_at
        FROM security_activity_log
        WHERE user_id = ?
      `;
      const params = [req.user.id];

      if (eventType) {
        query += ` AND event_type = ?`;
        params.push(eventType);
      }

      query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const activities = db.prepare(query).all(...params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as count FROM security_activity_log WHERE user_id = ?';
      const countParams = [req.user.id];

      if (eventType) {
        countQuery += ` AND event_type = ?`;
        countParams.push(eventType);
      }

      const { count: total } = db.prepare(countQuery).get(...countParams);

      res.json({
        activities,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      });
    } catch (error) {
      console.error('Get security activity error:', error);
      res.status(500).json({ message: 'Failed to fetch security activity log' });
    }
  });

  /**
   * POST /api/security/activity
   * Log a security event (internal use)
   */
  router.post('/activity', apiLimiter, (req, res) => {
    try {
      const { eventType, eventDescription, ipHash, deviceInfo, success, metadata } = req.body;

      if (!eventType || !eventDescription) {
        return res.status(400).json({ message: 'Event type and description required' });
      }

      db.prepare(
        `INSERT INTO security_activity_log
         (user_id, event_type, event_description, ip_hash, device_info, success, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        req.user.id,
        eventType,
        eventDescription,
        ipHash || hashIP(req.ip),
        deviceInfo || req.headers['user-agent'],
        success ? 1 : 0,
        metadata ? JSON.stringify(metadata) : null
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Log security activity error:', error);
      res.status(500).json({ message: 'Failed to log security activity' });
    }
  });

  // ========================================
  // PRIVACY SETTINGS ENDPOINTS
  // ========================================

  /**
   * GET /api/security/privacy-settings
   * Get user's privacy preferences
   */
  router.get('/privacy-settings', apiLimiter, (req, res) => {
    try {
      let settings = db.prepare(
        'SELECT * FROM user_privacy_settings WHERE user_id = ?'
      ).get(req.user.id);

      // Create default settings if not exists
      if (!settings) {
        db.prepare(
          `INSERT INTO user_privacy_settings (user_id) VALUES (?)`
        ).run(req.user.id);

        settings = db.prepare(
          'SELECT * FROM user_privacy_settings WHERE user_id = ?'
        ).get(req.user.id);
      }

      // Convert integer booleans to actual booleans for response
      const response = {
        analyticsEnabled: settings.analytics_enabled === 1,
        profileIndexing: settings.profile_indexing === 1,
        showOnlineStatus: settings.show_online_status === 1,
        loginAlerts: settings.login_alerts === 1,
        marketingEmails: settings.marketing_emails === 1,
        dataRetentionDays: settings.data_retention_days,
      };

      res.json(response);
    } catch (error) {
      console.error('Get privacy settings error:', error);
      res.status(500).json({ message: 'Failed to fetch privacy settings' });
    }
  });

  /**
   * PUT /api/security/privacy-settings
   * Update privacy preferences
   */
  router.put('/privacy-settings', apiLimiter, (req, res) => {
    try {
      const {
        analyticsEnabled,
        profileIndexing,
        showOnlineStatus,
        loginAlerts,
        marketingEmails,
        dataRetentionDays,
      } = req.body;

      db.prepare(
        `UPDATE user_privacy_settings
         SET analytics_enabled = ?,
             profile_indexing = ?,
             show_online_status = ?,
             login_alerts = ?,
             marketing_emails = ?,
             data_retention_days = ?,
             updated_at = datetime('now')
         WHERE user_id = ?`
      ).run(
        analyticsEnabled ? 1 : 0,
        profileIndexing ? 1 : 0,
        showOnlineStatus ? 1 : 0,
        loginAlerts ? 1 : 0,
        marketingEmails ? 1 : 0,
        dataRetentionDays || 365,
        req.user.id
      );

      // Log the privacy settings change
      db.prepare(
        `INSERT INTO security_activity_log
         (user_id, event_type, event_description, ip_hash, device_info, success)
         VALUES (?, ?, ?, ?, ?, 1)`
      ).run(
        req.user.id,
        'privacy_settings_changed',
        'Privacy settings updated',
        hashIP(req.ip),
        req.headers['user-agent']
      );

      res.json({ success: true, message: 'Privacy settings updated' });
    } catch (error) {
      console.error('Update privacy settings error:', error);
      res.status(500).json({ message: 'Failed to update privacy settings' });
    }
  });

  // ========================================
  // DATA EXPORT ENDPOINTS (GDPR COMPLIANCE)
  // ========================================

  /**
   * POST /api/security/export-data
   * Request data export (creates async job)
   */
  router.post('/export-data', strictAuthLimiter, (req, res) => {
    try {
      const { format } = req.body;

      if (!format || !['json', 'csv'].includes(format)) {
        return res.status(400).json({ message: 'Invalid format. Use json or csv' });
      }

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

      const result = db.prepare(
        `INSERT INTO data_export_requests
         (user_id, status, file_format, expires_at)
         VALUES (?, ?, ?, ?)`
      ).run(req.user.id, 'pending', format, expiresAt);

      // Log the request
      db.prepare(
        `INSERT INTO security_activity_log
         (user_id, event_type, event_description, ip_hash, device_info, success)
         VALUES (?, ?, ?, ?, ?, 1)`
      ).run(
        req.user.id,
        'data_export_requested',
        `Data export requested in ${format} format`,
        hashIP(req.ip),
        req.headers['user-agent']
      );

      // TODO: In production, trigger background job to generate export
      // For now, just return request ID with pending status

      res.json({
        requestId: result.lastInsertRowid,
        status: 'pending',
        format,
        expiresAt,
        message: 'Data export request created. You will receive a download link when ready.',
      });
    } catch (error) {
      console.error('Data export request error:', error);
      res.status(500).json({ message: 'Failed to create export request' });
    }
  });

  /**
   * GET /api/security/export-requests
   * List user's export requests
   */
  router.get('/export-requests', apiLimiter, (req, res) => {
    try {
      const requests = db.prepare(
        `SELECT id, status, file_format, expires_at, created_at
         FROM data_export_requests
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 20`
      ).all(req.user.id);

      res.json({ requests });
    } catch (error) {
      console.error('Get export requests error:', error);
      res.status(500).json({ message: 'Failed to fetch export requests' });
    }
  });

  /**
   * GET /api/security/export-requests/:id/download
   * Download exported data (if ready)
   */
  router.get('/export-requests/:id/download', apiLimiter, (req, res) => {
    try {
      const exportId = parseInt(req.params.id);

      const request = db.prepare(
        `SELECT * FROM data_export_requests
         WHERE id = ? AND user_id = ?`
      ).get(exportId, req.user.id);

      if (!request) {
        return res.status(404).json({ message: 'Export request not found' });
      }

      if (request.status !== 'completed') {
        return res.status(400).json({
          status: request.status,
          message: `Export is still ${request.status}. Please check back later.`,
        });
      }

      // Check if file still exists and hasn't expired
      if (!request.file_path || new Date(request.expires_at) < new Date()) {
        return res.status(410).json({ message: 'Export file has expired or no longer available' });
      }

      // TODO: In production, serve the file from file_path
      // For now, return error (real implementation would send file)

      res.status(501).json({ message: 'Download not yet implemented' });
    } catch (error) {
      console.error('Download export error:', error);
      res.status(500).json({ message: 'Failed to download export' });
    }
  });

  /**
   * GET /api/security/status
   * Get overall security status for current user
   */
  router.get('/status', apiLimiter, (req, res) => {
    try {
      // Get user info
      const user = db.prepare(
        'SELECT password_changed_at FROM users WHERE id = ?'
      ).get(req.user.id);

      // Get active sessions count
      const { sessionCount } = db.prepare(
        `SELECT COUNT(*) as sessionCount FROM refresh_tokens
         WHERE user_id = ? AND revoked = 0 AND expires_at > datetime('now')`
      ).get(req.user.id);

      // Get recent security events
      const recentEvents = db.prepare(
        `SELECT event_type, event_description, success, created_at
         FROM security_activity_log
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 5`
      ).all(req.user.id);

      const status = {
        passwordChangedAt: user?.password_changed_at || null,
        activeSessions: sessionCount,
        recentEvents,
        twoFactorEnabled: false, // TODO: Check when 2FA is implemented
      };

      res.json(status);
    } catch (error) {
      console.error('Get security status error:', error);
      res.status(500).json({ message: 'Failed to fetch security status' });
    }
  });

  return router;
}

module.exports = createSecurityRoutes;
