const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const {protect} = require('../middleware/authMiddleware');
const {toggleFavorite, getFavorites } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/favorites/:providerId', protect, toggleFavorite);
router.get('/favorites', protect, getFavorites);
router.post('/favorites/:providerId', protect, toggleFavorite);
router.get('/favorites', protect, getFavorites);

module.exports = router;