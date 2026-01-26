/**
 * Test helper module providing:
 * - In-memory SQLite database with the same schema as production
 * - Mock authentication middleware
 * - Express app builder for supertest
 *
 * Usage in test files:
 *   const { createTestApp, createTestDb, mockAuth } = require('../__tests__/testHelper.cjs');
 */

const initSqlJs = require('sql.js');
const express = require('express');

// ---------------------------------------------------------------
// Database helper: creates a fresh in-memory SQLite instance that
// exposes the same wrapper API as backend/config/database.js
// ---------------------------------------------------------------

async function createTestDb() {
  const SQL = await initSqlJs();
  const rawDb = new SQL.Database();

  // Create the tables needed by the modules under test
  rawDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT,
      role TEXT DEFAULT 'user',
      google_id TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      avatar_url TEXT,
      headline TEXT,
      company TEXT,
      bio TEXT,
      public_email TEXT,
      public_phone TEXT,
      website TEXT,
      show_email INTEGER DEFAULT 1,
      show_phone INTEGER DEFAULT 1,
      show_website INTEGER DEFAULT 1,
      show_company_email INTEGER DEFAULT 1,
      show_company_phone INTEGER DEFAULT 1,
      company_email TEXT,
      company_phone TEXT,
      address_line1 TEXT,
      address_line2 TEXT,
      address_city TEXT,
      address_state TEXT,
      address_postal_code TEXT,
      address_country TEXT,
      show_address_line1 INTEGER DEFAULT 1,
      show_address_line2 INTEGER DEFAULT 1,
      show_address_city INTEGER DEFAULT 1,
      show_address_state INTEGER DEFAULT 1,
      show_address_postal_code INTEGER DEFAULT 1,
      show_address_country INTEGER DEFAULT 1,
      company_address_line1 TEXT,
      company_address_line2 TEXT,
      company_address_city TEXT,
      company_address_state TEXT,
      company_address_postal_code TEXT,
      company_address_country TEXT,
      show_company_address_line1 INTEGER DEFAULT 1,
      show_company_address_line2 INTEGER DEFAULT 1,
      show_company_address_city INTEGER DEFAULT 1,
      show_company_address_state INTEGER DEFAULT 1,
      show_company_address_postal_code INTEGER DEFAULT 1,
      show_company_address_country INTEGER DEFAULT 1,
      published INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS link_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('CLASSIC', 'GALLERY', 'VIDEO_EMBED', 'HEADER', 'BOOKING', 'VIDEO_UPLOAD')),
      title TEXT NOT NULL,
      url TEXT,
      thumbnail TEXT,
      is_active INTEGER DEFAULT 1,
      clicks INTEGER DEFAULT 0,
      platform TEXT,
      layout TEXT CHECK(layout IS NULL OR layout IN ('grid', 'carousel', 'list')),
      display_order INTEGER NOT NULL,
      schedule_enabled INTEGER DEFAULT 0,
      schedule_start_time TEXT,
      schedule_end_time TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gallery_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link_item_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      caption TEXT,
      display_order INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (link_item_id) REFERENCES link_items(id) ON DELETE CASCADE
    );
  `);

  // Build the same wrapper API that backend/config/database.js exposes
  const wrapper = {
    prepare: (sql) => ({
      run: (...params) => {
        try {
          const stmt = rawDb.prepare(sql);
          stmt.bind(params);
          stmt.step();
          stmt.free();

          const lastIdStmt = rawDb.prepare('SELECT last_insert_rowid() as id');
          lastIdStmt.step();
          const lastInsertRowid = lastIdStmt.getAsObject().id;
          lastIdStmt.free();

          return { lastInsertRowid, changes: 1 };
        } catch (error) {
          throw error;
        }
      },
      get: (...params) => {
        try {
          const stmt = rawDb.prepare(sql);
          stmt.bind(params);
          if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
          }
          stmt.free();
          return null;
        } catch (error) {
          return null;
        }
      },
      all: (...params) => {
        try {
          const stmt = rawDb.prepare(sql);
          stmt.bind(params);
          const results = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        } catch (error) {
          return [];
        }
      },
    }),
    exec: (sql) => {
      rawDb.run(sql);
    },
    close: () => {
      rawDb.close();
    },
    // The real module exposes a `ready` Promise via a Proxy
    ready: Promise.resolve(),
  };

  return { db: wrapper, rawDb };
}

// ---------------------------------------------------------------
// Seed helpers
// ---------------------------------------------------------------

/**
 * Create a test user and profile, return their ids.
 */
function seedUserAndProfile(db, overrides = {}) {
  const userId = overrides.userId || 1;
  const username = overrides.username || 'testuser';
  const displayName = overrides.displayName || 'Test User';

  db.prepare(
    'INSERT OR IGNORE INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)'
  ).run(userId, username, `${username}@test.com`, 'hash');

  db.prepare(
    'INSERT OR IGNORE INTO profiles (user_id, username, display_name) VALUES (?, ?, ?)'
  ).run(userId, username, displayName);

  const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(userId);
  return { userId, profileId: profile.id };
}

/**
 * Create a link item for a profile. Returns the created link row.
 */
function seedLinkItem(db, profileId, overrides = {}) {
  const type = overrides.type || 'CLASSIC';
  const title = overrides.title || 'My Link';
  const url = overrides.url || 'https://example.com';
  const displayOrder = overrides.displayOrder || 1;
  const layout = overrides.layout || null;

  const result = db.prepare(
    `INSERT INTO link_items (profile_id, type, title, url, display_order, layout)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(profileId, type, title, url, displayOrder, layout);

  return db.prepare('SELECT * FROM link_items WHERE id = ?').get(result.lastInsertRowid);
}

/**
 * Create a gallery image for a link item.
 */
function seedGalleryImage(db, linkItemId, overrides = {}) {
  const imgUrl = overrides.url || 'data:image/jpeg;base64,/9j/TESTDATA';
  const caption = overrides.caption || '';
  const displayOrder = overrides.displayOrder || 1;

  const result = db.prepare(
    'INSERT INTO gallery_images (link_item_id, url, caption, display_order) VALUES (?, ?, ?, ?)'
  ).run(linkItemId, imgUrl, caption, displayOrder);

  return db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(result.lastInsertRowid);
}

// ---------------------------------------------------------------
// Authentication mock
// ---------------------------------------------------------------

/**
 * Middleware that injects req.user without actually validating a JWT.
 * Place *before* the router under test.
 */
function mockAuth(userId) {
  return (req, _res, next) => {
    req.user = { id: userId, username: 'testuser', role: 'user' };
    next();
  };
}

// ---------------------------------------------------------------
// Express app builder
// ---------------------------------------------------------------

/**
 * Build a minimal Express app with JSON body parsing.
 * The database module is mocked via jest.mock in each test file so that
 * require('../config/database') returns the in-memory wrapper.
 */
function createTestApp() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  return app;
}

module.exports = {
  createTestDb,
  createTestApp,
  mockAuth,
  seedUserAndProfile,
  seedLinkItem,
  seedGalleryImage,
};
