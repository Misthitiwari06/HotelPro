import React, { useState, useEffect } from 'react';
import API from '../services/api';
import RoomManageModal from '../components/RoomManageModal';

const AdminDashboardView = () => {
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'rooms', 'guests'
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, roomsRes, guestsRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/rooms'),
        API.get('/guests'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (roomsRes.data.success) setRooms(roomsRes.data.rooms);
      if (guestsRes.data.success) setGuests(guestsRes.data.guests);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Are you sure you want to permanently delete Room #${roomNumber}?`)) {
      return;
    }

    try {
      const res = await API.delete(`/rooms/${roomId}`);
      if (res.data.success) {
        setFeedbackMessage(`Room #${roomNumber} deleted successfully.`);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="status-pill status-available">Available</span>;
      case 'occupied':
        return <span className="status-pill status-occupied">Occupied</span>;
      case 'maintenance':
        return <span className="status-pill status-maintenance">Maintenance</span>;
      case 'cleaning':
        return <span className="status-pill status-cleaning">Cleaning</span>;
      default:
        return <span className="status-pill bg-light text-dark">{status}</span>;
    }
  };

  return (
    <div className="container-fluid px-lg-5 py-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <span className="badge bg-danger text-uppercase px-2 py-1 mb-1">Administrator Control</span>
          <h2 className="font-heading fw-bold mb-0">Executive Hotel Performance Dashboard</h2>
          <p className="text-muted small mb-0">Real-time room occupancy, revenue analytics, guest registries, and inventory management.</p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary fw-bold shadow-sm"
            onClick={() => {
              setEditingRoom(null);
              setShowRoomModal(true);
            }}
          >
            <i className="bi bi-plus-lg me-1"></i> Add New Room
          </button>
          <button className="btn btn-outline-secondary" onClick={fetchDashboardData} title="Refresh Dashboard">
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="alert alert-success alert-dismissible fade show py-2" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {feedbackMessage}
          <button type="button" className="btn-close" onClick={() => setFeedbackMessage('')}></button>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Total Revenue</span>
              <div className="stat-icon-wrapper bg-success-subtle text-success">
                <i className="bi bi-currency-dollar"></i>
              </div>
            </div>
            <div className="fs-2 fw-bold text-dark font-heading">
              ${stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : 0}
            </div>
            <div className="text-muted small mt-1">
              <i className="bi bi-arrow-up-right text-success me-1"></i> From {stats?.totalBookings || 0} reservations
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Occupancy Rate</span>
              <div className="stat-icon-wrapper bg-primary-subtle text-primary">
                <i className="bi bi-pie-chart-fill"></i>
              </div>
            </div>
            <div className="fs-2 fw-bold text-dark font-heading">{stats?.occupancyRate || 0}%</div>
            <div className="text-muted small mt-1">
              {stats?.occupiedRooms || 0} of {stats?.totalRooms || 0} rooms currently occupied
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">In-House Stays</span>
              <div className="stat-icon-wrapper bg-info-subtle text-info">
                <i className="bi bi-person-check-fill"></i>
              </div>
            </div>
            <div className="fs-2 fw-bold text-dark font-heading">{stats?.activeStays || 0}</div>
            <div className="text-muted small mt-1">
              Checked-in guests currently on property
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Total Rooms</span>
              <div className="stat-icon-wrapper bg-warning-subtle text-warning">
                <i className="bi bi-buildings"></i>
              </div>
            </div>
            <div className="fs-2 fw-bold text-dark font-heading">{stats?.totalRooms || 0}</div>
            <div className="text-muted small mt-1">
              {stats?.availableRooms || 0} Available • {stats?.cleaningRooms || 0} Cleaning
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4 border-bottom">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'overview' ? 'active text-primary border-primary border-bottom-0' : 'text-secondary'}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-speedometer2 me-1"></i> Operations Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'rooms' ? 'active text-primary border-primary border-bottom-0' : 'text-secondary'}`}
            onClick={() => setActiveTab('rooms')}
          >
            <i className="bi bi-door-closed me-1"></i> Room Inventory ({rooms.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'guests' ? 'active text-primary border-primary border-bottom-0' : 'text-secondary'}`}
            onClick={() => setActiveTab('guests')}
          >
            <i className="bi bi-people me-1"></i> Registered Guests ({guests.length})
          </button>
        </li>
      </ul>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card border rounded-3 shadow-sm p-4 bg-white h-100">
              <h5 className="fw-bold text-dark mb-3">Room Status Distribution</h5>
              <div className="d-flex flex-column gap-3">
                <div>
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    <span>Available ({stats?.availableRooms || 0})</span>
                    <span>{stats?.totalRooms ? Math.round((stats.availableRooms / stats.totalRooms) * 100) : 0}%</span>
                  </div>
                  <div className="progress" style={{ height: 10 }}>
                    <div
                      className="progress-bar bg-success"
                      style={{ width: `${stats?.totalRooms ? (stats.availableRooms / stats.totalRooms) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    <span>Occupied ({stats?.occupiedRooms || 0})</span>
                    <span>{stats?.totalRooms ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0}%</span>
                  </div>
                  <div className="progress" style={{ height: 10 }}>
                    <div
                      className="progress-bar bg-danger"
                      style={{ width: `${stats?.totalRooms ? (stats.occupiedRooms / stats.totalRooms) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    <span>Needs Cleaning ({stats?.cleaningRooms || 0})</span>
                    <span>{stats?.totalRooms ? Math.round((stats.cleaningRooms / stats.totalRooms) * 100) : 0}%</span>
                  </div>
                  <div className="progress" style={{ height: 10 }}>
                    <div
                      className="progress-bar bg-info"
                      style={{ width: `${stats?.totalRooms ? (stats.cleaningRooms / stats.totalRooms) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    <span>Maintenance ({stats?.maintenanceRooms || 0})</span>
                    <span>{stats?.totalRooms ? Math.round((stats.maintenanceRooms / stats.totalRooms) * 100) : 0}%</span>
                  </div>
                  <div className="progress" style={{ height: 10 }}>
                    <div
                      className="progress-bar bg-warning"
                      style={{ width: `${stats?.totalRooms ? (stats.maintenanceRooms / stats.totalRooms) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card border rounded-3 shadow-sm p-4 bg-white h-100">
              <h5 className="fw-bold text-dark mb-3">Quick System Actions</h5>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-primary py-2 text-start d-flex align-items-center justify-content-between"
                  onClick={() => {
                    setEditingRoom(null);
                    setShowRoomModal(true);
                  }}
                >
                  <span><i className="bi bi-plus-circle me-2"></i> Add New Inventory Room</span>
                  <i className="bi bi-chevron-right"></i>
                </button>
                <button
                  className="btn btn-outline-dark py-2 text-start d-flex align-items-center justify-content-between"
                  onClick={() => setActiveTab('rooms')}
                >
                  <span><i className="bi bi-sliders me-2"></i> Manage Nightly Room Rates & Amenities</span>
                  <i className="bi bi-chevron-right"></i>
                </button>
                <button
                  className="btn btn-outline-dark py-2 text-start d-flex align-items-center justify-content-between"
                  onClick={() => setActiveTab('guests')}
                >
                  <span><i className="bi bi-people me-2"></i> Review Guest Spend Analytics</span>
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROOM INVENTORY CRUD */}
      {activeTab === 'rooms' && (
        <div className="card border rounded-3 shadow-sm bg-white overflow-hidden">
          <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
            <h6 className="fw-bold mb-0">All Hotel Rooms ({rooms.length})</h6>
            <button
              className="btn btn-primary btn-sm fw-semibold"
              onClick={() => {
                setEditingRoom(null);
                setShowRoomModal(true);
              }}
            >
              <i className="bi bi-plus-lg me-1"></i> Add Room
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Room #</th>
                  <th>Preview</th>
                  <th>Category</th>
                  <th>Nightly Rate</th>
                  <th>Capacity</th>
                  <th>Floor</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room._id}>
                    <td className="ps-4 fw-bold">#{room.roomNumber}</td>
                    <td>
                      <img
                        src={room.images?.[0]}
                        alt={room.type}
                        className="rounded-2"
                        style={{ width: 60, height: 45, objectFit: 'cover' }}
                      />
                    </td>
                    <td className="fw-semibold">{room.type}</td>
                    <td className="fw-bold text-primary">${room.pricePerNight}</td>
                    <td>{room.capacity} Guests</td>
                    <td>Floor {room.floor}</td>
                    <td>{getStatusBadge(room.status)}</td>
                    <td className="text-end pe-4">
                      <div className="btn-group">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => {
                            setEditingRoom(room);
                            setShowRoomModal(true);
                          }}
                          title="Edit Room"
                        >
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteRoom(room._id, room.roomNumber)}
                          title="Delete Room"
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REGISTERED GUESTS */}
      {activeTab === 'guests' && (
        <div className="card border rounded-3 shadow-sm bg-white overflow-hidden">
          <div className="card-header bg-white p-3 border-bottom">
            <h6 className="fw-bold mb-0">Registered Guest Profiles ({guests.length})</h6>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Guest</th>
                  <th>Contact Info</th>
                  <th>Total Reservations</th>
                  <th>Lifetime Spend</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr key={guest._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={guest.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                          alt={guest.name}
                          className="rounded-circle"
                          style={{ width: 40, height: 40, objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-bold text-dark">{guest.name}</div>
                          {guest.address && <div className="text-muted small">{guest.address}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="small fw-semibold">{guest.email}</div>
                      <div className="text-muted small">{guest.phone || 'No phone provided'}</div>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary fw-bold">
                        {guest.totalBookings || 0} Stays
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-success fs-6">
                        ${guest.totalSpent ? guest.totalSpent.toLocaleString() : 0}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {new Date(guest.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Room Modal */}
      <RoomManageModal
        show={showRoomModal}
        editingRoom={editingRoom}
        onClose={() => setShowRoomModal(false)}
        onSaveSuccess={() => {
          setFeedbackMessage('Room saved successfully.');
          fetchDashboardData();
        }}
      />
    </div>
  );
};

export default AdminDashboardView;
