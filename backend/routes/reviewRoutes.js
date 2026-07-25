const express = require('express');
const router = express.Router();
const { createReview, getReviewsByProvider } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('customer'), createReview);
router.get('/:providerId', getReviewsByProvider);

module.exports = router;