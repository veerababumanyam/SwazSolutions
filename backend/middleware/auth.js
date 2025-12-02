const jwt = require('jsonwebtoken');

// JWT_SECRET is optional - auth system is disabled for open access
// Keeping code structure for future use if authentication is needed
const JWT_SECRET = process.env.JWT_SECRET || 'placeholder-not-used';

if (process.env.ENABLE_AUTH === 'true' && (!JWT_SECRET || JWT_SECRET.length < 32)) {
    console.error('❌ CRITICAL: JWT_SECRET not set or too weak. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = (authHeader && authHeader.split(' ')[1]) || req.cookies.token; // Bearer TOKEN or cookie

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Optional auth - attaches user if token exists, but doesn't require it
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = (authHeader && authHeader.split(' ')[1]) || req.cookies.token;

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) {
                req.user = user;
            }
        });
    }
    next();
}

module.exports = {
    authenticateToken,
    optionalAuth,
    JWT_SECRET
};
