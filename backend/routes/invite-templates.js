/**
 * Digital Invitation Templates API Routes
 * Template marketplace and management with ratings
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Middleware
const { authenticateToken } = require('../middleware/auth');

const createInviteTemplatesRoutes = (db) => {
  const router = express.Router();

  /**
   * @route   GET /api/invites/templates
   * @desc    Get marketplace templates (public templates)
   * @access  Public
   */
  router.get('/', async (req, res) => {
    try {
      const { category, search, sort = 'popular' } = req.query;

      let query = 'SELECT * FROM invite_templates WHERE is_public = 1';
      const params = [];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      if (search) {
        query += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      // Sorting
      switch (sort) {
        case 'rating':
          query += ' ORDER BY rating DESC, downloads DESC';
          break;
        case 'recent':
          query += ' ORDER BY created_at DESC';
          break;
        case 'popular':
        default:
          query += ' ORDER BY downloads DESC, rating DESC';
          break;
      }

      const templates = await db.all(query, params);

      // Parse JSON fields
      const parsedTemplates = templates.map(template => ({
        ...template,
        data: JSON.parse(template.data_json || '{}'),
        tags: JSON.parse(template.tags || '[]')
      }));

      res.json({
        success: true,
        data: parsedTemplates
      });

    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch templates'
      });
    }
  });

  /**
   * @route   GET /api/invites/templates/my
   * @desc    Get user's saved templates
   * @access  Private
   */
  router.get('/my', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;

      const templates = await db.all(
        'SELECT * FROM invite_templates WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );

      // Parse JSON fields
      const parsedTemplates = templates.map(template => ({
        ...template,
        data: JSON.parse(template.data_json || '{}'),
        tags: JSON.parse(template.tags || '[]')
      }));

      res.json({
        success: true,
        data: parsedTemplates
      });

    } catch (error) {
      console.error('Error fetching user templates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch templates'
      });
    }
  });

  /**
   * @route   GET /api/invites/templates/:id
   * @desc    Get single template
   * @access  Public
   */
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const template = await db.get(
        'SELECT * FROM invite_templates WHERE id = ?',
        [id]
      );

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      // Get user's rating if authenticated
      let userRating = null;
      if (req.user) {
        const rating = await db.get(
          'SELECT rating FROM invite_template_ratings WHERE template_id = ? AND user_id = ?',
          [id, req.user.id]
        );
        userRating = rating ? rating.rating : null;
      }

      // Parse JSON fields
      template.data = JSON.parse(template.data_json || '{}');
      template.tags = JSON.parse(template.tags || '[]');

      res.json({
        success: true,
        data: {
          ...template,
          userRating
        }
      });

    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch template'
      });
    }
  });

  /**
   * @route   POST /api/invites/templates
   * @desc    Save new template
   * @access  Private
   */
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, description, category, tags, thumbnailUrl, isPublic, data } = req.body;

      // Validate
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Template name is required'
        });
      }

      if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Template data is required'
        });
      }

      // Create template
      const templateId = `template_${uuidv4()}`;

      await db.run(
        `INSERT INTO invite_templates (
          id, user_id, name, description, category,
          tags, thumbnail_url, is_public,
          data_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          templateId,
          userId,
          name,
          description || '',
          category || 'custom',
          JSON.stringify(tags || []),
          thumbnailUrl || '',
          isPublic ? 1 : 0,
          JSON.stringify(data)
        ]
      );

      // Fetch created template
      const template = await db.get(
        'SELECT * FROM invite_templates WHERE id = ?',
        [templateId]
      );

      template.data = JSON.parse(template.data_json || '{}');
      template.tags = JSON.parse(template.tags || '[]');

      res.json({
        success: true,
        data: template
      });

    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create template'
      });
    }
  });

  /**
   * @route   PUT /api/invites/templates/:id
   * @desc    Update template
   * @access  Private
   */
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { name, description, category, tags, thumbnailUrl, isPublic, data } = req.body;

      // Check ownership
      const existing = await db.get(
        'SELECT * FROM invite_templates WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      // Update template
      await db.run(
        `UPDATE invite_templates SET
          name = ?, description = ?, category = ?, tags = ?,
          thumbnail_url = ?, is_public = ?, data_json = ?,
          updated_at = datetime('now')
        WHERE id = ?`,
        [
          name || existing.name,
          description !== undefined ? description : existing.description,
          category || existing.category,
          tags !== undefined ? JSON.stringify(tags) : existing.tags,
          thumbnailUrl !== undefined ? thumbnailUrl : existing.thumbnail_url,
          isPublic !== undefined ? (isPublic ? 1 : 0) : existing.is_public,
          data !== undefined ? JSON.stringify(data) : existing.data_json,
          id
        ]
      );

      // Fetch updated template
      const template = await db.get(
        'SELECT * FROM invite_templates WHERE id = ?',
        [id]
      );

      template.data = JSON.parse(template.data_json || '{}');
      template.tags = JSON.parse(template.tags || '[]');

      res.json({
        success: true,
        data: template
      });

    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update template'
      });
    }
  });

  /**
   * @route   DELETE /api/invites/templates/:id
   * @desc    Delete template
   * @access  Private
   */
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Check ownership
      const existing = await db.get(
        'SELECT * FROM invite_templates WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      // Delete template (CASCADE will handle ratings)
      await db.run(
        'DELETE FROM invite_templates WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Template deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete template'
      });
    }
  });

  /**
   * @route   POST /api/invites/templates/:id/rate
   * @desc    Rate a template
   * @access  Private
   */
  router.post('/:id/rate', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { rating } = req.body;

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
      }

      // Check template exists
      const template = await db.get(
        'SELECT * FROM invite_templates WHERE id = ?',
        [id]
      );

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      // Check if user already rated
      const existingRating = await db.get(
        'SELECT id FROM invite_template_ratings WHERE template_id = ? AND user_id = ?',
        [id, userId]
      );

      if (existingRating) {
        // Update existing rating
        await db.run(
          'UPDATE invite_template_ratings SET rating = ?, created_at = datetime(\'now\') WHERE id = ?',
          [rating, existingRating.id]
        );
      } else {
        // Insert new rating
        await db.run(
          'INSERT INTO invite_template_ratings (id, template_id, user_id, rating, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))',
          [uuidv4(), id, userId, rating]
        );
      }

      // Recalculate average rating
      const stats = await db.get(
        `SELECT AVG(rating) as avg_rating, COUNT(*) as count
         FROM invite_template_ratings WHERE template_id = ?`,
        [id]
      );

      // Update template rating
      await db.run(
        'UPDATE invite_templates SET rating = ?, downloads = downloads + 1 WHERE id = ?',
        [Math.round(stats.avg_rating * 10) / 10, id]
      );

      res.json({
        success: true,
        data: {
          averageRating: Math.round(stats.avg_rating * 10) / 10,
          totalRatings: stats.count
        }
      });

    } catch (error) {
      console.error('Error rating template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to rate template'
      });
    }
  });

  /**
   * @route   POST /api/invites/templates/:id/use
   * @desc    Use template (increment download count)
   * @access  Private
   */
  router.post('/:id/use', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      // Check template exists
      const template = await db.get(
        'SELECT * FROM invite_templates WHERE id = ?',
        [id]
      );

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      // Increment download count
      await db.run(
        'UPDATE invite_templates SET downloads = downloads + 1 WHERE id = ?',
        [id]
      );

      // Fetch updated template
      const updated = await db.get(
        'SELECT * FROM invite_templates WHERE id = ?',
        [id]
      );

      updated.data = JSON.parse(updated.data_json || '{}');
      updated.tags = JSON.parse(updated.tags || '[]');

      res.json({
        success: true,
        data: updated
      });

    } catch (error) {
      console.error('Error using template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to use template'
      });
    }
  });

  /**
   * @route   GET /api/invites/templates/:id/ratings
   * @desc    Get template ratings
   * @access  Public
   */
  router.get('/:id/ratings', async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = 10 } = req.query;

      // Check template exists
      const template = await db.get(
        'SELECT rating, downloads FROM invite_templates WHERE id = ?',
        [id]
      );

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      // Get recent ratings
      const ratings = await db.all(
        `SELECT itr.rating, itr.created_at, u.name as user_name
         FROM invite_template_ratings itr
         LEFT JOIN users u ON itr.user_id = u.id
         WHERE itr.template_id = ?
         ORDER BY itr.created_at DESC
         LIMIT ?`,
        [id, parseInt(limit)]
      );

      // Get distribution
      const distribution = await db.all(
        `SELECT rating, COUNT(*) as count
         FROM invite_template_ratings
         WHERE template_id = ?
         GROUP BY rating
         ORDER BY rating DESC`,
        [id]
      );

      res.json({
        success: true,
        data: {
          averageRating: template.rating,
          totalDownloads: template.downloads,
          recentRatings: ratings,
          distribution: distribution
        }
      });

    } catch (error) {
      console.error('Error fetching template ratings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch template ratings'
      });
    }
  });

  return router;
};

module.exports = createInviteTemplatesRoutes;
