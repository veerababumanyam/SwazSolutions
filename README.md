# Swaz Music Streaming - Full-Stack Web Application

A self-contained music streaming application with built-in backend (Node.js + SQLite) supporting 100-10,000 concurrent users.

## Features

✅ **Multi-User Support** - User registration and authentication  
✅ **Music Streaming** - Stream music from local files  
✅ **Playlists** - Create and manage personal playlists  
✅ **Search** - Find songs, albums, and artists  
✅ **Play Tracking** - Track play counts and favorites  
✅ **Auto-Discovery** - Automatic music folder scanning  
✅ **Self-Contained** - No external dependencies (no cloud, no Docker)  

## Quick Start

###  1. Install Dependencies

```bash
npm install
```

### 2. Add Your Music

Put your music files in `data/MusicFiles/`:

```
data/MusicFiles/
├── Album 1/
│   ├── song1.mp3
│   └── song2.mp3
└── Album 2/
    └── song3.mp3
```

### 3. Start the Server

**Development Mode (with hot reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
# Build frontend
npm run build

# Start server
npm start
```

### 4. Access the Application

- **Local:** http://localhost:3000
- **Network:** http://YOUR_IP:3000 (share with others!)

## Project Structure

```
swaz-music/
├── backend/                # Node.js backend
│   ├── server.js          # Express server
│   ├── config/
│   │   └── database.js    # SQLite database
│   ├── routes/
│   │   ├── auth.js        # Authentication
│   │   ├── songs.js       # Music API
│   │   └── playlists.js   # Playlist management
│   └── middleware/
│       └── auth.js        # JWT middleware
├── src/                   # React frontend
├── data/Music Files/       # Your music collection
├── music.db               # SQLite database (auto-created)
└── .env                   # Configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Songs
- `GET /api/songs` - List all songs
- `GET /api/songs/:id` - Get song details
- `POST /api/songs/scan` - Scan music folder
- `POST /api/songs/:id/play` - Track play count
- `GET /api/albums/list` - List all albums
- `GET /api/search?q=query` - Search music

### Playlists
- `GET /api/playlists` - List user playlists
- `POST /api/playlists` - Create playlist
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/songs` - Add song
- `DELETE /api/playlists/:id/songs/:songId` - Remove song

## Configuration

Edit `.env` file:

```bash
PORT=3000
JWT_SECRET=your-secret-key-minimum-32-characters
MUSIC_DIR=./data/MusicFiles
DB_PATH=./music.db
```

## Deployment

### Using PM2 (Recommended for Production)

```bash
# Install PM2
npm install -g pm2

# Build frontend
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Auto-start on system boot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### Manual Deployment

```bash
# Build
npm run build

# Start (keep running)
npm start
```

## Scaling

### Hardware Requirements

| Users | CPU | RAM | Storage | Bandwidth |
|-------|-----|-----|---------|-----------|
| 100 | 2-core | 2GB | 100GB | 10 Mbps |
| 1,000 | 4-core | 8GB | 500GB | 100 Mbps |
| 10,000 | 8-core | 32GB | 2TB | 1 Gbps |

### Performance Tips

1. **Enable Clustering** - PM2 automatically uses all CPU cores
2. **Add Nginx** - For better static file serving
3. **Optimize Database** - Run `VACUUM` periodically
4. **Use SSD** - For better I/O performance

## Troubleshooting

### Database Issues

```bash
# Delete database to reset
rm music.db

# Restart server (will recreate database)
npm start
```

### Scan Not Finding Music

```bash
# Check music directory exists
ls -la data/MusicFiles/

# Manually trigger scan
curl -X POST http://localhost:3000/api/songs/scan
```

### Port Already in Use

```bash
# Change port in .env
PORT=4000

# Or kill existing process
lsof -ti:3000 | xargs kill -9
```

## Development

### Running Tests

```bash
# Install test dependencies
npm install --save-dev jest supertest

# Run tests
npm test
```

### API Testing

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password123"}'

# Get songs (with auth)
curl http://localhost:3000/api/songs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## License

MIT

## Support

For issues and questions, open an issue on GitHub.
