const Room = require('../models/Room');
const Booking = require('../models/Booking');

// @desc    Get all rooms with filtering & search
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res) => {
  try {
    const { type, status, minPrice, maxPrice, capacity, search } = req.query;
    let query = {};

    if (type && type !== 'All') {
      query.type = type;
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    if (capacity) {
      query.capacity = { $gte: Number(capacity) };
    }
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { roomNumber: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const rooms = await Room.find(query).sort({ roomNumber: 1 });
    res.json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Admin / Staff)
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, type, pricePerNight, capacity, bedType, amenities, images, status, description, floor } = req.body;

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ success: false, message: `Room ${roomNumber} already exists` });
    }

    const room = await Room.create({
      roomNumber,
      type,
      pricePerNight,
      capacity,
      bedType,
      amenities,
      images,
      status: status || 'available',
      description,
      floor,
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private (Admin / Staff)
exports.updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Room updated successfully',
      room,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin only)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check if there are active bookings
    const activeBooking = await Booking.findOne({
      room: req.params.id,
      bookingStatus: { $in: ['confirmed', 'checked-in'] },
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active or upcoming bookings.',
      });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check room availability for date range
// @route   GET /api/rooms/check-availability
// @access  Public
exports.checkAvailability = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, guests, type } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both checkInDate and checkOutDate',
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
    }

    // Find conflicting bookings
    const conflictingBookings = await Booking.find({
      bookingStatus: { $in: ['confirmed', 'checked-in'] },
      $or: [
        { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } },
      ],
    }).select('room');

    const bookedRoomIds = conflictingBookings.map((b) => b.room);

    let roomQuery = {
      _id: { $nin: bookedRoomIds },
      status: { $ne: 'maintenance' },
    };

    if (guests) {
      roomQuery.capacity = { $gte: Number(guests) };
    }
    if (type && type !== 'All') {
      roomQuery.type = type;
    }

    const availableRooms = await Room.find(roomQuery).sort({ pricePerNight: 1 });

    res.json({
      success: true,
      checkInDate,
      checkOutDate,
      availableCount: availableRooms.length,
      rooms: availableRooms,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
