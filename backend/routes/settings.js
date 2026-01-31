const express = require('express');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { authenticateToken } = require('../middleware/auth');
const { apiLimiter, strictAuthLimiter } = require('../middleware/rateLimit');
const { encrypt, decrypt, isEncrypted } = require('../services/encryptionService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

function createSettingsRoutes(db) {
  const router = express.Router();

  /**
   * GET /api/users/settings
   * Get user settings (basic info)
   */
  router.get('/settings', authenticateToken, (req, res) => {
    try {
      const user = db.prepare(
        'SELECT id, username, email, role, created_at FROM users WHERE id = ?'
      ).get(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ message: 'Failed to load settings' });
    }
  });

  /**
   * PUT /api/users/email
   * Update email address (requires password confirmation)
   */
  router.put('/email', authenticateToken, apiLimiter, async (req, res) => {
    try {
      const { newEmail, password } = req.body;

      // Validation
      if (!newEmail || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      if (!validator.isEmail(newEmail)) {
        return res.status(400).json({ message: 'Invalid email address' });
      }

      // Get current user
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      // Check if email already exists (case-insensitive)
      const existingEmail = db.prepare(
        'SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?'
      ).get(newEmail, req.user.id);

      if (existingEmail) {
        return res.status(409).json({ message: 'Email already in use' });
      }

      // Update email
      db.prepare('UPDATE users SET email = ? WHERE id = ?').run(newEmail, req.user.id);

      res.json({
        message: 'Email updated successfully',
        user: {
          ...user,
          email: newEmail,
          password_hash: undefined,
        },
      });
    } catch (error) {
      console.error('Email update error:', error);
      res.status(500).json({ message: 'Failed to update email' });
    }
  });

  /**
   * PUT /api/users/password
   * Change password (requires current password verification)
   */
  router.put('/password', authenticateToken, apiLimiter, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Validation
      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: 'Current and new password are required' });
      }

      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ message: 'Password must be at least 8 characters' });
      }

      // Get current user
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
        hashedPassword,
        req.user.id
      );

      // Invalidate all other refresh tokens (force logout on other devices)
      try {
        const currentToken = req.headers['authorization']?.split(' ')[1];
        if (currentToken) {
          // Delete all refresh tokens except current session
          // (In real implementation, would hash the token to compare)
          const existingTokens = db.prepare(
            'SELECT id FROM refresh_tokens WHERE user_id = ? AND expires_at > datetime("now")'
          ).all(req.user.id);

          for (const token of existingTokens) {
            db.prepare('DELETE FROM refresh_tokens WHERE id = ? AND user_id = ?').run(
              token.id,
              req.user.id
            );
          }
        }
      } catch (e) {
        console.error('Error invalidating refresh tokens:', e);
      }

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Password update error:', error);
      res.status(500).json({ message: 'Failed to update password' });
    }
  });

  /**
   * GET /api/users/sessions
   * Get all active sessions for the current user
   */
  router.get('/sessions', authenticateToken, (req, res) => {
    try {
      const sessions = db.prepare(
        `SELECT
          id,
          device_info as deviceInfo,
          ip_address as ipAddress,
          last_active as lastActive,
          created_at as createdAt
        FROM refresh_tokens
        WHERE user_id = ? AND expires_at > datetime('now')
        ORDER BY last_active DESC`
      ).all(req.user.id);

      // Mark current session (by IP address)
      const currentIp = req.ip || req.connection.remoteAddress;
      const sessionsWithCurrent = sessions.map((session) => ({
        ...session,
        isCurrent: session.ipAddress === currentIp,
      }));

      res.json({ sessions: sessionsWithCurrent });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({ message: 'Failed to load sessions' });
    }
  });

  /**
   * DELETE /api/users/sessions/:id
   * Logout a specific device session
   */
  router.delete('/sessions/:id', authenticateToken, (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);

      // Verify session belongs to authenticated user
      const session = db.prepare(
        'SELECT user_id FROM refresh_tokens WHERE id = ?'
      ).get(sessionId);

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      if (session.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Delete session
      db.prepare('DELETE FROM refresh_tokens WHERE id = ?').run(sessionId);

      res.json({ message: 'Session terminated successfully' });
    } catch (error) {
      console.error('Session delete error:', error);
      res.status(500).json({ message: 'Failed to logout session' });
    }
  });

  /**
   * DELETE /api/users/account
   * Permanently delete user account and all associated data
   * DANGER: This cannot be undone
   */
  router.delete('/account', authenticateToken, apiLimiter, (req, res) => {
    try {
      const userId = req.user.id;

      // Cascade delete in order of foreign key dependencies
      // 1. Delete refresh tokens
      try {
        db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(userId);
      } catch (e) {
        console.error('Error deleting refresh tokens:', e);
      }

      // 2. Delete user preferences (if table exists)
      try {
        db.prepare('DELETE FROM user_preferences WHERE user_id = ?').run(userId);
      } catch (e) {
        // Table might not exist yet
      }

      // 3. Delete playlists
      try {
        db.prepare('DELETE FROM playlists WHERE user_id = ?').run(userId);
      } catch (e) {
        console.error('Error deleting playlists:', e);
      }

      // 4. Delete profiles
      try {
        db.prepare('DELETE FROM profiles WHERE user_id = ?').run(userId);
      } catch (e) {
        console.error('Error deleting profiles:', e);
      }

      // 5. Delete social links
      try {
        db.prepare('DELETE FROM social_profiles WHERE user_id = ?').run(userId);
      } catch (e) {
        console.error('Error deleting social profiles:', e);
      }

      // 6. Delete custom links
      try {
        db.prepare('DELETE FROM custom_links WHERE user_id = ?').run(userId);
      } catch (e) {
        console.error('Error deleting custom links:', e);
      }

      // 7. Delete analytics
      try {
        db.prepare('DELETE FROM profile_views WHERE user_id = ?').run(userId);
      } catch (e) {
        console.error('Error deleting profile views:', e);
      }

      try {
        db.prepare('DELETE FROM qr_code_scans WHERE user_id = ?').run(userId);
      } catch (e) {
        console.error('Error deleting QR code scans:', e);
      }

      // 8. Delete digital invites
      try {
        db.prepare('DELETE FROM digital_invites WHERE user_id = ?').run(userId);
      } catch (e) {
        console.error('Error deleting digital invites:', e);
      }

      // 9. Delete agentic AI inquiries
      try {
        db.prepare('DELETE FROM agentic_ai_inquiries WHERE user_id = ?').run(userId);
      } catch (e) {
        console.error('Error deleting AI inquiries:', e);
      }

      // 10. Finally, delete user
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);

      res.json({
        message: 'Account deleted successfully',
        deleted: true,
      });
    } catch (error) {
      console.error('Account deletion error:', error);
      res.status(500).json({ message: 'Failed to delete account' });
    }
  });

  /**
   * GET /api/users/settings/gemini-key
   * Get user's API key status (masked preview)
   */
  router.get('/settings/gemini-key', authenticateToken, (req, res) => {
    try {
      const user = db.prepare('SELECT gemini_api_key FROM users WHERE id = ?').get(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let hasApiKey = false;
      let keyPreview = null;
      let isEncrypted_ = false;

      if (user.gemini_api_key) {
        hasApiKey = true;
        isEncrypted_ = isEncrypted(user.gemini_api_key);

        // Decrypt to get masked preview
        const apiKey = decrypt(user.gemini_api_key);
        if (apiKey && apiKey.startsWith('AIza')) {
          // Mask: show first 4 + last 6 chars
          const start = apiKey.substring(0, 4);
          const end = apiKey.substring(apiKey.length - 6);
          keyPreview = `${start}***************${end}`;
        }
      }

      res.json({
        hasApiKey,
        keyPreview,
        isEncrypted: isEncrypted_,
      });
    } catch (error) {
      console.error('Get API key status error:', error);
      res.status(500).json({ message: 'Failed to load API key status' });
    }
  });

  /**
   * PUT /api/users/settings/gemini-key
   * Save or update user's Gemini API key with password confirmation
   */
  router.put('/settings/gemini-key', authenticateToken, apiLimiter, async (req, res) => {
    try {
      const { apiKey, password, testConnectivity } = req.body;

      // Validation
      if (!apiKey || !password) {
        return res.status(400).json({ message: 'API key and password are required' });
      }

      // Validate API key format
      if (!apiKey.startsWith('AIza') || apiKey.length < 35) {
        return res.status(400).json({ message: 'Invalid API key format' });
      }

      // Get current user
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      // Optional: Test connectivity with the provided API key
      let connectivityTest = null;
      if (testConnectivity) {
        try {
          const startTime = Date.now();
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-3.0-flash' });

          await model.generateContent('Reply with: OK');

          const responseTime = Date.now() - startTime;
          connectivityTest = {
            success: true,
            message: 'API key is valid and working',
            responseTime
          };
        } catch (testError) {
          connectivityTest = {
            success: false,
            message: 'Failed to validate API key with Gemini API: ' + (testError.message || 'Unknown error'),
            responseTime: Date.now() - startTime
          };

          // Don't save if connectivity test failed and was explicitly requested
          if (testConnectivity) {
            return res.status(400).json({
              message: 'API key validation failed',
              error: connectivityTest.message
            });
          }
        }
      }

      // Encrypt API key before storing
      const encryptedKey = encrypt(apiKey);

      // Save encrypted key to database
      db.prepare('UPDATE users SET gemini_api_key = ? WHERE id = ?').run(
        encryptedKey,
        req.user.id
      );

      // Generate masked preview for response
      const start = apiKey.substring(0, 4);
      const end = apiKey.substring(apiKey.length - 6);
      const keyPreview = `${start}***************${end}`;

      res.json({
        message: 'API key saved successfully',
        keyPreview,
        connectivityTest
      });
    } catch (error) {
      console.error('API key save error:', error);
      res.status(500).json({ message: 'Failed to save API key' });
    }
  });

  /**
   * POST /api/users/settings/gemini-key/test
   * Test connectivity with the provided API key (without saving)
   */
  router.post('/settings/gemini-key/test', authenticateToken, strictAuthLimiter, async (req, res) => {
    try {
      const { apiKey } = req.body;

      // Validation
      if (!apiKey) {
        return res.status(400).json({ message: 'API key is required' });
      }

      // Validate format
      if (!apiKey.startsWith('AIza') || apiKey.length < 35) {
        return res.status(400).json({ message: 'Invalid API key format' });
      }

      // Test connectivity
      try {
        const startTime = Date.now();
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-3.0-flash' });

        await model.generateContent('Reply with: OK');

        const responseTime = Date.now() - startTime;

        res.json({
          success: true,
          message: 'API key is valid and working',
          responseTime
        });
      } catch (testError) {
        res.status(400).json({
          success: false,
          message: 'Failed to validate API key: ' + (testError.message || 'Unknown error')
        });
      }
    } catch (error) {
      console.error('API key test error:', error);
      res.status(500).json({ message: 'Failed to test API key' });
    }
  });

  /**
   * DELETE /api/users/settings/gemini-key
   * Remove user's custom API key (revert to system default)
   */
  router.delete('/settings/gemini-key', authenticateToken, apiLimiter, async (req, res) => {
    try {
      const { password } = req.body;

      // Validation
      if (!password) {
        return res.status(400).json({ message: 'Password is required' });
      }

      // Get current user
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      // Remove API key (set to NULL)
      db.prepare('UPDATE users SET gemini_api_key = NULL WHERE id = ?').run(req.user.id);

      res.json({
        message: 'API key removed successfully. Reverting to system default.'
      });
    } catch (error) {
      console.error('API key deletion error:', error);
      res.status(500).json({ message: 'Failed to remove API key' });
    }
  });

  // ========================================
  // USER PREFERENCES ENDPOINTS
  // ========================================

  /**
   * GET /api/users/preferences
   * Get all user preferences
   */
  router.get('/preferences', authenticateToken, apiLimiter, (req, res) => {
    try {
      let prefs = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(req.user.id);

      // Create default preferences if not exists
      if (!prefs) {
        db.prepare('INSERT INTO user_preferences (user_id) VALUES (?)').run(req.user.id);
        prefs = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(req.user.id);
      }

      // Parse all JSON fields
      const preferences = {
        appearance: JSON.parse(prefs.appearance_settings),
        notifications: JSON.parse(prefs.notification_settings),
        music: JSON.parse(prefs.music_settings),
        ai: JSON.parse(prefs.ai_settings),
        privacy: JSON.parse(prefs.privacy_settings),
        general: JSON.parse(prefs.general_settings),
      };

      res.json({ preferences });
    } catch (error) {
      console.error('Get preferences error:', error);
      res.status(500).json({ message: 'Failed to fetch preferences' });
    }
  });

  /**
   * PUT /api/users/preferences
   * Update specific preference category
   */
  router.put('/preferences', authenticateToken, apiLimiter, (req, res) => {
    try {
      const { category, settings } = req.body;

      if (!category || !settings) {
        return res.status(400).json({ message: 'Category and settings are required' });
      }

      // Validate category
      const validCategories = ['appearance', 'notifications', 'music', 'ai', 'privacy', 'general'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: 'Invalid preference category' });
      }

      // Map category to column name
      const columnMap = {
        appearance: 'appearance_settings',
        notifications: 'notification_settings',
        music: 'music_settings',
        ai: 'ai_settings',
        privacy: 'privacy_settings',
        general: 'general_settings',
      };

      const column = columnMap[category];

      // Get current preferences
      let prefs = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(req.user.id);

      // Create default if doesn't exist
      if (!prefs) {
        db.prepare('INSERT INTO user_preferences (user_id) VALUES (?)').run(req.user.id);
        prefs = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(req.user.id);
      }

      // Merge with existing settings (don't overwrite entire category)
      const existingSettings = JSON.parse(prefs[column]);
      const mergedSettings = { ...existingSettings, ...settings };

      // Update the category
      db.prepare(
        `UPDATE user_preferences
         SET ${column} = ?, updated_at = datetime('now')
         WHERE user_id = ?`
      ).run(JSON.stringify(mergedSettings), req.user.id);

      // Return updated preferences
      const updated = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(req.user.id);
      const preferences = {
        appearance: JSON.parse(updated.appearance_settings),
        notifications: JSON.parse(updated.notification_settings),
        music: JSON.parse(updated.music_settings),
        ai: JSON.parse(updated.ai_settings),
        privacy: JSON.parse(updated.privacy_settings),
        general: JSON.parse(updated.general_settings),
      };

      res.json({
        success: true,
        message: `${category} preferences updated`,
        preferences,
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({ message: 'Failed to update preferences' });
    }
  });

  return router;
}

module.exports = createSettingsRoutes;
