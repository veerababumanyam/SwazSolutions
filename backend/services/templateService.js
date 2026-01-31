/**
 * Template Service
 * Handles vCard template operations: fetching, validating, applying, and creating
 * Type-safe service with comprehensive error handling
 */

const db = require('../config/database');

/**
 * Validate template configuration structure
 * @param {object} template - Template object to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validateTemplate(template) {
  const errors = [];

  // Validate required fields
  if (!template.name || typeof template.name !== 'string' || template.name.trim().length === 0) {
    errors.push('Template name is required');
  }

  if (!template.category || typeof template.category !== 'string') {
    errors.push('Template category is required');
  }

  const validCategories = ['Professional', 'Creative', 'Business', 'Hospitality', 'Technical'];
  if (template.category && !validCategories.includes(template.category)) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}`);
  }

  // Validate theme config
  if (!template.theme_config) {
    errors.push('Theme config is required');
  } else if (typeof template.theme_config === 'string') {
    try {
      const theme = JSON.parse(template.theme_config);
      if (!theme.colors || !theme.typography || !theme.layout) {
        errors.push('Theme config must have colors, typography, and layout properties');
      }
    } catch (e) {
      errors.push('Theme config must be valid JSON');
    }
  }

  // Validate blocks config
  if (!template.blocks_config) {
    errors.push('Blocks config is required');
  } else if (typeof template.blocks_config === 'string') {
    try {
      const blocks = JSON.parse(template.blocks_config);
      if (!Array.isArray(blocks)) {
        errors.push('Blocks config must be an array');
      }
    } catch (e) {
      errors.push('Blocks config must be valid JSON');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get template with full configuration (resolved from JSON)
 * @param {number} templateId - Template ID
 * @returns {Promise<object|null>} Complete template object or null
 */
async function getTemplateWithConfig(templateId) {
  try {
    const stmt = db.prepare(`
      SELECT
        id,
        name,
        description,
        category,
        thumbnail,
        theme_config,
        blocks_config,
        social_profiles_config,
        is_system,
        is_ai_generated,
        tags,
        popularity,
        created_by,
        is_public,
        created_at,
        updated_at
      FROM vcard_templates
      WHERE id = ?
    `);

    const template = stmt.get(templateId);

    if (!template) {
      return null;
    }

    // Parse JSON configurations
    return {
      ...template,
      theme_config: typeof template.theme_config === 'string' ? JSON.parse(template.theme_config) : template.theme_config,
      blocks_config: typeof template.blocks_config === 'string' ? JSON.parse(template.blocks_config) : template.blocks_config,
      social_profiles_config: template.social_profiles_config ? (typeof template.social_profiles_config === 'string' ? JSON.parse(template.social_profiles_config) : template.social_profiles_config) : null
    };
  } catch (error) {
    console.error('Error getting template with config:', error);
    throw error;
  }
}

/**
 * List templates with filtering and pagination
 * @param {object} options - Query options
 * @returns {Promise<object>} { templates: [], total: number }
 */
async function listTemplates(options = {}) {
  try {
    const {
      category = null,
      tags = null,
      search = null,
      limit = 20,
      offset = 0,
      sortBy = 'popular',
      includeUserCreated = true
    } = options;

    // Build query
    let query = `
      SELECT
        id,
        name,
        description,
        category,
        thumbnail,
        is_system,
        is_ai_generated,
        tags,
        popularity,
        created_by,
        is_public,
        created_at
      FROM vcard_templates
      WHERE 1=1
    `;

    const params = [];

    // Filter by system templates or public user templates
    if (includeUserCreated) {
      query += ` AND (is_system = 1 OR is_public = 1)`;
    } else {
      query += ` AND is_system = 1`;
    }

    // Filter by category
    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }

    // Filter by tags (comma-separated search)
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim().toLowerCase());
      const tagConditions = tagArray.map(() => `tags LIKE ?`).join(' OR ');
      query += ` AND (${tagConditions})`;
      params.push(...tagArray.map(tag => `%${tag}%`));
    }

    // Search by name or description
    if (search) {
      query += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Count total
    const countStmt = db.prepare(query);
    const countResult = db.prepare(`SELECT COUNT(*) as count FROM (${query})`).get(...params);
    const total = countResult?.count || 0;

    // Add sorting
    switch (sortBy) {
      case 'popular':
        query += ` ORDER BY popularity DESC, created_at DESC`;
        break;
      case 'newest':
        query += ` ORDER BY created_at DESC`;
        break;
      case 'oldest':
        query += ` ORDER BY created_at ASC`;
        break;
      case 'name':
        query += ` ORDER BY name ASC`;
        break;
      default:
        query += ` ORDER BY popularity DESC`;
    }

    // Add limit and offset
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute query
    const stmt = db.prepare(query);
    const templates = stmt.all(...params);

    return {
      templates: templates || [],
      total
    };
  } catch (error) {
    console.error('Error listing templates:', error);
    throw error;
  }
}

/**
 * Get all template categories with counts
 * @returns {Promise<Array>} Array of { category, count }
 */
async function getTemplateCategories() {
  try {
    const stmt = db.prepare(`
      SELECT
        category,
        COUNT(*) as count
      FROM vcard_templates
      WHERE is_system = 1 OR is_public = 1
      GROUP BY category
      ORDER BY count DESC
    `);

    return stmt.all() || [];
  } catch (error) {
    console.error('Error getting template categories:', error);
    throw error;
  }
}

/**
 * Create user template from existing profile
 * @param {number} profileId - Profile to template from
 * @param {number} userId - User creating template
 * @param {object} templateData - { name, description, category, tags, isPublic }
 * @returns {Promise<object>} Created template
 */
async function createTemplateFromProfile(profileId, userId, templateData) {
  try {
    // Get profile with appearance settings
    const profile = db.prepare(`
      SELECT p.*, pa.appearance_settings
      FROM profiles p
      LEFT JOIN profile_appearance pa ON p.id = pa.profile_id
      WHERE p.id = ? AND p.user_id = ?
    `).get(profileId, userId);

    if (!profile) {
      throw new Error('Profile not found or you do not have permission');
    }

    const appearanceSettings = profile.appearance_settings ? JSON.parse(profile.appearance_settings) : {};

    // Extract theme from appearance
    const theme_config = {
      colors: appearanceSettings.theme?.colors || { primary: '#3B82F6', background: '#FFFFFF' },
      typography: appearanceSettings.theme?.typography || { fontFamily: 'Inter', headingSize: 32 },
      layout: appearanceSettings.theme?.layout || { style: 'modern', spacing: 'comfortable' },
      avatar: appearanceSettings.theme?.avatar || 'circular',
      headerBackground: appearanceSettings.theme?.headerBackground || 'solid'
    };

    // Extract blocks from profile links
    const blocks = [];
    const links = db.prepare(`
      SELECT * FROM link_items WHERE profile_id = ?
    `).all(profileId);

    for (const link of links) {
      blocks.push({
        id: `block-${link.id}`,
        type: link.type,
        title: link.title,
        url: link.url,
        displayOrder: link.display_order,
        metadata: link.metadata ? JSON.parse(link.metadata) : {}
      });
    }

    // Get social profiles
    const socials = db.prepare(`
      SELECT * FROM social_profiles WHERE profile_id = ?
    `).all(profileId);

    const social_profiles_config = socials.map(s => ({
      id: `social-${s.id}`,
      platform: s.platform_name,
      url: s.platform_url,
      displayOrder: s.display_order
    }));

    // Validate template data
    const validation = validateTemplate({
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      theme_config,
      blocks_config: blocks
    });

    if (!validation.valid) {
      throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
    }

    // Insert template
    const stmt = db.prepare(`
      INSERT INTO vcard_templates (
        name,
        description,
        category,
        thumbnail,
        theme_config,
        blocks_config,
        social_profiles_config,
        is_system,
        is_ai_generated,
        tags,
        created_by,
        is_public,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const result = stmt.run(
      templateData.name,
      templateData.description || null,
      templateData.category,
      null, // thumbnail generated separately
      JSON.stringify(theme_config),
      JSON.stringify(blocks),
      JSON.stringify(social_profiles_config),
      0, // is_system = false
      0, // is_ai_generated = false
      templateData.tags || null,
      userId,
      templateData.isPublic ? 1 : 0
    );

    return getTemplateWithConfig(result.lastInsertRowid);
  } catch (error) {
    console.error('Error creating template from profile:', error);
    throw error;
  }
}

/**
 * Apply template to profile
 * @param {number} templateId - Template to apply
 * @param {number} profileId - Target profile
 * @param {number} userId - User applying template (for permissions)
 * @param {string} mode - 'replace' | 'merge' | 'theme-only'
 * @param {object} options - Additional options
 * @returns {Promise<object>} { success, appliedTemplate, changes }
 */
async function applyTemplate(templateId, profileId, userId, mode = 'replace', options = {}) {
  try {
    // Verify profile ownership
    const profile = db.prepare(`
      SELECT * FROM profiles WHERE id = ? AND user_id = ?
    `).get(profileId, userId);

    if (!profile) {
      throw new Error('Profile not found or you do not have permission');
    }

    // Get template
    const template = await getTemplateWithConfig(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const changes = {
      appliedAt: new Date().toISOString(),
      mode,
      previousState: {},
      newState: {}
    };

    // Apply based on mode
    if (mode === 'replace') {
      // Get current blocks for backup
      const currentBlocks = db.prepare(`
        SELECT * FROM link_items WHERE profile_id = ?
      `).all(profileId);
      changes.previousState.blocks = currentBlocks;

      // Delete existing blocks
      db.prepare('DELETE FROM link_items WHERE profile_id = ?').run(profileId);

      // Insert new blocks from template
      const templateBlocks = template.blocks_config || [];
      for (let i = 0; i < templateBlocks.length; i++) {
        const block = templateBlocks[i];
        db.prepare(`
          INSERT INTO link_items (
            profile_id,
            type,
            title,
            url,
            display_order,
            metadata,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).run(
          profileId,
          block.type,
          block.title,
          block.url || null,
          block.displayOrder || i,
          block.metadata ? JSON.stringify(block.metadata) : null
        );
      }

      changes.newState.blocks = templateBlocks;
    } else if (mode === 'merge') {
      // Add new block types from template that don't exist
      const existingTypes = new Set(
        db.prepare('SELECT DISTINCT type FROM link_items WHERE profile_id = ?')
          .all(profileId)
          .map(r => r.type)
      );

      const templateBlocks = template.blocks_config || [];
      const newBlocks = [];

      for (let i = 0; i < templateBlocks.length; i++) {
        const block = templateBlocks[i];
        if (!existingTypes.has(block.type)) {
          const maxOrder = db.prepare(
            'SELECT MAX(display_order) as max_order FROM link_items WHERE profile_id = ?'
          ).get(profileId);
          const nextOrder = (maxOrder?.max_order || 0) + 1;

          db.prepare(`
            INSERT INTO link_items (
              profile_id,
              type,
              title,
              url,
              display_order,
              metadata,
              created_at,
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `).run(
            profileId,
            block.type,
            block.title,
            block.url || null,
            nextOrder,
            block.metadata ? JSON.stringify(block.metadata) : null
          );

          newBlocks.push(block);
        }
      }

      changes.newState.blocksAdded = newBlocks;
    }

    // Apply theme in all modes except theme-only (which only applies theme)
    // Update theme for the profile
    const themeConfig = template.theme_config;
    const existingTheme = db.prepare(
      'SELECT id FROM themes WHERE profile_id = ? AND is_active = 1'
    ).get(profileId);

    if (existingTheme) {
      db.prepare(`
        UPDATE themes
        SET
          colors = ?,
          typography = ?,
          layout = ?,
          avatar = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        JSON.stringify(themeConfig.colors),
        JSON.stringify(themeConfig.typography),
        JSON.stringify(themeConfig.layout),
        themeConfig.avatar || 'circular',
        existingTheme.id
      );
    } else {
      db.prepare(`
        INSERT INTO themes (
          profile_id,
          name,
          colors,
          typography,
          layout,
          avatar,
          is_system,
          is_active,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        profileId,
        template.name,
        JSON.stringify(themeConfig.colors),
        JSON.stringify(themeConfig.typography),
        JSON.stringify(themeConfig.layout),
        themeConfig.avatar || 'circular',
        0,
        1
      );
    }

    changes.newState.theme = themeConfig;

    // Record template usage
    db.prepare(`
      INSERT INTO template_usage (
        template_id,
        profile_id,
        applied_at,
        apply_mode
      ) VALUES (?, ?, datetime('now'), ?)
    `).run(templateId, profileId, mode);

    // Increment template popularity
    db.prepare('UPDATE vcard_templates SET popularity = popularity + 1 WHERE id = ?')
      .run(templateId);

    return {
      success: true,
      appliedTemplate: template,
      changes
    };
  } catch (error) {
    console.error('Error applying template:', error);
    throw error;
  }
}

/**
 * Duplicate system template as user template
 * @param {number} templateId - Template to duplicate
 * @param {number} userId - User creating the copy
 * @param {string} newName - New template name
 * @returns {Promise<object>} New template
 */
async function duplicateTemplate(templateId, userId, newName) {
  try {
    const template = await getTemplateWithConfig(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Insert new template as user-created copy
    const stmt = db.prepare(`
      INSERT INTO vcard_templates (
        name,
        description,
        category,
        thumbnail,
        theme_config,
        blocks_config,
        social_profiles_config,
        is_system,
        is_ai_generated,
        tags,
        created_by,
        is_public,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const result = stmt.run(
      newName || `${template.name} (Copy)`,
      template.description,
      template.category,
      template.thumbnail,
      JSON.stringify(template.theme_config),
      JSON.stringify(template.blocks_config),
      template.social_profiles_config ? JSON.stringify(template.social_profiles_config) : null,
      0, // is_system = false
      template.is_ai_generated,
      template.tags,
      userId,
      0 // is_public = false by default
    );

    return getTemplateWithConfig(result.lastInsertRowid);
  } catch (error) {
    console.error('Error duplicating template:', error);
    throw error;
  }
}

/**
 * Update user template
 * @param {number} templateId - Template to update
 * @param {number} userId - User updating (must be owner)
 * @param {object} updates - Partial template object
 * @returns {Promise<object>} Updated template
 */
async function updateTemplate(templateId, userId, updates) {
  try {
    // Verify ownership
    const template = db.prepare(`
      SELECT * FROM vcard_templates WHERE id = ? AND created_by = ?
    `).get(templateId, userId);

    if (!template) {
      throw new Error('Template not found or you do not have permission');
    }

    // Build update query
    const allowedFields = ['name', 'description', 'category', 'tags', 'is_public'];
    const updateParts = [];
    const params = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateParts.push(`${field} = ?`);
        params.push(updates[field]);
      }
    }

    // Handle JSON fields separately (don't allow updates to theme/blocks)
    if (updateParts.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateParts.push('updated_at = datetime("now")');
    params.push(templateId);

    const stmt = db.prepare(`
      UPDATE vcard_templates
      SET ${updateParts.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...params);

    return getTemplateWithConfig(templateId);
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
}

/**
 * Delete user template
 * @param {number} templateId - Template to delete
 * @param {number} userId - User deleting (must be owner)
 * @returns {Promise<boolean>} true if deleted
 */
async function deleteTemplate(templateId, userId) {
  try {
    // Verify ownership and prevent deletion of system templates
    const template = db.prepare(`
      SELECT * FROM vcard_templates WHERE id = ? AND created_by = ? AND is_system = 0
    `).get(templateId, userId);

    if (!template) {
      throw new Error('Template not found, you do not have permission, or cannot delete system templates');
    }

    db.prepare('DELETE FROM vcard_templates WHERE id = ?').run(templateId);

    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}

/**
 * Generate HTML preview of template
 * @param {object} template - Template with config
 * @returns {string} HTML string for preview
 */
function generateTemplatePreview(template) {
  if (!template) return '<div>Template not found</div>';

  const theme = template.theme_config;
  const blocks = template.blocks_config || [];
  const socials = template.social_profiles_config || [];

  const primaryColor = theme.colors?.primary || '#3B82F6';
  const bgColor = theme.colors?.background || '#FFFFFF';
  const textColor = theme.colors?.text || '#000000';

  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.name} - Template Preview</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          background: ${bgColor};
          color: ${textColor};
          font-family: ${theme.typography?.fontFamily || 'Inter'}, sans-serif;
          padding: 20px;
        }
        .preview-container {
          max-width: 400px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .header {
          background: ${primaryColor};
          padding: 40px 20px;
          text-align: center;
          color: white;
        }
        .header h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        .content {
          padding: 20px;
        }
        .block {
          margin-bottom: 15px;
          padding: 12px;
          background: ${theme.colors?.blockBg || '#F3F4F6'};
          border-radius: ${theme.layout?.borderRadius || 8}px;
          border-left: 4px solid ${primaryColor};
        }
        .block-title {
          font-weight: 600;
          color: ${primaryColor};
          margin-bottom: 5px;
        }
        .block-content {
          font-size: 14px;
          color: ${textColor};
        }
        .social-links {
          display: flex;
          gap: 10px;
          margin-top: 15px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .social-link {
          display: inline-block;
          width: 40px;
          height: 40px;
          background: ${primaryColor};
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <div class="header">
          <h1>Template Preview</h1>
          <p>${template.name}</p>
        </div>
        <div class="content">
  `;

  // Add blocks
  for (const block of blocks.slice(0, 3)) {
    html += `
      <div class="block">
        <div class="block-title">${block.title || block.type}</div>
        <div class="block-content">${block.url ? `<a href="${block.url}">${block.url}</a>` : block.type}</div>
      </div>
    `;
  }

  // Add social links
  if (socials.length > 0) {
    html += '<div class="social-links">';
    for (const social of socials.slice(0, 5)) {
      const initials = social.platform.substring(0, 2).toUpperCase();
      html += `<div class="social-link" title="${social.platform}">${initials}</div>`;
    }
    html += '</div>';
  }

  html += `
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}

module.exports = {
  validateTemplate,
  getTemplateWithConfig,
  listTemplates,
  getTemplateCategories,
  createTemplateFromProfile,
  applyTemplate,
  duplicateTemplate,
  updateTemplate,
  deleteTemplate,
  generateTemplatePreview
};
