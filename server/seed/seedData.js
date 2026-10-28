const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: '../.env' });
if (!process.env.MONGO_URI) {
  dotenv.config({ path: '.env' });
}

const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotelpro';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed] Connected to MongoDB...');

    // Drop entire database to remove any legacy indexes
    try {
      await mongoose.connection.db.dropDatabase();
      console.log('[Seed] Dropped database and legacy indexes successfully.');
    } catch (dropErr) {
      console.log('[Seed] Drop database notice:', dropErr.message);
    }

    const users = await User.create([
      {
        name: 'Alexander Wright (General Manager)',
        email: 'admin@hotelpro.com',
        password: 'admin123',
        role: 'admin',
        phone: '+1 (555) 019-2834',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      },
      {
        name: 'Elena Rostova (Front Desk Lead)',
        email: 'staff@hotelpro.com',
        password: 'staff123',
        role: 'staff',
        phone: '+1 (555) 014-9988',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      },
      {
        name: 'Michael Sterling',
        email: 'guest@hotelpro.com',
        password: 'guest123',
        role: 'guest',
        phone: '+1 (555) 018-4455',
        address: '450 Fifth Avenue, New York, NY',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      },
      {
        name: 'Sophia Chen',
        email: 'sarah@example.com',
        password: 'guest123',
        role: 'guest',
        phone: '+1 (555) 012-7711',
        address: '742 Evergreen Terrace, Seattle, WA',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      },
    ]);
    console.log(`[Seed] Seeded ${users.length} users.`);

    // Seed Rooms
    const rooms = await Room.create([
      {
        roomNumber: '101',
        type: 'Single Room',
        pricePerNight: 2499,
        capacity: 1,
        bedType: 'Single Bed',
        floor: 1,
        status: 'available',
        rating: 4.6,
        amenities: ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'Work Desk', 'Daily Housekeeping'],
        images: [
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
        ],
        description: 'Cozy and functional single room tailored for solo business travelers or short stays with ergonomic workspace.',
      },
      {
        roomNumber: '102',
        type: 'Single Room',
        pricePerNight: 2799,
        capacity: 1,
        bedType: 'Single Bed',
        floor: 1,
        status: 'available',
        rating: 4.7,
        amenities: ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'Espresso Machine', 'City View'],
        images: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        ],
        description: 'Modern minimalist single room equipped with premium soundproofing and high-speed fiber internet.',
      },
      {
        roomNumber: '201',
        type: 'Double Room',
        pricePerNight: 3999,
        capacity: 2,
        bedType: 'Queen Bed',
        floor: 2,
        status: 'occupied',
        rating: 4.8,
        amenities: ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'Balcony', 'Mini Bar', 'En-suite Rainfall Shower'],
        images: [
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        ],
        description: 'Spacious double room featuring private garden-facing balcony and indulgent premium bedding.',
      },
      {
        roomNumber: '202',
        type: 'Double Room',
        pricePerNight: 4499,
        capacity: 2,
        bedType: 'King Bed',
        floor: 2,
        status: 'available',
        rating: 4.8,
        amenities: ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'Mini Refrigerator', 'Safe Deposit Box', 'Robes & Slippers'],
        images: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
        ],
        description: 'Elegantly appointed double room designed with soothing acoustic tones and plush king mattress.',
      },
      {
        roomNumber: '301',
        type: 'Deluxe Room',
        pricePerNight: 6999,
        capacity: 3,
        bedType: 'King Bed + Sofa Bed',
        floor: 3,
        status: 'occupied',
        rating: 4.9,
        amenities: ['Panoramic View', 'High-speed Wi-Fi', 'Smart TV 55"', 'Marble Bathroom', 'Bathtub', 'Complimentary Breakfast', 'Nespresso Machine'],
        images: [
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
        ],
        description: 'High-floor deluxe retreat offering floor-to-ceiling windows, marble bathroom, and daily artisanal breakfast.',
      },
      {
        roomNumber: '302',
        type: 'Deluxe Room',
        pricePerNight: 7499,
        capacity: 3,
        bedType: 'King Bed',
        floor: 3,
        status: 'available',
        rating: 4.9,
        amenities: ['City Skyline View', 'High-speed Wi-Fi', 'Complimentary Minibar', 'Soaking Tub', 'Pillow Menu', 'Turndown Service'],
        images: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        ],
        description: 'Refined deluxe quarters featuring customized pillow selection, deep soaking tub, and skyline vistas.',
      },
      {
        roomNumber: '401',
        type: 'Executive Suite',
        pricePerNight: 12999,
        capacity: 4,
        bedType: 'Master King + Twin Sleeper',
        floor: 4,
        status: 'available',
        rating: 5.0,
        amenities: ['Separate Living Room', 'Club Lounge Access', 'Private Bar', 'Jacuzzi', 'Express VIP Check-in', 'Evening Cocktails'],
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
        ],
        description: 'Corner executive suite with dedicated dining parlor, club lounge privileges, and bespoke concierge attention.',
      },
      {
        roomNumber: '501',
        type: 'Presidential Suite',
        pricePerNight: 24999,
        capacity: 4,
        bedType: 'Royal Master Bed',
        floor: 5,
        status: 'available',
        rating: 5.0,
        amenities: ['Private Rooftop Terrace', 'Heated Plunge Pool', 'Personal Butler 24/7', 'Private Elevator Access', 'Full Kitchenette', 'Limousine Airport Transfer'],
        images: [
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
        ],
        description: 'The crown jewel of HotelPro. Full penthouse level with private plunge pool, panoramic skyline terrace, and 24/7 butler.',
      },
    ]);
    console.log(`[Seed] Seeded ${rooms.length} hotel rooms.`);

    // Seed Sample Bookings
    const guestUser = users[2];
    const sarahUser = users[3];

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 2);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 5);
    const nextWeekEnd = new Date(today);
    nextWeekEnd.setDate(today.getDate() + 8);

    const pastCheckIn = new Date(today);
    pastCheckIn.setDate(today.getDate() - 4);
    const pastCheckOut = new Date(today);
    pastCheckOut.setDate(today.getDate() - 1);

    const booking1 = await Booking.create({
      bookingNumber: 'HP-9821-4401',
      guest: guestUser._id,
      room: rooms[2]._id, // Room 201
      guestName: guestUser.name,
      guestEmail: guestUser.email,
      guestPhone: guestUser.phone,
      checkInDate: today,
      checkOutDate: tomorrow,
      totalNights: 2,
      totalGuests: 2,
      roomRate: rooms[2].pricePerNight,
      taxAmount: Math.round(rooms[2].pricePerNight * 2 * 0.12),
      totalPrice: rooms[2].pricePerNight * 2 + Math.round(rooms[2].pricePerNight * 2 * 0.12),
      bookingStatus: 'checked-in',
      paymentStatus: 'paid',
      specialRequests: 'Late check-out request, feather-free pillows.',
    });

    const booking2 = await Booking.create({
      bookingNumber: 'HP-8712-3390',
      guest: sarahUser._id,
      room: rooms[4]._id, // Room 301
      guestName: sarahUser.name,
      guestEmail: sarahUser.email,
      guestPhone: sarahUser.phone,
      checkInDate: nextWeek,
      checkOutDate: nextWeekEnd,
      totalNights: 3,
      totalGuests: 2,
      roomRate: rooms[4].pricePerNight,
      taxAmount: Math.round(rooms[4].pricePerNight * 3 * 0.12),
      totalPrice: rooms[4].pricePerNight * 3 + Math.round(rooms[4].pricePerNight * 3 * 0.12),
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      specialRequests: 'High floor preferred, anniversary celebration sparkling wine.',
    });

    const booking3 = await Booking.create({
      bookingNumber: 'HP-6520-1188',
      guest: guestUser._id,
      room: rooms[0]._id, // Room 101
      guestName: guestUser.name,
      guestEmail: guestUser.email,
      guestPhone: guestUser.phone,
      checkInDate: pastCheckIn,
      checkOutDate: pastCheckOut,
      totalNights: 3,
      totalGuests: 1,
      roomRate: rooms[0].pricePerNight,
      taxAmount: Math.round(rooms[0].pricePerNight * 3 * 0.12),
      totalPrice: rooms[0].pricePerNight * 3 + Math.round(rooms[0].pricePerNight * 3 * 0.12),
      bookingStatus: 'checked-out',
      paymentStatus: 'paid',
      specialRequests: 'Quiet room near elevator.',
    });

    console.log('[Seed] Seeded sample bookings.');

    // Seed Payments
    await Payment.create([
      {
        booking: booking1._id,
        guest: guestUser._id,
        amount: booking1.totalPrice,
        currency: 'INR',
        paymentMethod: 'card',
        transactionId: 'TXN-982144-CARD',
        status: 'success',
      },
      {
        booking: booking2._id,
        guest: sarahUser._id,
        amount: booking2.totalPrice,
        currency: 'INR',
        paymentMethod: 'upi',
        transactionId: 'TXN-871233-UPI',
        status: 'success',
      },
      {
        booking: booking3._id,
        guest: guestUser._id,
        amount: booking3.totalPrice,
        currency: 'INR',
        paymentMethod: 'card',
        transactionId: 'TXN-652011-CARD',
        status: 'success',
      },
    ]);
    console.log('[Seed] Seeded sample payments.');

    console.log('\n=============================================');
    console.log('✅ HotelPro Database seeded successfully!');
    console.log('Default credentials:');
    console.log('Admin:      admin@hotelpro.com / admin123');
    console.log('Staff:      staff@hotelpro.com / staff123');
    console.log('Guest:      guest@hotelpro.com / guest123');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDB();
