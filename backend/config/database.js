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
      team_size TEXT,
      service_type TEXT NOT NULL,
      project_description TEXT NOT NULL,
      project_requirements TEXT,
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
    CREATE INDEX IF NOT EXISTS idx_ai_inquiries_team_size ON agentic_ai_inquiries(team_size);

    -- General Contact Inquiries table
    CREATE TABLE IF NOT EXISTS general_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_general_inquiries_email ON general_inquiries(email);
    CREATE INDEX IF NOT EXISTS idx_general_inquiries_created ON general_inquiries(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_general_inquiries_status ON general_inquiries(status);
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

  // Migration: Add subscription columns to users if they don't exist
  try {
    db.exec("SELECT subscription_status FROM users LIMIT 1");
  } catch (e) {
    try {
      db.run("ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free'");
      db.run("ALTER TABLE users ADD COLUMN subscription_end_date DATETIME");
      db.run("ALTER TABLE users ADD COLUMN stripe_customer_id TEXT");
      db.run("ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT");

      // Set default subscription end date for existing users to 30 days from now (Free trial for existing users too?)
      // or set them as 'free' and expired? The requirement says "free users can be valid for only one month".
      // Let's give existing users a fresh month of free trial, or set it to now if we want to force upgrade.
      // Assuming generous approach: give 1 month free from upgrade.
      const oneMonthFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      db.run("UPDATE users SET subscription_status = 'free', subscription_end_date = ?", [oneMonthFromNow]);

      console.log('✅ Added subscription columns to users table');
    } catch (alterError) {
      console.error('❌ Failed to add subscription columns:', alterError);
    }
  }

  // Migration: Add team_size column to agentic_ai_inquiries if it doesn't exist
  try {
    const checkTeamSize = db.prepare("SELECT team_size FROM agentic_ai_inquiries LIMIT 1");
    checkTeamSize.step();
    checkTeamSize.free();
  } catch (e) {
    try {
      db.run("ALTER TABLE agentic_ai_inquiries ADD COLUMN team_size TEXT");
      console.log('✅ Added team_size column to agentic_ai_inquiries table');
    } catch (alterError) {
      // Column might already exist
    }
  }

  // Migration: Add project_requirements column to agentic_ai_inquiries if it doesn't exist
  try {
    const checkProjReq = db.prepare("SELECT project_requirements FROM agentic_ai_inquiries LIMIT 1");
    checkProjReq.step();
    checkProjReq.free();
  } catch (e) {
    try {
      db.run("ALTER TABLE agentic_ai_inquiries ADD COLUMN project_requirements TEXT");
      console.log('✅ Added project_requirements column to agentic_ai_inquiries table');
    } catch (alterError) {
      // Column might already exist
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

  // Migration: Add additional field visibility columns to profiles
  // These allow users to control visibility of individual profile fields
  try {
    db.exec("SELECT show_headline FROM profiles LIMIT 1");
  } catch (e) {
    try {
      db.run("ALTER TABLE profiles ADD COLUMN show_headline INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_company INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_first_name INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_last_name INTEGER DEFAULT 1");
      db.run("ALTER TABLE profiles ADD COLUMN show_pronouns INTEGER DEFAULT 1");
      console.log('✅ Added additional field visibility columns to profiles table');
    } catch (alterError) {
      // Columns might already exist
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
  // ========================================
  // COMPREHENSIVE MUSIC DATABASE SCHEMA
  // ========================================

  // Artists table - for proper artist management with metadata
  db.run(`
    CREATE TABLE IF NOT EXISTS artists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      sort_name TEXT,
      bio TEXT,
      image_url TEXT,
      website_url TEXT,
      spotify_id TEXT,
      apple_music_id TEXT,
      country TEXT,
      formed_year INTEGER,
      disbanded_year INTEGER,
      is_group INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);
    CREATE INDEX IF NOT EXISTS idx_artists_sort_name ON artists(sort_name);
  `);

  // Genres table - hierarchical genre taxonomy
  db.run(`
    CREATE TABLE IF NOT EXISTS genres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      parent_id INTEGER,
      description TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES genres(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_genres_name ON genres(name);
    CREATE INDEX IF NOT EXISTS idx_genres_slug ON genres(slug);
    CREATE INDEX IF NOT EXISTS idx_genres_parent ON genres(parent_id);
  `);

  // Albums table - for album organization
  db.run(`
    CREATE TABLE IF NOT EXISTS albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist_id INTEGER,
      artist_name TEXT,
      release_date TEXT,
      release_year INTEGER,
      album_type TEXT DEFAULT 'album',
      total_tracks INTEGER,
      total_duration INTEGER,
      cover_url TEXT,
      cover_small_url TEXT,
      cover_large_url TEXT,
      label TEXT,
      upc TEXT,
      spotify_id TEXT,
      apple_music_id TEXT,
      is_compilation INTEGER DEFAULT 0,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_albums_title ON albums(title);
    CREATE INDEX IF NOT EXISTS idx_albums_artist_id ON albums(artist_id);
    CREATE INDEX IF NOT EXISTS idx_albums_artist_name ON albums(artist_name);
    CREATE INDEX IF NOT EXISTS idx_albums_release_year ON albums(release_year);
    CREATE INDEX IF NOT EXISTS idx_albums_album_type ON albums(album_type);
  `);

  // Album genres (many-to-many)
  db.run(`
    CREATE TABLE IF NOT EXISTS album_genres (
      album_id INTEGER NOT NULL,
      genre_id INTEGER NOT NULL,
      PRIMARY KEY (album_id, genre_id),
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
      FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_album_genres_album ON album_genres(album_id);
    CREATE INDEX IF NOT EXISTS idx_album_genres_genre ON album_genres(genre_id);
  `);

  // Song artists (many-to-many for featuring artists)
  db.run(`
    CREATE TABLE IF NOT EXISTS song_artists (
      song_id INTEGER NOT NULL,
      artist_id INTEGER NOT NULL,
      artist_role TEXT DEFAULT 'primary',
      display_order INTEGER DEFAULT 0,
      PRIMARY KEY (song_id, artist_id),
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
      FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_song_artists_song ON song_artists(song_id);
    CREATE INDEX IF NOT EXISTS idx_song_artists_artist ON song_artists(artist_id);
    CREATE INDEX IF NOT EXISTS idx_song_artists_role ON song_artists(artist_role);
  `);

  // Song genres (many-to-many)
  db.run(`
    CREATE TABLE IF NOT EXISTS song_genres (
      song_id INTEGER NOT NULL,
      genre_id INTEGER NOT NULL,
      PRIMARY KEY (song_id, genre_id),
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
      FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_song_genres_song ON song_genres(song_id);
    CREATE INDEX IF NOT EXISTS idx_song_genres_genre ON song_genres(genre_id);
  `);

  // Music metadata table - extended song metadata
  db.run(`
    CREATE TABLE IF NOT EXISTS music_metadata (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      song_id INTEGER NOT NULL UNIQUE,
      album_id INTEGER,
      artist_id INTEGER,
      track_number INTEGER,
      disc_number INTEGER DEFAULT 1,
      bpm INTEGER,
      key_signature TEXT,
      time_signature TEXT,
      isrc TEXT,
      explicit INTEGER DEFAULT 0,
      language TEXT,
      lyrics TEXT,
      lyrics_synced TEXT,
      lyrics_source TEXT,
      composer TEXT,
      lyricist TEXT,
      producer TEXT,
      mixer TEXT,
      mastering_engineer TEXT,
      recording_date TEXT,
      recording_location TEXT,
      copyright TEXT,
      label TEXT,
      catalog_number TEXT,
      comment TEXT,
      mood TEXT,
      energy_level INTEGER,
      danceability INTEGER,
      acousticness INTEGER,
      instrumentalness INTEGER,
      valence INTEGER,
      loudness REAL,
      bit_rate INTEGER,
      sample_rate INTEGER,
      channels INTEGER,
      codec TEXT,
      file_size INTEGER,
      file_hash TEXT,
      replay_gain_track REAL,
      replay_gain_album REAL,
      spotify_id TEXT,
      apple_music_id TEXT,
      musicbrainz_id TEXT,
      last_scanned_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL,
      FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_metadata_song ON music_metadata(song_id);
    CREATE INDEX IF NOT EXISTS idx_metadata_album ON music_metadata(album_id);
    CREATE INDEX IF NOT EXISTS idx_metadata_artist ON music_metadata(artist_id);
    CREATE INDEX IF NOT EXISTS idx_metadata_isrc ON music_metadata(isrc);
    CREATE INDEX IF NOT EXISTS idx_metadata_bpm ON music_metadata(bpm);
    CREATE INDEX IF NOT EXISTS idx_metadata_key ON music_metadata(key_signature);
    CREATE INDEX IF NOT EXISTS idx_metadata_mood ON music_metadata(mood);
    CREATE INDEX IF NOT EXISTS idx_metadata_language ON music_metadata(language);
  `);

  // Playback history table - for tracking listening history
  db.run(`
    CREATE TABLE IF NOT EXISTS playback_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      playlist_id INTEGER,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      duration_played INTEGER,
      completed INTEGER DEFAULT 0,
      source TEXT,
      device_type TEXT,
      audio_quality TEXT,
      context_type TEXT,
      context_id TEXT,
      skip_reason TEXT,
      shuffle_mode INTEGER DEFAULT 0,
      repeat_mode TEXT,
      volume_level INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_playback_user ON playback_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_playback_song ON playback_history(song_id);
    CREATE INDEX IF NOT EXISTS idx_playback_playlist ON playback_history(playlist_id);
    CREATE INDEX IF NOT EXISTS idx_playback_played_at ON playback_history(played_at DESC);
    CREATE INDEX IF NOT EXISTS idx_playback_user_played ON playback_history(user_id, played_at DESC);
    CREATE INDEX IF NOT EXISTS idx_playback_source ON playback_history(source);
    CREATE INDEX IF NOT EXISTS idx_playback_completed ON playback_history(completed);
  `);

  // Listening statistics table - aggregated listening data
  db.run(`
    CREATE TABLE IF NOT EXISTS listening_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      total_plays INTEGER DEFAULT 0,
      total_duration_played INTEGER DEFAULT 0,
      completed_plays INTEGER DEFAULT 0,
      skip_count INTEGER DEFAULT 0,
      last_played_at DATETIME,
      first_played_at DATETIME,
      avg_completion_rate REAL,
      favorite_time_of_day TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, song_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_stats_user ON listening_stats(user_id);
    CREATE INDEX IF NOT EXISTS idx_stats_song ON listening_stats(song_id);
    CREATE INDEX IF NOT EXISTS idx_stats_plays ON listening_stats(total_plays DESC);
    CREATE INDEX IF NOT EXISTS idx_stats_last_played ON listening_stats(last_played_at DESC);
  `);

  // User music preferences table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_music_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      favorite_genres TEXT,
      preferred_audio_quality TEXT DEFAULT 'high',
      crossfade_duration INTEGER DEFAULT 0,
      gapless_playback INTEGER DEFAULT 1,
      normalize_volume INTEGER DEFAULT 0,
      equalizer_preset TEXT,
      default_shuffle INTEGER DEFAULT 0,
      default_repeat TEXT DEFAULT 'off',
      autoplay_enabled INTEGER DEFAULT 1,
      explicit_content_enabled INTEGER DEFAULT 1,
      listening_history_enabled INTEGER DEFAULT 1,
      recommendations_enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_prefs_user ON user_music_preferences(user_id);
  `);

  // Recently played queue table
  db.run(`
    CREATE TABLE IF NOT EXISTS recently_played (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_recent_user ON recently_played(user_id);
    CREATE INDEX IF NOT EXISTS idx_recent_played ON recently_played(played_at DESC);
    CREATE INDEX IF NOT EXISTS idx_recent_type ON recently_played(item_type);
  `);

  // Play queue table - for persisting current play queue
  db.run(`
    CREATE TABLE IF NOT EXISTS play_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      source TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_queue_user ON play_queue(user_id);
    CREATE INDEX IF NOT EXISTS idx_queue_position ON play_queue(user_id, position);
  `);

  // Playlists table - enhanced with more metadata
  db.run(`
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      cover_url TEXT,
      is_public INTEGER DEFAULT 0,
      is_collaborative INTEGER DEFAULT 0,
      total_duration INTEGER DEFAULT 0,
      track_count INTEGER DEFAULT 0,
      plays_count INTEGER DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      color_scheme TEXT,
      last_modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id);
    CREATE INDEX IF NOT EXISTS idx_playlists_user_created ON playlists(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_playlists_public ON playlists(is_public);
    CREATE INDEX IF NOT EXISTS idx_playlists_name ON playlists(name);
  `);

  // Playlist songs (many-to-many) - enhanced
  db.run(`
    CREATE TABLE IF NOT EXISTS playlist_songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      added_by INTEGER,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
      FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE(playlist_id, song_id)
    );

    CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist ON playlist_songs(playlist_id);
    CREATE INDEX IF NOT EXISTS idx_playlist_songs_song ON playlist_songs(song_id);
    CREATE INDEX IF NOT EXISTS idx_playlist_songs_position ON playlist_songs(playlist_id, position);
  `);

  // Playlist likes table
  db.run(`
    CREATE TABLE IF NOT EXISTS playlist_likes (
      user_id INTEGER NOT NULL,
      playlist_id INTEGER NOT NULL,
      liked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, playlist_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_playlist_likes_user ON playlist_likes(user_id);
    CREATE INDEX IF NOT EXISTS idx_playlist_likes_playlist ON playlist_likes(playlist_id);
  `);

  // User likes (favorites) - for songs
  db.run(`
    CREATE TABLE IF NOT EXISTS user_likes (
      user_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      liked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, song_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_user_likes_user ON user_likes(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_likes_song ON user_likes(song_id);
    CREATE INDEX IF NOT EXISTS idx_user_likes_date ON user_likes(liked_at DESC);
  `);

  // Album likes table
  db.run(`
    CREATE TABLE IF NOT EXISTS album_likes (
      user_id INTEGER NOT NULL,
      album_id INTEGER NOT NULL,
      liked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, album_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_album_likes_user ON album_likes(user_id);
    CREATE INDEX IF NOT EXISTS idx_album_likes_album ON album_likes(album_id);
  `);

  // Artist follows table
  db.run(`
    CREATE TABLE IF NOT EXISTS artist_follows (
      user_id INTEGER NOT NULL,
      artist_id INTEGER NOT NULL,
      followed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, artist_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_artist_follows_user ON artist_follows(user_id);
    CREATE INDEX IF NOT EXISTS idx_artist_follows_artist ON artist_follows(artist_id);
  `);

  // Songs table additional indexes for efficient querying
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_songs_album ON songs(album);
    CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
    CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
    CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);
    CREATE INDEX IF NOT EXISTS idx_songs_created ON songs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_songs_duration ON songs(duration);
    CREATE INDEX IF NOT EXISTS idx_songs_artist_album ON songs(artist, album);
    CREATE INDEX IF NOT EXISTS idx_songs_genre_year ON songs(genre);
    CREATE INDEX IF NOT EXISTS idx_songs_play_count ON songs(play_count DESC);
  `);

  console.log('✅ Comprehensive music database schema created/verified');

  // ========================================
  // ENCRYPTION MIGRATION - Add email_hash columns for searchable encrypted data
  // ========================================

  // Migration: Add email_hash column to contact_tickets if it doesn't exist
  try {
    const checkTicketHash = db.prepare("SELECT email_hash FROM contact_tickets LIMIT 1");
    checkTicketHash.step();
    checkTicketHash.free();
  } catch (e) {
    try {
      db.run("ALTER TABLE contact_tickets ADD COLUMN email_hash TEXT");
      db.run("CREATE INDEX IF NOT EXISTS idx_tickets_email_hash ON contact_tickets(email_hash)");
      console.log('✅ Added email_hash column to contact_tickets table');
    } catch (alterError) {
      // Column might already exist
    }
  }

  // Migration: Add email_hash column to agentic_ai_inquiries if it doesn't exist
  try {
    const checkAIHash = db.prepare("SELECT email_hash FROM agentic_ai_inquiries LIMIT 1");
    checkAIHash.step();
    checkAIHash.free();
  } catch (e) {
    try {
      db.run("ALTER TABLE agentic_ai_inquiries ADD COLUMN email_hash TEXT");
      db.run("CREATE INDEX IF NOT EXISTS idx_ai_inquiries_email_hash ON agentic_ai_inquiries(email_hash)");
      console.log('✅ Added email_hash column to agentic_ai_inquiries table');
    } catch (alterError) {
      // Column might already exist
    }
  }

  // Migration: Add email_hash column to general_inquiries if it doesn't exist
  try {
    const checkGenHash = db.prepare("SELECT email_hash FROM general_inquiries LIMIT 1");
    checkGenHash.step();
    checkGenHash.free();
  } catch (e) {
    try {
      db.run("ALTER TABLE general_inquiries ADD COLUMN email_hash TEXT");
      db.run("CREATE INDEX IF NOT EXISTS idx_general_inquiries_email_hash ON general_inquiries(email_hash)");
      console.log('✅ Added email_hash column to general_inquiries table');
    } catch (alterError) {
      // Column might already exist
    }
  }

  console.log('✅ Encryption schema migration completed');

  // ========================================
  // SUPPORT TICKET SYSTEM TABLES
  // ========================================

  // Support Tickets table - tracks support requests from submission to resolution
  db.run(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      ticket_number TEXT UNIQUE NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      priority TEXT NOT NULL DEFAULT 'normal',
      status TEXT NOT NULL DEFAULT 'open',
      assigned_to INTEGER,
      resolution_notes TEXT,
      ip_address TEXT,
      user_agent TEXT,
      email_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
    CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
    CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
    CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
    CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_support_tickets_number ON support_tickets(ticket_number);
    CREATE INDEX IF NOT EXISTS idx_support_tickets_email_hash ON support_tickets(email_hash);
  `);

  // Support Ticket Messages table - tracks conversation history on tickets
  db.run(`
    CREATE TABLE IF NOT EXISTS support_ticket_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      user_id INTEGER,
      sender_type TEXT NOT NULL DEFAULT 'user',
      message TEXT NOT NULL,
      is_internal INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON support_ticket_messages(ticket_id);
    CREATE INDEX IF NOT EXISTS idx_ticket_messages_user ON support_ticket_messages(user_id);
    CREATE INDEX IF NOT EXISTS idx_ticket_messages_created ON support_ticket_messages(created_at);
  `);

  console.log('✅ Support ticket tables created/verified');

  // Refresh tokens table - for JWT refresh token storage
  db.run(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      device_info TEXT,
      ip_address TEXT,
      expires_at DATETIME NOT NULL,
      revoked INTEGER DEFAULT 0,
      revoked_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
  `);
  console.log('✅ Refresh tokens table created/verified');

  // Visitors table
  db.run(`
    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      count INTEGER DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Initialize visitors count if not exists
  try {
    const visitorCount = db.prepare("SELECT count FROM visitors WHERE id = 1").get();
    if (!visitorCount) {
      db.run("INSERT OR IGNORE INTO visitors (id, count) VALUES (1, 0)");
      console.log('✅ Initialized visitor counter');
    }
  } catch (e) {
    console.error('❌ Failed to initialize visitor counter:', e);
  }

  // ========================================
  // DIGITAL INVITES TABLES
  // ========================================
  // Run migration to create tables if they don't exist
  try {
    const migrationPath = path.join(__dirname, '../migrations/create-invites-tables.sql');
    if (fs.existsSync(migrationPath)) {
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');
      console.log('Running digital invites migration...');
      db.run(migrationSql);
      console.log('✅ Digital invites migration executed');
    } else {
      console.error('❌ Migration file not found:', migrationPath);
    }
  } catch (err) {
    console.error('❌ Failed to run digital invites migration:', err);
  }

  // ========================================
  // DIGITAL INVITES INDEXES
  // ========================================
  // Note: Tables are created by migrations/create-invites-tables.sql
  // These are additional performance indexes

  // Composite indexes for common queries
  db.run('CREATE INDEX IF NOT EXISTS idx_digital_invites_user_status ON digital_invites(user_id, status);');
  db.run('CREATE INDEX IF NOT EXISTS idx_digital_invites_user_created ON digital_invites(user_id, created_at DESC);');
  db.run('CREATE INDEX IF NOT EXISTS idx_invite_guests_invite_status ON invite_guests(invite_id, status);');
  db.run('CREATE INDEX IF NOT EXISTS idx_invite_analytics_invite_event ON invite_analytics(invite_id, event_type);');

  // User subscription indexes for performance
  db.run('CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);');
  db.run('CREATE INDEX IF NOT EXISTS idx_users_subscription_end_date ON users(subscription_end_date);');
  db.run('CREATE INDEX IF NOT EXISTS idx_users_subscription_status_end ON users(subscription_status, subscription_end_date);');

  console.log('✅ Digital invites and subscription indexes created/verified');

  // ========================================
  // PHASE 3: NEW BLOCK TYPES TABLES
  // ========================================

  // Contact form submissions table
  db.run(`
    CREATE TABLE IF NOT EXISTS contact_form_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link_id INTEGER NOT NULL,
      profile_id INTEGER NOT NULL,
      name TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      ip_hash TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read_at DATETIME,

      FOREIGN KEY (link_id) REFERENCES link_items(id) ON DELETE CASCADE,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_contact_form_submissions_link ON contact_form_submissions(link_id);
    CREATE INDEX IF NOT EXISTS idx_contact_form_submissions_profile ON contact_form_submissions(profile_id);
    CREATE INDEX IF NOT EXISTS idx_contact_form_submissions_created ON contact_form_submissions(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_contact_form_submissions_email ON contact_form_submissions(email);
  `);

  // File downloads tracking table
  db.run(`
    CREATE TABLE IF NOT EXISTS file_downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link_id INTEGER NOT NULL,
      profile_id INTEGER NOT NULL,
      downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_hash TEXT,
      user_agent TEXT,

      FOREIGN KEY (link_id) REFERENCES link_items(id) ON DELETE CASCADE,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_file_downloads_link ON file_downloads(link_id);
    CREATE INDEX IF NOT EXISTS idx_file_downloads_profile ON file_downloads(profile_id);
    CREATE INDEX IF NOT EXISTS idx_file_downloads_date ON file_downloads(downloaded_at DESC);
  `);

  // Uploaded files storage table
  db.run(`
    CREATE TABLE IF NOT EXISTS file_uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link_id INTEGER NOT NULL,
      profile_id INTEGER NOT NULL,
      file_url TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      password_hash TEXT,
      expires_at DATETIME,
      download_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (link_id) REFERENCES link_items(id) ON DELETE CASCADE,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_file_uploads_link ON file_uploads(link_id);
    CREATE INDEX IF NOT EXISTS idx_file_uploads_profile ON file_uploads(profile_id);
    CREATE INDEX IF NOT EXISTS idx_file_uploads_created ON file_uploads(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_file_uploads_expires ON file_uploads(expires_at);
  `);

  // Map location analytics table
  db.run(`
    CREATE TABLE IF NOT EXISTS map_location_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link_id INTEGER NOT NULL,
      profile_id INTEGER NOT NULL,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_hash TEXT,
      device_type TEXT,

      FOREIGN KEY (link_id) REFERENCES link_items(id) ON DELETE CASCADE,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_map_location_views_link ON map_location_views(link_id);
    CREATE INDEX IF NOT EXISTS idx_map_location_views_profile ON map_location_views(profile_id);
    CREATE INDEX IF NOT EXISTS idx_map_location_views_date ON map_location_views(viewed_at DESC);
  `);

  // Migration: Add styling columns to link_items if they don't exist
  try {
    db.exec("SELECT backgroundColor FROM link_items LIMIT 1");
  } catch (e) {
    try {
      db.run("ALTER TABLE link_items ADD COLUMN metadata TEXT");
      db.run("ALTER TABLE link_items ADD COLUMN backgroundColor TEXT");
      db.run("ALTER TABLE link_items ADD COLUMN textColor TEXT");
      db.run("ALTER TABLE link_items ADD COLUMN borderRadius INTEGER");
      console.log('✅ Added styling columns to link_items table');
    } catch (alterError) {
      console.log('⚠️ Styling columns may already exist on link_items');
    }
  }

  console.log('✅ Phase 3 block types tables created/verified');

  // ========================================
  // PHASE 4: TEMPLATE SYSTEM TABLES
  // ========================================

  // vCard templates table (system and user-created)
  db.run(`
    CREATE TABLE IF NOT EXISTS vcard_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      thumbnail TEXT,

      -- Core configuration (stored as JSON)
      theme_config TEXT NOT NULL,
      blocks_config TEXT NOT NULL,
      social_profiles_config TEXT,

      -- Metadata
      is_system INTEGER DEFAULT 0,
      is_ai_generated INTEGER DEFAULT 0,
      tags TEXT,
      popularity INTEGER DEFAULT 0,

      -- Ownership
      created_by INTEGER,
      is_public INTEGER DEFAULT 0,

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_vcard_templates_category ON vcard_templates(category);
    CREATE INDEX IF NOT EXISTS idx_vcard_templates_is_system ON vcard_templates(is_system);
    CREATE INDEX IF NOT EXISTS idx_vcard_templates_tags ON vcard_templates(tags);
    CREATE INDEX IF NOT EXISTS idx_vcard_templates_created_by ON vcard_templates(created_by);
  `);

  // Template usage tracking
  db.run(`
    CREATE TABLE IF NOT EXISTS template_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      profile_id INTEGER NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      apply_mode TEXT,

      FOREIGN KEY (template_id) REFERENCES vcard_templates(id) ON DELETE CASCADE,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_template_usage_template ON template_usage(template_id);
    CREATE INDEX IF NOT EXISTS idx_template_usage_profile ON template_usage(profile_id);
    CREATE INDEX IF NOT EXISTS idx_template_usage_applied ON template_usage(applied_at DESC);
  `);

  console.log('✅ Phase 4 template system tables created/verified');

  // Save database to file
  saveDatabase();
  console.log('✅ Database initialized successfully');
}

// Debounced save timer
let saveTimer = null;
const SAVE_DEBOUNCE_MS = 1000; // Save at most once per second

// Save database to file with debouncing
function saveDatabase(immediate = false) {
  if (!db) return;

  // Clear any pending save
  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  const performSave = () => {
    try {
      const data = db.export();
      fs.writeFileSync(dbPath, Buffer.from(data));
      saveTimer = null;
    } catch (error) {
      console.error('Failed to save database:', error);
    }
  };

  if (immediate) {
    performSave();
  } else {
    saveTimer = setTimeout(performSave, SAVE_DEBOUNCE_MS);
  }
}

// Force immediate save (for critical operations)
function saveDatabaseSync() {
  if (!db) return;

  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }

  try {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  } catch (error) {
    console.error('Failed to save database sync:', error);
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

// Graceful shutdown handler - ensures database is saved before exit
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received, saving database before shutdown...`);
  saveDatabaseSync(); // Force immediate save

  if (db) {
    try {
      db.close();
      console.log('✅ Database saved and closed successfully');
    } catch (error) {
      console.error('❌ Error closing database:', error);
    }
  }

  process.exit(0);
};

// Register shutdown handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Ctrl+C
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // kill command
process.on('beforeExit', (code) => {
  if (code === 0) {
    saveDatabaseSync(); // Final save on clean exit
  }
});

module.exports = new Proxy(dbWrapper, {
  get: (target, prop) => {
    if (prop === 'ready') return dbReady;
    return target[prop];
  }
});
