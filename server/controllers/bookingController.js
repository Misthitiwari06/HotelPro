const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Payment = require('../models/Payment');

// Helper to generate unique booking reference
const generateBookingNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `HP-${timestamp}-${random}`;
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const {
      roomId,
      checkInDate,
      checkOutDate,
      totalGuests,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
      paymentMethod,
    } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide room ID, check-in date, and check-out date',
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

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.status === 'maintenance') {
      return res.status(400).json({ success: false, message: 'This room is currently undergoing maintenance' });
    }

    // Check for conflicting bookings
    const conflict = await Booking.findOne({
      room: roomId,
      bookingStatus: { $in: ['confirmed', 'checked-in'] },
      $or: [
        { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } },
      ],
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'Room is already booked for the selected dates. Please choose another date or room.',
      });
    }

    // Calculate nights & pricing
    const diffTime = Math.abs(checkOut - checkIn);
    const totalNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const roomCharge = totalNights * room.pricePerNight;
    const taxAmount = Math.round(roomCharge * 0.12); // 12% hospitality tax
    const totalPrice = roomCharge + taxAmount;

    const bookingNumber = generateBookingNumber();

    // Pricing and payment verification
    let finalTxnId = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    let paymentNotes = `Payment for Booking #${bookingNumber}`;
    let isPaymentPaid = 'paid';

    if (paymentMethod === 'upi') {
      const { upiUtr, upiApp } = req.body;
      if (!upiUtr || !/^\d{12}$/.test(upiUtr.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Please provide a valid, verified 12-digit UPI Reference Number (UTR) from your UPI payment app.',
        });
      }

      const existingTxn = await Payment.findOne({ transactionId: upiUtr.trim() });
      if (existingTxn) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: This UPI Reference Number (UTR) has already been processed for another reservation.',
        });
      }

      finalTxnId = upiUtr.trim();
      paymentNotes = `Verified UPI Payment via ${upiApp || 'UPI App'} (UTR: ${upiUtr.trim()})`;
    } else if (paymentMethod === 'cash') {
      isPaymentPaid = 'pending';
      paymentNotes = 'Pay at hotel front desk upon arrival';
    }

    const booking = await Booking.create({
      bookingNumber,
      guest: req.user.id,
      room: roomId,
      guestName: guestName || req.user.name,
      guestEmail: guestEmail || req.user.email,
      guestPhone: guestPhone || req.user.phone || '',
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalNights,
      totalGuests: totalGuests || 1,
      roomRate: room.pricePerNight,
      taxAmount,
      totalPrice,
      bookingStatus: 'confirmed',
      paymentStatus: isPaymentPaid,
      specialRequests: specialRequests || 'None',
    });

    // Create payment entry
    const payment = await Payment.create({
      booking: booking._id,
      guest: req.user.id,
      amount: totalPrice,
      paymentMethod: paymentMethod || 'card',
      transactionId: finalTxnId,
      status: isPaymentPaid === 'paid' ? 'success' : 'pending',
      notes: paymentNotes,
    });

    // If checkIn is today, update room status to occupied
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDay = new Date(checkIn);
    checkInDay.setHours(0, 0, 0, 0);
    if (checkInDay.getTime() === today.getTime()) {
      room.status = 'occupied';
      await room.save();
    }

    const populatedBooking = await Booking.findById(booking._id).populate('room');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: populatedBooking,
      payment,
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ guest: req.user.id })
      .populate('room')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (Admin/Staff)
// @route   GET /api/bookings
// @access  Private (Admin / Staff)
exports.getAllBookings = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.bookingStatus = status;
    }

    if (search) {
      query.$or = [
        { bookingNumber: { $regex: search, $options: 'i' } },
        { guestName: { $regex: search, $options: 'i' } },
        { guestEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const bookings = await Booking.find(query)
      .populate('room')
      .populate('guest', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get booking by ID with full details & invoice
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room')
      .populate('guest', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only allow guest who booked it or admin/staff to view
    if (
      booking.guest._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'staff'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    const payment = await Payment.findOne({ booking: booking._id });

    res.json({
      success: true,
      booking,
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status (check-in, check-out, cancel)
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin / Staff)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'checked-in', 'checked-out', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.bookingStatus = status;
    await booking.save();

    // Adjust room status accordingly
    const room = await Room.findById(booking.room);
    if (room) {
      if (status === 'checked-in') {
        room.status = 'occupied';
      } else if (status === 'checked-out') {
        room.status = 'cleaning';
      } else if (status === 'cancelled') {
        room.status = 'available';
      }
      await room.save();
    }

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check permissions
    if (
      booking.guest.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'staff'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'checked-in' || booking.bookingStatus === 'checked-out') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an active or completed stay. Please contact front desk.',
      });
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Free up room
    const room = await Room.findById(booking.room);
    if (room && room.status === 'occupied') {
      room.status = 'available';
      await room.save();
    }

    // Update payment record
    await Payment.findOneAndUpdate(
      { booking: booking._id },
      { status: 'refunded', notes: 'Refund issued upon cancellation' }
    );

    res.json({
      success: true,
      message: 'Booking cancelled and refund initiated successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

