const Booking = require('../models/Booking');
const AvailabilitySlot = require('../models/AvailabilitySlot');
const Service = require('../models/Service');
const Notification = require('../models/Notification');

// @desc    Create a booking request (Customer only)
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, slotId } = req.body;

    if (!serviceId || !slotId) {
      return res.status(400).json({ message: 'Please provide serviceId and slotId' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const slot = await AvailabilitySlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }

    // Server-side double-booking check — never trust the frontend
    if (slot.isBooked) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    const booking = await Booking.create({
      customerId: req.user._id,
      providerId: service.providerId,
      serviceId,
      slotId,
      status: 'pending'
    });

    // Lock the slot immediately so no one else can request it
    slot.isBooked = true;
    await slot.save();

   

    
    await Notification.create({
      userId: booking.providerId,
      bookingId: booking._id,
      message: 'You have a new booking request.',
      type: 'booking_requested'
    });

    res.status(201).json(booking);
  } catch (error) {

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get bookings for the logged-in user (customer or provider)
// @route   GET /api/bookings/me
exports.getMyBookings = async (req, res) => {
  try {
    const filter = req.user.role === 'provider'
      ? { providerId: req.user._id }
      : { customerId: req.user._id };

    const bookings = await Booking.find(filter)
      .populate('serviceId', 'title price durationMinutes')
      .populate('slotId', 'dayOfWeek startTime endTime')
      .populate('customerId', 'name email')
      .populate('providerId', 'name email')
      .sort('-createdAt');

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update booking status (only the relevant party can change each status)
// @route   PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'completed', 'declined', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isProvider = booking.providerId.toString() === req.user._id.toString();
    const isCustomer = booking.customerId.toString() === req.user._id.toString();

    // Only the provider can confirm, decline, or mark completed
    if (['confirmed', 'declined', 'completed'].includes(status) && !isProvider) {
      return res.status(403).json({ message: 'Only the provider can perform this action' });
    }

    // Only the customer can cancel
    if (status === 'cancelled' && !isCustomer) {
      return res.status(403).json({ message: 'Only the customer can cancel this booking' });
    }

    booking.status = status;
    await booking.save();

    const statusMessages = {
      confirmed: 'Your booking request was confirmed!',
      declined: 'Your booking request was declined.',
      completed: 'Your booking has been marked completed. Leave a review!',
      cancelled: 'A booking was cancelled.'
    };

    const notifyUserId = ['confirmed', 'declined'].includes(status)
      ? booking.customerId
      : booking.providerId;

    await Notification.create({
      userId: notifyUserId,
      bookingId: booking._id,
      message: statusMessages[status] || `Booking status changed to ${status}`,
      type: `booking_${status}`
    });

    // Free up the slot if declined or cancelled
    if (status === 'declined' || status === 'cancelled') {
      await AvailabilitySlot.findByIdAndUpdate(booking.slotId, { isBooked: false });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};