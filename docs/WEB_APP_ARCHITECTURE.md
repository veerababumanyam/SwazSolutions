# Self-Contained Web-Based Music Streaming Application

## What You Want

✅ **Web-based** - Users open browser and go to your URL  
✅ **All code in one project** - Frontend + Backend together  
✅ **Built-in database** - SQLite file (no external PostgreSQL)  
✅ **No external services** - No AWS, no cloud, all self-contained  
✅ **Deploy once** - Run on your own server/computer  

---

## Architecture

```
Your Server/Computer Running:
┌────────────────────────────────────────────────┐
│  Swaz Music Streaming (One Application)       │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  Node.js Backend (Port 3000)             │ │
│  │  - Express server                        │ │
│  │  - Built-in authentication               │ │
│  │  - Music streaming API                   │ │
│  │  - Serves React frontend                 │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  SQLite Database (single file)           │ │
│  │  - music.db (all data in one file)       │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  Music Files Folder                      │ │
│  │  - /music/songs/                         │ │
│  │  - /music/covers/                        │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
                       ▲
                       │ HTTP
         ┌─────────────┴─────────────┐
         │                           │
    User Browser              User Browser
    (100 users)              (10,000 users)
```

**How It Works:**
1. You run `npm start` on your server
2. Application starts on `http://your-server:3000`
3. Users visit the URL in their browser
4. Everything runs from ONE codebase!

---

## Project Structure

```
swaz-music/
├── frontend/              # React app (your existing code)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/               # Node.js server (NEW)
│   ├── server.js         # Main server file
│   ├── routes/
│   │   ├── auth.js       # Login/register
│   │   ├── songs.js      # Music API
│   │   └── playlists.js  # Playlist management
│   ├── database/
│   │   ├── db.js         # SQLite connection
│   │   └── schema.sql    # Database structure
│   └── middleware/
│       └── auth.js       # JWT authentication
│
├── music/                 # Music files storage
│   ├── songs/
│   └── covers/
│
├── music.db              # SQLite database file
├── package.json          # All dependencies
└── .env                  # Configuration
```

---

## Implementation

### Step 1: Backend Server (Built-in)

**backend/server.js:**
```javascript
const express = require('express');
const path = require('path');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('music.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT,
    album TEXT,
    file_path TEXT NOT NULL,
    duration INTEGER,
    genre TEXT,
    play_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    is_public BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id INTEGER,
    song_id INTEGER,
    position INTEGER,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (song_id) REFERENCES songs(id)
  );
`);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use('/music', express.static(path.join(__dirname, '../music')));

// API Routes
const authRoutes = require('./routes/auth');
const songRoutes = require('./routes/songs');
const playlistRoutes = require('./routes/playlists');

app.use('/api/auth', authRoutes(db));
app.use('/api/songs', songRoutes(db));
app.use('/api/playlists', playlistRoutes(db));

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
    🎵 Swaz Music Streaming Server Running
    
    Local:   http://localhost:${PORT}
    Network: http://${getLocalIP()}:${PORT}
    
    Share network URL with users!
  `);
});

function getLocalIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}
```

**backend/routes/auth.js:**
```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (db) => {
  const router = express.Router();

  // Register
  router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    
    try {
      const hash = await bcrypt.hash(password, 10);
      const stmt = db.prepare('INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)');
      const result = stmt.run(username, hash, email);
      
      res.json({ id: result.lastInsertRowid, username });
    } catch (error) {
      res.status(400).json({ error: 'Username or email already exists' });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  });

  return router;
};
```

**backend/routes/songs.js:**
```javascript
const express = require('express');
const fs = require('fs');
const path = require('path');
const { getAudioDurationInSeconds } = require('get-audio-duration');

module.exports = (db) => {
  const router = express.Router();

  // Get all songs
  router.get('/', (req, res) => {
    const songs = db.prepare('SELECT * FROM songs ORDER BY title').all();
    res.json(songs);
  });

  // Get song by ID
  router.get('/:id', (req, res) => {
    const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id);
    if (!song) return res.status(404).json({ error: 'Song not found' });
    res.json(song);
  });

  // Scan music folder
  router.post('/scan', async (req, res) => {
    const musicDir = path.join(__dirname, '../../music/songs');
    
    try {
      const files = fs.readdirSync(musicDir, { recursive: true });
      const audioFiles = files.filter(f => 
        f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.ogg')
      );

      for (const file of audioFiles) {
        const fullPath = path.join(musicDir, file);
        const relativePath = `/music/songs/${file}`;
        
        // Extract metadata from file path
        const parts = file.split('/');
        const album = parts.length > 1 ? parts[0] : 'Unknown Album';
        const filename = parts[parts.length - 1];
        const title = filename.replace(/\.\w+$/, '');
        
        // Get duration
        let duration = 0;
        try {
          duration = Math.floor(await getAudioDurationInSeconds(fullPath));
        } catch (e) {
          console.warn('Could not get duration for:', file);
        }

        // Insert or update song
        const stmt = db.prepare(`
          INSERT INTO songs (title, album, file_path, duration)
          VALUES (?, ?, ?, ?)
          ON CONFLICT (file_path) DO UPDATE SET
            title = excluded.title,
            album = excluded.album,
            duration = excluded.duration
        `);
        
        stmt.run(title, album, relativePath, duration);
      }

      const songCount = db.prepare('SELECT COUNT(*) as count FROM songs').get();
      res.json({ message: 'Scan complete', songCount: songCount.count });
    } catch (error) {
      res.status(500).json({ error: 'Scan failed', details: error.message });
    }
  });

  // Increment play count
  router.post('/:id/play', (req, res) => {
    const stmt = db.prepare('UPDATE songs SET play_count = play_count + 1 WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  });

  return router;
};
```

### Step 2: Package.json (All Dependencies)

```json
{
  "name": "swaz-music-streaming",
  "version": "1.0.0",
  "description": "Self-contained web-based music streaming",
  "scripts": {
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "nodemon backend/server.js",
    "dev": "concurrently \"npm:dev:frontend\" \"npm:dev:backend\"",
    "build:frontend": "cd frontend && npm run build",
    "start": "node backend/server.js",
    "deploy": "npm run build:frontend && npm start"
  },
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^9.2.2",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "get-audio-duration": "^4.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "concurrently": "^8.2.2"
  }
}
```

### Step 3: Environment Configuration

**.env:**
```bash
PORT=3000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MUSIC_DIR=./music
DB_PATH=./music.db
```

---

## Deployment Steps

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create music folder
mkdir -p music/songs music/covers

# 3. Add your music files to music/songs/

# 4. Run in development mode
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

### Production Deployment

```bash
# 1. Build frontend
npm run build:frontend

# 2. Start server
npm start

# Server runs on http://your-ip:3000
# Users access from any browser!
```

### Deploy on Your Server

**Option 1: Direct on Linux Server**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your project
git clone https://github.com/yourname/swaz-music.git
cd swaz-music

# Install and start
npm install
npm run build:frontend
npm start
```

**Option 2: Keep Running with PM2**
```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start backend/server.js --name swaz-music

# Auto-start on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

---

## Scaling for Users

### 100 Users (Basic Server)
- RAM: 2GB
- CPU: 2 cores
- Storage: 100GB
- **Cost: ~$5-10/month VPS** (DigitalOcean, Linode)

### 1,000 Users (Medium Server)
- RAM: 8GB
- CPU: 4 cores
- Storage: 500GB
- **Cost: ~$40-80/month VPS**

### 10,000 Users (Large Server)
- RAM: 32GB
- CPU: 8-16 cores
- Storage: 2TB
- **Cost: ~$160-320/month dedicated server**

---

## All Features Included

✅ **User Authentication** - Built-in login/register  
✅ **Music Streaming** - Serve files directly  
✅ **Playlists** - User playlists in SQLite  
✅ **Search** - Query songs/albums  
✅ **Play Counts** - Track popularity  
✅ **Multi-user** - 100-10K concurrent users  
✅ **One Codebase** - Everything together  
✅ **No External Services** - Fully self-contained  

---

## Summary

**What you're getting:**
- One project folder with ALL code
- Frontend (React) + Backend (Node.js) together
- SQLite database (one file, no separate database server)
- Run `npm start` and it's live
- Users access via web browser
- Host on your own server (no cloud dependency)

**Should I create this full-stack implementation now?**

I'll:
1. Create the backend folder structure
2. Set up Express server with SQLite
3. Add authentication routes
4. Update your frontend to use the built-in API
5. Test multi-user access

Ready to proceed?
