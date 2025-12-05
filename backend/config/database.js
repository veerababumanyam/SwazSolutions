const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Database file path
const dbPath = process.env.DB_PATH || path.join(__dirname, '../music.db');

let db = null;

// Initialize SQL.js and create/load database
async function initializeDatabase() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  let buffer;
  if (fs.existsSync(dbPath)) {
    buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('✅ Loaded existing database');
  } else {
    db = new SQL.Database();
    console.log('✅ Created new database');
  }

  // Create schema
  db.run(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT,
      role TEXT DEFAULT 'user',
      google_id TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Songs table
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT,
      album TEXT,
      file_path TEXT UNIQUE NOT NULL,
      cover_path TEXT,
      duration INTEGER,
      genre TEXT,
      play_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_play_count ON songs(play_count DESC);

    -- Contact Tickets table (for data recovery inquiries)
    CREATE TABLE IF NOT EXISTS contact_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      device_type TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      is_emergency INTEGER DEFAULT 0,
      ip_address TEXT,
      user_agent TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_tickets_email ON contact_tickets(email);
    CREATE INDEX IF NOT EXISTS idx_tickets_created ON contact_tickets(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_tickets_status ON contact_tickets(status);

    -- Agentic AI Inquiries table
    CREATE TABLE IF NOT EXISTS agentic_ai_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      company TEXT NOT NULL,
      company_size TEXT,
      service_type TEXT NOT NULL,
      project_description TEXT NOT NULL,
      budget TEXT,
      timeline TEXT,
      ip_address TEXT,
      user_agent TEXT,
      status TEXT DEFAULT 'new',
      priority TEXT DEFAULT 'normal',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_ai_inquiries_email ON agentic_ai_inquiries(email);
    CREATE INDEX IF NOT EXISTS idx_ai_inquiries_created ON agentic_ai_inquiries(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ai_inquiries_status ON agentic_ai_inquiries(status);
    CREATE INDEX IF NOT EXISTS idx_ai_inquiries_priority ON agentic_ai_inquiries(priority);
  `);

  // Migration: Add cover_path if it doesn't exist
  try {
    // Check if column exists
    const result = db.exec("SELECT cover_path FROM songs LIMIT 1");
  } catch (e) {
    // Column doesn't exist, add it
    try {
      db.run("ALTER TABLE songs ADD COLUMN cover_path TEXT");
      console.log('✅ Added cover_path column to songs table');
    } catch (alterError) {
      console.error('❌ Failed to add cover_path column:', alterError);
    }
  }

  // Migration: Add role to users if it doesn't exist
  try {
    db.exec("SELECT role FROM users LIMIT 1");
  } catch (e) {
    try {
      db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
      console.log('✅ Added role column to users table');
    } catch (alterError) {
      console.error('❌ Failed to add role column:', alterError);
    }
  }

  // Migration: Add google_id to users if it doesn't exist
  try {
    db.exec("SELECT google_id FROM users LIMIT 1");
  } catch (e) {
    try {
      db.run("ALTER TABLE users ADD COLUMN google_id TEXT");
      db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)");
      console.log('✅ Added google_id column to users table');
    } catch (alterError) {
      console.error('❌ Failed to add google_id column:', alterError);
    }
  }

  // ========================================
  // VIRTUAL PROFILE FEATURE TABLES (T001-T009)
  // ========================================

  // T001: Profiles table
  db.run(`
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
      profile_tags TEXT,
      public_email TEXT,
      public_phone TEXT,
      website TEXT,
      languages TEXT,
      pronouns TEXT,
      timezone TEXT,
      contact_preferences TEXT,
      published INTEGER DEFAULT 0,
      indexing_opt_in INTEGER DEFAULT 0,
      active_theme_id INTEGER,
      background_image_url TEXT,
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_published ON profiles(published) WHERE published = 1;
  `);

  // T002: Social profiles table (featured links, max 5)
  db.run(`
    CREATE TABLE IF NOT EXISTS social_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      platform_name TEXT NOT NULL,
      platform_url TEXT NOT NULL,
      logo_url TEXT NOT NULL,
      display_order INTEGER NOT NULL,
      is_featured INTEGER DEFAULT 1,
      is_public INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
      CHECK (display_order <= 5 OR is_featured = 0)
    );

    CREATE INDEX IF NOT EXISTS idx_social_profiles_profile ON social_profiles(profile_id);
  `);

  // T003: Custom links table (unlimited additional links)
  db.run(`
    CREATE TABLE IF NOT EXISTS custom_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      link_title TEXT NOT NULL,
      link_url TEXT NOT NULL,
      custom_logo_url TEXT,
      display_order INTEGER NOT NULL,
      is_public INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_custom_links_profile ON custom_links(profile_id);
  `);

  // T004: Themes table
  // Migration: Update schema to align with API routes
  // - Rename theme_name -> name
  // - Add is_system column (replaces theme_type for system/custom designation)
  // - Change user_id -> profile_id (references profiles table)

  try {
    const tableExists = db.exec(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='themes'
    `);

    if (tableExists && tableExists.length > 0 && tableExists[0].values.length > 0) {
      // Table exists, check if migration is needed
      const tableInfo = db.exec("PRAGMA table_info(themes)");
      if (tableInfo && tableInfo.length > 0) {
        const columns = tableInfo[0].values.map(row => row[1]);
        const hasOldSchema = columns.includes('theme_name') || columns.includes('user_id');
        const hasNewSchema = columns.includes('name') && columns.includes('profile_id') && columns.includes('is_system');

        if (hasOldSchema && !hasNewSchema) {
          console.log('🔄 Migrating themes table to new schema...');

          // Create new table with correct schema
          db.run(`
            CREATE TABLE themes_new (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              profile_id INTEGER,
              name TEXT NOT NULL,
              category TEXT,
              colors TEXT NOT NULL,
              typography TEXT NOT NULL,
              layout TEXT NOT NULL,
              avatar TEXT NOT NULL,
              background_image_url TEXT,
              logo_url TEXT,
              preview_image_url TEXT,
              is_system INTEGER DEFAULT 0,
              is_active INTEGER DEFAULT 0,
              is_public INTEGER DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
            )
          `);

          // Migrate data if any exists
          try {
            // Map user_id to profile_id and convert theme_type to is_system
            db.run(`
              INSERT INTO themes_new (
                id, profile_id, name, category, colors, typography, layout, avatar,
                background_image_url, logo_url, preview_image_url, is_system, is_active, is_public,
                created_at, updated_at
              )
              SELECT 
                t.id,
                p.id as profile_id,
                t.theme_name as name,
                t.category,
                t.colors,
                t.typography,
                t.layout,
                t.avatar,
                t.background_image_url,
                t.logo_url,
                t.preview_image_url,
                CASE WHEN t.theme_type = 'system' THEN 1 ELSE 0 END as is_system,
                t.is_active,
                t.is_public,
                t.created_at,
                t.updated_at
              FROM themes t
              LEFT JOIN profiles p ON t.user_id = p.user_id
            `);
          } catch (migrateError) {
            console.log('No existing theme data to migrate or migration not needed');
          }

          // Drop old table and rename new one
          db.run('DROP TABLE themes');
          db.run('ALTER TABLE themes_new RENAME TO themes');

          console.log('✅ Themes table migration completed');
        }
      }
    }
  } catch (error) {
    console.error('Error checking themes table:', error);
  }

  // Create themes table with new schema
  db.run(`
    CREATE TABLE IF NOT EXISTS themes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER,
      name TEXT NOT NULL,
      category TEXT,
      colors TEXT NOT NULL,
      typography TEXT NOT NULL,
      layout TEXT NOT NULL,
      avatar TEXT NOT NULL,
      header_background TEXT,
      background_image_url TEXT,
      logo_url TEXT,
      preview_image_url TEXT,
      is_system INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 0,
      is_public INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    )
  `);

  // Migration: Add header_background column to themes if it doesn't exist
  try {
    db.exec("SELECT header_background FROM themes LIMIT 1");
  } catch (e) {
    try {
      db.run("ALTER TABLE themes ADD COLUMN header_background TEXT");
      console.log('✅ Added header_background column to themes table');
    } catch (alterError) {
      // Column might already exist
    }
  }

  // Migration: Add wallpaper column to themes if it doesn't exist
  try {
    db.exec("SELECT wallpaper FROM themes LIMIT 1");
  } catch (e) {
    try {
      db.run("ALTER TABLE themes ADD COLUMN wallpaper TEXT");
      console.log('✅ Added wallpaper column to themes table');
    } catch (alterError) {
      // Column might already exist
    }
  }

  // Migration: Add contact visibility columns to profiles if they don't exist
  try {
    db.exec("SELECT show_email FROM profiles LIMIT 1");
  } catch (e) {
    try {
      db.run("ALTER TABLE profiles ADD COLUMN show_email INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_phone INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_website INTEGER DEFAULT 1");
      console.log('✅ Added contact visibility columns to profiles table');
    } catch (alterError) {
      // Columns might already exist
    }
  }

  // Migration: Add show_bio column to profiles if it doesn't exist
  try {
    db.exec("SELECT show_bio FROM profiles LIMIT 1");
  } catch (e) {
    try {
      db.run("ALTER TABLE profiles ADD COLUMN show_bio INTEGER DEFAULT 1");
      console.log('✅ Added show_bio column to profiles table');
    } catch (alterError) {
      // Column might already exist
    }
  }

  // Migration: Add company contact columns to profiles if they don't exist
  try {
    db.exec("SELECT company_email FROM profiles LIMIT 1");
  } catch (e) {
    try {
      db.run("ALTER TABLE profiles ADD COLUMN company_email TEXT");
      db.run("ALTER TABLE profiles ADD COLUMN company_phone TEXT");
      db.run("ALTER TABLE profiles ADD COLUMN show_company_email INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_company_phone INTEGER DEFAULT 1");
      console.log('✅ Added company contact columns to profiles table');
    } catch (alterError) {
      // Columns might already exist
    }
  }

  // Migration: Add personal address columns to profiles if they don't exist
  try {
    db.exec("SELECT address_line1 FROM profiles LIMIT 1");
  } catch (e) {
    try {
      db.run("ALTER TABLE profiles ADD COLUMN address_line1 TEXT");
      db.run("ALTER TABLE profiles ADD COLUMN address_line2 TEXT");
      db.run("ALTER TABLE profiles ADD COLUMN address_city TEXT");
      db.run("ALTER TABLE profiles ADD COLUMN address_state TEXT");
      db.run("ALTER TABLE profiles ADD COLUMN address_postal_code TEXT");
      db.run("ALTER TABLE profiles ADD COLUMN address_country TEXT");
      db.run("ALTER TABLE profiles ADD COLUMN show_address_line1 INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_address_line2 INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_address_city INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_address_state INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_address_postal_code INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_address_country INTEGER DEFAULT 1");
      console.log('✅ Added personal address columns to profiles table');
    } catch (alterError) {
      // Columns might already exist
    }
  }

  // Migration: Add show_address_line1 column if show_address_street exists (rename migration)
  try {
    db.exec("SELECT show_address_line1 FROM profiles LIMIT 1");
  } catch (e) {
    try {
      db.run("ALTER TABLE profiles ADD COLUMN show_address_line1 INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_address_line2 INTEGER DEFAULT 1");
      // Copy values from old columns if they exist
      try {
        db.run("UPDATE profiles SET show_address_line1 = show_address_street WHERE show_address_street IS NOT NULL");
      } catch (copyErr) { /* old column doesn't exist */ }
      console.log('✅ Added show_address_line1/line2 columns');
    } catch (alterError) {
      // Columns might already exist
    }
  }

  // Migration: Add company address columns to profiles if they don't exist
  try {
    db.exec("SELECT company_address_line1 FROM profiles LIMIT 1");
  } catch (e) {
    try {
      db.run("ALTER TABLE profiles ADD COLUMN company_address_line1 TEXT");
      db.run("ALTER TABLE profiles ADD COLUMN company_address_line2 TEXT");
      db.run("ALTER TABLE profiles ADD COLUMN company_address_city TEXT");
      db.run("ALTER TABLE profiles ADD COLUMN company_address_state TEXT");
      db.run("ALTER TABLE profiles ADD COLUMN company_address_postal_code TEXT");
      db.run("ALTER TABLE profiles ADD COLUMN company_address_country TEXT");
      db.run("ALTER TABLE profiles ADD COLUMN show_company_address_line1 INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_company_address_line2 INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_company_address_city INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_company_address_state INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_company_address_postal_code INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_company_address_country INTEGER DEFAULT 1");
      console.log('✅ Added company address columns to profiles table');
    } catch (alterError) {
      // Columns might already exist
    }
  }

  // Migration: Add show_company_address_line1 column if show_company_address_street exists (rename migration)
  try {
    db.exec("SELECT show_company_address_line1 FROM profiles LIMIT 1");
  } catch (e) {
    try {
      db.run("ALTER TABLE profiles ADD COLUMN show_company_address_line1 INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_company_address_line2 INTEGER DEFAULT 1");
      // Copy values from old columns if they exist
      try {
        db.run("UPDATE profiles SET show_company_address_line1 = show_company_address_street WHERE show_company_address_street IS NOT NULL");
      } catch (copyErr) { /* old column doesn't exist */ }
      console.log('✅ Added show_company_address_line1/line2 columns');
    } catch (alterError) {
      // Columns might already exist
    }
  }

  // Create indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_themes_system ON themes(is_system)');
  db.run('CREATE INDEX IF NOT EXISTS idx_themes_profile ON themes(profile_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_themes_category ON themes(category)');

  // Profile Appearance Settings table (persistent storage for all appearance settings)
  db.run(`
    CREATE TABLE IF NOT EXISTS profile_appearance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL UNIQUE,
      appearance_settings TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_profile_appearance_profile ON profile_appearance(profile_id)');
  console.log('✅ Profile appearance table created/verified');

  // T005: Profile views analytics table
  db.run(`
    CREATE TABLE IF NOT EXISTS profile_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      viewer_ip_hash TEXT NOT NULL,
      referrer TEXT,
      device_type TEXT,
      location_country TEXT,
      location_city TEXT,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_profile_views_profile ON profile_views(profile_id);
    CREATE INDEX IF NOT EXISTS idx_profile_views_date ON profile_views(viewed_at);
  `);

  // T006: Share events table (T140 - updated schema)
  // Migration: Update schema to match new API (share_method + platform instead of share_channel)
  try {
    const tableExists = db.exec(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='share_events'
    `);

    if (tableExists && tableExists.length > 0 && tableExists[0].values.length > 0) {
      const tableInfo = db.exec("PRAGMA table_info(share_events)");
      if (tableInfo && tableInfo.length > 0) {
        const columns = tableInfo[0].values.map(row => row[1]);
        const hasOldSchema = columns.includes('share_channel') || columns.includes('shared_at');
        const hasNewSchema = columns.includes('share_method') && columns.includes('created_at');

        if (hasOldSchema || !hasNewSchema) {
          console.log('🔄 Migrating share_events table to new schema...');
          db.run('DROP TABLE share_events');
        }
      }
    }
  } catch (error) {
    console.error('Error checking share_events schema:', error);
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS share_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      share_method TEXT NOT NULL,
      platform TEXT,
      ip_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_share_events_profile ON share_events(profile_id);
    CREATE INDEX IF NOT EXISTS idx_share_events_method ON share_events(share_method);
  `);

  // T007: vCard downloads table
  db.run(`
    CREATE TABLE IF NOT EXISTS vcard_downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      device_type TEXT,
      ip_hash TEXT,
      downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_vcard_downloads_profile ON vcard_downloads(profile_id);
  `);

  // T008: Analytics summary table (daily aggregation)
  db.run(`
    CREATE TABLE IF NOT EXISTS analytics_summary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      total_views INTEGER DEFAULT 0,
      unique_visitors INTEGER DEFAULT 0,
      vcard_downloads INTEGER DEFAULT 0,
      share_count INTEGER DEFAULT 0,
      qr_scans INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
      UNIQUE(profile_id, date)
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_summary_profile ON analytics_summary(profile_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON analytics_summary(date);
  `);

  // T009: QR codes cache table
  // Migration: Drop old schema and create new schema with cache_key, qr_data, and format
  // This migration is safe because QR codes are cached data and can be regenerated
  try {
    // Check if table exists using exec
    const tableExists = db.exec(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='qr_codes'
    `);

    if (tableExists && tableExists.length > 0 && tableExists[0].values.length > 0) {
      // Check if old schema exists (has profile_url column)
      const tableInfo = db.exec("PRAGMA table_info(qr_codes)");
      if (tableInfo && tableInfo.length > 0) {
        const columns = tableInfo[0].values.map(row => row[1]); // column name is at index 1
        const hasOldSchema = columns.includes('profile_url');
        const hasNewSchema = columns.includes('cache_key');

        if (hasOldSchema || !hasNewSchema) {
          console.log('🔄 Migrating qr_codes table to new schema...');
          db.run('DROP TABLE qr_codes');
        }
      }
    }
  } catch (err) {
    console.error('Migration check error:', err.message);
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS qr_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      cache_key TEXT NOT NULL,
      qr_data TEXT NOT NULL,
      format TEXT NOT NULL,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
      UNIQUE(profile_id, cache_key)
    )
  `);

  db.run('CREATE INDEX IF NOT EXISTS idx_qr_codes_profile ON qr_codes(profile_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_qr_codes_cache ON qr_codes(cache_key)');

  // T038a: Username history table (for 90-day redirects)
  db.run(`
    CREATE TABLE IF NOT EXISTS username_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      old_username TEXT NOT NULL,
      new_username TEXT NOT NULL,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_username_history_old ON username_history(old_username);
    CREATE INDEX IF NOT EXISTS idx_username_history_expires ON username_history(expires_at);
  `);

  // T010: Additional performance indexes
  db.run(`
    -- Composite indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_profiles_published_username ON profiles(published, username) WHERE published = 1;
    CREATE INDEX IF NOT EXISTS idx_profiles_indexing_published ON profiles(indexing_opt_in, published) WHERE published = 1 AND indexing_opt_in = 1;
    CREATE INDEX IF NOT EXISTS idx_social_profiles_featured ON social_profiles(profile_id, is_featured, display_order);
    CREATE INDEX IF NOT EXISTS idx_profile_views_date ON profile_views(profile_id, viewed_at);
    CREATE INDEX IF NOT EXISTS idx_share_events_date ON share_events(profile_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_vcard_downloads_date ON vcard_downloads(profile_id, downloaded_at);
  `);

  console.log('✅ Virtual Profile tables and indexes created/verified');

  // Create camera_updates table
  db.run(`
    CREATE TABLE IF NOT EXISTS camera_updates (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      version TEXT,
      description TEXT,
      features TEXT,
      download_link TEXT,
      image_url TEXT,
      source_url TEXT NOT NULL,
      source_name TEXT NOT NULL,
      priority TEXT DEFAULT 'normal',
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_camera_brand ON camera_updates(brand);
    CREATE INDEX IF NOT EXISTS idx_camera_type ON camera_updates(type);
    CREATE INDEX IF NOT EXISTS idx_camera_date ON camera_updates(date DESC);
    CREATE INDEX IF NOT EXISTS idx_camera_priority ON camera_updates(priority);
    CREATE INDEX IF NOT EXISTS idx_camera_title ON camera_updates(title);
  `);
  // Playlists and other tables
  db.run(`
    -- Playlists table
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      is_public BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Playlist songs (many-to-many)
    CREATE TABLE IF NOT EXISTS playlist_songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
      UNIQUE(playlist_id, song_id)
    );

    -- User likes (favorites)
    CREATE TABLE IF NOT EXISTS user_likes (
      user_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      liked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, song_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_songs_album ON songs(album);
    CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
    CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
    CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id);
    CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist ON playlist_songs(playlist_id);
    CREATE INDEX IF NOT EXISTS idx_play_count ON songs(play_count DESC);

    -- Visitors table
    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      count INTEGER DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Initialize visitors count if not exists
  try {
    const visitorCount = db.exec("SELECT count FROM visitors WHERE id = 1");
    if (visitorCount.length === 0 || visitorCount[0].values.length === 0) {
      db.run("INSERT INTO visitors (id, count) VALUES (1, 0)");
      console.log('✅ Initialized visitor counter');
    }
  } catch (e) {
    console.error('❌ Failed to initialize visitor counter:', e);
  }

  // Save database to file
  saveDatabase();
  console.log('✅ Database initialized successfully');
}

// Save database to file
function saveDatabase() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

// Wrapper functions to match better-sqlite3 API
const dbWrapper = {
  prepare: (sql) => {
    return {
      run: (...params) => {
        if (!db) throw new Error('Database not initialized');
        try {
          // Create a prepared statement with sql.js
          const stmt = db.prepare(sql);
          stmt.bind(params);
          stmt.step();
          stmt.free();

          // Get last inserted row id BEFORE saving (must be immediate)
          const lastIdStmt = db.prepare('SELECT last_insert_rowid() as id');
          lastIdStmt.step();
          const lastInsertRowid = lastIdStmt.getAsObject().id;
          lastIdStmt.free();

          saveDatabase();
          return { lastInsertRowid: lastInsertRowid, changes: 1 };
        } catch (error) {
          console.error('Database run error:', error.message);
          console.error('SQL:', sql);
          console.error('Params:', params);
          throw error;
        }
      },
      get: (...params) => {
        if (!db) return null;
        try {
          const stmt = db.prepare(sql);
          stmt.bind(params);
          if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
          }
          stmt.free();
          return null;
        } catch (error) {
          console.error('Database get error:', error);
          return null;
        }
      },
      all: (...params) => {
        if (!db) return [];
        try {
          const stmt = db.prepare(sql);
          stmt.bind(params);
          const results = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        } catch (error) {
          console.error('Database all error:', error);
          return [];
        }
      }
    };
  },
  exec: (sql) => {
    if (!db) throw new Error('Database not initialized');
    db.run(sql);
    saveDatabase();
  },
  close: () => {
    if (db) {
      saveDatabase();
      db.close();
    }
  }
};

// Initialize database on module load
let dbReady = initializeDatabase();

module.exports = new Proxy(dbWrapper, {
  get: (target, prop) => {
    if (prop === 'ready') return dbReady;
    return target[prop];
  }
});
