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
        db.run(sql, params);
        saveDatabase();
        // sql.js doesn't have a direct lastInsertRowid, simulate it
        const lastRowIdResult = db.exec('SELECT last_insert_rowid() as id');
        const lastInsertRowid = lastRowIdResult.length > 0 && lastRowIdResult[0].values.length > 0 ? lastRowIdResult[0].values[0][0] : 0;
        return { lastInsertRowid: lastInsertRowid, changes: 1 };
      },
      get: (...params) => {
        if (!db) return null;
        const result = db.exec(sql, params);
        if (result.length === 0) return null;
        const row = result[0];
        if (row.values.length === 0) return null;
        const obj = {};
        row.columns.forEach((col, idx) => {
          obj[col] = row.values[0][idx];
        });
        return obj;
      },
      all: (...params) => {
        if (!db) return [];
        const result = db.exec(sql, params);
        if (result.length === 0) return [];
        const row = result[0];
        return row.values.map(values => {
          const obj = {};
          row.columns.forEach((col, idx) => {
            obj[col] = values[idx];
          });
          return obj;
        });
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
