const express = require('express');
const { 
    getUserProfile, 
    updateProfile,
    getHistory,
    updateHistory,
    getFavourites,
    addFavourite,
    removeFavourite
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Protected: History routes
router.get('/history', authenticate, getHistory);
router.post('/history', authenticate, updateHistory);

// Protected: Favourites routes
router.get('/favourites', authenticate, getFavourites);
router.post('/favourites', authenticate, addFavourite);
router.delete('/favourites/:storyId', authenticate, removeFavourite);

// Public: Get user profile
router.get('/:id', getUserProfile);

// Protected: Update own profile
router.put('/profile', authenticate, updateProfile);

module.exports = router;
