const db = require('../config/db');

/**
 * GET /api/stories
 * List all stories (with optional filters and pagination)
 */
const getAllStories = async (req, res, next) => {
    try {
        const { genre, status, author_id, page = 1, limit = 12, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereConditions = [];
        let params = [];
        let paramCount = 0;

        // Only show stories that have at least one published chapter (for public listing)
        // Unless we're filtering by author (dashboard view)
        if (!author_id) {
            whereConditions.push(`EXISTS (SELECT 1 FROM chapters c WHERE c.story_id = s.id AND c.status = 'published')`);
        }

        if (genre && genre !== 'All') {
            paramCount++;
            whereConditions.push(`s.genre = $${paramCount}`);
            params.push(genre);
        }

        if (status) {
            paramCount++;
            whereConditions.push(`s.status = $${paramCount}`);
            params.push(status);
        }

        if (author_id) {
            paramCount++;
            whereConditions.push(`s.author_id = $${paramCount}`);
            params.push(author_id);
        }

        if (search) {
            paramCount++;
            whereConditions.push(`(s.title ILIKE $${paramCount} OR s.description ILIKE $${paramCount})`);
            params.push(`%${search}%`);
        }

        const whereClause = whereConditions.length > 0
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Get total count
        const countResult = await db.query(
            `SELECT COUNT(*) FROM stories s ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        // Get stories with author info and chapter count
        paramCount++;
        params.push(parseInt(limit));
        paramCount++;
        params.push(offset);

        const result = await db.query(
            `SELECT s.*, 
              u.username AS author_username, 
              u.display_name AS author_display_name,
              u.avatar_url AS author_avatar,
              (SELECT COUNT(*) FROM chapters c WHERE c.story_id = s.id AND c.status = 'published') AS chapter_count
       FROM stories s
       JOIN users u ON s.author_id = u.id
       ${whereClause}
       ORDER BY s.updated_at DESC
       LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
            params
        );

        res.json({
            stories: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/stories/:id
 * Get a single story with its chapters
 */
const getStoryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const storyResult = await db.query(
            `SELECT s.*, 
              u.username AS author_username, 
              u.display_name AS author_display_name,
              u.avatar_url AS author_avatar,
              u.bio AS author_bio
       FROM stories s
       JOIN users u ON s.author_id = u.id
       WHERE s.id = $1`,
            [id]
        );

        if (storyResult.rows.length === 0) {
            return res.status(404).json({ error: 'Story not found.' });
        }

        const story = storyResult.rows[0];

        // Determine which chapters to show
        const isOwner = req.user && req.user.id === story.author_id;
        const chapterFilter = isOwner ? '' : "AND c.status = 'published'";

        const chaptersResult = await db.query(
            `SELECT id, title, chapter_order, status, word_count, created_at, updated_at
       FROM chapters c
       WHERE c.story_id = $1 ${chapterFilter}
       ORDER BY c.chapter_order ASC`,
            [id]
        );

        res.json({
            story,
            chapters: chaptersResult.rows,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/stories
 * Create a new story (writer only)
 */
const createStory = async (req, res, next) => {
    try {
        const { title, description, cover_image_url, genre, tags } = req.body;

        const result = await db.query(
            `INSERT INTO stories (author_id, title, description, cover_image_url, genre, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [req.user.id, title, description || '', cover_image_url || '', genre || 'General', tags || []]
        );

        res.status(201).json({
            message: 'Story created successfully',
            story: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/stories/:id
 * Update a story (owner only)
 */
const updateStory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, cover_image_url, genre, tags, status } = req.body;

        // Verify ownership
        const existing = await db.query('SELECT author_id FROM stories WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Story not found.' });
        }
        if (existing.rows[0].author_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only edit your own stories.' });
        }

        const fields = [];
        const values = [];
        let paramCount = 0;

        if (title !== undefined) { paramCount++; fields.push(`title = $${paramCount}`); values.push(title); }
        if (description !== undefined) { paramCount++; fields.push(`description = $${paramCount}`); values.push(description); }
        if (cover_image_url !== undefined) { paramCount++; fields.push(`cover_image_url = $${paramCount}`); values.push(cover_image_url); }
        if (genre !== undefined) { paramCount++; fields.push(`genre = $${paramCount}`); values.push(genre); }
        if (tags !== undefined) { paramCount++; fields.push(`tags = $${paramCount}`); values.push(tags); }
        if (status !== undefined) { paramCount++; fields.push(`status = $${paramCount}`); values.push(status); }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update.' });
        }

        paramCount++;
        values.push(id);

        const result = await db.query(
            `UPDATE stories SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        res.json({
            message: 'Story updated successfully',
            story: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/stories/:id
 * Delete a story and all its chapters (owner only)
 */
const deleteStory = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const existing = await db.query('SELECT author_id FROM stories WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Story not found.' });
        }
        if (existing.rows[0].author_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own stories.' });
        }

        await db.query('DELETE FROM stories WHERE id = $1', [id]);

        res.json({ message: 'Story deleted successfully' });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/stories/:id/comments
 * Get comments for a story
 */
const getStoryComments = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT c.id, c.content, c.created_at, u.id AS author_id, u.username AS author_username, u.display_name AS author_display_name, u.avatar_url AS author_avatar
             FROM story_comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.story_id = $1
             ORDER BY c.created_at ASC`,
            [id]
        );
        res.json({ comments: result.rows });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/stories/:id/comments
 * Add a comment to a story
 */
const addStoryComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment content is required.' });
        }

        const result = await db.query(
            `INSERT INTO story_comments (story_id, user_id, content)
             VALUES ($1, $2, $3)
             RETURNING id, content, created_at`,
            [id, userId, content]
        );

        res.status(201).json({
            message: 'Comment added successfully',
            comment: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllStories, getStoryById, createStory, updateStory, deleteStory, getStoryComments, addStoryComment };
