const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Please provide room number'],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify room type'],
      enum: ['Single Room', 'Double Room', 'Deluxe Room', 'Executive Suite', 'Presidential Suite'],
      default: 'Deluxe Room',
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Please provide price per night'],
      min: 0,
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify max capacity'],
      default: 2,
    },
    bedType: {
      type: String,
      default: 'King Bed',
    },
    amenities: {
      type: [String],
      default: ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'En-suite Bathroom', 'Room Service'],
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      ],
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance', 'cleaning'],
      default: 'available',
    },
    description: {
      type: String,
      default: 'Experience world-class luxury and comfort with bespoke furnishings and modern amenities.',
    },
    floor: {
      type: Number,
      default: 1,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Room', roomSchema);
