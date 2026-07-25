const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('customer'), createBooking);
router.get('/me', protect, getMyBookings);
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;