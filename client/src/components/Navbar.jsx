import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ activeView, setActiveView, onOpenAuthModal }) => {
  const { user, isAuthenticated, isAdmin, isStaff, logout, quickLogin } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3 sticky-top shadow-sm" style={{ backgroundColor: '#0f172a' }}>
      <div className="container">
        <a
          className="navbar-brand d-flex align-items-center gap-2 cursor-pointer"
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('home');
          }}
        >
          <span className="bg-primary text-white p-2 rounded-3 d-inline-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
            <i className="bi bi-buildings-fill fs-5"></i>
          </span>
          <div className="d-flex flex-column">
            <span className="navbar-brand-text fs-4 lh-1">Hotel<span className="text-warning">Pro</span></span>
            <span className="brand-badge mt-1 align-self-start">Hospitality Cloud</span>
          </div>
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#hotelNavbar"
          aria-controls="hotelNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="hotelNavbar">
          <ul className="navbar-nav me-auto ms-lg-4 mb-2 mb-lg-0 gap-1">
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-decoration-none px-3 py-2 rounded-2 ${activeView === 'home' ? 'text-white bg-secondary bg-opacity-25 fw-semibold' : 'text-light text-opacity-75'}`}
                onClick={() => setActiveView('home')}
              >
                <i className="bi bi-door-open me-1"></i> Rooms & Suites
              </button>
            </li>

            {isAuthenticated && (
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link text-decoration-none px-3 py-2 rounded-2 ${activeView === 'my-bookings' ? 'text-white bg-secondary bg-opacity-25 fw-semibold' : 'text-light text-opacity-75'}`}
                  onClick={() => setActiveView('my-bookings')}
                >
                  <i className="bi bi-calendar-check me-1"></i> My Bookings
                </button>
              </li>
            )}

            {isStaff && (
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link text-decoration-none px-3 py-2 rounded-2 ${activeView === 'front-desk' ? 'text-white bg-secondary bg-opacity-25 fw-semibold' : 'text-light text-opacity-75'}`}
                  onClick={() => setActiveView('front-desk')}
                >
                  <i className="bi bi-person-badge me-1"></i> Front Desk Ops
                </button>
              </li>
            )}

            {isAdmin && (
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link text-decoration-none px-3 py-2 rounded-2 ${activeView === 'admin-dashboard' ? 'text-white bg-secondary bg-opacity-25 fw-semibold' : 'text-light text-opacity-75'}`}
                  onClick={() => setActiveView('admin-dashboard')}
                >
                  <i className="bi bi-speedometer2 me-1"></i> Executive Dashboard
                </button>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {/* Quick Demo Switcher */}
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary btn-sm dropdown-toggle text-light"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Demo Profiles
              </button>
              <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow">
                <li><h6 className="dropdown-header text-uppercase text-secondary">Switch Role Instantly</h6></li>
                <li>
                  <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => quickLogin('admin')}>
                    <span className="badge bg-danger">Admin</span> Alexander (Manager)
                  </button>
                </li>
                <li>
                  <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => quickLogin('staff')}>
                    <span className="badge bg-info text-dark">Staff</span> Elena (Front Desk)
                  </button>
                </li>
                <li>
                  <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => quickLogin('guest')}>
                    <span className="badge bg-success">Guest</span> Michael Sterling
                  </button>
                </li>
              </ul>
            </div>

            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2 ms-2">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={user.name}
                  className="rounded-circle border border-warning"
                  style={{ width: 36, height: 36, objectFit: 'cover' }}
                />
                <div className="d-none d-xl-block text-start text-white">
                  <div className="fw-semibold small">{user.name}</div>
                  <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                    <span className={`badge ${user.role === 'admin' ? 'bg-danger' : user.role === 'staff' ? 'bg-info text-dark' : 'bg-primary'}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-outline-danger btn-sm ms-2"
                  onClick={logout}
                  title="Sign out"
                >
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-sm px-3 fw-semibold shadow-sm"
                onClick={onOpenAuthModal}
              >
                <i className="bi bi-person-fill me-1"></i> Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

