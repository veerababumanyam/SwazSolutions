const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Initialize database
const db = require('./config/database');

// Import routes
const createAuthRoutes = require('./routes/auth');
const createSongRoutes = require('./routes/songs');
const createPlaylistRoutes = require('./routes/playlists');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on('play', (data) => {
        socket.to(data.room).emit('play', data);
    });

    socket.on('pause', (data) => {
        socket.to(data.room).emit('pause', data);
    });

    socket.on('seek', (data) => {
        socket.to(data.room).emit('seek', data);
    });

    socket.on('change_song', (data) => {
        socket.to(data.room).emit('change_song', data);
    });

    socket.on('sync_state', (data) => {
        socket.to(data.room).emit('sync_state', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Serve music files
const musicDir = process.env.MUSIC_DIR || path.join(__dirname, '../data/MusicFiles');
if (fs.existsSync(musicDir)) {
    app.use('/music', express.static(musicDir));
    console.log(`📁 Serving music from: ${musicDir}`);
} else {
    console.warn(`⚠️  Music directory not found: ${musicDir}`);
}

// API Routes
app.use('/api/auth', createAuthRoutes(db));
app.use('/api/songs', createSongRoutes(db));
app.use('/api/playlists', createPlaylistRoutes(db));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Serve frontend (production)
const frontendDist = path.join(__dirname, '../dist');
if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));

    // SPA fallback - serve index.html for all non-API routes
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api') && !req.path.startsWith('/music')) {
            res.sendFile(path.join(frontendDist, 'index.html'));
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    });
} else {
    console.warn(`⚠️  Frontend dist not found. Run 'npm run build' first.`);
    app.get('/', (req, res) => {
        res.send(`
      <h1>Swaz Music Streaming Backend</h1>
      <p>Frontend not built yet. Run <code>npm run build</code> to build the frontend.</p>
      <h2>API Endpoints:</h2>
      <ul>
        <li>GET /api/health - Health check</li>
        <li>POST /api/auth/register - Register user</li>
        <li>POST /api/auth/login - Login</li>
        <li>GET /api/songs - List songs</li>
        <li>POST /api/songs/scan - Scan music folder</li>
        <li>GET /api/playlists - List playlists</li>
      </ul>
    `);
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Get local IP address
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();

    console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🎵  Swaz Music Streaming Server                     ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║   Status:    RUNNING ✅                                ║
║   Port:      ${PORT}                                        ║
║                                                        ║
║   Local Access:                                        ║
║   → http://localhost:${PORT}                               ║
║                                                        ║
║   Network Access (share with others):                  ║
║   → http://${localIP}:${PORT}                    ║
║                                                        ║
║   API Documentation:                                   ║
║   → http://localhost:${PORT}/api/health                    ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);

    console.log('🎯 Ready to serve music!');
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    db.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    db.close();
    process.exit(0);
});

module.exports = app;
