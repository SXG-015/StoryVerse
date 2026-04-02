const express = require('express');
const { body } = require('express-validator');
const { getChapters, getChapterById, createChapter, updateChapter, deleteChapter } = require('../controllers/chapterController');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const chapterValidation = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Chapter title is required and must be under 200 characters'),
];

const validate = (req, res, next) => {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(err => ({ field: err.path, message: err.msg })),
        });
    }
    next();
};

// Public: List chapters of a story (optional auth for draft visibility)
router.get('/:storyId/chapters', optionalAuth, getChapters);

// Public: Get single chapter (optional auth for draft access)
router.get('/:storyId/chapters/:chapterId', optionalAuth, getChapterById);

// Protected: Create chapter (story owner only)
router.post('/:storyId/chapters', authenticate, chapterValidation, validate, createChapter);

// Protected: Update chapter (owner only — includes draft/publish toggle)
router.put('/:storyId/chapters/:chapterId', authenticate, updateChapter);

// Protected: Delete chapter (owner only)
router.delete('/:storyId/chapters/:chapterId', authenticate, deleteChapter);

module.exports = router;
