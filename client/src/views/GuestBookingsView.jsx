import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const GuestBookingsView = ({ onOpenInvoice, onExploreRooms }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await API.get('/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load guest bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you wish to cancel this reservation? A refund will be initiated.')) {
      return;
    }

    setCancelLoadingId(bookingId);
    try {
      const res = await API.put(`/bookings/${bookingId}/cancel`);
      if (res.data.success) {
        setMessage('Reservation cancelled and refund processed.');
        fetchMyBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="status-pill status-confirmed"><i className="bi bi-clock-history"></i> Confirmed</span>;
      case 'checked-in':
        return <span className="status-pill status-checked-in"><i className="bi bi-check-circle-fill"></i> Currently In-House</span>;
      case 'checked-out':
        return <span className="status-pill status-checked-out"><i className="bi bi-door-closed"></i> Stay Completed</span>;
      case 'cancelled':
        return <span className="status-pill status-cancelled"><i className="bi bi-x-circle-fill"></i> Cancelled & Refunded</span>;
      default:
        return <span className="status-pill bg-light text-dark">{status}</span>;
    }
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-2 py-1 mb-1">Guest Portal</span>
          <h2 className="font-heading fw-bold mb-0">My Hotel Stays & Reservations</h2>
          <p className="text-muted small mb-0">Manage upcoming itineraries, download VAT/tax invoices, and check stay details.</p>
        </div>

        <button className="btn btn-outline-primary fw-semibold" onClick={onExploreRooms}>
          <i className="bi bi-plus-circle me-1"></i> Book Another Room
        </button>
      </div>

      {message && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted mt-2 small">Loading your reservations...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border shadow-sm">
          <i className="bi bi-calendar-x display-3 text-muted mb-3 d-block"></i>
          <h4 className="fw-bold mb-2">No active reservations found</h4>
          <p className="text-muted small mb-4">You have not booked any rooms with HotelPro yet.</p>
          <button className="btn btn-primary fw-bold px-4" onClick={onExploreRooms}>
            Explore Rooms & Book Now
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {bookings.map((booking) => (
            <div key={booking._id} className="card border rounded-3 shadow-sm overflow-hidden bg-white">
              <div className="card-body p-4">
                <div className="row g-4 align-items-center">
                  {/* Room Thumbnail & Info */}
                  <div className="col-lg-4">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={booking.room?.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80'}
                        alt={booking.room?.type}
                        className="rounded-3 shadow-sm"
                        style={{ width: 110, height: 85, objectFit: 'cover' }}
                      />
                      <div>
                        <span className="badge bg-dark mb-1">Room #{booking.room?.roomNumber}</span>
                        <h5 className="fw-bold mb-1 text-dark">{booking.room?.type}</h5>
                        <div className="text-muted small">Ref: <strong className="text-dark">{booking.bookingNumber}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Dates & Duration */}
                  <div className="col-sm-6 col-lg-3">
                    <div className="small text-secondary mb-1">
                      <i className="bi bi-calendar3 text-primary me-1"></i> Stay Period:
                    </div>
                    <div className="fw-bold text-dark small">{formatDate(booking.checkInDate)}</div>
                    <div className="text-muted small">to {formatDate(booking.checkOutDate)}</div>
                    <div className="badge bg-light text-secondary border mt-1">
                      {booking.totalNights} Night(s) • {booking.totalGuests} Guest(s)
                    </div>
                  </div>

                  {/* Pricing & Status */}
                  <div className="col-sm-6 col-lg-2">
                    <div className="small text-secondary mb-1">Total Paid:</div>
                    <div className="price-tag text-primary fs-4">${booking.totalPrice}</div>
                    <div className="mt-1">{getStatusBadge(booking.bookingStatus)}</div>
                  </div>

                  {/* Actions */}
                  <div className="col-lg-3 text-lg-end d-flex flex-wrap flex-lg-column gap-2 justify-content-end">
                    <button
                      className="btn btn-outline-dark btn-sm fw-semibold"
                      onClick={() => onOpenInvoice(booking)}
                    >
                      <i className="bi bi-file-earmark-text me-1 text-primary"></i> View Tax Invoice
                    </button>

                    {booking.bookingStatus === 'confirmed' && (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleCancel(booking._id)}
                        disabled={cancelLoadingId === booking._id}
                      >
                        {cancelLoadingId === booking._id ? (
                          <span><span className="spinner-border spinner-border-sm me-1"></span>Cancelling...</span>
                        ) : (
                          <span><i className="bi bi-x-circle me-1"></i> Cancel Booking</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestBookingsView;

