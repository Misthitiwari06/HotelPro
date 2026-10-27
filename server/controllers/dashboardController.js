const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const Payment = require('../models/Payment');

// @desc    Get Admin/Staff Dashboard Analytics
// @route   GET /api/dashboard/stats
// @access  Private (Admin / Staff)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'available' });
    const occupiedRooms = await Room.countDocuments({ status: 'occupied' });
    const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });
    const cleaningRooms = await Room.countDocuments({ status: 'cleaning' });

    const totalBookings = await Booking.countDocuments();
    const activeStays = await Booking.countDocuments({ bookingStatus: 'checked-in' });
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' });
    const totalGuests = await User.countDocuments({ role: 'guest' });

    // Calculate total revenue from paid bookings
    const paidBookings = await Booking.find({ paymentStatus: 'paid' });
    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // Calculate occupancy rate
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .populate('room', 'roomNumber type pricePerNight')
      .populate('guest', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent payments
    const recentPayments = await Payment.find()
      .populate('guest', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Room type distribution
    const roomTypeStats = await Room.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricePerNight' },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalBookings,
        occupancyRate,
        totalRooms,
        availableRooms,
        occupiedRooms,
        maintenanceRooms,
        cleaningRooms,
        activeStays,
        confirmedBookings,
        cancelledBookings,
        totalGuests,
      },
      roomTypeStats,
      recentBookings,
      recentPayments,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
