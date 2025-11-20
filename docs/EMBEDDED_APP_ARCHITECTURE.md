# Fully Embedded Music Streaming Application

## What You Want: Single Standalone Application

**Zero external dependencies** - Everything runs inside the application:
✅ No Docker, no PostgreSQL, no Redis, no Nginx  
✅ No separate backend server  
✅ All database functionality built-in  
✅ All features in one executable/app  

---

## Architecture: Electron Desktop App

### Why Electron?

Electron lets you build a **single cross-platform application** that:
- Runs on Windows, Mac, Linux
- Has built-in web server
- Has built-in database (SQLite)
- Can access local file system
- Packages everything into one installer
- **No external dependencies needed**

### Application Structure

```
Music Streaming App (Single Executable)
│
├── Frontend (React - already built!)
├── Built-in Backend (Node.js in Electron)
├── Built-in Database (Better-SQLite3)
├── Built-in File Server (Express in Electron)
└── Built-in Music Scanner
```

**Users run ONE application** - everything included!

---

## Technical Architecture

### Option 1: Electron App (Recommended - Multi-User)

**Single executable that contains:**

```
┌─────────────────────────────────────────────┐
│         Electron Application (.exe)         │
│                                             │
│  ┌────────────────────────────────────┐   │
│  │  Frontend (React)                  │   │
│  │  - Your existing music player UI   │   │
│  └────────────────────────────────────┘   │
│                                             │
│  ┌────────────────────────────────────┐   │
│  │  Backend (Node.js/Express)         │   │
│  │  - Runs on localhost:3000          │   │
│  │  - Serves music files              │   │
│  │  - Handles authentication          │   │
│  └────────────────────────────────────┘   │
│                                             │
│  ┌────────────────────────────────────┐   │
│  │  Database (SQLite - single file)   │   │
│  │  - All user data                   │   │
│  │  - Songs metadata                  │   │
│  │  - Playlists                       │   │
│  └────────────────────────────────────┘   │
│                                             │
│  ┌────────────────────────────────────┐   │
│  │  Music Files (Local folder)        │   │
│  │  - Auto-discovered                 │   │
│  │  - Served internally               │   │
│  └────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**How It Works:**
1. User downloads **one .exe file** (or .dmg for Mac)
2. Double-click to launch
3. App starts local server on `localhost:3000`
4. Opens browser automatically to `localhost:3000`
5. **100-10K users connect to `http://your-ip:3000`** from their browsers
6. Everything runs from this one app!

**Perfect for:** Running on one machine, others access via network

---

### Option 2: Progressive Web App (PWA) - Fully Browser-Based

**Everything runs in the browser:**

```
┌─────────────────────────────────────────┐
│          Browser Only                   │
│  (No installation needed!)              │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  React Frontend                   │ │
│  │  - Music player UI                │ │
│  │  - All existing features          │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  IndexedDB (Built-in Browser DB)  │ │
│  │  - Songs metadata                 │ │
│  │  - Playlists                      │ │
│  │  - User preferences               │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Web Workers (Background Tasks)   │ │
│  │  - File scanning                  │ │
│  │  - Audio processing               │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  File System Access API           │ │
│  │  - Access music folder            │ │
│  │  - No file upload needed          │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Perfect for:** Single user on their own computer

---

## Recommended: Electron Multi-User Solution

### Project Structure

```
swaz-music-app/
├── package.json
├── electron/
│   ├── main.ts              # Electron main process
│   ├── preload.ts           # Security bridge
│   └── server.ts            # Built-in backend
├── src/                     # Your existing React app
│   ├── components/
│   ├── contexts/
│   └── pages/
├── database/
│   └── schema.sql           # SQLite schema
└── build/                   # Production build
    └── app.exe              # Final single executable
```

### Implementation Steps

**Step 1: Install Electron**

```json
// package.json updates
{
  "name": "swaz-music-streaming",
  "version": "1.0.0",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build && electron-builder",
    "electron:dev": "concurrently \"vite\" \"electron .\"",
    "electron:build": "electron-builder"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1",
    "concurrently": "^8.2.2"
  },
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^9.2.2",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2"
  },
  "build": {
    "appId": "com.swaz.music",
    "productName": "Swaz Music Streaming",
    "files": [
      "dist/**/*",
      "electron/**/*",
      "database/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "assets/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "assets/icon.png"
    }
  }
}
```

**Step 2: Electron Main Process**

```typescript
// electron/main.ts
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { startServer } from './server';

let mainWindow: BrowserWindow | null;
let serverPort = 3000;

async function createWindow() {
  // Start built-in server
  await startServer(serverPort);
  
  // Create browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadURL(`http://localhost:${serverPort}`);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

**Step 3: Built-in Backend Server**

```typescript
// electron/server.ts
import express from 'express';
import path from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const db = new Database('swaz-music.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT,
    album TEXT,
    file_path TEXT NOT NULL,
    duration INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// API Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  
  try {
    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    const result = stmt.run(username, hash);
    res.json({ id: result.lastInsertRowid, username });
  } catch (error) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (!user || !await bcrypt.compare(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id, username }, 'your-secret-key', { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username } });
});

app.get('/api/songs', (req, res) => {
  const songs = db.prepare('SELECT * FROM songs').all();
  res.json(songs);
});

app.post('/api/songs/scan', (req, res) => {
  const { folderPath } = req.body;
  // Scan folder and add to database
  // (Use your existing MusicFileWatcher logic)
  res.json({ message: 'Scan complete' });
});

// Serve music files
app.use('/music', express.static(process.env.MUSIC_DIR || '/var/music'));

export function startServer(port: number) {
  return new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`🎵 Server running on http://localhost:${port}`);
      resolve(true);
    });
  });
}
```

**Step 4: Update Frontend to Use Built-in API**

```typescript
// src/config/api.ts
const API_BASE = window.electron 
  ? 'http://localhost:3000/api'  // Electron app
  : '/api';                        // PWA/Web

export const api = {
  login: (username: string, password: string) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }),
  
  getSongs: () =>
    fetch(`${API_BASE}/songs`).then(r => r.json()),
  
  // ... more endpoints
};
```

---

## Build & Distribution

### Build Single Executable

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Build Electron app
npm run electron:build

# Output:
# Windows: dist/Swaz Music Streaming Setup.exe (single installer)
# Mac: dist/Swaz Music Streaming.dmg
# Linux: dist/Swaz Music Streaming.AppImage
```

### What Users Get

**One file installation:**
- Windows: `Swaz-Music-Setup.exe` (~150MB)
- Mac: `Swaz-Music.dmg` (~150MB)
- Linux: `Swaz-Music.AppImage` (~150MB)

**After installation:**
1. User double-clicks app icon
2. App opens and shows music player
3. App runs server on `localhost:3000`
4. Other users on network can access at `http://[your-ip]:3000`

**Everything is inside the app** - no external services needed!

---

## Multi-User Access

### Network Access (LAN)

```typescript
// electron/main.ts - configure network access
import os from 'os';

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Show access URL in app
const localIP = getLocalIP();
console.log(`
  🎵 Server running!
  
  Local: http://localhost:${port}
  Network: http://${localIP}:${port}
  
  Share the network URL with others!
`);
```

**Other users access via:**
- `http://192.168.1.X:3000` (your local IP)

---

## Scaling for 100-10K Users

### Hardware Requirements (Single Machine)

```
100 users:     16GB RAM, 4-core CPU
1,000 users:   32GB RAM, 8-core CPU  
10,000 users:  64GB RAM, 16-core CPU
```

### Performance Optimizations

```typescript
// Enable clustering in Electron
import cluster from 'cluster';
import os from 'os';

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  startServer(3000);
}
```

---

## Summary

**You get:**
✅ **ONE executable** (no Docker, PostgreSQL, Redis, etc.)  
✅ **Built-in database** (SQLite file)  
✅ **Built-in server** (Express in Electron)  
✅ **Built-in authentication**  
✅ **Network access** (others connect via your IP)  
✅ **Cross-platform** (Windows/Mac/Linux)  

**Users experience:**
1. Download ONE installer file
2. Install app (click, click, done)
3. Launch app
4. Access from any browser on network

**Should I start building this Electron-based standalone application?**
