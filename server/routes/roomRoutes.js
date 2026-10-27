const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  checkAvailability,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/check-availability', checkAvailability);
router.get('/', getRooms);
router.get('/:id', getRoomById);
router.post('/', protect, authorize('admin', 'staff'), createRoom);
router.put('/:id', protect, authorize('admin', 'staff'), updateRoom);
router.delete('/:id', protect, authorize('admin'), deleteRoom);

module.exports = router;
