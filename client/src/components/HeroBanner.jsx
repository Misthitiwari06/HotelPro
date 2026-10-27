import React, { useState } from 'react';

const HeroBanner = ({ onSearch, filters, setFilters }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getDayAfterTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(filters?.checkInDate || getTomorrow());
  const [checkOut, setCheckOut] = useState(filters?.checkOutDate || getDayAfterTomorrow());
  const [roomType, setRoomType] = useState(filters?.type || 'All');
  const [guests, setGuests] = useState(filters?.capacity || '1');

  const handleCheckInChange = (e) => {
    const selectedCheckIn = e.target.value;
    setCheckIn(selectedCheckIn);
    if (selectedCheckIn && checkOut && new Date(selectedCheckIn) >= new Date(checkOut)) {
      const nextDay = new Date(selectedCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

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
        {/* Main Hero Header */}
        <div className="row justify-content-center">
          <div className="col-lg-9 mb-2">
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-semibold text-uppercase mb-3 shadow-xs">
              ★ Five-Star Luxury Experience ★
            </span>
            <h1 className="display-4 fw-bold mb-3 text-white">
              Where Precision Meets Hospitality
            </h1>
            <p className="lead text-light text-opacity-75 mx-auto mb-4" style={{ maxWidth: '680px' }}>
              Seamless reservation management, refined accommodations, and instant check-ins. Designed for guests and hoteliers alike.
            </p>
          </div>
        </div>

        {/* Check-In and Check-Out Date Selection Box - Positioned downward with ample spacing */}
        <div className="row justify-content-center">
          <div className="col-lg-11">
            <div className="search-box-card text-dark text-start">
              <form onSubmit={handleSearchSubmit}>
                <div className="row g-3 align-items-end">
                  {/* Check-In Date */}
                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-secondary mb-1 d-flex align-items-center">
                      <i className="bi bi-calendar-event me-1 text-primary fs-6"></i> Check-in Date
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-lg fs-6"
                      min={todayStr}
                      value={checkIn}
                      onChange={handleCheckInChange}
                      required
                    />
                  </div>

                  {/* Check-Out Date */}
                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-secondary mb-1 d-flex align-items-center">
                      <i className="bi bi-calendar-check me-1 text-primary fs-6"></i> Check-out Date
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-lg fs-6"
                      min={checkIn || todayStr}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                    />
                  </div>

                  {/* Room Category */}
                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-secondary mb-1 d-flex align-items-center">
                      <i className="bi bi-door-closed me-1 text-primary fs-6"></i> Room Category
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

                  {/* Guests */}
                  <div className="col-md-2">
                    <label className="form-label small fw-bold text-secondary mb-1 d-flex align-items-center">
                      <i className="bi bi-people me-1 text-primary fs-6"></i> Guests
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

                  {/* Submit Button */}
                  <div className="col-md-1">
                    <button
                      type="submit"
                      className="btn btn-warning btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center"
                      title="Search Available Rooms"
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
