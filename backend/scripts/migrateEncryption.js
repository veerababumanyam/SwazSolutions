#!/usr/bin/env node
/**
 * Data Encryption Migration Script
 *
 * This script migrates existing unencrypted data to encrypted format.
 * Run this once after deploying the encryption feature.
 *
 * Usage: node scripts/migrateEncryption.js
 *
 * IMPORTANT:
 * - Set ENCRYPTION_KEY environment variable before running
 * - Back up your database before running this migration
 * - This script is idempotent - it will skip already-encrypted data
 */

require('dotenv').config();
const encryption = require('../services/encryptionService');

async function migrateEncryption() {
  console.log('========================================');
  console.log('AES-256 Data Encryption Migration');
  console.log('========================================\n');

  // Check if encryption is enabled
  if (!encryption.isEnabled()) {
    console.error('ERROR: ENCRYPTION_KEY environment variable is not set.');
    console.error('Please set ENCRYPTION_KEY in your .env file and try again.');
    process.exit(1);
  }

  console.log('✅ Encryption service initialized\n');

  // Wait for database to be ready
  const db = require('../config/database');
  await db.ready;

  let stats = {
    contactTickets: { total: 0, migrated: 0, skipped: 0, errors: 0 },
    aiInquiries: { total: 0, migrated: 0, skipped: 0, errors: 0 },
    generalInquiries: { total: 0, migrated: 0, skipped: 0, errors: 0 },
    profiles: { total: 0, migrated: 0, skipped: 0, errors: 0 }
  };

  // ========================================
  // Migrate Contact Tickets
  // ========================================
  console.log('Migrating contact_tickets...');

  try {
    const tickets = db.prepare('SELECT * FROM contact_tickets').all();
    stats.contactTickets.total = tickets.length;

    for (const ticket of tickets) {
      try {
        // Skip if already encrypted (check if name starts with encryption prefix)
        if (encryption.isEncrypted(ticket.name)) {
          stats.contactTickets.skipped++;
          continue;
        }

        // Encrypt sensitive fields
        const encryptedName = encryption.encrypt(ticket.name);
        const encryptedEmail = encryption.encrypt(ticket.email);
        const encryptedPhone = encryption.encrypt(ticket.phone);
        const encryptedSymptoms = encryption.encrypt(ticket.symptoms);
        const emailHash = encryption.hashForSearch(ticket.email);

        db.prepare(`
          UPDATE contact_tickets
          SET name = ?, email = ?, email_hash = ?, phone = ?, symptoms = ?
          WHERE id = ?
        `).run(encryptedName, encryptedEmail, emailHash, encryptedPhone, encryptedSymptoms, ticket.id);

        stats.contactTickets.migrated++;
      } catch (err) {
        console.error(`  Error migrating ticket ${ticket.id}:`, err.message);
        stats.contactTickets.errors++;
      }
    }
  } catch (err) {
    console.error('Error reading contact_tickets:', err.message);
  }

  console.log(`  Total: ${stats.contactTickets.total}, Migrated: ${stats.contactTickets.migrated}, Skipped: ${stats.contactTickets.skipped}, Errors: ${stats.contactTickets.errors}\n`);

  // ========================================
  // Migrate Agentic AI Inquiries
  // ========================================
  console.log('Migrating agentic_ai_inquiries...');

  try {
    const inquiries = db.prepare('SELECT * FROM agentic_ai_inquiries').all();
    stats.aiInquiries.total = inquiries.length;

    for (const inquiry of inquiries) {
      try {
        // Skip if already encrypted
        if (encryption.isEncrypted(inquiry.name)) {
          stats.aiInquiries.skipped++;
          continue;
        }

        // Encrypt sensitive fields
        const encryptedName = encryption.encrypt(inquiry.name);
        const encryptedEmail = encryption.encrypt(inquiry.email);
        const encryptedPhone = encryption.encrypt(inquiry.phone);
        const encryptedCompany = encryption.encrypt(inquiry.company);
        const encryptedDescription = encryption.encrypt(inquiry.project_description);
        const encryptedRequirements = inquiry.project_requirements
          ? encryption.encrypt(inquiry.project_requirements)
          : null;
        const emailHash = encryption.hashForSearch(inquiry.email);

        db.prepare(`
          UPDATE agentic_ai_inquiries
          SET name = ?, email = ?, email_hash = ?, phone = ?, company = ?,
              project_description = ?, project_requirements = ?
          WHERE id = ?
        `).run(
          encryptedName, encryptedEmail, emailHash, encryptedPhone, encryptedCompany,
          encryptedDescription, encryptedRequirements, inquiry.id
        );

        stats.aiInquiries.migrated++;
      } catch (err) {
        console.error(`  Error migrating AI inquiry ${inquiry.id}:`, err.message);
        stats.aiInquiries.errors++;
      }
    }
  } catch (err) {
    console.error('Error reading agentic_ai_inquiries:', err.message);
  }

  console.log(`  Total: ${stats.aiInquiries.total}, Migrated: ${stats.aiInquiries.migrated}, Skipped: ${stats.aiInquiries.skipped}, Errors: ${stats.aiInquiries.errors}\n`);

  // ========================================
  // Migrate General Inquiries
  // ========================================
  console.log('Migrating general_inquiries...');

  try {
    const generalInquiries = db.prepare('SELECT * FROM general_inquiries').all();
    stats.generalInquiries.total = generalInquiries.length;

    for (const inquiry of generalInquiries) {
      try {
        // Skip if already encrypted
        if (encryption.isEncrypted(inquiry.name)) {
          stats.generalInquiries.skipped++;
          continue;
        }

        // Encrypt sensitive fields
        const encryptedName = encryption.encrypt(inquiry.name);
        const encryptedEmail = encryption.encrypt(inquiry.email);
        const encryptedSubject = encryption.encrypt(inquiry.subject);
        const encryptedMessage = encryption.encrypt(inquiry.message);
        const emailHash = encryption.hashForSearch(inquiry.email);

        db.prepare(`
          UPDATE general_inquiries
          SET name = ?, email = ?, email_hash = ?, subject = ?, message = ?
          WHERE id = ?
        `).run(encryptedName, encryptedEmail, emailHash, encryptedSubject, encryptedMessage, inquiry.id);

        stats.generalInquiries.migrated++;
      } catch (err) {
        console.error(`  Error migrating general inquiry ${inquiry.id}:`, err.message);
        stats.generalInquiries.errors++;
      }
    }
  } catch (err) {
    console.error('Error reading general_inquiries:', err.message);
  }

  console.log(`  Total: ${stats.generalInquiries.total}, Migrated: ${stats.generalInquiries.migrated}, Skipped: ${stats.generalInquiries.skipped}, Errors: ${stats.generalInquiries.errors}\n`);

  // ========================================
  // Migrate Profile Sensitive Fields
  // ========================================
  console.log('Migrating profiles...');

  const profileFields = [
    'public_email', 'public_phone',
    'company_email', 'company_phone',
    'address_line1', 'address_line2', 'address_city', 'address_state', 'address_postal_code', 'address_country',
    'company_address_line1', 'company_address_line2', 'company_address_city', 'company_address_state', 'company_address_postal_code', 'company_address_country'
  ];

  try {
    const profiles = db.prepare('SELECT * FROM profiles').all();
    stats.profiles.total = profiles.length;

    for (const profile of profiles) {
      try {
        // Check if any field is already encrypted (use public_email as indicator)
        if (profile.public_email && encryption.isEncrypted(profile.public_email)) {
          stats.profiles.skipped++;
          continue;
        }

        // Build update query dynamically for non-null fields
        const updates = [];
        const values = [];

        for (const field of profileFields) {
          if (profile[field]) {
            updates.push(`${field} = ?`);
            values.push(encryption.encrypt(profile[field]));
          }
        }

        if (updates.length > 0) {
          values.push(profile.id);
          db.prepare(`UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`).run(...values);
          stats.profiles.migrated++;
        } else {
          stats.profiles.skipped++;
        }
      } catch (err) {
        console.error(`  Error migrating profile ${profile.id}:`, err.message);
        stats.profiles.errors++;
      }
    }
  } catch (err) {
    console.error('Error reading profiles:', err.message);
  }

  console.log(`  Total: ${stats.profiles.total}, Migrated: ${stats.profiles.migrated}, Skipped: ${stats.profiles.skipped}, Errors: ${stats.profiles.errors}\n`);

  // ========================================
  // Summary
  // ========================================
  console.log('========================================');
  console.log('Migration Complete!');
  console.log('========================================');
  console.log(`Contact Tickets:    ${stats.contactTickets.migrated}/${stats.contactTickets.total} migrated`);
  console.log(`AI Inquiries:       ${stats.aiInquiries.migrated}/${stats.aiInquiries.total} migrated`);
  console.log(`General Inquiries:  ${stats.generalInquiries.migrated}/${stats.generalInquiries.total} migrated`);
  console.log(`Profiles:           ${stats.profiles.migrated}/${stats.profiles.total} migrated`);

  const totalErrors = stats.contactTickets.errors + stats.aiInquiries.errors +
                      stats.generalInquiries.errors + stats.profiles.errors;

  if (totalErrors > 0) {
    console.log(`\n⚠️  ${totalErrors} errors occurred during migration. Check logs above.`);
    process.exit(1);
  } else {
    console.log('\n✅ All data migrated successfully!');
    process.exit(0);
  }
}

// Run the migration
migrateEncryption().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
