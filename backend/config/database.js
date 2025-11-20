const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Database file path
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../music.db');

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
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Songs table
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT,
      album TEXT,
      file_path TEXT UNIQUE NOT NULL,
      duration INTEGER,
      genre TEXT,
      play_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

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
  `);

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
        db.run(sql, params);
        saveDatabase();
        // sql.js doesn't have a direct lastInsertRowid, simulate it
        const lastRowIdResult = db.exec('SELECT last_insert_rowid() as id');
        const lastInsertRowid = lastRowIdResult.length > 0 && lastRowIdResult[0].values.length > 0 ? lastRowIdResult[0].values[0][0] : 0;
        return { lastInsertRowid: lastInsertRowid, changes: 1 };
      },
      get: (...params) => {
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
