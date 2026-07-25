const express = require('express');
const router = express.Router();
const { createSlot, getSlotsByProvider, deleteSlot } = require('../controllers/availabilityController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('provider'), createSlot);
router.get('/:providerId', getSlotsByProvider);
router.delete('/:id', protect, authorize('provider'), deleteSlot);

module.exports = router;