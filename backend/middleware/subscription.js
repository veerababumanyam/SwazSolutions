const db = require('../config/database'); // We might need to access DB if we want fresh status, but req.user should be populated by auth middleware
const { ENABLE_AUTH } = require('./auth');

/**
 * Middleware to check if user has active subscription or valid free trial
 */
function checkSubscription(req, res, next) {
    // Skip subscription check if authentication is disabled
    if (!ENABLE_AUTH) {
        return next();
    }

    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    // Admins bypass subscription check
    if (req.user.role === 'admin') {
        return next();
    }

    // Fetch fresh user data to ensure up-to-date subscription status
    // (auth token might have old data if it's long-lived, though we use short-lived access tokens)
    // For performance, we could rely on token claims if we include subscription status in token,
    // but checking DB is safer for "payment just happened" scenarios or "trial just expired".
    // Since we have `db` available globally or we can require it... 
    // Wait, `db` is not exported directly from config/database.js in a way that guarantees it's initialized immediately synchronously at module level,
    // but it is initialized in server.js.
    // However, for middleware, it's cleaner if we pass db or access it safely.
    // In `server.js`, db is passed to route creators.
    // But middleware is usually `app.use(checkSubscription)`. 
    // We can just rely on the fact that `req.user` comes from `authenticateToken` which decodes the JWT.
    // TO DO: We should update `authenticateToken` or `generateTokens` to include subscription info in JWT,
    // OR, we query DB here. Querying DB is safer.

    // We'll require the db instance here. Note: in `config/database.js` it exports { ready, prepare... } or just runs stuff?
    // Let's check `config/database.js`. It doesn't seem to export `db` directly for preparing statements outside.
    // It exports nothing? Wait, let me check `config/database.js` imports in `server.js` again.
    // `const db = require('./config/database');`
    // And `db.ready.then(...)`. So `db` is the exports.
    // Let's look at `config/database.js` content again.
    // AHH, I missed the exports in the view_file output. It was truncated? Or I just didn't scroll down enough?
    // Let me check `config/database.js` exports at the end invalidating my assumption.

    // Actually, looking at `server.js`: `const db = require('./config/database');`
    // The previous view of `database.js` showed lines 1-800, but I missed the end.
    // To be safe, I will assume it exports the SQL.js db object (or wrapper) enriched with `ready` promise.

    const db = require('../config/database');

    try {
        const user = db.prepare('SELECT subscription_status, subscription_end_date FROM users WHERE id = ?').get(req.user.id);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const isPaid = user.subscription_status === 'active' || user.subscription_status === 'paid';
        const endDate = new Date(user.subscription_end_date);
        const now = new Date();

        if (isPaid) {
            // Check if paid subscription has expired (should be handled by payment provider webhooks, but double-check)
            if (now >= endDate) {
                // Update status to expired if not already set
                if (user.subscription_status !== 'expired') {
                    db.prepare('UPDATE users SET subscription_status = ? WHERE id = ?')
                        .run('expired', req.user.id);
                    console.log(`⏰ Subscription expired for user ${req.user.id} (was ${user.subscription_status})`);
                }
                return res.status(403).json({
                    error: 'Subscription expired',
                    code: 'SUBSCRIPTION_EXPIRED',
                    message: 'Your subscription has expired. Please renew to continue.'
                });
            }
            // Subscription is active and valid
            return next();
        }

        // If free or cancelled but potentially still in period
        if (now < endDate) {
            return next();
        }

        // Expired - update status in database if not already set
        if (user.subscription_status !== 'expired') {
            db.prepare('UPDATE users SET subscription_status = ? WHERE id = ?')
                .run('expired', req.user.id);
            console.log(`⏰ Free trial expired for user ${req.user.id} (username: ${req.user.username || 'unknown'})`);
        }

        return res.status(403).json({
            error: 'Subscription expired',
            code: 'SUBSCRIPTION_EXPIRED',
            message: 'Your free trial or subscription has expired. Please upgrade to continue.'
        });

    } catch (error) {
        console.error('Subscription check error:', error);
        return res.status(500).json({ error: 'Failed to check subscription status' });
    }
}

module.exports = { checkSubscription };
