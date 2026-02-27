const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sugrs-default-secret-change-in-production';

/**
 * Extract user from JWT (optional — does not reject if missing).
 * Sets req.user if a valid token is present in Authorization header.
 * Falls through silently if no token — backward compatible with existing frontend.
 */
function extractUser(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }

    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        req.user = null;
    }
    next();
}

/**
 * Require a valid JWT with one of the specified roles.
 * Use on routes that MUST be authenticated.
 *
 * @param {string[]} roles - allowed roles, e.g. ['officer', 'admin']
 */
function requireAuth(roles = []) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
}

module.exports = { extractUser, requireAuth, JWT_SECRET };
