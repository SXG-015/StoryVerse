const express = require('express');
const { body } = require('express-validator');
const { getAllStories, getStoryById, createStory, updateStory, deleteStory, getStoryComments, addStoryComment } = require('../controllers/storyController');
const { authenticate, requireWriter, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const storyValidation = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title is required and must be under 200 characters'),
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

// Public: List stories (with optional auth for personalized results)
router.get('/', optionalAuth, getAllStories);

// Public: Get single story (optional auth to show drafts for owner)
router.get('/:id', optionalAuth, getStoryById);

// Protected: Create story (writers only)
router.post('/', authenticate, requireWriter, storyValidation, validate, createStory);

// Protected: Update story (owner only)
router.put('/:id', authenticate, updateStory);

// Protected: Delete story (owner only)
router.delete('/:id', authenticate, deleteStory);

// Public: Get story comments
router.get('/:id/comments', getStoryComments);

// Protected: Add a comment
router.post('/:id/comments', authenticate, addStoryComment);

module.exports = router;
