const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { OAuth2Client } = require('google-auth-library');
const {
    authenticateToken,
    JWT_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY_DAYS,
    generateRefreshToken,
    hashRefreshToken
} = require('../middleware/auth');
const { strictAuthLimiter, authLimiter } = require('../middleware/rateLimit');
const logger = require('../utils/logger');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function createAuthRoutes(db) {
    const router = express.Router();

    // Set access token cookie (short-lived)
    const setTokenCookie = (res, token) => {
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes (matches ACCESS_TOKEN_EXPIRY)
        });
    };

    // Set refresh token cookie (long-lived)
    const setRefreshTokenCookie = (res, refreshToken) => {
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/auth', // Restrict to auth routes only
            maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        });
    };

    // Store refresh token in database
    const storeRefreshToken = (userId, refreshToken, req) => {
        const tokenHash = hashRefreshToken(refreshToken);
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
            .toISOString().replace('T', ' ').substring(0, 19);
        const deviceInfo = req.headers['user-agent'] || 'Unknown';
        const ipAddress = req.ip || req.connection.remoteAddress;

        db.prepare(
            `INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at)
             VALUES (?, ?, ?, ?, ?)`
        ).run(userId, tokenHash, deviceInfo, ipAddress, expiresAt);
    };

    // Generate both access and refresh tokens
    const generateTokens = (user, req, res) => {
        // Generate short-lived access token
        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role || 'user' },
            JWT_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        // Generate refresh token
        const refreshToken = generateRefreshToken();

        // Store refresh token in database
        storeRefreshToken(user.id, refreshToken, req);

        // Set cookies
        setTokenCookie(res, accessToken);
        setRefreshTokenCookie(res, refreshToken);

        return { accessToken, refreshToken };
    };

    // Helper function to auto-create a basic profile for new users
    const ensureProfileExists = (userId, username, displayName) => {
        try {
            // Check if profile already exists
            const existing = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(userId);
            if (existing) {
                return existing;
            }

            // Create a basic profile with minimal info (user can edit later)
            const result = db.prepare(
                `INSERT INTO profiles (user_id, username, display_name, published, created_at, updated_at)
                 VALUES (?, ?, ?, 0, datetime('now'), datetime('now'))`
            ).run(userId, username, displayName || username);

            console.log(`✅ Auto-created profile for user ${username} (ID: ${userId})`);
            return { id: result.lastInsertRowid };
        } catch (error) {
            // If profile creation fails (e.g., username conflict), log but don't fail auth
            console.error(`⚠️ Failed to auto-create profile for user ${username}:`, error.message);
            return null;
        }
    };

    // Register new user - Protected with strict rate limiting
    router.post('/register', strictAuthLimiter, async (req, res) => {
        const { username, password, email } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Validate username
        if (!validator.isLength(username, { min: 3, max: 20 })) {
            return res.status(400).json({ error: 'Username must be 3-20 characters' });
        }
        if (!validator.isAlphanumeric(username, 'en-US')) {
            return res.status(400).json({ error: 'Username must be alphanumeric (letters and numbers only)' });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
            });
        }

        // Validate email if provided
        if (email && !validator.isEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        try {
            const passwordHash = await bcrypt.hash(password, 10);

            const stmt = db.prepare(
                'INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)'
            );

            stmt.run(username, passwordHash, email || null, 'user');

            // Fetch user to get ID (reliable way)
            const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

            // Initialize subscription (Free Trial)
            const trialDetails = {
                status: 'free',
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };

            db.prepare('UPDATE users SET subscription_status = ?, subscription_end_date = ? WHERE id = ?')
                .run(trialDetails.status, trialDetails.endDate, user.id);

            user.subscription_status = trialDetails.status;
            user.subscription_end_date = trialDetails.endDate;

            // Generate access and refresh tokens
            const { accessToken, refreshToken } = generateTokens(user, req, res);

            // Auto-create a basic profile for the new user
            ensureProfileExists(user.id, username, username);

            res.status(201).json({
                message: 'User registered successfully',
                token: accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    username,
                    email: email || null,
                    role: 'user',
                    subscriptionStatus: user.subscription_status,
                    subscriptionEnd: user.subscription_end_date
                }
            });
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                res.status(409).json({ error: 'Username or email already exists' });
            } else {
                console.error('Registration error:', error);
                res.status(500).json({ error: 'Registration failed' });
            }
        }
    });

    // Login - Protected with strict rate limiting to prevent brute force
    router.post('/login', strictAuthLimiter, async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        try {
            const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // If user has no password (e.g. Google user trying to login with password), fail
            if (!user.password_hash) {
                return res.status(401).json({ error: 'Please login with Google' });
            }

            const validPassword = await bcrypt.compare(password, user.password_hash);

            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate access and refresh tokens
            const { accessToken, refreshToken } = generateTokens(user, req, res);

            res.json({
                message: 'Login successful',
                token: accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role || 'user',
                    subscriptionStatus: user.subscription_status,
                    subscriptionEnd: user.subscription_end_date
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    });

    // Google Login - Protected with strict rate limiting
    router.post('/google', strictAuthLimiter, async (req, res) => {
        console.log('📧 Google OAuth request received');
        const { credential } = req.body;

        if (!credential) {
            console.log('❌ No credential provided');
            return res.status(400).json({ error: 'Google credential required' });
        }

        console.log('🔐 Verifying Google token...');
        try {
            // Verify Google Token
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            const { sub: googleId, email, name, picture } = payload;

            // Check if user exists with this Google ID
            let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);

            if (user) {
                // User found by Google ID - proceed with login
            } else {
                // Check if email is already registered (without Google)
                const existingUser = db.prepare('SELECT id, username, email FROM users WHERE email = ?').get(email);

                if (existingUser) {
                    // Security: Do NOT auto-link Google account to existing email
                    // This prevents account takeover attacks
                    logger.security('Google OAuth attempted on existing email', {
                        email,
                        existingUserId: existingUser.id
                    });

                    return res.status(409).json({
                        error: 'An account with this email already exists. Please log in with your password or reset it.',
                        code: 'EMAIL_ALREADY_EXISTS',
                        message: 'An account with this email already exists. Please log in with your password, or use the password reset option if you\'ve forgotten it. To link your Google account, log in first and then connect Google from your settings.'
                    });
                }
                // Create new user
                // Generate a unique username from email or name
                let baseUsername = (name || email.split('@')[0]).replace(/[^a-zA-Z0-9]/g, '');
                let username = baseUsername;
                let counter = 1;

                // Ensure username uniqueness
                while (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)) {
                    username = `${baseUsername}${counter++}`;
                }

                const result = db.prepare(
                    'INSERT INTO users (username, email, google_id, role, password_hash) VALUES (?, ?, ?, ?, ?)'
                ).run(username, email, googleId, 'pro', null); // NULL for OAuth users (no password)

                user = {
                    id: result.lastInsertRowid,
                    username,
                    email,
                    role: 'pro'
                };

                // Initialize subscription (Free Trial) - even for Google users
                const trialDetails = {
                    status: 'free',
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                };

                db.prepare('UPDATE users SET subscription_status = ?, subscription_end_date = ? WHERE id = ?')
                    .run(trialDetails.status, trialDetails.endDate, user.id);

                user.subscription_status = trialDetails.status;
                user.subscription_end_date = trialDetails.endDate;
            }

            // Generate access and refresh tokens
            const { accessToken, refreshToken } = generateTokens(user, req, res);

            // Auto-create profile for Google users (using Google display name)
            ensureProfileExists(user.id, user.username, name || user.username);

            console.log(`✅ Google OAuth successful for user: ${user.username}`);
            res.json({
                message: 'Google login successful',
                token: accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role || 'pro',
                    picture,
                    subscriptionStatus: user.subscription_status,
                    subscriptionEnd: user.subscription_end_date
                }
            });

        } catch (error) {
            console.error('❌ Google login error:', error.message);
            // In development, log more details for debugging
            if (process.env.NODE_ENV === 'development') {
                console.error('Error details:', error);
            }
            res.status(401).json({
                error: 'Google authentication failed',
                code: 'GOOGLE_AUTH_FAILED'
            });
        }
    });

    // Logout - revokes refresh tokens and clears cookies (with rate limiting)
    router.post('/logout', authLimiter, (req, res) => {
        try {
            // Get refresh token from cookie or body
            const refreshToken = req.cookies.refresh_token || req.body.refreshToken;

            if (refreshToken) {
                // Revoke the refresh token in database
                const tokenHash = hashRefreshToken(refreshToken);
                db.prepare(
                    `UPDATE refresh_tokens SET revoked = 1, revoked_at = datetime('now') WHERE token_hash = ?`
                ).run(tokenHash);
            }

            // Clear all auth cookies
            res.clearCookie('token');
            res.clearCookie('refresh_token', { path: '/api/auth' });

            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear cookies even if DB operation fails
            res.clearCookie('token');
            res.clearCookie('refresh_token', { path: '/api/auth' });
            res.json({ message: 'Logged out successfully' });
        }
    });

    // Logout from all devices - revokes all refresh tokens for user (with rate limiting)
    router.post('/logout-all', authLimiter, authenticateToken, (req, res) => {
        try {
            // Revoke all refresh tokens for this user
            db.prepare(
                `UPDATE refresh_tokens SET revoked = 1, revoked_at = datetime('now') WHERE user_id = ? AND revoked = 0`
            ).run(req.user.id);

            // Clear current session cookies
            res.clearCookie('token');
            res.clearCookie('refresh_token', { path: '/api/auth' });

            res.json({ message: 'Logged out from all devices successfully' });
        } catch (error) {
            console.error('Logout all error:', error);
            res.status(500).json({ error: 'Failed to logout from all devices' });
        }
    });

    // Refresh access token using refresh token - Standard auth rate limiting
    router.post('/refresh', authLimiter, (req, res) => {
        try {
            // Get refresh token from cookie or body
            const refreshToken = req.cookies.refresh_token || req.body.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({
                    error: 'Refresh token required',
                    code: 'REFRESH_TOKEN_MISSING'
                });
            }

            // Hash the token to look it up
            const tokenHash = hashRefreshToken(refreshToken);

            // Find the refresh token in database
            const storedToken = db.prepare(
                `SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked = 0`
            ).get(tokenHash);

            if (!storedToken) {
                return res.status(401).json({
                    error: 'Invalid or revoked refresh token',
                    code: 'REFRESH_TOKEN_INVALID'
                });
            }

            // Check if token is expired
            const expiresAt = new Date(storedToken.expires_at);
            if (expiresAt < new Date()) {
                // Mark as revoked since it's expired
                db.prepare(
                    `UPDATE refresh_tokens SET revoked = 1, revoked_at = datetime('now') WHERE id = ?`
                ).run(storedToken.id);

                return res.status(401).json({
                    error: 'Refresh token has expired',
                    code: 'REFRESH_TOKEN_EXPIRED'
                });
            }

            // Get the user
            const user = db.prepare(
                'SELECT id, username, email, role, subscription_status, subscription_end_date FROM users WHERE id = ?'
            ).get(storedToken.user_id);

            if (!user) {
                return res.status(401).json({
                    error: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Revoke old refresh token (token rotation for security)
            db.prepare(
                `UPDATE refresh_tokens SET revoked = 1, revoked_at = datetime('now') WHERE id = ?`
            ).run(storedToken.id);

            // Generate new tokens
            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, req, res);

            res.json({
                message: 'Token refreshed successfully',
                token: accessToken,
                refreshToken: newRefreshToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role || 'user'
                }
            });
        } catch (error) {
            console.error('Token refresh error:', error);
            res.status(500).json({ error: 'Failed to refresh token' });
        }
    });

    // Get current user (with rate limiting)
    router.get('/me', authLimiter, authenticateToken, (req, res) => {
        try {
            const user = db.prepare(
                'SELECT id, username, email, role, created_at, subscription_status, subscription_end_date FROM users WHERE id = ?'
            ).get(req.user.id);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Check if user has a profile
            const profile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);

            res.json({
                user,
                hasProfile: !!profile
            });
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ error: 'Failed to get user' });
        }
    });

    return router;
}

module.exports = createAuthRoutes;
