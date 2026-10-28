import React, { useState, useEffect } from 'react';
import API from '../services/api';
import HeroBanner from '../components/HeroBanner';
import RoomCard from '../components/RoomCard';
import RoomPhotosQRModal from '../components/RoomPhotosQRModal';

const DEFAULT_ROOMS = [
  {
    _id: '671e01',
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
    _id: '671e02',
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
    _id: '671e03',
    roomNumber: '201',
    type: 'Double Room',
    pricePerNight: 3999,
    capacity: 2,
    bedType: 'Queen Bed',
    floor: 2,
    status: 'available',
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
    _id: '671e04',
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
    _id: '671e05',
    roomNumber: '301',
    type: 'Deluxe Room',
    pricePerNight: 6999,
    capacity: 3,
    bedType: 'King Bed + Sofa Bed',
    floor: 3,
    status: 'available',
    rating: 4.9,
    amenities: ['Panoramic View', 'High-speed Wi-Fi', 'Smart TV 55"', 'Marble Bathroom', 'Bathtub', 'Complimentary Breakfast'],
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
    ],
    description: 'High-floor deluxe retreat offering floor-to-ceiling windows, marble bathroom, and daily artisanal breakfast.',
  },
  {
    _id: '671e06',
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
    _id: '671e07',
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
    _id: '671e08',
    roomNumber: '501',
    type: 'Presidential Suite',
    pricePerNight: 24999,
    capacity: 4,
    bedType: 'Royal Master Bed',
    floor: 5,
    status: 'available',
    rating: 5.0,
    amenities: ['Private Rooftop Terrace', 'Heated Plunge Pool', 'Personal Butler 24/7', 'Private Elevator Access', 'Full Kitchenette', 'Limousine Transfer'],
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
    ],
    description: 'The crown jewel of HotelPro. Full penthouse level with private plunge pool, panoramic skyline terrace, and 24/7 butler.',
  },
];

const HomeView = ({ onBookRoom, onOpenAuthModal }) => {
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'All',
    status: 'All',
    capacity: '1',
    search: '',
  });
  const [photosQRRoom, setPhotosQRRoom] = useState(null);
  const [photosQRInitialTab, setPhotosQRInitialTab] = useState('photos');

  const filterRoomList = (list) => {
    return list.filter((r) => {
      if (filters.type && filters.type !== 'All' && r.type !== filters.type) return false;
      if (filters.status && filters.status !== 'All' && r.status !== filters.status) return false;
      if (filters.capacity && r.capacity < Number(filters.capacity)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          r.roomNumber?.toLowerCase().includes(q) ||
          r.type?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  };

  const fetchRooms = async () => {
    try {
      let queryParams = [];
      if (filters.type && filters.type !== 'All') queryParams.push(`type=${encodeURIComponent(filters.type)}`);
      if (filters.status && filters.status !== 'All') queryParams.push(`status=${encodeURIComponent(filters.status)}`);
      if (filters.capacity && filters.capacity !== 'All') queryParams.push(`capacity=${encodeURIComponent(filters.capacity)}`);
      if (filters.search) queryParams.push(`search=${encodeURIComponent(filters.search)}`);

      const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
      const res = await API.get(`/rooms${queryString}`);
      if (res.data.success && res.data.rooms && res.data.rooms.length > 0) {
        const enhancedRooms = res.data.rooms.map((r) => ({
          ...r,
          images: r.images && r.images.length > 0
            ? r.images
            : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
        }));
        setRooms(enhancedRooms);
      } else {
        setRooms(filterRoomList(DEFAULT_ROOMS));
      }
    } catch (err) {
      console.warn('Using luxury inventory fallback:', err.message);
      setRooms(filterRoomList(DEFAULT_ROOMS));
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [filters.type, filters.status, filters.capacity]);

  // Deep linking: When user scans QR code on phone or browser opens with ?room=<roomId>
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomIdParam = urlParams.get('room');
      const viewParam = urlParams.get('view');
      if (roomIdParam) {
        const found = DEFAULT_ROOMS.find((r) => r._id === roomIdParam || r.roomNumber === roomIdParam);
        if (found) {
          setPhotosQRRoom(found);
          setPhotosQRInitialTab(viewParam === 'qr' ? 'qr' : 'photos');
        } else {
          API.get(`/rooms/${roomIdParam}`)
            .then((res) => {
              if (res.data.success && res.data.room) {
                setPhotosQRRoom(res.data.room);
                setPhotosQRInitialTab(viewParam === 'qr' ? 'qr' : 'photos');
              }
            })
            .catch(() => {});
        }
      }
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    fetchRooms();
  };

  return (
    <div>
      {/* Hero Banner with Integrated Search */}
      <HeroBanner filters={filters} setFilters={setFilters} onSearch={() => fetchRooms()} />

      {/* Main Room Showcase Container */}
      <div className="container showcase-container py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h2 className="font-heading fw-bold text-dark mb-1">Our Accommodations</h2>
            <p className="text-muted small mb-0">Discover our collection of curated guest rooms and panoramic suites.</p>
          </div>

          {/* Quick Filter Pill Buttons */}
          <div className="d-flex flex-wrap gap-2">
            {['All', 'Single Room', 'Double Room', 'Deluxe Room', 'Executive Suite', 'Presidential Suite'].map((cat) => (
              <button
                key={cat}
                className={`btn btn-sm px-3 rounded-pill fw-semibold ${filters.type === cat ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilters({ ...filters, type: cat })}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-3 rounded-3 border mb-4 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by room number, keywords or features..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="All">All Statuses</option>
                <option value="available">Available Only</option>
                <option value="occupied">Occupied</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.capacity}
                onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
              >
                <option value="1">1+ Guests</option>
                <option value="2">2+ Guests</option>
                <option value="3">3+ Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>

            <div className="col-md-2 d-flex gap-2">
              <button type="submit" className="btn btn-dark w-100 fw-semibold">
                Apply
              </button>
              {(filters.type !== 'All' || filters.status !== 'All' || filters.search) && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setFilters({ type: 'All', status: 'All', capacity: '1', search: '' });
                  }}
                  title="Reset Filters"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted mt-2 small">Loading luxury inventory...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border">
            <i className="bi bi-door-closed display-3 text-muted mb-3 d-block"></i>
            <h5 className="fw-bold">No rooms found</h5>
            <p className="text-muted small">Try adjusting your filters or search keywords.</p>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setFilters({ type: 'All', status: 'All', capacity: '1', search: '' })}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {rooms.map((room) => (
              <div className="col-md-6 col-lg-4" key={room._id}>
                <RoomCard
                  room={room}
                  onBookNow={onBookRoom}
                  onViewDetails={(r) => {
                    setPhotosQRRoom(r);
                    setPhotosQRInitialTab('photos');
                  }}
                  onOpenPhotos={(r) => {
                    setPhotosQRRoom(r);
                    setPhotosQRInitialTab('photos');
                  }}
                  onOpenQR={(r) => {
                    setPhotosQRRoom(r);
                    setPhotosQRInitialTab('qr');
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hotel Amenities & Experience Showcase */}
      <section className="bg-light py-5 border-top border-bottom">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge bg-primary-subtle text-primary fw-bold text-uppercase px-3 py-2 rounded-pill mb-2">
              World-Class Amenities
            </span>
            <h2 className="font-heading fw-bold">Everything You Need for an Unforgettable Stay</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              From bespoke dining to seamless fiber connectivity, our amenities are tailored to exceed expectations.
            </p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-6 col-md-3">
              <div className="p-4 bg-white rounded-3 shadow-sm h-100 border">
                <i className="bi bi-wifi display-6 text-primary mb-3 d-block"></i>
                <h6 className="fw-bold mb-1">High-Speed Wi-Fi</h6>
                <p className="text-muted small mb-0">Complimentary 1 Gbps fiber throughout all properties.</p>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-4 bg-white rounded-3 shadow-sm h-100 border">
                <i className="bi bi-cup-hot display-6 text-warning mb-3 d-block"></i>
                <h6 className="fw-bold mb-1">Artisanal Breakfast</h6>
                <p className="text-muted small mb-0">Fresh gourmet breakfast buffet crafted daily by executive chefs.</p>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-4 bg-white rounded-3 shadow-sm h-100 border">
                <i className="bi bi-water display-6 text-info mb-3 d-block"></i>
                <h6 className="fw-bold mb-1">Infinity Pool & Spa</h6>
                <p className="text-muted small mb-0">Heated rooftop pool with panoramic skyline views and luxury hydrotherapy.</p>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-4 bg-white rounded-3 shadow-sm h-100 border">
                <i className="bi bi-shield-check display-6 text-success mb-3 d-block"></i>
                <h6 className="fw-bold mb-1">24/7 Concierge</h6>
                <p className="text-muted small mb-0">Round-the-clock front desk assistance, luggage valet, and room service.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Room Photos & QR Code Modal */}
      <RoomPhotosQRModal
        room={photosQRRoom}
        show={Boolean(photosQRRoom)}
        initialTab={photosQRInitialTab}
        onClose={() => setPhotosQRRoom(null)}
        onBookNow={(roomToBook) => {
          setPhotosQRRoom(null);
          onBookRoom(roomToBook);
        }}
      />

      {/* Footer */}
      <footer className="bg-dark text-white pt-5 pb-4 mt-5">
        <div className="container">
          <div className="row g-4 justify-content-between mb-4">
            <div className="col-lg-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="bg-primary text-white p-2 rounded-2 d-inline-flex">
                  <i className="bi bi-buildings-fill fs-5"></i>
                </span>
                <h4 className="font-heading fw-bold mb-0">Hotel<span className="text-warning">Pro</span></h4>
              </div>
              <p className="text-secondary small">
                The premier digital hotel management and luxury hospitality suite. Providing seamless guest reservation engines, front-desk workflows, and real-time operations.
              </p>
            </div>

            <div className="col-lg-2 col-6">
              <h6 className="fw-bold text-uppercase small text-light mb-3">Navigation</h6>
              <ul className="list-unstyled small text-secondary d-flex flex-column gap-2">
                <li><a href="#rooms" className="text-decoration-none text-secondary">All Accommodations</a></li>
                <li><a href="#amenities" className="text-decoration-none text-secondary">Hotel Amenities</a></li>
                <li><a href="#about" className="text-decoration-none text-secondary">About HotelPro</a></li>
                <li><a href="#contact" className="text-decoration-none text-secondary">Concierge Support</a></li>
              </ul>
            </div>

            <div className="col-lg-2 col-6">
              <h6 className="fw-bold text-uppercase small text-light mb-3">Front Desk</h6>
              <ul className="list-unstyled small text-secondary d-flex flex-column gap-2">
                <li>Check-In: 3:00 PM</li>
                <li>Check-Out: 11:00 AM</li>
                <li>Express Checkout: Available</li>
                <li>Baggage Storage: 24 Hours</li>
              </ul>
            </div>

            <div className="col-lg-3">
              <h6 className="fw-bold text-uppercase small text-light mb-3">Direct Concierge</h6>
              <div className="small text-secondary mb-2">
                <i className="bi bi-telephone-fill text-warning me-2"></i> +1 (800) 555-HOTEL
              </div>
              <div className="small text-secondary mb-2">
                <i className="bi bi-envelope-fill text-warning me-2"></i> concierge@hotelpro.com
              </div>
              <div className="small text-secondary">
                <i className="bi bi-geo-alt-fill text-warning me-2"></i> 777 Grand Blvd, Metropolis, NY
              </div>
            </div>
          </div>

          <div className="border-top border-secondary pt-3 d-flex flex-column flex-md-row justify-content-between align-items-center small text-secondary">
            <div>© {new Date().getFullYear()} HotelPro Management Solutions. All rights reserved.</div>
            <div className="d-flex gap-3 mt-2 mt-md-0">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeView;

