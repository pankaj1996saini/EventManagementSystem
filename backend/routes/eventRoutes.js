const express = require('express');
const { body } = require('express-validator');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const eventValidation = [
  body('name').trim().notEmpty().withMessage('Event name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('totalSeats').isInt({ min: 1 }).withMessage('Total seats must be at least 1'),
];

router.get('/', getEvents);
router.get('/:id', getEventById);

router.post('/', protect, authorize('organizer', 'admin'), eventValidation, createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

router.post(
  '/:id/register',
  protect,
  authorize('participant', 'admin', 'organizer'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('participants').isInt({ min: 1 }).withMessage('Participants must be at least 1'),
  ],
  registerForEvent
);

module.exports = router;
