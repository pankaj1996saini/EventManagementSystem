const express = require('express');
const {
  getRegistrations,
  getRegistrationById,
  cancelRegistration,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getRegistrations);
router.get('/:id', protect, getRegistrationById);
router.delete('/:id', protect, cancelRegistration);

module.exports = router;
