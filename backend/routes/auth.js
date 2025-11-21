const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

function createAuthRoutes(db) {
    const router = express.Router();

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
                'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)'
            );

            const result = stmt.run(username, passwordHash, email || null);

            const token = jwt.sign(
                { id: result.lastInsertRowid, username },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: result.lastInsertRowid,
                    username,
                    email: email || null
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

            const validPassword = await bcrypt.compare(password, user.password_hash);

            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    });

    // Get current user
    router.get('/me', authenticateToken, (req, res) => {
        try {
            const user = db.prepare(
                'SELECT id, username, email, created_at FROM users WHERE id = ?'
            ).get(req.user.id);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ user });
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ error: 'Failed to get user' });
        }
    });

    return router;
}

module.exports = createAuthRoutes;
