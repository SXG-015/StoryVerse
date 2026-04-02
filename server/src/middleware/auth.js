const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Middleware: Verify JWT token from cookies or Authorization header
 * Attaches user object to req.user
 */
const authenticate = async (req, res, next) => {
    try {
        let token = req.cookies?.token;

        // Fallback to Authorization header
        if (!token && req.headers.authorization) {
            const parts = req.headers.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                token = parts[1];
            }
        }

        if (!token) {
            return res.status(401).json({ error: 'Authentication required. Please log in.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch fresh user data
        const result = await db.query(
            'SELECT id, username, email, role, display_name, bio, avatar_url FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found. Please log in again.' });
        }

        req.user = result.rows[0];
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
        }
        next(err);
    }
};

/**
 * Middleware: Require user to have the 'writer' role
 */
const requireWriter = (req, res, next) => {
    if (req.user.role !== 'writer') {
        return res.status(403).json({
            error: 'Writer access required. Please upgrade your account to a writer role.',
        });
    }
    next();
};

/**
 * Middleware: Optional auth — attaches user if token present, continues otherwise
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token = req.cookies?.token;
        if (!token && req.headers.authorization) {
            const parts = req.headers.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                token = parts[1];
            }
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const result = await db.query(
                'SELECT id, username, email, role, display_name, bio, avatar_url FROM users WHERE id = $1',
                [decoded.userId]
            );
            if (result.rows.length > 0) {
                req.user = result.rows[0];
            }
        }
    } catch (err) {
        // Silently continue — optional auth
    }
    next();
};

module.exports = { authenticate, requireWriter, optionalAuth };
