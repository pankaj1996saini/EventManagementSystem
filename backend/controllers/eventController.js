const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get all events (search, filter, sort, pagination)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const { search, category, date, venue, sortBy, order, status, organizer, page = 1, limit = 12 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (venue) query.venue = { $regex: venue, $options: 'i' };
    if (organizer) query.organizer = organizer;

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }

    // By default, public listing only shows active events unless explicitly requested otherwise
    if (status === 'all') {
      // no filter - used by admin/organizer views
    } else if (status === 'inactive') {
      query.isActive = false;
    } else {
      query.isActive = true;
    }

    const sortField = ['date', 'name', 'availableSeats', 'createdAt'].includes(sortBy) ? sortBy : 'date';
    const sortOrder = order === 'desc' ? -1 : 1;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('category', 'name')
        .populate('organizer', 'name email')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Event.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: events.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: events,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('category', 'name')
      .populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private (organizer, admin)
const createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, image, category, date, time, venue, totalSeats, rules } = req.body;

    const event = await Event.create({
      name,
      description,
      image,
      category,
      date,
      time,
      venue,
      organizer: req.user._id,
      totalSeats,
      availableSeats: totalSeats,
      rules,
    });

    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (organizer who owns it, admin)
const updateEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    const fields = ['name', 'description', 'image', 'category', 'date', 'time', 'venue', 'rules', 'isActive'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    // If totalSeats is changed, adjust availableSeats proportionally
    if (req.body.totalSeats !== undefined) {
      const diff = req.body.totalSeats - event.totalSeats;
      event.totalSeats = req.body.totalSeats;
      event.availableSeats = Math.max(0, event.availableSeats + diff);
    }

    await event.save();
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (organizer who owns it, admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();

    res.json({ success: true, message: 'Event and its registrations deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private (participant)
const registerForEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, participants } = req.body;
    const numParticipants = Number(participants) || 1;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (!event.isActive) {
      return res.status(400).json({ success: false, message: 'Registration is closed for this event' });
    }

    if (event.availableSeats < numParticipants) {
      return res.status(400).json({ success: false, message: `Only ${event.availableSeats} seat(s) available` });
    }

    const existing = await Registration.findOne({ event: event._id, user: req.user._id, status: 'confirmed' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already registered for this event' });
    }

    const registration = await Registration.create({
      event: event._id,
      user: req.user._id,
      name,
      email,
      phone,
      participants: numParticipants,
    });

    event.availableSeats -= numParticipants;
    await event.save();

    res.status(201).json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
};
