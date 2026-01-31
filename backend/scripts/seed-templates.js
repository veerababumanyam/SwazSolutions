/**
 * Template Seeding Script
 * Initializes system templates and generates thumbnails
 * Run: node backend/scripts/seed-templates.js
 */

const db = require('../config/database');
const { SYSTEM_TEMPLATES, seedSystemTemplates } = require('../data/template-definitions');
const { generateThumbnailsForAll } = require('../services/templateThumbnailService');

async function seedAllTemplates() {
  try {
    // Wait for database to be ready
    await db.ready;

    console.log('\n========================================');
    console.log('  Template Seeding Process');
    console.log('========================================\n');

    // Phase 1: Seed templates
    console.log('Phase 1: Seeding system templates...\n');
    const seedResults = await seedSystemTemplates(db);

    console.log(`\nResults:`);
    console.log(`  ✓ Successful: ${seedResults.successful}`);
    console.log(`  ✗ Failed: ${seedResults.failed}`);

    if (seedResults.errors.length > 0) {
      console.log('\nErrors:');
      seedResults.errors.forEach(err => console.log(`  - ${err}`));
    }

    // Phase 2: Generate thumbnails
    console.log('\n\nPhase 2: Generating thumbnails...\n');
    const thumbnailResults = await generateThumbnailsForAll(db, SYSTEM_TEMPLATES);

    console.log(`\nResults:`);
    console.log(`  ✓ Successful: ${thumbnailResults.successful}`);
    console.log(`  ✗ Failed: ${thumbnailResults.failed}`);

    // Summary
    console.log('\n========================================');
    console.log('  Seeding Complete!');
    console.log('========================================\n');

    console.log('Summary:');
    console.log(`  • Templates seeded: ${seedResults.successful}/${SYSTEM_TEMPLATES.length}`);
    console.log(`  • Thumbnails generated: ${thumbnailResults.successful}`);
    console.log('\nYour template system is ready to use!');
    console.log('Access templates at: GET /api/templates\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run seeding
seedAllTemplates();
