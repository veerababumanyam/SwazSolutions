const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { OAuth2Client } = require('google-auth-library');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function createAuthRoutes(db) {
    const router = express.Router();

    const setTokenCookie = (res, token) => {
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Secure in production
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
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

    // Register new user
    router.post('/register', async (req, res) => {
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

            const token = jwt.sign(
                { id: user.id, username, role: 'user' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            setTokenCookie(res, token);

            // Auto-create a basic profile for the new user
            ensureProfileExists(user.id, username, username);

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user.id,
                    username,
                    email: email || null,
                    role: 'user'
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

    // Login
    router.post('/login', async (req, res) => {
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

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role || 'user' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            setTokenCookie(res, token);

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role || 'user'
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    });

    // Google Login
    router.post('/google', async (req, res) => {
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

            // Check if user exists
            let user = db.prepare('SELECT * FROM users WHERE google_id = ? OR email = ?').get(googleId, email);

            if (user) {
                // Update existing user if needed (e.g. link google_id if matched by email)
                if (!user.google_id) {
                    db.prepare('UPDATE users SET google_id = ?, role = ? WHERE id = ?').run(googleId, 'pro', user.id);
                    user.role = 'pro'; // Upgrade to pro
                }
            } else {
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
                ).run(username, email, googleId, 'pro', 'GOOGLE_AUTH_USER_NO_PASSWORD'); // Placeholder for NOT NULL constraint

                user = {
                    id: result.lastInsertRowid,
                    username,
                    email,
                    role: 'pro'
                };
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role || 'pro' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            setTokenCookie(res, token);

            // Auto-create profile for Google users (using Google display name)
            ensureProfileExists(user.id, user.username, name || user.username);

            console.log(`✅ Google OAuth successful for user: ${user.username}`);
            res.json({
                message: 'Google login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role || 'pro',
                    picture
                }
            });

        } catch (error) {
            console.error('❌ Google login error:', error.message);
            console.error('Stack:', error.stack);
            res.status(401).json({
                error: 'Google authentication failed',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // Logout
    router.post('/logout', (req, res) => {
        res.clearCookie('token');
        res.json({ message: 'Logged out successfully' });
    });

    // Get current user
    router.get('/me', authenticateToken, (req, res) => {
        try {
            const user = db.prepare(
                'SELECT id, username, email, role, created_at FROM users WHERE id = ?'
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
