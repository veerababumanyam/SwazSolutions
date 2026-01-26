/**
 * Digital Invitation Sharing API Routes
 * Social sharing and communication features
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Middleware
const { authenticateToken } = require('../middleware/auth');

// Import services (reuse existing email service)
const emailService = require('../services/emailService');

const createInviteSharingRoutes = (db) => {
  const router = express.Router();

  /**
   * @route   GET /api/invites/:id/qr
   * @desc    Generate QR code for invitation
   * @access  Private
   */
  router.get('/:id/qr', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { type = 'main' } = req.query;

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

      // Generate URL based on type
      let url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${invite.slug}`;

      if (type === 'rsvp') {
        url += '/rsvp';
      } else if (type === 'map') {
        url += '/map';
      }

      // Use external QR code service (api.qrserver.com)
      const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;

      res.json({
        success: true,
        data: {
          qrCode,
          url,
          type
        }
      });

    } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate QR code'
      });
    }
  });

  /**
   * @route   POST /api/invites/:id/share/whatsapp
   * @desc    Generate WhatsApp share link
   * @access  Private
   */
  router.post('/:id/share/whatsapp', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { phoneNumbers, message } = req.body;

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

      // Generate invitation URL
      const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${invite.slug}`;

      // Build default message
      const defaultMessage = `You're invited! ${invite.host_name} invites you to ${invite.event_type} on ${new Date(invite.event_date).toLocaleDateString()}. View details: ${inviteUrl}`;

      const shareMessage = message || defaultMessage;

      // Generate WhatsApp links (one per number)
      const links = phoneNumbers.map(phone => ({
        phone,
        url: `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(shareMessage)}`
      }));

      // Log share event
      for (const phoneNumber of phoneNumbers) {
        await db.run(
          `INSERT INTO invite_analytics (id, invite_id, event_type, metadata, created_at)
           VALUES (?, ?, ?, ?, datetime('now'))`,
          [uuidv4(), id, 'share', JSON.stringify({ channel: 'whatsapp', phone: phoneNumber })]
        );
      }

      res.json({
        success: true,
        data: {
          links,
          message: shareMessage
        }
      });

    } catch (error) {
      console.error('Error generating WhatsApp share:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate WhatsApp share link'
      });
    }
  });

  /**
   * @route   POST /api/invites/:id/share/instagram
   * @desc    Generate Instagram story image
   * @access  Private
   */
  router.post('/:id/share/instagram', authenticateToken, async (req, res) => {
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

      // In a real implementation, this would use a library like Sharp or Canvas
      // to generate a 1080x1920 image with event details and QR code.
      // For now, we'll return a URL that the frontend can use.

      const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${invite.slug}`;
      const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(inviteUrl)}`;

      // Return data for frontend to generate image
      res.json({
        success: true,
        data: {
          eventName: invite.event_type,
          hostName: invite.host_name,
          date: new Date(invite.event_date).toLocaleDateString(),
          venue: invite.venue,
          qrCode,
          inviteUrl,
          // Template for image generation
          template: {
            width: 1080,
            height: 1920,
            backgroundColor: invite.custom_bg || '#1a1a2e',
            textColor: '#ffffff'
          }
        }
      });

    } catch (error) {
      console.error('Error generating Instagram story:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate Instagram story'
      });
    }
  });

  /**
   * @route   POST /api/invites/:id/share/email
   * @desc    Send bulk email invitations
   * @access  Private
   */
  router.post('/:id/share/email', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { guestIds, subject, message } = req.body;

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

      if (!Array.isArray(guestIds) || guestIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Guest IDs array is required'
        });
      }

      // Get guests
      const guests = await db.all(
        `SELECT * FROM invite_guests
         WHERE invite_id = ? AND id IN (${guestIds.map(() => '?').join(',')})`,
        [id, ...guestIds]
      );

      if (guests.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No guests found'
        });
      }

      const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${invite.slug}`;

      // Send emails
      const results = {
        sent: 0,
        failed: 0,
        errors: []
      };

      for (const guest of guests) {
        try {
          // Build email content
          const emailSubject = subject || `You're invited: ${invite.event_type} by ${invite.host_name}`;
          const emailMessage = message || `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>You're Invited!</h2>
              <p>${invite.host_name} invites you to ${invite.event_type}</p>
              <p><strong>When:</strong> ${new Date(invite.event_date).toLocaleDateString()} at ${invite.event_time || '6:30 PM'}</p>
              <p><strong>Where:</strong> ${invite.venue}</p>
              <p>${invite.details || ''}</p>
              <p style="margin: 30px 0;">
                <a href="${inviteUrl}" style="background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Invitation</a>
              </p>
              <p style="color: #666; font-size: 12px;">Or copy this link: ${inviteUrl}</p>
            </div>
          `;

          // Send email using existing email service
          await emailService.sendEmail({
            to: guest.email,
            subject: emailSubject,
            html: emailMessage
          });

          // Update last contacted
          await db.run(
            'UPDATE invite_guests SET last_contacted = datetime(\'now\') WHERE id = ?',
            [guest.id]
          );

          // Log notification
          await db.run(
            `INSERT INTO invite_notifications (id, invite_id, recipient, channel, status, campaign, created_at)
             VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
            [uuidv4(), id, guest.email, 'email', 'sent', 'Invitation']
          );

          results.sent++;

        } catch (emailError) {
          console.error(`Failed to send email to ${guest.email}:`, emailError);
          results.failed++;
          results.errors.push({ email: guest.email, error: emailError.message });
        }
      }

      // Log share event
      await db.run(
        `INSERT INTO invite_analytics (id, invite_id, event_type, metadata, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [uuidv4(), id, 'share', JSON.stringify({ channel: 'email', count: results.sent })]
      );

      res.json({
        success: true,
        data: results
      });

    } catch (error) {
      console.error('Error sending bulk emails:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send emails'
      });
    }
  });

  /**
   * @route   GET /api/invites/:id/share/links
   * @desc    Get all share links for an invitation
   * @access  Private
   */
  router.get('/:id/share/links', authenticateToken, async (req, res) => {
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

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const inviteUrl = `${baseUrl}/invite/${invite.slug}`;

      // Default share message
      const shareMessage = `You're invited! ${invite.host_name} invites you to ${invite.event_type} on ${new Date(invite.event_date).toLocaleDateString()}.`;

      res.json({
        success: true,
        data: {
          direct: inviteUrl,
          whatsapp: `https://wa.me/?text=${encodeURIComponent(shareMessage + ' ' + inviteUrl)}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteUrl)}`,
          twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(shareMessage)}`,
          email: `mailto:?subject=Invitation to ${invite.event_type}&body=${encodeURIComponent(shareMessage + '\n\n' + inviteUrl)}`,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(inviteUrl)}`
        }
      });

    } catch (error) {
      console.error('Error getting share links:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get share links'
      });
    }
  });

  /**
   * @route   POST /api/invites/:id/share/track
   * @desc    Track share event
   * @access  Public
   */
  router.post('/:id/share/track', async (req, res) => {
    try {
      const { id } = req.params;
      const { channel } = req.body;

      // Verify invite exists and is published
      const invite = await db.get(
        'SELECT * FROM digital_invites WHERE id = ? AND status = ?',
        [id, 'published']
      );

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Log share event
      await db.run(
        `INSERT INTO invite_analytics (id, invite_id, event_type, metadata, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [uuidv4(), id, 'share', JSON.stringify({ channel: channel || 'unknown' })]
      );

      res.json({
        success: true
      });

    } catch (error) {
      console.error('Error tracking share:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to track share'
      });
    }
  });

  return router;
};

module.exports = createInviteSharingRoutes;
