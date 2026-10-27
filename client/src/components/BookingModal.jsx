import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookingModal = ({ room, show, onClose, onBookingSuccess, onOpenAuthModal }) => {
  const { user, isAuthenticated } = useAuth();

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

  const [checkInDate, setCheckInDate] = useState(getTomorrow());
  const [checkOutDate, setCheckOutDate] = useState(getDayAfterTomorrow());
  const [totalGuests, setTotalGuests] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setGuestName(user.name || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || '');
    }
  }, [user]);

  if (!show || !room) return null;

  // Calculate nights
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = checkOut - checkIn;
  const nights = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
  const roomSubtotal = nights * room.pricePerNight;
  const taxAmount = Math.round(roomSubtotal * 0.12);
  const totalPrice = roomSubtotal + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      onClose();
      onOpenAuthModal();
      return;
    }

    if (nights <= 0) {
      setError('Check-out date must be strictly after check-in date.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/bookings', {
        roomId: room._id,
        checkInDate,
        checkOutDate,
        totalGuests,
        guestName,
        guestEmail,
        guestPhone,
        specialRequests,
        paymentMethod,
      });

      if (res.data.success) {
        onBookingSuccess(res.data.booking);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking reservation could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-dark text-white p-4">
            <div>
              <span className="badge bg-warning text-dark text-uppercase fw-bold mb-1">
                Room #{room.roomNumber} • {room.type}
              </span>
              <h4 className="modal-title font-heading mb-0">Confirm Your Luxury Reservation</h4>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              <div className="row g-4">
                {/* Left Column: Dates & Guest Info */}
                <div className="col-md-7 border-end-md">
                  <h6 className="fw-bold text-dark text-uppercase small letter-spacing mb-3">
                    <i className="bi bi-calendar3 me-1 text-primary"></i> 1. Select Stay Dates
                  </h6>
                  <div className="row g-2 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label small text-secondary">Check-In</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small text-secondary">Check-Out</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <h6 className="fw-bold text-dark text-uppercase small letter-spacing mb-3 pt-2 border-top">
                    <i className="bi bi-person-lines-fill me-1 text-primary"></i> 2. Guest Information
                  </h6>
                  <div className="row g-2 mb-3">
                    <div className="col-12">
                      <label className="form-label small text-secondary">Primary Guest Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="John Doe"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small text-secondary">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        placeholder="john@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small text-secondary">Contact Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+1 (555) 000-0000"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small text-secondary">Special Preferences / Requests</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Airport pickup, high floor, hypoallergenic bedding, late check-in..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                      ></textarea>
                    </div>
                  </div>

                  <h6 className="fw-bold text-dark text-uppercase small letter-spacing mb-2 pt-2 border-top">
                    <i className="bi bi-credit-card-2-front me-1 text-primary"></i> 3. Payment Method
                  </h6>
                  <div className="d-flex gap-3">
                    {['card', 'upi', 'cash'].map((m) => (
                      <div className="form-check" key={m}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id={`pay-${m}`}
                          checked={paymentMethod === m}
                          onChange={() => setPaymentMethod(m)}
                        />
                        <label className="form-check-label text-capitalize small" htmlFor={`pay-${m}`}>
                          {m === 'card' ? 'Credit / Debit Card' : m === 'upi' ? 'Instant UPI' : 'Pay At Front Desk'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Price Breakdown */}
                <div className="col-md-5">
                  <div className="bg-light p-3 rounded-3 border h-100 d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="fw-bold text-dark mb-3">Booking Summary</h6>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <img
                          src={room.images?.[0]}
                          alt={room.type}
                          className="rounded-2"
                          style={{ width: 80, height: 60, objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-bold text-dark">{room.type}</div>
                          <div className="text-secondary small">Room #{room.roomNumber}</div>
                        </div>
                      </div>

                      <div className="border-top pt-2">
                        <div className="d-flex justify-content-between small text-secondary mb-1">
                          <span>Rate per Night:</span>
                          <span className="fw-semibold text-dark">${room.pricePerNight}</span>
                        </div>
                        <div className="d-flex justify-content-between small text-secondary mb-1">
                          <span>Total Duration:</span>
                          <span className="fw-semibold text-dark">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                        </div>
                        <div className="d-flex justify-content-between small text-secondary mb-1">
                          <span>Room Subtotal:</span>
                          <span className="fw-semibold text-dark">${roomSubtotal}</span>
                        </div>
                        <div className="d-flex justify-content-between small text-secondary mb-2">
                          <span>Hospitality Tax & Fees (12%):</span>
                          <span className="fw-semibold text-dark">${taxAmount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-top pt-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-bold text-dark fs-6">Total Amount:</span>
                        <span className="price-tag text-primary fs-3">${totalPrice}</span>
                      </div>

                      {!isAuthenticated ? (
                        <button
                          type="button"
                          className="btn btn-warning w-100 fw-bold py-2 shadow-sm"
                          onClick={() => {
                            onClose();
                            onOpenAuthModal();
                          }}
                        >
                          <i className="bi bi-box-arrow-in-right me-1"></i> Sign In to Complete
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="btn btn-primary w-100 fw-bold py-2 shadow-sm"
                          disabled={loading || nights <= 0}
                        >
                          {loading ? (
                            <span><span className="spinner-border spinner-border-sm me-2"></span>Confirming...</span>
                          ) : (
                            <span><i className="bi bi-shield-lock-fill me-1"></i> Confirm & Pay ${totalPrice}</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
