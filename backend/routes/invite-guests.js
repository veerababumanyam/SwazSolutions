/**
 * Digital Invitation Guests API Routes
 * Guest management for digital invitations
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Middleware
const { authenticateToken } = require('../middleware/auth');

const createInviteGuestsRoutes = (db) => {
  const router = express.Router();

  /**
   * @route   POST /api/invites/:id/guests
   * @desc    Add guest to invitation
   * @access  Private
   */
  router.post('/:id/guests', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const guestData = req.body;

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

      // Validate
      if (!guestData.name || !guestData.email) {
        return res.status(400).json({
          success: false,
          error: 'Name and email are required'
        });
      }

      // Check if email already exists for this invite
      const existing = await db.get(
        'SELECT id FROM invite_guests WHERE invite_id = ? AND email = ?',
        [id, guestData.email]
      );

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Guest with this email already exists'
        });
      }

      // Create guest
      const guestId = `guest_${uuidv4()}`;

      await db.run(
        `INSERT INTO invite_guests (
          id, user_id, invite_id, name, email, phone, category,
          status, plus_ones, dietary, is_invited
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          guestId,
          userId,
          id,
          guestData.name,
          guestData.email,
          guestData.phone || '',
          guestData.category || 'Other',
          guestData.status || 'Pending',
          guestData.plusOnes || 0,
          guestData.dietary || '',
          1
        ]
      );

      // Fetch created guest
      const guest = await db.get(
        'SELECT * FROM invite_guests WHERE id = ?',
        [guestId]
      );

      res.json({
        success: true,
        data: guest
      });

    } catch (error) {
      console.error('Error adding guest:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add guest'
      });
    }
  });

  /**
   * @route   GET /api/invites/:id/guests
   * @desc    Get guests for invitation
   * @access  Private
   */
  router.get('/:id/guests', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const {
        category,
        status,
        invited,
        search,
        page = 1,
        limit = 50
      } = req.query;

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

      // Build query
      let query = 'SELECT * FROM invite_guests WHERE invite_id = ?';
      const params = [id];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      if (invited !== undefined) {
        query += ' AND is_invited = ?';
        params.push(invited === 'true' ? 1 : 0);
      }

      if (search) {
        query += ' AND (name LIKE ? OR email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

      const guests = await db.all(query, params);

      // Get total count and stats
      const countResult = await db.get(
        'SELECT COUNT(*) as total FROM invite_guests WHERE invite_id = ?',
        [id]
      );

      const stats = await db.get(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as accepted,
          SUM(CASE WHEN status = 'Declined' THEN 1 ELSE 0 END) as declined,
          SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN is_invited = 1 THEN 1 + plus_ones ELSE 0 END) as expected_attendees
        FROM invite_guests WHERE invite_id = ?`,
        [id]
      );

      res.json({
        success: true,
        data: guests,
        total: countResult.total,
        stats: stats || {
          total: 0,
          accepted: 0,
          declined: 0,
          pending: 0,
          expected_attendees: 0
        },
        page: parseInt(page),
        limit: parseInt(limit)
      });

    } catch (error) {
      console.error('Error fetching guests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch guests'
      });
    }
  });

  /**
   * @route   PUT /api/invites/:id/guests/:guestId
   * @desc    Update guest
   * @access  Private
   */
  router.put('/:id/guests/:guestId', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id, guestId } = req.params;
      const guestData = req.body;

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

      // Verify guest belongs to this invite
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

      // Update guest
      await db.run(
        `UPDATE invite_guests SET
          name = ?, email = ?, phone = ?, category = ?,
          status = ?, plus_ones = ?, dietary = ?, is_invited = ?
        WHERE id = ?`,
        [
          guestData.name,
          guestData.email,
          guestData.phone || '',
          guestData.category,
          guestData.status,
          guestData.plusOnes || 0,
          guestData.dietary || '',
          guestData.isInvited !== undefined ? (guestData.isInvited ? 1 : 0) : guest.is_invited,
          guestId
        ]
      );

      // Fetch updated guest
      const updatedGuest = await db.get(
        'SELECT * FROM invite_guests WHERE id = ?',
        [guestId]
      );

      res.json({
        success: true,
        data: updatedGuest
      });

    } catch (error) {
      console.error('Error updating guest:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update guest'
      });
    }
  });

  /**
   * @route   DELETE /api/invites/:id/guests/:guestId
   * @desc    Delete guest
   * @access  Private
   */
  router.delete('/:id/guests/:guestId', authenticateToken, async (req, res) => {
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

      // Delete guest (CASCADE will handle related records)
      await db.run(
        'DELETE FROM invite_guests WHERE id = ? AND invite_id = ?',
        [guestId, id]
      );

      res.json({
        success: true,
        message: 'Guest deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting guest:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete guest'
      });
    }
  });

  /**
   * @route   POST /api/invites/:id/guests/bulk
   * @desc    Bulk operations on guests
   * @access  Private
   */
  router.post('/:id/guests/bulk', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { operation, guestIds, data } = req.body;

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

      let result;

      switch (operation) {
        case 'delete':
          // Delete multiple guests
          const placeholders = guestIds.map(() => '?').join(',');
          await db.run(
            `DELETE FROM invite_guests WHERE id IN (${placeholders}) AND invite_id = ?`,
            [...guestIds, id]
          );
          result = { deleted: guestIds.length };
          break;

        case 'invite':
          // Add guests to event
          await db.run(
            `UPDATE invite_guests SET is_invited = 1 WHERE id IN (${placeholders}) AND invite_id = ?`,
            [...guestIds, id]
          );
          result = { invited: guestIds.length };
          break;

        case 'uninvite':
          // Remove guests from event
          await db.run(
            `UPDATE invite_guests SET is_invited = 0 WHERE id IN (${placeholders}) AND invite_id = ?`,
            [...guestIds, id]
          );
          result = { uninvited: guestIds.length };
          break;

        case 'update':
          // Update multiple guests with same data
          await db.run(
            `UPDATE invite_guests SET category = ?, status = ? WHERE id IN (${placeholders}) AND invite_id = ?`,
            [data.category, data.status, ...guestIds, id]
          );
          result = { updated: guestIds.length };
          break;

        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid operation'
          });
      }

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error performing bulk operation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform bulk operation'
      });
    }
  });

  /**
   * @route   POST /api/invites/:id/guests/import
   * @desc    Import guests from CSV
   * @access  Private
   */
  router.post('/:id/guests/import', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { guests } = req.body; // Array of {name, email, phone, category}

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

      if (!Array.isArray(guests) || guests.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid guests data'
        });
      }

      const imported = [];
      const skipped = [];

      for (const guestData of guests) {
        if (!guestData.name || !guestData.email) {
          skipped.push({ ...guestData, reason: 'Missing name or email' });
          continue;
        }

        // Check if already exists
        const existing = await db.get(
          'SELECT id FROM invite_guests WHERE invite_id = ? AND email = ?',
          [id, guestData.email]
        );

        if (existing) {
          skipped.push({ ...guestData, reason: 'Already exists' });
          continue;
        }

        // Create guest
        const guestId = `guest_${uuidv4()}`;

        await db.run(
          `INSERT INTO invite_guests (
            id, user_id, invite_id, name, email, phone, category,
            status, plus_ones, dietary, is_invited
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            guestId,
            userId,
            id,
            guestData.name,
            guestData.email,
            guestData.phone || '',
            guestData.category || 'Other',
            'Pending',
            guestData.plusOnes || 0,
            guestData.dietary || '',
            1
          ]
        );

        imported.push({ id: guestId, ...guestData });
      }

      res.json({
        success: true,
        data: {
          imported: imported.length,
          skipped: skipped.length,
          importedGuests: imported,
          skippedGuests: skipped
        }
      });

    } catch (error) {
      console.error('Error importing guests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to import guests'
      });
    }
  });

  /**
   * @route   GET /api/invites/:id/guests/export
   * @desc    Export guests as CSV
   * @access  Private
   */
  router.get('/:id/guests/export', authenticateToken, async (req, res) => {
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

      // Get all guests
      const guests = await db.all(
        'SELECT * FROM invite_guests WHERE invite_id = ? ORDER BY name',
        [id]
      );

      // Generate CSV
      const headers = 'Name,Email,Phone,Category,Status,Plus Ones,Dietary';
      const rows = guests.map(g =>
        `"${g.name}","${g.email}","${g.phone || ''}","${g.category}","${g.status}",${g.plus_ones},"${g.dietary || ''}"`
      );

      const csv = [headers, ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="guests_${id}.csv"`);

      res.send(csv);

    } catch (error) {
      console.error('Error exporting guests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export guests'
      });
    }
  });

  /**
   * @route   POST /api/invites/:id/guests/send-invites
   * @desc    Send invitations to guests (bulk email)
   * @access  Private
   */
  router.post('/:id/guests/send-invites', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { guestIds, message } = req.body;

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

      const guests = await db.all(
        `SELECT * FROM invite_guests
         WHERE invite_id = ? AND id IN (${guestIds.map(() => '?').join(',')})`,
        [id, ...guestIds]
      );

      // In a real implementation, this would send emails via a service
      // For now, we'll mark them as contacted
      const now = new Date().toISOString();

      for (const guest of guests) {
        await db.run(
          'UPDATE invite_guests SET last_contacted = ? WHERE id = ?',
          [now, guest.id]
        );
      }

      // Log notification
      for (const guest of guests) {
        await db.run(
          `INSERT INTO invite_notifications (id, invite_id, recipient, channel, status, campaign, created_at)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
          [uuidv4(), id, guest.email, 'email', 'sent', 'Invitation']
        );
      }

      res.json({
        success: true,
        data: {
          sent: guests.length,
          message: 'Invitations sent successfully'
        }
      });

    } catch (error) {
      console.error('Error sending invitations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send invitations'
      });
    }
  });

  return router;
};

module.exports = createInviteGuestsRoutes;
