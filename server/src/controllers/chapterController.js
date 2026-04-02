const db = require('../config/db');

/**
 * GET /api/stories/:storyId/chapters
 * List all chapters of a story
 */
const getChapters = async (req, res, next) => {
    try {
        const { storyId } = req.params;

        // Verify story exists
        const storyResult = await db.query('SELECT author_id FROM stories WHERE id = $1', [storyId]);
        if (storyResult.rows.length === 0) {
            return res.status(404).json({ error: 'Story not found.' });
        }

        const isOwner = req.user && req.user.id === storyResult.rows[0].author_id;
        const statusFilter = isOwner ? '' : "AND status = 'published'";

        const result = await db.query(
            `SELECT id, title, chapter_order, status, word_count, created_at, updated_at
       FROM chapters
       WHERE story_id = $1 ${statusFilter}
       ORDER BY chapter_order ASC`,
            [storyId]
        );

        res.json({ chapters: result.rows });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/stories/:storyId/chapters/:chapterId
 * Get a single chapter with full content
 */
const getChapterById = async (req, res, next) => {
    try {
        const { storyId, chapterId } = req.params;

        const result = await db.query(
            `SELECT c.*, s.title AS story_title, s.author_id,
              u.username AS author_username, u.display_name AS author_display_name
       FROM chapters c
       JOIN stories s ON c.story_id = s.id
       JOIN users u ON s.author_id = u.id
       WHERE c.id = $1 AND c.story_id = $2`,
            [chapterId, storyId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Chapter not found.' });
        }

        const chapter = result.rows[0];

        // Draft chapters are only visible to the owner
        const isOwner = req.user && req.user.id === chapter.author_id;
        if (chapter.status === 'draft' && !isOwner) {
            return res.status(403).json({ error: 'This chapter is not published yet.' });
        }

        // Get previous and next chapter info for navigation
        const navResult = await db.query(
            `SELECT id, title, chapter_order FROM chapters
       WHERE story_id = $1 AND status = 'published'
       ORDER BY chapter_order ASC`,
            [storyId]
        );

        const chapters = navResult.rows;
        const currentIndex = chapters.findIndex(c => c.id === chapterId);

        res.json({
            chapter,
            navigation: {
                previous: currentIndex > 0 ? chapters[currentIndex - 1] : null,
                next: currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null,
                total: chapters.length,
                current: currentIndex + 1,
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/stories/:storyId/chapters
 * Add a new chapter to a story (story owner only)
 */
const createChapter = async (req, res, next) => {
    try {
        const { storyId } = req.params;
        const { title, content, status } = req.body;

        // Verify story ownership
        const storyResult = await db.query('SELECT author_id FROM stories WHERE id = $1', [storyId]);
        if (storyResult.rows.length === 0) {
            return res.status(404).json({ error: 'Story not found.' });
        }
        if (storyResult.rows[0].author_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only add chapters to your own stories.' });
        }

        // Calculate next chapter order
        const orderResult = await db.query(
            'SELECT COALESCE(MAX(chapter_order), 0) + 1 AS next_order FROM chapters WHERE story_id = $1',
            [storyId]
        );
        const nextOrder = orderResult.rows[0].next_order;

        // Calculate word count from content (strip HTML tags)
        const plainText = (content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const wordCount = plainText ? plainText.split(' ').length : 0;

        const chapterStatus = status === 'published' ? 'published' : 'draft';

        const result = await db.query(
            `INSERT INTO chapters (story_id, title, content, chapter_order, status, word_count)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [storyId, title, content || '', nextOrder, chapterStatus, wordCount]
        );

        res.status(201).json({
            message: 'Chapter created successfully',
            chapter: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/stories/:storyId/chapters/:chapterId
 * Update a chapter (owner only) — includes status toggle (draft/published)
 */
const updateChapter = async (req, res, next) => {
    try {
        const { storyId, chapterId } = req.params;
        const { title, content, status, chapter_order } = req.body;

        // Verify ownership
        const storyResult = await db.query('SELECT author_id FROM stories WHERE id = $1', [storyId]);
        if (storyResult.rows.length === 0) {
            return res.status(404).json({ error: 'Story not found.' });
        }
        if (storyResult.rows[0].author_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only edit chapters of your own stories.' });
        }

        // Verify chapter exists
        const chapterExists = await db.query(
            'SELECT id FROM chapters WHERE id = $1 AND story_id = $2',
            [chapterId, storyId]
        );
        if (chapterExists.rows.length === 0) {
            return res.status(404).json({ error: 'Chapter not found.' });
        }

        const fields = [];
        const values = [];
        let paramCount = 0;

        if (title !== undefined) {
            paramCount++;
            fields.push(`title = $${paramCount}`);
            values.push(title);
        }
        if (content !== undefined) {
            paramCount++;
            fields.push(`content = $${paramCount}`);
            values.push(content);

            // Recalculate word count
            const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const wordCount = plainText ? plainText.split(' ').length : 0;
            paramCount++;
            fields.push(`word_count = $${paramCount}`);
            values.push(wordCount);
        }
        if (status !== undefined && (status === 'draft' || status === 'published')) {
            paramCount++;
            fields.push(`status = $${paramCount}`);
            values.push(status);
        }
        if (chapter_order !== undefined) {
            paramCount++;
            fields.push(`chapter_order = $${paramCount}`);
            values.push(chapter_order);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update.' });
        }

        paramCount++;
        values.push(chapterId);

        const result = await db.query(
            `UPDATE chapters SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        res.json({
            message: 'Chapter updated successfully',
            chapter: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/stories/:storyId/chapters/:chapterId
 * Delete a chapter (owner only)
 */
const deleteChapter = async (req, res, next) => {
    try {
        const { storyId, chapterId } = req.params;

        // Verify ownership
        const storyResult = await db.query('SELECT author_id FROM stories WHERE id = $1', [storyId]);
        if (storyResult.rows.length === 0) {
            return res.status(404).json({ error: 'Story not found.' });
        }
        if (storyResult.rows[0].author_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete chapters of your own stories.' });
        }

        const deleteResult = await db.query(
            'DELETE FROM chapters WHERE id = $1 AND story_id = $2 RETURNING chapter_order',
            [chapterId, storyId]
        );

        if (deleteResult.rows.length === 0) {
            return res.status(404).json({ error: 'Chapter not found.' });
        }

        // Reorder remaining chapters to fill the gap
        const deletedOrder = deleteResult.rows[0].chapter_order;
        await db.query(
            `UPDATE chapters SET chapter_order = chapter_order - 1
       WHERE story_id = $1 AND chapter_order > $2`,
            [storyId, deletedOrder]
        );

        res.json({ message: 'Chapter deleted successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getChapters, getChapterById, createChapter, updateChapter, deleteChapter };
