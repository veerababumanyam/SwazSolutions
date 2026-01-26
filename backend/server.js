const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import centralized rate limiters
const { apiLimiter, authLimiter } = require('./middleware/rateLimit');

// Import authentication middleware
const { authenticateToken, optionalAuth, ENABLE_AUTH } = require('./middleware/auth');
const { checkSubscription } = require('./middleware/subscription');
const { handlePortConflict } = require('./utils/portManager');

// CORS Configuration - Origin Whitelisting
const parseAllowedOrigins = () => {
    const originsEnv = process.env.CORS_ALLOWED_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:5173';
    return originsEnv.split(',').map(origin => origin.trim()).filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();

const corsOriginValidator = (origin, callback) => {
    // Allow requests with no origin (same-origin, server-to-server, mobile apps, Postman)
    if (!origin) {
        return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
        return callback(null, true);
    }

    // In development, log rejected origins for debugging
    if (process.env.NODE_ENV !== 'production') {
        console.warn(`⚠️  CORS: Blocked request from unauthorized origin: ${origin}`);
        console.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`);
    }

    return callback(new Error(`CORS policy: Origin ${origin} is not allowed`), false);
};

const corsOptions = {
    origin: corsOriginValidator,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Gemini-API-Key'],
    optionsSuccessStatus: 200 // For legacy browser support
};

// Initialize database
const db = require('./config/database');

// Import routes
const createAuthRoutes = require('./routes/auth');
const createSongRoutes = require('./routes/songs');
const createPlaylistRoutes = require('./routes/playlists');
const createVisitorRoutes = require('./routes/visitors');
const createContactRoutes = require('./routes/contact');
const createLyricsRoutes = require('./routes/lyrics');
const createAlbumCoverRoutes = require('./routes/album-covers');
const { router: cameraUpdatesRouter, init: initCameraRoutes, saveUpdatesToDb } = require('./routes/cameraUpdates');

// Virtual Profile routes
const publicProfilesRouter = require('./routes/publicProfiles');
const profilesRouter = require('./routes/profiles');
const socialLinksRouter = require('./routes/social-links');
const linkItemsRouter = require('./routes/link-items'); // Modern vCard link items
const galleryUploadsRouter = require('./routes/gallery-uploads'); // Gallery image uploads
const avatarCropRouter = require('./routes/avatar-crop'); // Avatar crop settings
const themesRouter = require('./routes/themes');
const fontsRouter = require('./routes/fonts');
const qrCodesRouter = require('./routes/qr-codes');
const vcardsRouter = require('./routes/vcards');
const analyticsRouter = require('./routes/analytics');
const uploadsRouter = require('./routes/uploads');
const appearanceRouter = require('./routes/appearance');
const aiBioRouter = require('./routes/ai-bio'); // AI bio generation

// Digital Invites routes
const createInviteRoutes = require('./routes/invites');
const createInviteGuestsRoutes = require('./routes/invite-guests');
const createInviteGuestGroupsRoutes = require('./routes/invite-guest-groups');
const createInviteTemplatesRoutes = require('./routes/invite-templates');
const createInviteAnalyticsRoutes = require('./routes/invite-analytics');
const createInviteCheckInRoutes = require('./routes/invite-checkin');
const createInviteSharingRoutes = require('./routes/invite-sharing');
const createInviteGalleryRoutes = require('./routes/invite-gallery');

const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: corsOriginValidator,
        credentials: true,
        methods: ["GET", "POST"]
    }
});

// Socket.io Authentication Middleware
io.use((socket, next) => {
    try {
        // Parse cookies from handshake
        const cookies = socket.handshake.headers.cookie;
        if (!cookies) {
            return next(new Error('Authentication required'));
        }

        // Simple cookie parser for Socket.io
        const parsedCookies = {};
        cookies.split(';').forEach(cookie => {
            const [key, value] = cookie.trim().split('=');
            if (key && value) {
                parsedCookies[key] = decodeURIComponent(value);
            }
        });

        const token = parsedCookies.token;
        if (!token) {
            return next(new Error('Authentication token missing'));
        }

        // Verify JWT token
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            console.error('JWT_SECRET not configured for Socket.io authentication');
            return next(new Error('Server configuration error'));
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return next(new Error('Token expired'));
                }
                return next(new Error('Invalid token'));
            }

            // Attach user info to socket
            socket.userId = decoded.userId;
            socket.username = decoded.username;
            socket.userRole = decoded.role;

            console.log(`✅ Socket.io: User authenticated - ${socket.username} (${socket.userId})`);
            next();
        });
    } catch (error) {
        console.error('Socket.io authentication error:', error);
        next(new Error('Authentication failed'));
    }
});

const PORT = process.env.PORT || 3000;

// Rate limiters are imported from ./middleware/rateLimit.js
// - apiLimiter: 100 requests per minute (general API)
// - authLimiter: 30 requests per 15 minutes (auth operations)
// - strictAuthLimiter: 5 requests per 15 minutes (login/register - applied in auth routes)

// Database ready flag
let isDatabaseReady = false;
db.ready.then(() => {
    isDatabaseReady = true;
    console.log('✅ Database ready');
}).catch(err => {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
});

// Socket.io Logic with Authentication and Room Authorization
io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.username} (${socket.id})`);

    // User's personal room (for music player control)
    const userRoom = `user:${socket.userId}`;

    // Automatically join user's own room
    socket.join(userRoom);
    console.log(`📡 User ${socket.username} auto-joined room: ${userRoom}`);

    // Join room event - only allow users to join their own room
    socket.on('join_room', (room) => {
        // Verify user owns this room
        if (room !== userRoom && room !== `user:${socket.userId}`) {
            console.warn(`⚠️  Unauthorized: ${socket.username} tried to join room: ${room}`);
            socket.emit('error', { message: 'Cannot join other users\' rooms' });
            return;
        }

        socket.join(room);
        console.log(`✅ User ${socket.username} joined room: ${room}`);
    });

    // Music control events - verify room ownership
    const verifyRoomOwnership = (room) => {
        return room === userRoom || room === `user:${socket.userId}`;
    };

    socket.on('play', (data) => {
        if (!verifyRoomOwnership(data.room)) {
            console.warn(`⚠️  Unauthorized play: ${socket.username} tried to control room: ${data.room}`);
            return;
        }
        socket.to(data.room).emit('play', data);
    });

    socket.on('pause', (data) => {
        if (!verifyRoomOwnership(data.room)) {
            console.warn(`⚠️  Unauthorized pause: ${socket.username} tried to control room: ${data.room}`);
            return;
        }
        socket.to(data.room).emit('pause', data);
    });

    socket.on('seek', (data) => {
        if (!verifyRoomOwnership(data.room)) {
            console.warn(`⚠️  Unauthorized seek: ${socket.username} tried to control room: ${data.room}`);
            return;
        }
        socket.to(data.room).emit('seek', data);
    });

    socket.on('change_song', (data) => {
        if (!verifyRoomOwnership(data.room)) {
            console.warn(`⚠️  Unauthorized change_song: ${socket.username} tried to control room: ${data.room}`);
            return;
        }
        socket.to(data.room).emit('change_song', data);
    });

    socket.on('sync_state', (data) => {
        if (!verifyRoomOwnership(data.room)) {
            console.warn(`⚠️  Unauthorized sync_state: ${socket.username} tried to control room: ${data.room}`);
            return;
        }
        socket.to(data.room).emit('sync_state', data);
    });

    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.username} (${socket.id})`);
    });
});

// Security Headers Configuration with Helmet.js
// Implements CSP, X-Frame-Options, HSTS, and other security headers
app.use(helmet({
    // Content Security Policy - Restricts resource loading to trusted sources
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "https://accounts.google.com", "https://apis.google.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
            connectSrc: ["'self'", "https://accounts.google.com", "https://oauth2.googleapis.com", "https://fonts.googleapis.com"],
            frameSrc: ["'self'", "https://accounts.google.com", "https://accounts.google.com/gsi/"],
            childSrc: ["'self'", "https://accounts.google.com"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'self'"],
            upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        },
        reportOnly: false,
    },

    // X-Frame-Options - Prevents clickjacking attacks
    // frameGuard replaces the deprecated X-Frame-Options with frame-ancestors in CSP
    // but also sets X-Frame-Options for older browser compatibility
    frameguard: {
        action: 'sameorigin'
    },

    // Strict-Transport-Security (HSTS) - Forces HTTPS connections
    // Only enable in production with proper HTTPS setup
    strictTransportSecurity: process.env.NODE_ENV === 'production' ? {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true
    } : false,

    // X-Content-Type-Options - Prevents MIME-type sniffing
    noSniff: true,

    // X-XSS-Protection - Legacy XSS protection for older browsers
    xssFilter: true,

    // X-DNS-Prefetch-Control - Controls DNS prefetching
    dnsPrefetchControl: { allow: false },

    // X-Permitted-Cross-Domain-Policies - Restricts Adobe Flash/PDF policies
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },

    // Referrer-Policy - Controls referrer information leakage
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

    // Hide X-Powered-By header to obscure technology stack
    hidePoweredBy: true,

    // Origin-Agent-Cluster header - Enables origin-keyed agent clusters
    originAgentCluster: true,

    // Cross-Origin policies for enhanced isolation
    crossOriginEmbedderPolicy: false, // Disabled to allow Google OAuth iframes
    // COOP: Disabled in development to allow Vite HMR postMessage, enabled in production for security
    crossOriginOpenerPolicy: process.env.NODE_ENV === 'production'
        ? { policy: 'same-origin-allow-popups' } // Allow OAuth popups in production
        : false, // Disabled in development for Vite HMR compatibility
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resources (needed for OAuth)
}));

// Permissions-Policy header - Controls browser feature access
// This header is not included in Helmet by default
app.use((req, res, next) => {
    res.setHeader('Permissions-Policy',
        'accelerometer=(), autoplay=(self), camera=(), cross-origin-isolated=(), display-capture=(), ' +
        'encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), keyboard-map=(), ' +
        'magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(self), ' +
        'publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(self), usb=(), xr-spatial-tracking=()'
    );
    next();
});

// Webhook handler can be added here if needed, or handled via API routes.
// For Cashfree, we currently handle verification synchronously via /api/subscription/verify-payment.

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

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

// Import security logging middleware
const { securityLogger } = require('./middleware/securityLogger');

// Import SEO middleware for crawler optimization
const { seoMiddleware } = require('./middleware/seo-middleware');

// Logging middleware - development only (replaced by securityLogger in production)
app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    }
    next();
});

// Security logging middleware - logs all security-relevant events
// Always enabled in production for incident response and compliance
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_SECURITY_LOGGING === 'true') {
    app.use(securityLogger);
    console.log('🔒 Security logging enabled');
}

// Music files are now served from Cloudflare R2
// Local /music static serving is deprecated - files are accessed via R2 URLs directly
// Keeping musicDir for backward compatibility with scanner (deprecated parameter)
const musicDir = process.env.MUSIC_DIR || path.join(__dirname, '../data/MusicFiles');
if (process.env.R2_BUCKET_NAME) {
    console.log(`☁️  Music files served from Cloudflare R2 bucket: ${process.env.R2_BUCKET_NAME}`);
} else {
    console.warn(`⚠️  R2 not configured - music files will not be accessible`);
}

// Serve cover art
const coversDir = path.join(__dirname, '../data/covers');
if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
}
app.use('/covers', express.static(coversDir));
console.log(`🖼️  Serving covers from: ${coversDir}`);

// Serve uploaded files (avatars, logos, backgrounds)
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
console.log(`📤 Serving uploads from: ${uploadsDir}`);

// Initialize camera updates routes with database
initCameraRoutes(db);

// Conditional authentication middleware wrapper
// Only applies authentication when ENABLE_AUTH=true
const withAuth = ENABLE_AUTH ? authenticateToken : (req, res, next) => next();
const withOptionalAuth = optionalAuth;

// API Routes with rate limiting
// Authentication applied conditionally based on ENABLE_AUTH environment variable
// Set ENABLE_AUTH=true in .env to enable authentication for protected routes
const authRoutes = createAuthRoutes(db);
app.use('/api/auth', authRoutes);

// Subscription routes
const { createSubscriptionRoutes } = require('./routes/subscription');
app.use('/api/subscription', createSubscriptionRoutes(db));

// Protected routes (require authentication when ENABLE_AUTH=true)
// Apply checkSubscription to core services
app.use('/api/songs', apiLimiter, withAuth, checkSubscription, createSongRoutes(db));
app.use('/api/playlists', apiLimiter, withAuth, checkSubscription, createPlaylistRoutes(db));
app.use('/api/visitors', apiLimiter, withOptionalAuth, createVisitorRoutes(db)); // Optional auth for tracking
app.use('/api/contact', createContactRoutes(db)); // Contact has its own rate limiter, public access

// Gemini API proxy - protects API key server-side
const { createGeminiProxyRoutes } = require('./routes/gemini-proxy');
app.use('/api/gemini-proxy', createGeminiProxyRoutes());

app.use('/api/lyrics', apiLimiter, withAuth, checkSubscription, createLyricsRoutes(db)); // AI Lyrics generation
app.use('/api/album-covers', apiLimiter, withAuth, checkSubscription, createAlbumCoverRoutes(db)); // AI Album cover generation
app.use('/api/camera-updates', apiLimiter, cameraUpdatesRouter); // Public camera updates

// AI-optimized content routes for search engines
const aiContentRouter = require('./routes/ai-content');
app.use('/api/ai', aiContentRouter); // Structured data for AI crawlers

// Virtual Profile routes
app.use('/api/public', publicProfilesRouter); // No auth required - public profiles
app.use('/api/public/profile', vcardsRouter); // vCard downloads (mounted at /api/public/profile/:username/vcard)
app.use('/api/appearance', appearanceRouter); // Public appearance route (no auth for public/:username/appearance)
// Profiles editing requires subscription
app.use('/api/profiles', apiLimiter, withAuth, checkSubscription, profilesRouter); // Auth required - profile CRUD
app.use('/api/profiles', apiLimiter, withAuth, checkSubscription, socialLinksRouter); // Auth required - social links
app.use('/api/profiles', apiLimiter, withAuth, checkSubscription, linkItemsRouter); // Auth required - link items CRUD
app.use('/api/profiles', apiLimiter, withAuth, checkSubscription, galleryUploadsRouter); // Auth required - gallery uploads
app.use('/api/profiles', apiLimiter, withAuth, checkSubscription, avatarCropRouter); // Auth required - avatar crop
app.use('/api/profiles', apiLimiter, withAuth, checkSubscription, appearanceRouter); // Auth required - appearance settings
app.use('/api/profiles', withAuth, checkSubscription, aiBioRouter); // Auth required - AI bio generation (has own rate limiter)
app.use('/api/themes', withAuth, checkSubscription, themesRouter); // Auth required for custom themes
app.use('/api/fonts', fontsRouter); // Font options public
app.use('/api/qr-codes', apiLimiter, withAuth, qrCodesRouter); // Auth required - QR generation
app.use('/api/analytics', apiLimiter, withAuth, analyticsRouter); // Auth required - analytics
app.use('/api/uploads', apiLimiter, withAuth, uploadsRouter); // Auth required - file uploads

// Digital Invites API routes
app.use('/api/invites', apiLimiter, withAuth, checkSubscription, createInviteRoutes(db)); // Auth required - invitations CRUD
app.use('/api/invites', apiLimiter, withAuth, checkSubscription, createInviteGuestsRoutes(db)); // Auth required - guest management
app.use('/api/invites/guest-groups', apiLimiter, withAuth, checkSubscription, createInviteGuestGroupsRoutes(db)); // Auth required - guest groups
app.use('/api/invites/templates', createInviteTemplatesRoutes(db)); // Mixed auth - public marketplace, private my templates
app.use('/api/invites', apiLimiter, withAuth, checkSubscription, createInviteAnalyticsRoutes(db)); // Auth required - analytics
app.use('/api/invites', apiLimiter, withAuth, checkSubscription, createInviteCheckInRoutes(db)); // Auth required - check-in system
app.use('/api/invites', apiLimiter, withAuth, checkSubscription, createInviteSharingRoutes(db)); // Auth required - sharing
app.use('/api/invites', apiLimiter, withAuth, checkSubscription, createInviteGalleryRoutes(db)); // Auth required - gallery

// Health check (always public, with rate limiting)
app.get('/api/health', apiLimiter, (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Apply SEO middleware BEFORE static serving
// Detects crawlers and serves pre-rendered HTML with schema
app.use(seoMiddleware);

// Serve frontend (production)
const frontendDist = path.join(__dirname, '../dist');
if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));

    // SPA fallback - serve index.html for all non-API routes
    // Note: /music route is deprecated (music now served from R2)
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
let subscriptionExpirationIntervalId = null;

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
    if (subscriptionExpirationIntervalId) {
        clearInterval(subscriptionExpirationIntervalId);
        subscriptionExpirationIntervalId = null;
    }
};

// Start server with port conflict detection
(async () => {
    const AUTO_KILL = process.env.AUTO_KILL_PORT_CONFLICT === 'true';

    // Pre-flight port availability check
    const portAvailable = await handlePortConflict(PORT, AUTO_KILL);

    if (!portAvailable) {
        console.error(`❌ Cannot start server: Port ${PORT} is in use`);
        process.exit(1);
    }

    // Start server with comprehensive error handling
    const serverInstance = server.listen(PORT, '0.0.0.0', () => {
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

        if (ENABLE_AUTH) {
            console.log('🔒 Authentication: ENABLED ✅');
            console.log('   Protected routes require valid JWT token');
        } else {
            console.warn('⚠️  Authentication: DISABLED - OPEN ACCESS MODE');
            console.warn('   Set ENABLE_AUTH=true in .env to enable authentication');
        }

        console.log(`🌐 CORS: Whitelisted origins: ${allowedOrigins.join(', ')}`);
        console.log('');

    // Schedule music scan (every 24 hours) with safety boundaries and retry logic
    const SCAN_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
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
            // musicDir parameter is deprecated - scanner now uses R2 directly
            // Kept for backward compatibility
            const musicDir = process.env.MUSIC_DIR || path.join(__dirname, '../data/MusicFiles');

            // Run the R2 scan
            const result = await scanMusicDirectory(db, musicDir);
            console.log('✅ Scheduled R2 scan complete:', result);

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

    console.log('⏰ Scheduling music scan (Every 24 hours)...');

    // Run initial scan on startup (after a short delay to ensure DB is ready)
    setTimeout(() => {
        runSafeScan().catch(err => {
            console.error('❌ Critical error during initial scan:', err);
        });
    }, 5000); // 5 second delay

    // Start the interval for periodic scans
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

    // Subscription Expiration Check - Run every hour
    console.log('💳 Initializing Subscription Expiration Check...');

    async function checkExpiredSubscriptions() {
        try {
            const now = new Date().toISOString();
            const result = db.prepare(`
                UPDATE users 
                SET subscription_status = 'expired'
                WHERE subscription_status IN ('free', 'active', 'paid')
                  AND subscription_end_date < ?
                  AND subscription_status != 'expired'
            `).run(now);

            if (result.changes > 0) {
                console.log(`✅ Updated ${result.changes} expired subscription(s) to 'expired' status`);
            }
        } catch (error) {
            console.error('❌ Error checking expired subscriptions:', error.message);
            console.error(error.stack);
        }
    }

    // Run immediately on startup, then every hour
    setTimeout(() => {
        checkExpiredSubscriptions().catch(err => {
            console.error('❌ Initial subscription expiration check failed:', err);
        });
    }, 3000);

    const SUBSCRIPTION_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour
    subscriptionExpirationIntervalId = setInterval(() => {
        checkExpiredSubscriptions().catch(err => {
            console.error('❌ Subscription expiration check error:', err);
        });
    }, SUBSCRIPTION_CHECK_INTERVAL);
    console.log('⏰ Subscription expiration check scheduled (Hourly)');
    });

    // Handle server errors
    serverInstance.on('error', (error) => {
        if (error['code'] === 'EADDRINUSE') {
            console.error(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   ❌ CRITICAL ERROR: Port Already In Use               ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║   Port ${PORT} is occupied by another process          ║
║                                                        ║
║   This should not happen (pre-flight check passed)    ║
║   There may be a race condition.                      ║
║                                                        ║
║   Try restarting the application.                     ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
      `);
            process.exit(1);
        } else if (error['code'] === 'EACCES') {
            console.error(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   ❌ CRITICAL ERROR: Permission Denied                 ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║   Port ${PORT} requires elevated privileges            ║
║                                                        ║
║   Solutions:                                           ║
║   1. Use a port >= 1024 (recommended)                 ║
║   2. Run with administrator privileges (not recommended) ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
      `);
            process.exit(1);
        } else {
            console.error(`❌ Server error:`, error);
            process.exit(1);
        }
    });

    // Update graceful shutdown to reference serverInstance
    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        cleanupScheduledTasks();
        serverInstance.close(() => {
            db.close();
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        console.log('\nSIGINT signal received: closing HTTP server');
        cleanupScheduledTasks();
        serverInstance.close(() => {
            db.close();
            process.exit(0);
        });
    });
})();

module.exports = app;
