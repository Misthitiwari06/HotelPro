import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ show, onClose }) => {
  const { login, register, quickLogin } = useAuth();
  const [isRegisterTab, setIsRegisterTab] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('guest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegisterTab) {
      const res = await register({ name, email, password, role, phone });
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.message);
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.message);
      }
    }
  };

  const handleDemoFill = async (roleName) => {
    setLoading(true);
    const res = await quickLogin(roleName);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-dark text-white p-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="bg-primary text-white p-1 rounded-2 d-inline-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}>
                  <i className="bi bi-buildings-fill fs-6"></i>
                </span>
                <span className="font-heading fw-bold fs-5">Hotel<span className="text-warning">Pro</span></span>
              </div>
              <p className="text-muted small mb-0">Secure Hospitality Portal Authentication</p>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* Quick Demo Fill Buttons */}
            <div className="mb-4 bg-light p-3 rounded-3 border">
              <div className="small fw-bold text-secondary text-uppercase mb-2 text-center" style={{ fontSize: '0.72rem' }}>
                ⚡ Quick 1-Click Demo Profiles
              </div>
              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-between"
                  onClick={() => handleDemoFill('admin')}
                  disabled={loading}
                >
                  <span><i className="bi bi-shield-lock-fill me-1"></i> Admin (Alexander)</span>
                  <span className="badge bg-danger">Full Control</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline-info text-dark btn-sm d-flex align-items-center justify-content-between"
                  onClick={() => handleDemoFill('staff')}
                  disabled={loading}
                >
                  <span><i className="bi bi-person-badge-fill me-1"></i> Front Desk Staff (Elena)</span>
                  <span className="badge bg-info text-dark">Check-in / Out</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-between"
                  onClick={() => handleDemoFill('guest')}
                  disabled={loading}
                >
                  <span><i className="bi bi-person-fill me-1"></i> Guest / Customer (Michael)</span>
                  <span className="badge bg-primary">Reservations</span>
                </button>
              </div>
            </div>

            <div className="text-center text-muted small mb-3 position-relative">
              <hr className="my-0" />
              <span className="bg-white px-2 position-relative" style={{ top: '-10px' }}>or sign in manually</span>
            </div>

            {/* Tab switch */}
            <ul className="nav nav-pills nav-fill mb-3 bg-light p-1 rounded-3">
              <li className="nav-item">
                <button
                  className={`nav-link py-2 small fw-bold ${!isRegisterTab ? 'active bg-primary' : 'text-secondary'}`}
                  onClick={() => setIsRegisterTab(false)}
                >
                  Sign In
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link py-2 small fw-bold ${isRegisterTab ? 'active bg-primary' : 'text-secondary'}`}
                  onClick={() => setIsRegisterTab(true)}
                >
                  Create Account
                </button>
              </li>
            </ul>

            {error && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-circle-fill"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {isRegisterTab && (
                <>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rachel Adams"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+1 (555) 234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Role</label>
                    <select
                      className="form-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="guest">Guest / Customer</option>
                      <option value="staff">Hotel Staff / Receptionist</option>
                      <option value="admin">Administrator / Manager</option>
                    </select>
                  </div>
                </>
              )}

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@hotelpro.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 fw-bold py-2 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <span><span className="spinner-border spinner-border-sm me-2"></span>Processing...</span>
                ) : isRegisterTab ? (
                  'Create My Account'
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
