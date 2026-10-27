import React, { useState } from 'react';

const HeroBanner = ({ onSearch, filters, setFilters }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [roomType, setRoomType] = useState('All');
  const [guests, setGuests] = useState('1');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      type: roomType,
      capacity: guests,
      checkInDate: checkIn,
      checkOutDate: checkOut,
    }));
    if (onSearch) {
      onSearch({ checkIn, checkOut, roomType, guests });
    }
  };

  return (
    <div className="hero-wrapper text-center">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-semibold text-uppercase mb-3">
              ★ Five-Star Luxury Experience ★
            </span>
            <h1 className="display-4 fw-bold mb-3 text-white">
              Where Precision Meets Hospitality
            </h1>
            <p className="lead text-light text-opacity-75 mb-5 mx-auto" style={{ maxWidth: '680px' }}>
              Seamless reservation management, refined accommodations, and instant check-ins. Designed for guests and hoteliers alike.
            </p>
          </div>
        </div>

        {/* Floating Search Availability Box */}
        <div className="row justify-content-center">
          <div className="col-lg-11">
            <div className="search-box-card text-dark text-start">
              <form onSubmit={handleSearchSubmit}>
                <div className="row g-3 align-items-end">
                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-secondary mb-1">
                      <i className="bi bi-calendar-event me-1 text-primary"></i> Check-in Date
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-lg fs-6"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-secondary mb-1">
                      <i className="bi bi-calendar-check me-1 text-primary"></i> Check-out Date
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-lg fs-6"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-secondary mb-1">
                      <i className="bi bi-door-closed me-1 text-primary"></i> Room Category
                    </label>
                    <select
                      className="form-select form-select-lg fs-6"
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      <option value="Single Room">Single Room</option>
                      <option value="Double Room">Double Room</option>
                      <option value="Deluxe Room">Deluxe Room</option>
                      <option value="Executive Suite">Executive Suite</option>
                      <option value="Presidential Suite">Presidential Suite</option>
                    </select>
                  </div>

                  <div className="col-md-2">
                    <label className="form-label small fw-bold text-secondary mb-1">
                      <i className="bi bi-people me-1 text-primary"></i> Guests
                    </label>
                    <select
                      className="form-select form-select-lg fs-6"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4+ Guests</option>
                    </select>
                  </div>

                  <div className="col-md-1">
                    <button
                      type="submit"
                      className="btn btn-warning btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center"
                      title="Search Rooms"
                    >
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
