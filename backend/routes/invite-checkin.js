/**
 * Digital Invitation Check-In API Routes
 * Guest check-in system for event management
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Middleware
const { authenticateToken } = require('../middleware/auth');

const createInviteCheckInRoutes = (db) => {
  const router = express.Router();

  /**
   * @route   POST /api/invites/:id/checkin
   * @desc    Check in a guest
   * @access  Private
   */
  router.post('/:id/checkin', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { guestId, qrData } = req.body;

      // Verify invitation ownership
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

      // Find guest by ID or QR data
      let guest;
      if (guestId) {
        guest = await db.get(
          'SELECT * FROM invite_guests WHERE id = ? AND invite_id = ?',
          [guestId, id]
        );
      } else if (qrData) {
        // Parse QR data (format: guest:guestId or email:guestEmail)
        const parsed = JSON.parse(Buffer.from(qrData, 'base64').toString());
        if (parsed.guestId) {
          guest = await db.get(
            'SELECT * FROM invite_guests WHERE id = ? AND invite_id = ?',
            [parsed.guestId, id]
          );
        } else if (parsed.email) {
          guest = await db.get(
            'SELECT * FROM invite_guests WHERE email = ? AND invite_id = ?',
            [parsed.email, id]
          );
        }
      }

      if (!guest) {
        return res.status(404).json({
          success: false,
          error: 'Guest not found'
        });
      }

      // Check if already checked in
      const existingCheckIn = await db.get(
        'SELECT * FROM invite_checkins WHERE guest_id = ? AND invite_id = ?',
        [guest.id, id]
      );

      if (existingCheckIn) {
        return res.status(400).json({
          success: false,
          error: 'Guest already checked in',
          data: {
            checkedInAt: existingCheckIn.checked_in_at,
            checkedInBy: existingCheckIn.checked_in_by
          }
        });
      }

      // Create check-in record
      const checkInId = uuidv4();

      await db.run(
        `INSERT INTO invite_checkins (id, invite_id, guest_id, checked_in_by, checked_in_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [checkInId, id, guest.id, userId]
      );

      // Fetch check-in record
      const checkIn = await db.get(
        `SELECT ic.*, g.name as guest_name, g.email as guest_email, g.category, u.name as checked_in_by_name
         FROM invite_checkins ic
         JOIN invite_guests g ON ic.guest_id = g.id
         LEFT JOIN users u ON ic.checked_in_by = u.id
         WHERE ic.id = ?`,
        [checkInId]
      );

      res.json({
        success: true,
        data: checkIn,
        message: `Checked in: ${guest.name}`
      });

    } catch (error) {
      console.error('Error checking in guest:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check in guest'
      });
    }
  });

  /**
   * @route   GET /api/invites/:id/checkin
   * @desc    Get all check-ins for an invitation
   * @access  Private
   */
  router.get('/:id/checkin', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      // Verify invitation ownership
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

      // Get check-ins with guest details
      const checkIns = await db.all(
        `SELECT ic.*, g.name as guest_name, g.email as guest_email, g.category, g.phone,
          g.plus_ones, g.dietary, u.name as checked_in_by_name
         FROM invite_checkins ic
         JOIN invite_guests g ON ic.guest_id = g.id
         LEFT JOIN users u ON ic.checked_in_by = u.id
         WHERE ic.invite_id = ?
         ORDER BY ic.checked_in_at DESC
         LIMIT ? OFFSET ?`,
        [id, parseInt(limit), parseInt(offset)]
      );

      // Get total count
      const countResult = await db.get(
        'SELECT COUNT(*) as total FROM invite_checkins WHERE invite_id = ?',
        [id]
      );

      res.json({
        success: true,
        data: checkIns,
        total: countResult.total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

    } catch (error) {
      console.error('Error fetching check-ins:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch check-ins'
      });
    }
  });

  /**
   * @route   GET /api/invites/:id/checkin/stats
   * @desc    Get check-in statistics
   * @access  Private
   */
  router.get('/:id/checkin/stats', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Verify invitation ownership
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

      // Get check-in stats
      const stats = await db.get(
        `SELECT
          COUNT(*) as total_checked_in,
          COUNT(DISTINCT checked_in_by) as operators,
          MAX(checked_in_at) as last_checkin
         FROM invite_checkins WHERE invite_id = ?`,
        [id]
      );

      // Get total guests for comparison
      const guestStats = await db.get(
        `SELECT
          COUNT(*) as total_guests,
          SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as accepted
         FROM invite_guests WHERE invite_id = ?`,
        [id]
      );

      // Get check-ins by category
      const categoryBreakdown = await db.all(
        `SELECT g.category, COUNT(*) as count
         FROM invite_checkins ic
         JOIN invite_guests g ON ic.guest_id = g.id
         WHERE ic.invite_id = ?
         GROUP BY g.category
         ORDER BY count DESC`,
        [id]
      );

      // Get recent check-ins (last 10)
      const recent = await db.all(
        `SELECT ic.checked_in_at, g.name, g.category, u.name as checked_in_by_name
         FROM invite_checkins ic
         JOIN invite_guests g ON ic.guest_id = g.id
         LEFT JOIN users u ON ic.checked_in_by = u.id
         WHERE ic.invite_id = ?
         ORDER BY ic.checked_in_at DESC
         LIMIT 10`,
        [id]
      );

      res.json({
        success: true,
        data: {
          totalGuests: guestStats.total_guests || 0,
          totalAccepted: guestStats.accepted || 0,
          totalCheckedIn: stats.total_checked_in || 0,
          checkInRate: guestStats.total_guests > 0
            ? ((stats.total_checked_in / guestStats.total_guests) * 100).toFixed(1)
            : 0,
          operators: stats.operators || 0,
          lastCheckin: stats.last_checkin,
          categoryBreakdown,
          recentCheckIns: recent
        }
      });

    } catch (error) {
      console.error('Error fetching check-in stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch check-in statistics'
      });
    }
  });

  /**
   * @route   GET /api/invites/:id/checkin/verify/:guestId
   * @desc    Verify guest QR code for check-in
   * @access  Private
   */
  router.get('/:id/checkin/verify/:guestId', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id, guestId } = req.params;

      // Verify invitation ownership
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

      // Get guest details
      const guest = await db.get(
        'SELECT * FROM invite_guests WHERE id = ? AND invite_id = ?',
        [guestId, id]
      );

      if (!guest) {
        return res.status(404).json({
          success: false,
          error: 'Guest not found'
        });
      }

      // Check if already checked in
      const existingCheckIn = await db.get(
        'SELECT * FROM invite_checkins WHERE guest_id = ? AND invite_id = ?',
        [guestId, id]
      );

      res.json({
        success: true,
        data: {
          guest: {
            id: guest.id,
            name: guest.name,
            email: guest.email,
            category: guest.category,
            plusOnes: guest.plus_ones,
            dietary: guest.dietary
          },
          alreadyCheckedIn: !!existingCheckIn,
          checkInDetails: existingCheckIn || null
        }
      });

    } catch (error) {
      console.error('Error verifying guest:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify guest'
      });
    }
  });

  /**
   * @route   DELETE /api/invites/:id/checkin/:checkInId
   * @desc    Undo a check-in (admin only)
   * @access  Private
   */
  router.delete('/:id/checkin/:checkInId', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id, checkInId } = req.params;

      // Verify invitation ownership
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

      // Verify check-in exists
      const checkIn = await db.get(
        'SELECT * FROM invite_checkins WHERE id = ? AND invite_id = ?',
        [checkInId, id]
      );

      if (!checkIn) {
        return res.status(404).json({
          success: false,
          error: 'Check-in not found'
        });
      }

      // Delete check-in
      await db.run(
        'DELETE FROM invite_checkins WHERE id = ?',
        [checkInId]
      );

      res.json({
        success: true,
        message: 'Check-in undone successfully'
      });

    } catch (error) {
      console.error('Error undoing check-in:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to undo check-in'
      });
    }
  });

  /**
   * @route   GET /api/invites/:id/checkin/search
   * @desc    Search guests for manual check-in
   * @access  Private
   */
  router.get('/:id/checkin/search', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { q } = req.query;

      // Verify invitation ownership
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

      if (!q || q.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Search query must be at least 2 characters'
        });
      }

      // Search guests
      const guests = await db.all(
        `SELECT g.*, ic.checked_in_at
         FROM invite_guests g
         LEFT JOIN invite_checkins ic ON g.id = ic.guest_id AND ic.invite_id = ?
         WHERE g.invite_id = ? AND (g.name LIKE ? OR g.email LIKE ? OR g.phone LIKE ?)
         ORDER BY g.name
         LIMIT 20`,
        [id, id, `%${q}%`, `%${q}%`, `%${q}%`]
      );

      res.json({
        success: true,
        data: guests
      });

    } catch (error) {
      console.error('Error searching guests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search guests'
      });
    }
  });

  /**
   * @route   GET /api/invites/:id/checkin/pending
   * @desc    Get pending guests (not checked in yet)
   * @access  Private
   */
  router.get('/:id/checkin/pending', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Verify invitation ownership
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

      // Get guests who haven't checked in (only accepted guests)
      const pending = await db.all(
        `SELECT g.*
         FROM invite_guests g
         WHERE g.invite_id = ?
         AND g.id NOT IN (SELECT guest_id FROM invite_checkins WHERE invite_id = ?)
         AND g.status = 'Accepted'
         ORDER BY g.name`,
        [id, id]
      );

      res.json({
        success: true,
        data: pending
      });

    } catch (error) {
      console.error('Error fetching pending guests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pending guests'
      });
    }
  });

  return router;
};

module.exports = createInviteCheckInRoutes;
