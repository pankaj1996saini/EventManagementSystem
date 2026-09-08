const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Get registrations (filtered by role)
//          Admin -> all, Organizer -> registrations for own events, Participant -> own registrations
// @route   GET /api/registrations
// @access  Private
const getRegistrations = async (req, res, next) => {
  try {
    const { eventId, sortBy, order, status } = req.query;
    let query = {};

    if (req.user.role === 'participant') {
      query.user = req.user._id;
    } else if (req.user.role === 'organizer') {
      const myEvents = await Event.find({ organizer: req.user._id }).select('_id');
      query.event = { $in: myEvents.map((e) => e._id) };
    }
    // admin: no restriction

    if (eventId) query.event = eventId;
    if (status) query.status = status;

    const sortField = ['createdAt', 'participants'].includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const registrations = await Registration.find(query)
      .populate({ path: 'event', select: 'name date time venue organizer' })
      .populate('user', 'name email')
      .sort({ [sortField]: sortOrder });

    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single registration
// @route   GET /api/registrations/:id
// @access  Private
const getRegistrationById = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    const isOwner = registration.user._id.toString() === req.user._id.toString();
    const isOrganizerOfEvent =
      req.user.role === 'organizer' && registration.event.organizer.toString() === req.user._id.toString();

    if (req.user.role !== 'admin' && !isOwner && !isOrganizerOfEvent) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this registration' });
    }

    res.json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel / delete a registration
// @route   DELETE /api/registrations/:id
// @access  Private (owner, admin)
const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    const isOwner = registration.user.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this registration' });
    }

    if (registration.status === 'confirmed') {
      const event = await Event.findById(registration.event);
      if (event) {
        event.availableSeats += registration.participants;
        await event.save();
      }
    }

    registration.status = 'cancelled';
    await registration.save();

    res.json({ success: true, message: 'Registration cancelled', data: registration });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRegistrations, getRegistrationById, cancelRegistration };
