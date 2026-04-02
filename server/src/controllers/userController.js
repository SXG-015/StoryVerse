const db = require('../config/db');

/**
 * GET /api/users/:id
 * Get a public user profile
 */
const getUserProfile = async (req, res, next) => {
    try {
        const { id } = req.params;

        const userResult = await db.query(
            `SELECT id, username, display_name, role, bio, avatar_url, created_at
       FROM users WHERE id = $1`,
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const user = userResult.rows[0];

        // Fetch user's published stories
        const storiesResult = await db.query(
            `SELECT s.id, s.title, s.description, s.cover_image_url, s.genre, s.status, s.created_at, s.updated_at,
              (SELECT COUNT(*) FROM chapters c WHERE c.story_id = s.id AND c.status = 'published') AS chapter_count
       FROM stories s
       WHERE s.author_id = $1
       ORDER BY s.updated_at DESC`,
            [id]
        );

        res.json({
            user,
            stories: storiesResult.rows,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/users/profile
 * Update the authenticated user's profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { display_name, bio, avatar_url, role } = req.body;

        // Build dynamic update query
        const fields = [];
        const values = [];
        let paramCount = 0;

        if (display_name !== undefined) {
            paramCount++;
            fields.push(`display_name = $${paramCount}`);
            values.push(display_name);
        }
        if (bio !== undefined) {
            paramCount++;
            fields.push(`bio = $${paramCount}`);
            values.push(bio);
        }
        if (avatar_url !== undefined) {
            paramCount++;
            fields.push(`avatar_url = $${paramCount}`);
            values.push(avatar_url);
        }
        // Allow upgrading from reader to writer
        if (role === 'writer') {
            paramCount++;
            fields.push(`role = $${paramCount}`);
            values.push('writer');
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update.' });
        }

        paramCount++;
        values.push(userId);

        const result = await db.query(
            `UPDATE users SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, username, email, role, display_name, bio, avatar_url, created_at, updated_at`,
            values
        );

        res.json({
            message: 'Profile updated successfully',
            user: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};

const getHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            `SELECT s.id, s.title, s.description, s.cover_image_url, s.genre, s.status, s.created_at, s.updated_at, rh.last_read_at,
             (SELECT COUNT(*) FROM chapters c WHERE c.story_id = s.id AND c.status = 'published') AS chapter_count
             FROM reading_history rh
             JOIN stories s ON rh.story_id = s.id
             WHERE rh.user_id = $1
             ORDER BY rh.last_read_at DESC`,
            [userId]
        );
        res.json({ history: result.rows });
    } catch (err) {
        next(err);
    }
};

const updateHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { storyId } = req.body;
        if (!storyId) return res.status(400).json({ error: 'Story ID is required' });

        await db.query(
            `INSERT INTO reading_history (user_id, story_id, last_read_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (user_id, story_id) DO UPDATE SET last_read_at = NOW()`,
            [userId, storyId]
        );
        res.json({ message: 'History updated' });
    } catch (err) {
        next(err);
    }
};

const getFavourites = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            `SELECT s.id, s.title, s.description, s.cover_image_url, s.genre, s.status, s.created_at, s.updated_at, f.created_at as favourited_at,
             (SELECT COUNT(*) FROM chapters c WHERE c.story_id = s.id AND c.status = 'published') AS chapter_count
             FROM favourites f
             JOIN stories s ON f.story_id = s.id
             WHERE f.user_id = $1
             ORDER BY f.created_at DESC`,
            [userId]
        );
        res.json({ favourites: result.rows });
    } catch (err) {
        next(err);
    }
};

const addFavourite = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { storyId } = req.body;
        if (!storyId) return res.status(400).json({ error: 'Story ID is required' });

        await db.query(
            `INSERT INTO favourites (user_id, story_id)
             VALUES ($1, $2)
             ON CONFLICT (user_id, story_id) DO NOTHING`,
            [userId, storyId]
        );
        res.json({ message: 'Added to favourites' });
    } catch (err) {
        next(err);
    }
};

const removeFavourite = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { storyId } = req.params;

        await db.query(
            `DELETE FROM favourites WHERE user_id = $1 AND story_id = $2`,
            [userId, storyId]
        );
        res.json({ message: 'Removed from favourites' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getUserProfile, updateProfile, getHistory, updateHistory, getFavourites, addFavourite, removeFavourite };
