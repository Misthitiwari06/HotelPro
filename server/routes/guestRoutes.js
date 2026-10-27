const express = require('express');
const router = express.Router();
const { getGuests, getGuestById } = require('../controllers/guestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'staff'), getGuests);
router.get('/:id', protect, authorize('admin', 'staff'), getGuestById);

module.exports = router;
