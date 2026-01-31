/**
 * vCard Templates API Routes
 * Comprehensive template management: browse, preview, apply, create, and manage
 * Rate limited: 100 requests/min for public endpoints
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');
const templateService = require('../services/templateService');

/**
 * Helper: Validate query parameters
 */
function validatePaginationParams(limit, offset) {
  const parsedLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const parsedOffset = Math.max(parseInt(offset) || 0, 0);
  return { limit: parsedLimit, offset: parsedOffset };
}

// ============================================================================
// GET /api/templates - List all system + public user templates
// ============================================================================
router.get('/', (req, res) => {
  try {
    const {
      category,
      tags,
      search,
      limit = 20,
      offset = 0,
      sortBy = 'popular'
    } = req.query;

    const { limit: validLimit, offset: validOffset } = validatePaginationParams(limit, offset);

    const result = templateService.listTemplates({
      category,
      tags,
      search,
      limit: validLimit,
      offset: validOffset,
      sortBy,
      includeUserCreated: true
    });

    res.json({
      templates: result.templates,
      total: result.total,
      limit: validLimit,
      offset: validOffset
    });
  } catch (error) {
    console.error('Error listing templates:', error);
    res.status(500).json({ error: 'Failed to list templates' });
  }
});

// ============================================================================
// GET /api/templates/categories - Get all categories with counts
// ============================================================================
router.get('/categories', (req, res) => {
  try {
    const categories = templateService.getTemplateCategories();

    res.json({
      categories
    });
  } catch (error) {
    console.error('Error getting template categories:', error);
    res.status(500).json({ error: 'Failed to get template categories' });
  }
});

// ============================================================================
// GET /api/templates/:id - Get single template with full configuration
// ============================================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const template = await templateService.getTemplateWithConfig(parseInt(id));

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check if template is accessible (system or public)
    if (!template.is_system && !template.is_public) {
      return res.status(403).json({ error: 'Template is private' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error getting template:', error);
    res.status(500).json({ error: 'Failed to get template' });
  }
});

// ============================================================================
// GET /api/templates/:id/preview - Get HTML preview of template
// ============================================================================
router.get('/:id/preview', async (req, res) => {
  try {
    const { id } = req.params;

    const template = await templateService.getTemplateWithConfig(parseInt(id));

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check if template is accessible
    if (!template.is_system && !template.is_public) {
      return res.status(403).json({ error: 'Template is private' });
    }

    const html = templateService.generateTemplatePreview(template);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error generating template preview:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

// ============================================================================
// POST /api/templates/:id/apply - Apply template to user's profile
// ============================================================================
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { profileId, mode = 'replace' } = req.body;
    const userId = req.user.id;

    // Validate mode
    const validModes = ['replace', 'merge', 'theme-only'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({
        error: 'Invalid apply mode',
        validModes
      });
    }

    if (!profileId) {
      return res.status(400).json({ error: 'Profile ID is required' });
    }

    const result = await templateService.applyTemplate(
      parseInt(id),
      parseInt(profileId),
      userId,
      mode
    );

    res.json(result);
  } catch (error) {
    console.error('Error applying template:', error);

    if (error.message.includes('not found') || error.message.includes('permission')) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to apply template' });
  }
});

// ============================================================================
// POST /api/templates/:id/duplicate - Duplicate system template as user template
// ============================================================================
router.post('/:id/duplicate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;
    const userId = req.user.id;

    const duplicated = await templateService.duplicateTemplate(
      parseInt(id),
      userId,
      newName
    );

    res.status(201).json(duplicated);
  } catch (error) {
    console.error('Error duplicating template:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.status(500).json({ error: 'Failed to duplicate template' });
  }
});

// ============================================================================
// POST /api/templates - Create custom template from current profile
// ============================================================================
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      profileId,
      name,
      description,
      category,
      tags,
      isPublic = false
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!profileId || !name || !category) {
      return res.status(400).json({
        error: 'Required fields: profileId, name, category'
      });
    }

    const validCategories = ['Professional', 'Creative', 'Business', 'Hospitality', 'Technical'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    const template = await templateService.createTemplateFromProfile(
      parseInt(profileId),
      userId,
      {
        name,
        description,
        category,
        tags,
        isPublic
      }
    );

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);

    if (error.message.includes('validation failed')) {
      return res.status(400).json({ error: error.message });
    }

    if (error.message.includes('Profile not found')) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to create template' });
  }
});

// ============================================================================
// PUT /api/templates/:id - Update custom template (owner only)
// ============================================================================
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const updated = await templateService.updateTemplate(
      parseInt(id),
      userId,
      updates
    );

    res.json(updated);
  } catch (error) {
    console.error('Error updating template:', error);

    if (error.message.includes('permission') || error.message.includes('not found')) {
      return res.status(403).json({ error: error.message });
    }

    if (error.message.includes('No valid fields')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to update template' });
  }
});

// ============================================================================
// DELETE /api/templates/:id - Delete custom template (owner only)
// ============================================================================
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const success = await templateService.deleteTemplate(parseInt(id), userId);

    if (success) {
      res.json({ success: true, message: 'Template deleted' });
    }
  } catch (error) {
    console.error('Error deleting template:', error);

    if (error.message.includes('permission') || error.message.includes('system templates')) {
      return res.status(403).json({ error: error.message });
    }

    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// ============================================================================
// GET /api/templates/user/my-templates - Get user's custom templates
// ============================================================================
router.get('/user/my-templates', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const { limit: validLimit, offset: validOffset } = validatePaginationParams(limit, offset);

    const stmt = db.prepare(`
      SELECT
        id,
        name,
        description,
        category,
        thumbnail,
        is_public,
        popularity,
        created_at,
        updated_at
      FROM vcard_templates
      WHERE created_by = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);

    const templates = stmt.all(userId, validLimit, validOffset);

    const countStmt = db.prepare(`
      SELECT COUNT(*) as count FROM vcard_templates WHERE created_by = ?
    `);
    const countResult = countStmt.get(userId);

    res.json({
      templates: templates || [],
      total: countResult?.count || 0,
      limit: validLimit,
      offset: validOffset
    });
  } catch (error) {
    console.error('Error getting user templates:', error);
    res.status(500).json({ error: 'Failed to get user templates' });
  }
});

module.exports = router;
