import React, { useState, useEffect } from 'react';
import API from '../services/api';
import HeroBanner from '../components/HeroBanner';
import RoomCard from '../components/RoomCard';

const HomeView = ({ onBookRoom, onOpenAuthModal }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'All',
    status: 'All',
    capacity: '1',
    search: '',
  });
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      let queryParams = [];
      if (filters.type && filters.type !== 'All') queryParams.push(`type=${encodeURIComponent(filters.type)}`);
      if (filters.status && filters.status !== 'All') queryParams.push(`status=${encodeURIComponent(filters.status)}`);
      if (filters.capacity && filters.capacity !== 'All') queryParams.push(`capacity=${encodeURIComponent(filters.capacity)}`);
      if (filters.search) queryParams.push(`search=${encodeURIComponent(filters.search)}`);

      const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
      const res = await API.get(`/rooms${queryString}`);
      if (res.data.success) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [filters.type, filters.status, filters.capacity]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    fetchRooms();
  };

  return (
    <div>
      {/* Hero Banner with Integrated Search */}
      <HeroBanner filters={filters} setFilters={setFilters} onSearch={() => fetchRooms()} />

      {/* Main Room Showcase Container */}
      <div className="container py-5">
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
                  onViewDetails={setSelectedRoomDetails}
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

      {/* Room Detail Modal */}
      {selectedRoomDetails && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="position-relative">
                <img
                  src={selectedRoomDetails.images?.[0]}
                  alt={selectedRoomDetails.type}
                  className="w-100"
                  style={{ height: 260, objectFit: 'cover' }}
                />
                <button
                  type="button"
                  className="btn btn-dark btn-sm rounded-circle position-absolute top-0 end-0 m-3"
                  onClick={() => setSelectedRoomDetails(null)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="modal-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span className="badge bg-warning text-dark fw-bold mb-1">Room #{selectedRoomDetails.roomNumber}</span>
                    <h4 className="font-heading fw-bold mb-0">{selectedRoomDetails.type}</h4>
                  </div>
                  <div className="text-end">
                    <span className="price-tag text-primary">${selectedRoomDetails.pricePerNight}</span>
                    <div className="text-muted small">per night</div>
                  </div>
                </div>

                <p className="text-muted small mb-3">{selectedRoomDetails.description}</p>

                <h6 className="fw-bold small text-uppercase text-secondary mb-2">Room Amenities</h6>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {selectedRoomDetails.amenities?.map((amenity, idx) => (
                    <span key={idx} className="badge bg-light text-dark border py-2 px-3">
                      ✓ {amenity}
                    </span>
                  ))}
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary w-50 fw-semibold"
                    onClick={() => setSelectedRoomDetails(null)}
                  >
                    Close
                  </button>
                  <button
                    className="btn btn-primary w-50 fw-bold"
                    onClick={() => {
                      const roomToBook = selectedRoomDetails;
                      setSelectedRoomDetails(null);
                      onBookRoom(roomToBook);
                    }}
                    disabled={selectedRoomDetails.status !== 'available'}
                  >
                    {selectedRoomDetails.status === 'available' ? 'Book Room' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
