import React, { useState, useEffect } from 'react';
import API from '../services/api';
import RoomPhotosQRModal from '../components/RoomPhotosQRModal';

const FrontDeskView = ({ onOpenInvoice }) => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'rooms'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedRoomForQR, setSelectedRoomForQR] = useState(null);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        API.get('/rooms'),
        API.get('/bookings'),
      ]);
      if (roomsRes.data.success) setRooms(roomsRes.data.rooms);
      if (bookingsRes.data.success) setBookings(bookingsRes.data.bookings);
    } catch (err) {
      console.error('Error fetching front desk data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setActionLoadingId(bookingId);
    try {
      const res = await API.put(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.data.success) {
        setMessage(`Booking status updated to ${newStatus}. Room state updated.`);
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoomStatusChange = async (roomId, newStatus) => {
    try {
      const res = await API.put(`/rooms/${roomId}`, { status: newStatus });
      if (res.data.success) {
        setMessage(`Room status updated to ${newStatus}.`);
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change room status');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'All' || b.bookingStatus === statusFilter;
    const matchesSearch =
      !searchQuery ||
      b.bookingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.room?.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="status-pill status-confirmed">Confirmed</span>;
      case 'checked-in':
        return <span className="status-pill status-checked-in"><i className="bi bi-person-check-fill"></i> Checked-In</span>;
      case 'checked-out':
        return <span className="status-pill status-checked-out"><i className="bi bi-door-closed"></i> Checked-Out</span>;
      case 'cancelled':
        return <span className="status-pill status-cancelled">Cancelled</span>;
      default:
        return <span className="status-pill bg-light text-dark">{status}</span>;
    }
  };

  return (
    <div className="container-fluid px-lg-5 py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <span className="badge bg-info text-dark text-uppercase px-2 py-1 mb-1">Reception & Operations</span>
          <h2 className="font-heading fw-bold mb-0">Front Desk Stay Management</h2>
          <p className="text-muted small mb-0">Live check-in, express checkout, room status toggles, and arrivals dispatch.</p>
        </div>

        {/* Tab switcher */}
        <div className="btn-group shadow-sm">
          <button
            className={`btn fw-semibold ${activeTab === 'bookings' ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="bi bi-calendar-check me-1"></i> Reservations ({bookings.length})
          </button>
          <button
            className={`btn fw-semibold ${activeTab === 'rooms' ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setActiveTab('rooms')}
          >
            <i className="bi bi-grid-3x3-gap me-1"></i> Room Board ({rooms.length})
          </button>
        </div>
      </div>

      {message && (
        <div className="alert alert-success alert-dismissible fade show py-2" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      {/* VIEW: BOOKINGS & ARRIVALS */}
      {activeTab === 'bookings' && (
        <div className="card border rounded-3 shadow-sm bg-white">
          <div className="card-header bg-white p-3 border-bottom">
            <div className="row g-3 align-items-center">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by guest name, room #, or booking ref..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="d-flex gap-1">
                  {['All', 'confirmed', 'checked-in', 'checked-out'].map((st) => (
                    <button
                      key={st}
                      className={`btn btn-sm text-capitalize ${statusFilter === st ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setStatusFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-md-3 text-md-end">
                <button className="btn btn-outline-secondary btn-sm" onClick={loadData}>
                  <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-2 small">Loading reservations...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-0">No bookings match your current filter.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Reference</th>
                      <th>Guest Details</th>
                      <th>Room</th>
                      <th>Stay Schedule</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Front Desk Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={b._id}>
                        <td className="ps-4">
                          <span className="fw-bold text-dark">{b.bookingNumber}</span>
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                            {new Date(b.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{b.guestName}</div>
                          <div className="text-muted small">{b.guestEmail}</div>
                          {b.guestPhone && <div className="text-muted small">{b.guestPhone}</div>}
                        </td>
                        <td>
                          <span className="badge bg-dark mb-1">Room #{b.room?.roomNumber}</span>
                          <div className="small text-secondary">{b.room?.type}</div>
                        </td>
                        <td>
                          <div className="small fw-semibold">
                            {new Date(b.checkInDate).toLocaleDateString()} → {new Date(b.checkOutDate).toLocaleDateString()}
                          </div>
                          <div className="text-muted small">{b.totalNights} Nights • {b.totalGuests} Guests</div>
                        </td>
                        <td>
                          <div className="fw-bold text-primary">₹{b.totalPrice?.toLocaleString('en-IN')}</div>
                          <span className="badge bg-success-subtle text-success small">{b.paymentStatus}</span>
                        </td>
                        <td>{getStatusBadge(b.bookingStatus)}</td>
                        <td className="text-end pe-4">
                          <div className="btn-group">
                            {b.bookingStatus === 'confirmed' && (
                              <button
                                className="btn btn-success btn-sm fw-bold px-3"
                                onClick={() => handleStatusUpdate(b._id, 'checked-in')}
                                disabled={actionLoadingId === b._id}
                              >
                                <i className="bi bi-box-arrow-in-right me-1"></i> Check In
                              </button>
                            )}

                            {b.bookingStatus === 'checked-in' && (
                              <button
                                className="btn btn-warning btn-sm fw-bold px-3 text-dark"
                                onClick={() => handleStatusUpdate(b._id, 'checked-out')}
                                disabled={actionLoadingId === b._id}
                              >
                                <i className="bi bi-box-arrow-left me-1"></i> Check Out
                              </button>
                            )}

                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => onOpenInvoice(b)}
                              title="Print Invoice"
                            >
                              <i className="bi bi-printer"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: LIVE ROOM BOARD & STATUS TOGGLES */}
      {activeTab === 'rooms' && (
        <div className="row g-3">
          {rooms.map((room) => (
            <div className="col-sm-6 col-md-4 col-xl-3" key={room._id}>
              <div className="card h-100 border shadow-sm rounded-3 overflow-hidden">
                <div className="position-relative">
                  <img
                    src={room.images?.[0]}
                    alt={room.type}
                    style={{ height: 140, width: '100%', objectFit: 'cover' }}
                  />
                  <span className="badge bg-dark position-absolute top-0 start-0 m-2">
                    Room #{room.roomNumber}
                  </span>
                  <span className="badge bg-light text-dark position-absolute top-0 end-0 m-2 border">
                    Floor {room.floor}
                  </span>
                </div>

                <div className="card-body p-3">
                  <h6 className="fw-bold text-dark mb-1">{room.type}</h6>
                  <div className="text-muted small mb-3">₹{room.pricePerNight?.toLocaleString('en-IN')} / night • {room.capacity} Guests</div>

                  <label className="form-label small text-secondary fw-semibold mb-1">Room Status:</label>
                  <select
                    className="form-select form-select-sm mb-2"
                    value={room.status}
                    onChange={(e) => handleRoomStatusChange(room._id, e.target.value)}
                  >
                    <option value="available">🟢 Available</option>
                    <option value="occupied">🔴 Occupied</option>
                    <option value="cleaning">🔵 Needs Cleaning</option>
                    <option value="maintenance">🟡 Maintenance</option>
                  </select>

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                    onClick={() => setSelectedRoomForQR(room)}
                  >
                    <i className="bi bi-qr-code"></i>
                    <span>Room Photos QR</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Room Photos & QR Code Modal */}
      <RoomPhotosQRModal
        room={selectedRoomForQR}
        show={Boolean(selectedRoomForQR)}
        initialTab="qr"
        onClose={() => setSelectedRoomForQR(null)}
        onBookNow={() => setSelectedRoomForQR(null)}
      />
    </div>
  );
};

export default FrontDeskView;

