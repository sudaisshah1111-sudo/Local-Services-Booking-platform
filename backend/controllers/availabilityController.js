const AvailabilitySlot = require('../models/AvailabilitySlot');

// @desc    Create an availability slot (Provider only)
// @route   POST /api/availability
exports.createSlot = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;

    if (!dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide dayOfWeek, startTime, and endTime' });
    }

    // Prevent overlapping slots for the same provider on the same day
    const overlap = await AvailabilitySlot.findOne({
      providerId: req.user._id,
      dayOfWeek,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (overlap) {
      return res.status(400).json({ message: 'This slot overlaps with an existing availability slot' });
    }

    const slot = await AvailabilitySlot.create({
      providerId: req.user._id,
      dayOfWeek,
      startTime,
      endTime
    });

    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get availability slots for a provider
// @route   GET /api/availability/:providerId
exports.getSlotsByProvider = async (req, res) => {
  try {
    const slots = await AvailabilitySlot.find({ providerId: req.params.providerId }).sort('dayOfWeek startTime');
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a slot (only owning provider)
// @route   DELETE /api/availability/:id
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await AvailabilitySlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    if (slot.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this slot' });
    }
    if (slot.isBooked) {
      return res.status(400).json({ message: 'Cannot delete a slot that is already booked' });
    }

    await slot.deleteOne();
    res.status(200).json({ message: 'Slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};