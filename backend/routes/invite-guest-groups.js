/**
 * Digital Invitation Guest Groups API Routes
 * Guest group management for digital invitations
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Middleware
const { authenticateToken } = require('../middleware/auth');

const createInviteGuestGroupsRoutes = (db) => {
  const router = express.Router();

  /**
   * @route   POST /api/invites/guest-groups
   * @desc    Create a new guest group
   * @access  Private
   */
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, description, color } = req.body;

      // Validate
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Group name is required'
        });
      }

      // Create group
      const groupId = `group_${uuidv4()}`;

      await db.run(
        `INSERT INTO invite_guest_groups (id, user_id, name, description, color, guest_ids, created_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
        [groupId, userId, name, description || '', color || '#3B82F6', JSON.stringify([])]
      );

      // Fetch created group
      const group = await db.get(
        'SELECT * FROM invite_guest_groups WHERE id = ?',
        [groupId]
      );

      // Parse JSON fields
      group.guest_ids = JSON.parse(group.guest_ids || '[]');

      res.json({
        success: true,
        data: group
      });

    } catch (error) {
      console.error('Error creating guest group:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create guest group'
      });
    }
  });

  /**
   * @route   GET /api/invites/guest-groups
   * @desc    Get user's guest groups
   * @access  Private
   */
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;

      const groups = await db.all(
        'SELECT * FROM invite_guest_groups WHERE user_id = ? ORDER BY name',
        [userId]
      );

      // Parse JSON fields and get guest counts
      const parsedGroups = await Promise.all(groups.map(async (group) => {
        const guestIds = JSON.parse(group.guest_ids || '[]');

        // Get actual guest details for each group
        const guests = guestIds.length > 0
          ? await db.all(
              `SELECT id, name, email, category, status
               FROM invite_guests
               WHERE id IN (${guestIds.map(() => '?').join(',')})`,
              guestIds
            )
          : [];

        return {
          ...group,
          guest_ids: guestIds,
          guestCount: guests.length,
          guests: guests
        };
      }));

      res.json({
        success: true,
        data: parsedGroups
      });

    } catch (error) {
      console.error('Error fetching guest groups:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch guest groups'
      });
    }
  });

  /**
   * @route   GET /api/invites/guest-groups/:id
   * @desc    Get single guest group
   * @access  Private
   */
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const group = await db.get(
        'SELECT * FROM invite_guest_groups WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!group) {
        return res.status(404).json({
          success: false,
          error: 'Guest group not found'
        });
      }

      // Parse JSON fields
      const guestIds = JSON.parse(group.guest_ids || '[]');

      // Get guest details
      const guests = guestIds.length > 0
        ? await db.all(
            `SELECT * FROM invite_guests
             WHERE id IN (${guestIds.map(() => '?').join(',')})`,
            guestIds
          )
        : [];

      group.guest_ids = guestIds;
      group.guests = guests;

      res.json({
        success: true,
        data: group
      });

    } catch (error) {
      console.error('Error fetching guest group:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch guest group'
      });
    }
  });

  /**
   * @route   PUT /api/invites/guest-groups/:id
   * @desc    Update guest group
   * @access  Private
   */
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { name, description, color } = req.body;

      // Check ownership
      const existing = await db.get(
        'SELECT * FROM invite_guest_groups WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Guest group not found'
        });
      }

      // Update group
      await db.run(
        `UPDATE invite_guest_groups
         SET name = ?, description = ?, color = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [
          name || existing.name,
          description !== undefined ? description : existing.description,
          color !== undefined ? color : existing.color,
          id
        ]
      );

      // Fetch updated group
      const group = await db.get(
        'SELECT * FROM invite_guest_groups WHERE id = ?',
        [id]
      );

      group.guest_ids = JSON.parse(group.guest_ids || '[]');

      res.json({
        success: true,
        data: group
      });

    } catch (error) {
      console.error('Error updating guest group:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update guest group'
      });
    }
  });

  /**
   * @route   DELETE /api/invites/guest-groups/:id
   * @desc    Delete guest group
   * @access  Private
   */
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Check ownership
      const existing = await db.get(
        'SELECT * FROM invite_guest_groups WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Guest group not found'
        });
      }

      // Delete group (guests remain, just removed from group)
      await db.run(
        'DELETE FROM invite_guest_groups WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Guest group deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting guest group:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete guest group'
      });
    }
  });

  /**
   * @route   POST /api/invites/guest-groups/:id/guests
   * @desc    Add guests to group
   * @access  Private
   */
  router.post('/:id/guests', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { guestIds } = req.body;

      // Check ownership
      const group = await db.get(
        'SELECT * FROM invite_guest_groups WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!group) {
        return res.status(404).json({
          success: false,
          error: 'Guest group not found'
        });
      }

      if (!Array.isArray(guestIds) || guestIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Guest IDs array is required'
        });
      }

      // Get current guest IDs
      const currentGuestIds = JSON.parse(group.guest_ids || '[]');

      // Add new guest IDs (avoid duplicates)
      const newGuestIds = [...new Set([...currentGuestIds, ...guestIds])];

      // Update group
      await db.run(
        'UPDATE invite_guest_groups SET guest_ids = ?, updated_at = datetime(\'now\') WHERE id = ?',
        [JSON.stringify(newGuestIds), id]
      );

      res.json({
        success: true,
        data: {
          added: guestIds.length,
          totalGuests: newGuestIds.length
        }
      });

    } catch (error) {
      console.error('Error adding guests to group:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add guests to group'
      });
    }
  });

  /**
   * @route   DELETE /api/invites/guest-groups/:id/guests/:guestId
   * @desc    Remove guest from group
   * @access  Private
   */
  router.delete('/:id/guests/:guestId', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id, guestId } = req.params;

      // Check ownership
      const group = await db.get(
        'SELECT * FROM invite_guest_groups WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!group) {
        return res.status(404).json({
          success: false,
          error: 'Guest group not found'
        });
      }

      // Get current guest IDs and remove the specified guest
      const currentGuestIds = JSON.parse(group.guest_ids || '[]');
      const newGuestIds = currentGuestIds.filter(gid => gid !== guestId);

      // Update group
      await db.run(
        'UPDATE invite_guest_groups SET guest_ids = ?, updated_at = datetime(\'now\') WHERE id = ?',
        [JSON.stringify(newGuestIds), id]
      );

      res.json({
        success: true,
        data: {
          removed: guestId,
          totalGuests: newGuestIds.length
        }
      });

    } catch (error) {
      console.error('Error removing guest from group:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove guest from group'
      });
    }
  });

  /**
   * @route   POST /api/invites/guest-groups/:id/assign
   * @desc    Bulk assign guests to category/status from group
   * @access  Private
   */
  router.post('/:id/assign', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { category, status, inviteId } = req.body;

      // Check ownership
      const group = await db.get(
        'SELECT * FROM invite_guest_groups WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!group) {
        return res.status(404).json({
          success: false,
          error: 'Guest group not found'
        });
      }

      const guestIds = JSON.parse(group.guest_ids || '[]');

      if (guestIds.length === 0) {
        return res.json({
          success: true,
          data: {
            updated: 0,
            message: 'No guests in group'
          }
        });
      }

      // Build update query based on what's being assigned
      const updates = [];
      const values = [];

      if (category) {
        updates.push('category = ?');
        values.push(category);
      }

      if (status) {
        updates.push('status = ?');
        values.push(status);
      }

      if (inviteId) {
        updates.push('invite_id = ?');
        values.push(inviteId);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'At least one field (category, status, or inviteId) must be provided'
        });
      }

      updates.push('updated_at = datetime(\'now\')');
      values.push(...guestIds);

      await db.run(
        `UPDATE invite_guests SET ${updates.join(', ')}
         WHERE id IN (${guestIds.map(() => '?').join(',')})`,
        values
      );

      res.json({
        success: true,
        data: {
          updated: guestIds.length
        }
      });

    } catch (error) {
      console.error('Error bulk assigning guests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to bulk assign guests'
      });
    }
  });

  return router;
};

module.exports = createInviteGuestGroupsRoutes;
