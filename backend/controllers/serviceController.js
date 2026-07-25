const Service = require('../models/Service');

// @desc    Create a service (Provider only)
// @route   POST /api/services
exports.createService = async (req, res) => {
  try {
    const { title, description, category, durationMinutes, price } = req.body;

    if (!title || !description || !category || !durationMinutes || !price) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const service = await Service.create({
      providerId: req.user._id,
      title,
      description,
      category,
      durationMinutes,
      price
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all services (optionally filter by providerId, category)
// @route   GET /api/services
exports.getServices = async (req, res) => {
  try {
    const { providerId, category } = req.query;
    const filter = { isActive: true };
    if (providerId) filter.providerId = providerId;
    if (category) filter.category = category;

    const services = await Service.find(filter).populate('providerId', 'name profilePicUrl');
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('providerId', 'name profilePicUrl');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a service (only the owning provider)
// @route   PUT /api/services/:id
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (service.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this service' });
    }

    const updates = req.body;
    Object.assign(service, updates);
    await service.save();

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a service (only the owning provider)
// @route   DELETE /api/services/:id
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (service.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }

    await service.deleteOne();
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};