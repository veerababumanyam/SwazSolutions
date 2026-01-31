/**
 * Digital Invitations API Routes
 * CRUD operations for digital invitations
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

// Middleware - using barrel export for cleaner imports
const {
  authenticateToken,
  apiLimiter
} = require('../middleware');
const { resolveGeminiApiKey } = require('../middleware/geminiKeyResolver');
const { generateInvitationText } = require('../services/geminiService');

// Validation helpers
const validateInviteData = (data) => {
  const errors = [];

  if (!data.hostName || data.hostName.trim().length === 0) {
    errors.push('Host name is required');
  }

  if (!data.eventType) {
    errors.push('Event type is required');
  }

  if (!data.date) {
    errors.push('Event date is required');
  }

  if (!data.venue || data.venue.trim().length === 0) {
    errors.push('Venue is required');
  }

  return errors;
};

const createInviteRoutes = (db) => {
  const router = express.Router();

  /**
   * @route   POST /api/invites
   * @desc    Create a new digital invitation
   * @access  Private
   */
  router.post('/', authenticateToken, (req, res) => {
    try {
      const userId = req.user.id;
      const inviteData = req.body;

      // Validate
      const errors = validateInviteData(inviteData);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: errors.join(', ')
        });
      }

      // Check user's invitation quota
      const userQuota = db.prepare('SELECT invites_quota, invites_used FROM users WHERE id = ?').get(userId);

      if (userQuota && userQuota.invites_used >= userQuota.invites_quota) {
        return res.status(403).json({
          success: false,
          error: 'Invitation quota exceeded. Please upgrade your subscription.'
        });
      }

      // Generate invite ID and slug
      const inviteId = `invite_${uuidv4()}`;
      const slug = inviteData.slug || `${inviteData.hostName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      // Check if slug is unique
      const existingSlug = db.prepare('SELECT id FROM digital_invites WHERE slug = ?').get(slug);

      if (existingSlug) {
        return res.status(400).json({
          success: false,
          error: 'Slug already exists. Please choose a different one.'
        });
      }

      // Insert invitation
      db.prepare(
        `INSERT INTO digital_invites (
          id, user_id, event_type, host_name,
          primary_lang, secondary_lang, bilingual_enabled, bilingual_layout,
          event_date, event_time, venue, map_link, details,
          multi_event_enabled, events_json, sections_json,
          indian_config_json, media_config_json,
          template_id, custom_bg, custom_font,
          show_qr, show_countdown, show_rsvp, auto_expiry,
          generated_text, ai_tone, gallery_images,
          status, slug
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        inviteId,
        userId,
        inviteData.eventType,
        inviteData.hostName,
        inviteData.primaryLang || 'en',
        inviteData.secondaryLang || '',
        inviteData.bilingualEnabled ? 1 : 0,
        inviteData.bilingualLayout || 'tabs',
        inviteData.date,
        inviteData.time || '18:30',
        inviteData.venue,
        inviteData.mapLink || '',
        inviteData.details || '',
        inviteData.multiEventEnabled ? 1 : 0,
        JSON.stringify(inviteData.events || []),
        JSON.stringify(inviteData.sections || []),
        JSON.stringify(inviteData.indianConfig || { enabled: false }),
        JSON.stringify(inviteData.mediaConfig || {}),
        inviteData.templateId || 'wc1',
        inviteData.customBg || '',
        inviteData.customFont || '',
        inviteData.showQr ? 1 : 0,
        inviteData.showCountdown !== undefined ? inviteData.showCountdown : 1,
        inviteData.showRsvp !== undefined ? inviteData.showRsvp : 1,
        inviteData.autoExpiry ? 1 : 0,
        inviteData.generatedText || '',
        inviteData.aiTone || '',
        JSON.stringify(inviteData.galleryImages || []),
        'draft',
        slug
      );

      // Update user's invite count
      db.prepare('UPDATE users SET invites_used = invites_used + 1 WHERE id = ?').run(userId);

      // Fetch created invite
      const invite = db.prepare('SELECT * FROM digital_invites WHERE id = ?').get(inviteId);

      // Parse JSON fields
      if (invite) {
        invite.events_json = JSON.parse(invite.events_json || '[]');
        invite.sections_json = JSON.parse(invite.sections_json || '[]');
        invite.indian_config_json = JSON.parse(invite.indian_config_json || '{}');
        invite.media_config_json = JSON.parse(invite.media_config_json || '{}');
        invite.gallery_images = JSON.parse(invite.gallery_images || '[]');
      }

      res.json({
        success: true,
        data: invite
      });

    } catch (error) {
      console.error('Error creating invitation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create invitation'
      });
    }
  });

  /**
   * @route   GET /api/invites
   * @desc    Get user's invitations
   * @access  Private
   */
  router.get('/', authenticateToken, (req, res) => {
    try {
      const userId = req.user.id;
      const { status, page = 1, limit = 20 } = req.query;

      let query = 'SELECT * FROM digital_invites WHERE user_id = ?';
      const params = [userId];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

      const invites = db.prepare(query).all(...params);

      // Parse JSON fields
      const parsedInvites = invites.map(invite => ({
        ...invite,
        events_json: JSON.parse(invite.events_json || '[]'),
        sections_json: JSON.parse(invite.sections_json || '[]'),
        indian_config_json: JSON.parse(invite.indian_config_json || '{}'),
        media_config_json: JSON.parse(invite.media_config_json || '{}'),
        gallery_images: JSON.parse(invite.gallery_images || '[]')
      }));

      // Get total count
      const countResult = db.prepare('SELECT COUNT(*) as total FROM digital_invites WHERE user_id = ?').get(userId);

      res.json({
        success: true,
        data: parsedInvites,
        total: countResult?.total || 0,
        page: parseInt(page),
        limit: parseInt(limit)
      });

    } catch (error) {
      console.error('Error fetching invitations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch invitations'
      });
    }
  });

  /**
   * @route   GET /api/invites/:id
   * @desc    Get invitation by ID
   * @access  Private
   */
  router.get('/:id', authenticateToken, (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const invite = db.prepare('SELECT * FROM digital_invites WHERE id = ? AND user_id = ?').get(id, userId);

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Parse JSON fields
      invite.events_json = JSON.parse(invite.events_json || '[]');
      invite.sections_json = JSON.parse(invite.sections_json || '[]');
      invite.indian_config_json = JSON.parse(invite.indian_config_json || '{}');
      invite.media_config_json = JSON.parse(invite.media_config_json || '{}');
      invite.gallery_images = JSON.parse(invite.gallery_images || '[]');

      // Get guest statistics
      const stats = db.prepare(
        `SELECT
          COUNT(*) as total_guests,
          SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as accepted,
          SUM(CASE WHEN status = 'Declined' THEN 1 ELSE 0 END) as declined,
          SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending
        FROM invite_guests WHERE invite_id = ?`
      ).get(id);

      res.json({
        success: true,
        data: {
          ...invite,
          stats
        }
      });

    } catch (error) {
      console.error('Error fetching invitation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch invitation'
      });
    }
  });

  /**
   * @route   PUT /api/invites/:id
   * @desc    Update invitation
   * @access  Private
   */
  router.put('/:id', authenticateToken, (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const inviteData = req.body;

      // Check ownership
      const existing = db.prepare('SELECT * FROM digital_invites WHERE id = ? AND user_id = ?').get(id, userId);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Validate
      const errors = validateInviteData(inviteData);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: errors.join(', ')
        });
      }

      // Update invitation
      db.prepare(
        `UPDATE digital_invites SET
          event_type = ?, host_name = ?,
          primary_lang = ?, secondary_lang = ?, bilingual_enabled = ?, bilingual_layout = ?,
          event_date = ?, event_time = ?, venue = ?, map_link = ?, details = ?,
          multi_event_enabled = ?, events_json = ?, sections_json = ?,
          indian_config_json = ?, media_config_json = ?,
          template_id = ?, custom_bg = ?, custom_font = ?,
          show_qr = ?, show_countdown = ?, show_rsvp = ?, auto_expiry = ?,
          generated_text = ?, ai_tone = ?, gallery_images = ?,
          updated_at = datetime('now')
        WHERE id = ?`
      ).run(
        inviteData.eventType,
        inviteData.hostName,
        inviteData.primaryLang || 'en',
        inviteData.secondaryLang || '',
        inviteData.bilingualEnabled ? 1 : 0,
        inviteData.bilingualLayout || 'tabs',
        inviteData.date,
        inviteData.time || '18:30',
        inviteData.venue,
        inviteData.mapLink || '',
        inviteData.details || '',
        inviteData.multiEventEnabled ? 1 : 0,
        JSON.stringify(inviteData.events || []),
        JSON.stringify(inviteData.sections || []),
        JSON.stringify(inviteData.indianConfig || { enabled: false }),
        JSON.stringify(inviteData.mediaConfig || {}),
        inviteData.templateId || 'wc1',
        inviteData.customBg || '',
        inviteData.customFont || '',
        inviteData.showQr ? 1 : 0,
        inviteData.showCountdown !== undefined ? inviteData.showCountdown : 1,
        inviteData.showRsvp !== undefined ? inviteData.showRsvp : 1,
        inviteData.autoExpiry ? 1 : 0,
        inviteData.generatedText || '',
        inviteData.aiTone || '',
        JSON.stringify(inviteData.galleryImages || []),
        id
      );

      // Fetch updated invite
      const invite = db.prepare('SELECT * FROM digital_invites WHERE id = ?').get(id);

      // Parse JSON fields
      if (invite) {
        invite.events_json = JSON.parse(invite.events_json || '[]');
        invite.sections_json = JSON.parse(invite.sections_json || '[]');
        invite.indian_config_json = JSON.parse(invite.indian_config_json || '{}');
        invite.media_config_json = JSON.parse(invite.media_config_json || '{}');
        invite.gallery_images = JSON.parse(invite.gallery_images || '[]');
      }

      res.json({
        success: true,
        data: invite
      });

    } catch (error) {
      console.error('Error updating invitation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update invitation'
      });
    }
  });

  /**
   * @route   DELETE /api/invites/:id
   * @desc    Delete invitation
   * @access  Private
   */
  router.delete('/:id', authenticateToken, (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Check ownership
      const existing = db.prepare('SELECT * FROM digital_invites WHERE id = ? AND user_id = ?').get(id, userId);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Delete invitation (CASCADE will handle related records)
      db.prepare('DELETE FROM digital_invites WHERE id = ?').run(id);

      // Update user's invite count
      db.prepare('UPDATE users SET invites_used = invites_used - 1 WHERE id = ?').run(userId);

      res.json({
        success: true,
        message: 'Invitation deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting invitation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete invitation'
      });
    }
  });

  /**
   * @route   POST /api/invites/:id/publish
   * @desc    Publish invitation
   * @access  Private
   */
  router.post('/:id/publish', authenticateToken, (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Check ownership
      const existing = db.prepare('SELECT * FROM digital_invites WHERE id = ? AND user_id = ?').get(id, userId);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Update status to published
      db.prepare('UPDATE digital_invites SET status = ?, updated_at = datetime("now") WHERE id = ?').run('published', id);

      // Fetch updated invite
      const invite = db.prepare('SELECT * FROM digital_invites WHERE id = ?').get(id);

      res.json({
        success: true,
        data: invite,
        message: 'Invitation published successfully'
      });

    } catch (error) {
      console.error('Error publishing invitation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to publish invitation'
      });
    }
  });

  /**
   * @route   GET /api/invites/slug/:slug
   * @desc    Get public invitation by slug
   * @access  Public
   */
  router.get('/slug/:slug', (req, res) => {
    try {
      const { slug } = req.params;

      const invite = db.prepare('SELECT * FROM digital_invites WHERE slug = ? AND status = ?').get(slug, 'published');

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Parse JSON fields
      invite.events_json = JSON.parse(invite.events_json || '[]');
      invite.sections_json = JSON.parse(invite.sections_json || '[]');
      invite.indian_config_json = JSON.parse(invite.indian_config_json || '{}');
      invite.media_config_json = JSON.parse(invite.media_config_json || '{}');
      invite.gallery_images = JSON.parse(invite.gallery_images || '[]');

      // Track view event (analytics)
      const eventId = uuidv4();
      db.prepare('INSERT INTO invite_analytics (id, invite_id, event_type, created_at) VALUES (?, ?, ?, datetime("now"))').run(
        eventId, invite.id, 'view'
      );

      res.json({
        success: true,
        data: invite
      });

    } catch (error) {
      console.error('Error fetching public invitation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch invitation'
      });
    }
  });

  /**
   * @route   POST /api/invites/:id/ai-generate
   * @desc    Generate AI invitation text
   * @access  Private
   */
  router.post('/:id/ai-generate', authenticateToken, resolveGeminiApiKey(db), async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { tone } = req.body;

      // Check ownership
      const invite = db.prepare('SELECT * FROM digital_invites WHERE id = ? AND user_id = ?').get(id, userId);

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Generate text using user's API key
      const generatedText = await generateInvitationText(req.geminiApiKey, {
        occasionType: invite.event_type,
        tone: tone || 'Poetic',
        inviteData: {
          title: invite.host_name,
          date: invite.event_date,
          venue: invite.venue,
          description: invite.details
        }
      });

      // Save generated text
      db.prepare('UPDATE digital_invites SET generated_text = ?, ai_tone = ? WHERE id = ?').run(
        generatedText, tone || 'Poetic', id
      );

      res.json({
        success: true,
        data: {
          generatedText
        }
      });

    } catch (error) {
      console.error('Error generating AI text:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate invitation text',
        message: error.message
      });
    }
  });

  /**
   * @route   POST /api/invites/:id/duplicate
   * @desc    Duplicate invitation
   * @access  Private
   */
  router.post('/:id/duplicate', authenticateToken, (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Check ownership and get original
      const original = db.prepare('SELECT * FROM digital_invites WHERE id = ? AND user_id = ?').get(id, userId);

      if (!original) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Check user's quota
      const userQuota = db.prepare('SELECT invites_quota, invites_used FROM users WHERE id = ?').get(userId);

      if (userQuota && userQuota.invites_used >= userQuota.invites_quota) {
        return res.status(403).json({
          success: false,
          error: 'Invitation quota exceeded. Please upgrade your subscription.'
        });
      }

      // Create duplicate
      const newId = `invite_${uuidv4()}`;
      const newSlug = `${original.slug}-copy-${Date.now()}`;

      db.prepare(
        `INSERT INTO digital_invites (
          id, user_id, event_type, host_name,
          primary_lang, secondary_lang, bilingual_enabled, bilingual_layout,
          event_date, event_time, venue, map_link, details,
          multi_event_enabled, events_json, sections_json,
          indian_config_json, media_config_json,
          template_id, custom_bg, custom_font,
          show_qr, show_countdown, show_rsvp, auto_expiry,
          generated_text, ai_tone, gallery_images,
          status, slug
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        newId,
        userId,
        original.event_type,
        original.host_name + ' (Copy)',
        original.primary_lang,
        original.secondary_lang,
        original.bilingual_enabled,
        original.bilingual_layout,
        original.event_date,
        original.event_time,
        original.venue,
        original.map_link,
        original.details,
        original.multi_event_enabled,
        original.events_json,
        original.sections_json,
        original.indian_config_json,
        original.media_config_json,
        original.template_id,
        original.custom_bg,
        original.custom_font,
        original.show_qr,
        original.show_countdown,
        original.show_rsvp,
        original.auto_expiry,
        original.generated_text,
        original.ai_tone,
        original.gallery_images,
        'draft',
        newSlug
      );

      // Update user's invite count
      db.prepare('UPDATE users SET invites_used = invites_used + 1 WHERE id = ?').run(userId);

      // Fetch new invite
      const invite = db.prepare('SELECT * FROM digital_invites WHERE id = ?').get(newId);

      res.json({
        success: true,
        data: invite,
        message: 'Invitation duplicated successfully'
      });

    } catch (error) {
      console.error('Error duplicating invitation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to duplicate invitation'
      });
    }
  });

  /**
   * @route   GET /api/invites/stats/overview
   * @desc    Get invitation statistics for dashboard
   * @access  Private
   */
  router.get('/stats/overview', authenticateToken, (req, res) => {
    try {
      const userId = req.user.id;

      // Get invitation counts by status
      const statusCounts = db.prepare(
        `SELECT status, COUNT(*) as count FROM digital_invites
         WHERE user_id = ? GROUP BY status`
      ).all(userId);

      // Get total guests across all invites
      const guestStats = db.prepare(
        `SELECT
          COUNT(DISTINCT ig.id) as total_guests,
          SUM(CASE WHEN ig.status = 'Accepted' THEN 1 ELSE 0 END) as accepted,
          SUM(CASE WHEN ig.status = 'Declined' THEN 1 ELSE 0 END) as declined,
          SUM(CASE WHEN ig.status = 'Pending' THEN 1 ELSE 0 END) as pending
         FROM invite_guests ig
         INNER JOIN digital_invites di ON ig.invite_id = di.id
         WHERE di.user_id = ?`
      ).get(userId);

      // Get recent activity (last 7 days)
      const recentActivity = db.prepare(
        `SELECT
          DATE(ia.created_at) as date,
          ia.event_type,
          COUNT(*) as count
         FROM invite_analytics ia
         INNER JOIN digital_invites di ON ia.invite_id = di.id
         WHERE di.user_id = ? AND ia.created_at >= datetime('now', '-7 days')
         GROUP BY DATE(ia.created_at), ia.event_type
         ORDER BY date DESC`
      ).all(userId);

      res.json({
        success: true,
        data: {
          statusCounts: statusCounts.reduce((acc, item) => {
            acc[item.status] = item.count;
            return acc;
          }, {}),
          guestStats: guestStats || {
            total_guests: 0,
            accepted: 0,
            declined: 0,
            pending: 0
          },
          recentActivity
        }
      });

    } catch (error) {
      console.error('Error fetching invitation stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics'
      });
    }
  });

  return router;
};

module.exports = createInviteRoutes;
