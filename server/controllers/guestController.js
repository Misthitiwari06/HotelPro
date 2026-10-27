const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get all registered guests & their booking statistics
// @route   GET /api/guests
// @access  Private (Admin / Staff)
exports.getGuests = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: 'guest' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const guests = await User.find(query).sort({ createdAt: -1 });

    // Populate guest stats (number of bookings, total spent)
    const guestDataWithStats = await Promise.all(
      guests.map(async (guest) => {
        const bookings = await Booking.find({ guest: guest._id });
        const totalBookings = bookings.length;
        const totalSpent = bookings
          .filter((b) => b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + b.totalPrice, 0);

        return {
          _id: guest._id,
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          address: guest.address,
          avatar: guest.avatar,
          createdAt: guest.createdAt,
          totalBookings,
          totalSpent,
        };
      })
    );

    res.json({
      success: true,
      count: guestDataWithStats.length,
      guests: guestDataWithStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single guest details with stay history
// @route   GET /api/guests/:id
// @access  Private (Admin / Staff)
exports.getGuestById = async (req, res) => {
  try {
    const guest = await User.findById(req.params.id);
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    const bookings = await Booking.find({ guest: guest._id })
      .populate('room')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      guest,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
