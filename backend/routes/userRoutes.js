const express = require('express');
const { getUsers, updateUserStatus } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), getUsers);
router.put('/:id/status', protect, authorize('admin'), updateUserStatus);

module.exports = router;
