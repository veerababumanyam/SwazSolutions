const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

// Initialize database
const db = require('./config/database');

// Import routes
const createAuthRoutes = require('./routes/auth');
const createSongRoutes = require('./routes/songs');
const createPlaylistRoutes = require('./routes/playlists');
const createVisitorRoutes = require('./routes/visitors');
const createContactRoutes = require('./routes/contact');
const { router: cameraUpdatesRouter, init: initCameraRoutes, saveUpdatesToDb } = require('./routes/cameraUpdates');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Rate Limiters
const authLimiter = rateLimit({
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute  
    max: parseInt(process.env.API_RATE_LIMIT_MAX) || 100,
    message: 'Too many requests, please slow down',
    standardHeaders: true,
    legacyHeaders: false,
});

// Database ready flag
let isDatabaseReady = false;
db.ready.then(() => {
    isDatabaseReady = true;
    console.log('✅ Database ready');
}).catch(err => {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
});

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
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:"],
        },
    },
}));
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database readiness check
app.use((req, res, next) => {
    if (!isDatabaseReady && !req.path.startsWith('/api/health')) {
        return res.status(503).json({
            error: 'Service initializing',
            message: 'Database is starting up, please try again in a moment'
        });
    }
    next();
});

// Logging middleware
app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    }
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

// Serve cover art
const coversDir = path.join(__dirname, '../data/covers');
if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
}
app.use('/covers', express.static(coversDir));
console.log(`🖼️  Serving covers from: ${coversDir}`);

// Initialize camera updates routes with database
initCameraRoutes(db);

// API Routes with rate limiting
// Note: Authentication is disabled for open access
// Auth routes kept for future use but not enforced
app.use('/api/auth', apiLimiter, createAuthRoutes(db));
app.use('/api/songs', apiLimiter, createSongRoutes(db));
app.use('/api/playlists', apiLimiter, createPlaylistRoutes(db));
app.use('/api/visitors', apiLimiter, createVisitorRoutes(db));
app.use('/api/contact', createContactRoutes(db)); // Contact has its own rate limiter
app.use('/api/camera-updates', apiLimiter, cameraUpdatesRouter);

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

// Scheduled scan variables (module scope for cleanup)
let scanIntervalId = null;
let scanRetryTimeoutId = null;
let isScanning = false;
let cameraScraperIntervalId = null;

// Cleanup function for graceful shutdown
const cleanupScheduledTasks = () => {
    if (scanIntervalId) {
        clearInterval(scanIntervalId);
        scanIntervalId = null;
    }
    if (scanRetryTimeoutId) {
        clearTimeout(scanRetryTimeoutId);
        scanRetryTimeoutId = null;
    }
    if (cameraScraperIntervalId) {
        clearInterval(cameraScraperIntervalId);
        cameraScraperIntervalId = null;
    }
};

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
    console.log('⚠️  Running in OPEN ACCESS mode - no authentication required');
    console.log('');

    // Schedule music scan (every 12 hours) with safety boundaries and retry logic
    const SCAN_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 5000; // 5 seconds between retries
    const { scanMusicDirectory } = require('./services/musicScanner');

    async function runSafeScan(retryCount = 0) {
        // Prevent concurrent scans
        if (isScanning) {
            console.log('⏭️  Scan already in progress, skipping...');
            return;
        }

        // Clear any pending retry timeout
        if (scanRetryTimeoutId) {
            clearTimeout(scanRetryTimeoutId);
            scanRetryTimeoutId = null;
        }

        isScanning = true;
        console.log(`🔄 Starting scheduled music scan (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})...`);

        try {
            const musicDir = process.env.MUSIC_DIR || path.join(__dirname, '../data/MusicFiles');

            // Run the scan
            const result = await scanMusicDirectory(db, musicDir);
            console.log('✅ Scheduled scan complete:', result);

        } catch (error) {
            console.error(`❌ Scheduled scan failed (Attempt ${retryCount + 1}):`, error.message);

            // Retry logic
            if (retryCount < MAX_RETRIES) {
                console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
                scanRetryTimeoutId = setTimeout(() => {
                    scanRetryTimeoutId = null;
                    runSafeScan(retryCount + 1).catch(err => {
                        console.error('❌ Critical error during retry:', err);
                    });
                }, RETRY_DELAY_MS);
            } else {
                console.error('❌ Max retries reached. Giving up until next schedule.');
            }
        } finally {
            isScanning = false;
        }
    }

    console.log('⏰ Scheduling music scan (Every 12 hours)...');

    // Start the interval
    scanIntervalId = setInterval(() => {
        // Wrap in top-level try-catch to guarantee server stability
        try {
            runSafeScan().catch(err => {
                console.error('❌ Critical error initiating scheduled scan:', err);
            });
        } catch (criticalError) {
            console.error('❌ Critical error initiating scheduled scan:', criticalError);
        }
    }, SCAN_INTERVAL_MS);

    // Camera Updates AI Agent - Daily scraping
    console.log('📸 Initializing Camera Updates AI Agent...');
    const { scrapeAllBrands } = require('./services/cameraUpdatesScraper');

    async function runCameraScraper() {
        try {
            console.log('🔄 Starting camera updates scraping...');
            const updates = await scrapeAllBrands();

            if (updates && updates.length > 0) {
                const result = saveUpdatesToDb(updates);
                if (result.inserted > 0 || result.updated > 0) {
                    console.log(`✅ Camera updates saved: ${result.inserted} new, ${result.updated} updated, ${result.skipped} unchanged (${updates.length} total)`);
                } else {
                    console.log(`ℹ️  All ${result.skipped} updates are current, no changes needed`);
                }
            } else {
                const existingCount = db.prepare('SELECT COUNT(*) as count FROM camera_updates').get().count;
                console.log(`ℹ️  No new updates from scraper, keeping ${existingCount} existing updates active`);
            }
        } catch (error) {
            console.error('❌ Camera scraper error:', error.message);
            console.error(error.stack);
            const existingCount = db.prepare('SELECT COUNT(*) as count FROM camera_updates').get().count;
            console.log(`ℹ️  Scraper failed, preserving ${existingCount} existing updates`);
        }
    }

    // Wait a bit for database to be fully ready, then run
    setTimeout(() => {
        runCameraScraper().catch(err => {
            console.error('❌ Initial camera scraper failed:', err);
        });
    }, 2000);

    // Schedule daily updates (every 24 hours)
    const CAMERA_SCRAPE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
    cameraScraperIntervalId = setInterval(runCameraScraper, CAMERA_SCRAPE_INTERVAL);
    console.log('⏰ Camera updates scheduled (Daily)');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    cleanupScheduledTasks();
    server.close(() => {
        db.close();
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    cleanupScheduledTasks();
    server.close(() => {
        db.close();
        process.exit(0);
    });
});

module.exports = app;
