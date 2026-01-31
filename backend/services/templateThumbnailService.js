/**
 * Template Thumbnail Service
 * Generates visual preview thumbnails for vCard templates
 * Creates SVG-based thumbnails showing theme colors and sample blocks
 */

const fs = require('fs');
const path = require('path');

// Ensure thumbnails directory exists
const THUMBNAILS_DIR = path.join(__dirname, '../public/thumbnails');
if (!fs.existsSync(THUMBNAILS_DIR)) {
  fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
}

/**
 * Generate SVG thumbnail for template
 * Shows theme colors, sample blocks, and category visual
 * @param {object} template - Template with config
 * @returns {string} SVG code
 */
function generateSVGThumbnail(template) {
  if (!template) return '';

  const theme = template.theme_config || {};
  const blocks = template.blocks_config || [];
  const colors = theme.colors || {};

  const primaryColor = colors.primary || '#3B82F6';
  const secondaryColor = colors.secondary || '#10B981';
  const backgroundColor = colors.background || '#FFFFFF';
  const textColor = colors.text || '#000000';

  // SVG dimensions
  const width = 300;
  const height = 400;

  // Generate color swatches from theme blocks
  const blockColors = blocks.slice(0, 3).map((block, idx) => {
    const hue = (360 / blocks.length) * idx;
    return `hsl(${hue}, 70%, 60%)`;
  });

  // Generate SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${backgroundColor}"/>

  <!-- Header Section -->
  <defs>
    <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
    </linearGradient>
  </defs>

  <rect width="${width}" height="100" fill="url(#headerGradient)"/>

  <!-- Header Text -->
  <text x="${width / 2}" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold"
        fill="white" text-anchor="middle">${template.name.substring(0, 20)}</text>
  <text x="${width / 2}" y="70" font-family="Arial, sans-serif" font-size="11"
        fill="white" opacity="0.8" text-anchor="middle">${template.category}</text>

  <!-- Content Section -->
  <g id="content">
`;

  // Add sample blocks as colored rectangles
  let yPos = 120;
  const blockHeight = 50;
  const blockPadding = 10;

  blocks.slice(0, 4).forEach((block, idx) => {
    const blockColor = blockColors[idx % blockColors.length] || primaryColor;
    const x = 20;
    const y = yPos + (idx * (blockHeight + blockPadding));

    // Block background
    svg += `
    <rect x="${x}" y="${y}" width="${width - 40}" height="${blockHeight}"
          fill="${blockColor}" opacity="0.15" rx="6"/>

    <!-- Block accent line -->
    <rect x="${x}" y="${y}" width="4" height="${blockHeight}"
          fill="${blockColor}" rx="2"/>

    <!-- Block text -->
    <text x="${x + 20}" y="${y + 22}" font-family="Arial, sans-serif" font-size="12"
          font-weight="600" fill="${textColor}">${block.title.substring(0, 22)}</text>
    <text x="${x + 20}" y="${y + 38}" font-family="Arial, sans-serif" font-size="10"
          fill="${textColor}" opacity="0.6">${block.type}</text>
`;
  });

  // Add color palette at bottom
  svg += `
  <!-- Color Palette -->
  <g id="palette" transform="translate(20, 350)">
`;

  const paletteColors = [
    primaryColor,
    secondaryColor,
    colors.accent || '#FFA500',
    colors.blockBg || '#F3F4F6'
  ];

  paletteColors.forEach((color, idx) => {
    const x = idx * 60;
    svg += `
    <circle cx="${x + 20}" cy="10" r="8" fill="${color}" stroke="${textColor}" stroke-width="1"/>
    <rect x="${x}" y="25" width="40" height="2" fill="${color}"/>
`;
  });

  svg += `
  </g>
  </g>
</svg>`;

  return svg;
}

/**
 * Generate and save thumbnail for template
 * @param {object} template - Template with config
 * @param {number} templateId - Template ID
 * @returns {Promise<string>} URL to thumbnail
 */
async function generateThumbnail(template, templateId) {
  try {
    if (!template || !template.name) {
      throw new Error('Invalid template object');
    }

    // Generate SVG
    const svg = generateSVGThumbnail(template);

    if (!svg) {
      throw new Error('Failed to generate SVG');
    }

    // Create filename from template ID and name
    const sanitizedName = template.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const filename = `template-${templateId}-${sanitizedName}.svg`;
    const filepath = path.join(THUMBNAILS_DIR, filename);

    // Write SVG file
    fs.writeFileSync(filepath, svg, 'utf8');

    // Return relative URL
    const url = `/thumbnails/${filename}`;

    console.log(`✓ Generated thumbnail for template "${template.name}" at ${url}`);

    return url;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    // Return placeholder URL on error
    return '/thumbnails/placeholder.svg';
  }
}

/**
 * Generate thumbnails for all system templates
 * Useful for seeding process
 * @param {object} db - Database instance
 * @param {Array} templates - Template definitions
 * @returns {Promise<object>} { successful: number, failed: number }
 */
async function generateThumbnailsForAll(db, templates) {
  const results = {
    successful: 0,
    failed: 0
  };

  try {
    console.log(`Generating thumbnails for ${templates.length} templates...`);

    for (const templateDef of templates) {
      try {
        // Get template from database
        const template = db.prepare(
          'SELECT * FROM vcard_templates WHERE name = ? AND is_system = 1'
        ).get(templateDef.name);

        if (!template) {
          console.warn(`Template "${templateDef.name}" not found in database, skipping...`);
          continue;
        }

        // Parse configs
        const config = {
          name: template.name,
          category: template.category,
          theme_config: typeof template.theme_config === 'string'
            ? JSON.parse(template.theme_config)
            : template.theme_config,
          blocks_config: typeof template.blocks_config === 'string'
            ? JSON.parse(template.blocks_config)
            : template.blocks_config
        };

        // Generate and save thumbnail
        const thumbnailUrl = await generateThumbnail(config, template.id);

        // Update template record with thumbnail URL
        db.prepare('UPDATE vcard_templates SET thumbnail = ? WHERE id = ?')
          .run(thumbnailUrl, template.id);

        console.log(`✓ Generated thumbnail for "${template.name}"`);
        results.successful++;
      } catch (error) {
        console.error(`Failed to generate thumbnail for "${templateDef.name}":`, error.message);
        results.failed++;
      }
    }

    console.log(`✅ Thumbnail generation complete: ${results.successful} successful, ${results.failed} failed`);
    return results;
  } catch (error) {
    console.error('Error during thumbnail generation:', error);
    throw error;
  }
}

/**
 * Create placeholder thumbnail SVG
 * Used as fallback when generation fails
 * @returns {string} SVG code
 */
function createPlaceholderSVG() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="400" fill="#F3F4F6"/>
  <rect width="300" height="100" fill="#E5E7EB"/>
  <circle cx="150" cy="50" r="30" fill="#D1D5DB"/>
  <rect x="20" y="130" width="260" height="40" fill="#E5E7EB" rx="4"/>
  <rect x="20" y="180" width="260" height="40" fill="#E5E7EB" rx="4"/>
  <rect x="20" y="230" width="260" height="40" fill="#E5E7EB" rx="4"/>
  <text x="150" y="350" font-family="Arial" font-size="14" fill="#9CA3AF" text-anchor="middle">
    No Preview Available
  </text>
</svg>`;
}

/**
 * Initialize placeholder thumbnail if not exists
 * Called during app startup
 */
function initializePlaceholder() {
  try {
    const placeholderPath = path.join(THUMBNAILS_DIR, 'placeholder.svg');

    if (!fs.existsSync(placeholderPath)) {
      const svg = createPlaceholderSVG();
      fs.writeFileSync(placeholderPath, svg, 'utf8');
      console.log('✓ Created placeholder thumbnail');
    }
  } catch (error) {
    console.error('Failed to initialize placeholder thumbnail:', error);
  }
}

// Initialize placeholder on module load
initializePlaceholder();

module.exports = {
  generateSVGThumbnail,
  generateThumbnail,
  generateThumbnailsForAll,
  createPlaceholderSVG,
  initializePlaceholder,
  THUMBNAILS_DIR
};
