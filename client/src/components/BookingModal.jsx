import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import RoomPhotosQRModal from './RoomPhotosQRModal';

const BookingModal = ({ room, show, onClose, onBookingSuccess, onOpenAuthModal }) => {
  const { user, isAuthenticated } = useAuth();
  const [showRoomPhotosQR, setShowRoomPhotosQR] = useState(false);

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
  const [paymentMethod, setPaymentMethod] = useState('upi'); // Default or selectable
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // UPI QR Code & Verification State
  const [upiConfig, setUpiConfig] = useState({
    upiId: 'hotelpro@icici',
    payeeName: 'HotelPro Hospitality Pvt Ltd',
    merchantCode: 'HOTELPRO',
    exchangeRateUsdToInr: 83,
  });
  const [upiUtr, setUpiUtr] = useState('');
  const [upiVerifying, setUpiVerifying] = useState(false);
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [upiVerifyError, setUpiVerifyError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Fetch UPI payment config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await API.get('/payments/config');
        if (res.data.success && res.data.config) {
          setUpiConfig(res.data.config);
        }
      } catch (err) {
        console.warn('Using default payment configuration:', err.message);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (user) {
      setGuestName(user.name || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || '');
    }
  }, [user]);

  // Reset UPI verification when amount or dates change
  useEffect(() => {
    setIsUpiVerified(false);
    setUpiVerifyError('');
  }, [checkInDate, checkOutDate]);

  if (!show || !room) return null;

  // Calculate nights
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = checkOut - checkIn;
  const nights = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
  const roomSubtotal = nights * room.pricePerNight;
  const taxAmount = Math.round(roomSubtotal * 0.12);
  const totalPrice = roomSubtotal + taxAmount;

  // Dynamic valid UPI URL standard (direct in Indian Rupees)
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiConfig.upiId)}&pn=${encodeURIComponent(upiConfig.payeeName)}&am=${totalPrice}&cu=INR&tn=${encodeURIComponent(`HotelPro Booking Room ${room.roomNumber}`)}`;

  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    setCheckInDate(newCheckIn);
    if (new Date(newCheckIn) >= new Date(checkOutDate)) {
      const nextDay = new Date(newCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiConfig.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // UPI UTR Verification
  const handleVerifyUpi = async () => {
    setUpiVerifyError('');
    if (!upiUtr || !/^\d{12}$/.test(upiUtr.trim())) {
      setUpiVerifyError('Please enter a valid 12-digit numeric UPI Reference Number (UTR).');
      return;
    }

    setUpiVerifying(true);
    try {
      const res = await API.post('/payments/verify-upi', {
        utr: upiUtr.trim(),
        amount: totalPrice,
      });

      if (res.data.success && res.data.verified) {
        setIsUpiVerified(true);
        setUpiVerifyError('');
      } else {
        setUpiVerifyError(res.data.message || 'Payment verification failed.');
      }
    } catch (err) {
      setIsUpiVerified(false);
      setUpiVerifyError(err.response?.data?.message || 'Verification failed. Please check the UTR and try again.');
    } finally {
      setUpiVerifying(false);
    }
  };

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

    // Strict verification rule: Do not show payment success unless payment is verified
    if (paymentMethod === 'upi' && !isUpiVerified) {
      setError('Please verify your UPI payment using the 12-digit UTR before confirming your reservation.');
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
        upiUtr: paymentMethod === 'upi' ? upiUtr.trim() : undefined,
        upiApp: paymentMethod === 'upi' ? 'UPI App (GPay/PhonePe/Paytm)' : undefined,
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

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
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
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              <div className="row g-4">
                {/* Left Column: Dates, Guest Info & Payment */}
                <div className="col-md-7 border-end-md">
                  {/* Step 1: Stay Dates - Downward spaced container */}
                  <div className="p-3 bg-light rounded-3 border mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold text-dark text-uppercase small letter-spacing mb-0">
                        <i className="bi bi-calendar3 me-1 text-primary"></i> 1. Select Stay Dates
                      </h6>
                      <span className="badge bg-secondary-subtle text-secondary small">
                        {nights} {nights === 1 ? 'Night' : 'Nights'}
                      </span>
                    </div>

                    <div className="row g-2">
                      <div className="col-sm-6">
                        <label className="form-label small text-secondary fw-semibold mb-1">Check-In Date</label>
                        <input
                          type="date"
                          className="form-control"
                          min={todayStr}
                          required
                          value={checkInDate}
                          onChange={handleCheckInChange}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small text-secondary fw-semibold mb-1">Check-Out Date</label>
                        <input
                          type="date"
                          className="form-control"
                          min={checkInDate || todayStr}
                          required
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Guest Information */}
                  <div className="p-3 bg-light rounded-3 border mb-3">
                    <h6 className="fw-bold text-dark text-uppercase small letter-spacing mb-2">
                      <i className="bi bi-person-lines-fill me-1 text-primary"></i> 2. Guest Information
                    </h6>
                    <div className="row g-2">
                      <div className="col-12">
                        <label className="form-label small text-secondary fw-semibold mb-1">Primary Guest Full Name</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          required
                          placeholder="John Doe"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small text-secondary fw-semibold mb-1">Email Address</label>
                        <input
                          type="email"
                          className="form-control form-control-sm"
                          required
                          placeholder="john@example.com"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small text-secondary fw-semibold mb-1">Contact Phone</label>
                        <input
                          type="tel"
                          className="form-control form-control-sm"
                          placeholder="+1 (555) 000-0000"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small text-secondary fw-semibold mb-1">Special Preferences / Requests</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows="2"
                          placeholder="Airport pickup, high floor, hypoallergenic bedding, late check-in..."
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Payment Method */}
                  <div className="p-3 bg-light rounded-3 border">
                    <h6 className="fw-bold text-dark text-uppercase small letter-spacing mb-2">
                      <i className="bi bi-credit-card-2-front me-1 text-primary"></i> 3. Payment Method
                    </h6>

                    {/* Radio Selectors for all methods */}
                    <div className="d-flex flex-wrap gap-3 mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id="pay-upi"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                        />
                        <label className="form-check-label small fw-semibold" htmlFor="pay-upi">
                          <i className="bi bi-qr-code-scan text-primary me-1"></i> UPI / QR Code
                        </label>
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id="pay-card"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                        />
                        <label className="form-check-label small fw-semibold" htmlFor="pay-card">
                          <i className="bi bi-credit-card me-1"></i> Credit / Debit Card
                        </label>
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id="pay-cash"
                          checked={paymentMethod === 'cash'}
                          onChange={() => setPaymentMethod('cash')}
                        />
                        <label className="form-check-label small fw-semibold" htmlFor="pay-cash">
                          <i className="bi bi-cash-stack me-1"></i> Pay at Front Desk
                        </label>
                      </div>
                    </div>

                    {/* QR CODE PAYMENT BOX (When UPI is selected) */}
                    {paymentMethod === 'upi' && (
                      <div className="payment-qr-box bg-white p-3 rounded-3 border mt-2 shadow-xs">
                        {/* Heading & Supported Apps */}
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-1 mb-3 pb-2 border-bottom">
                          <div>
                            <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                              <span className="badge bg-primary p-1 rounded-2">
                                <i className="bi bi-qr-code text-white"></i>
                              </span>
                              <span>Scan to Pay</span>
                            </h6>
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                              Scan using Google Pay, PhonePe, Paytm, or any UPI app
                            </small>
                          </div>
                          <div className="d-flex gap-1 align-items-center">
                            <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.7rem' }}>
                              Google Pay
                            </span>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.7rem' }}>
                              PhonePe
                            </span>
                            <span className="badge bg-info-subtle text-info border border-info-subtle" style={{ fontSize: '0.7rem' }}>
                              Paytm
                            </span>
                          </div>
                        </div>

                        {/* QR Code and Account Details Layout */}
                        <div className="row g-3 align-items-center mb-3">
                          <div className="col-sm-5 text-center">
                            <div className="p-2 border rounded-3 bg-light d-inline-block shadow-xs">
                              <QRCodeSVG
                                value={upiUri}
                                size={135}
                                level="M"
                                includeMargin={true}
                              />
                            </div>
                            <div className="badge bg-light text-dark border mt-1" style={{ fontSize: '0.7rem' }}>
                              <i className="bi bi-shield-check text-success me-1"></i> Verified Account
                            </div>
                          </div>

                          <div className="col-sm-7">
                            <div className="p-2 bg-light rounded-2 border mb-2 small" style={{ fontSize: '0.8rem' }}>
                              <div className="d-flex justify-content-between mb-1">
                                <span className="text-secondary">Payee:</span>
                                <strong className="text-dark">{upiConfig.payeeName}</strong>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="text-secondary">UPI ID:</span>
                                <div className="d-flex align-items-center gap-1">
                                  <span className="badge bg-dark font-monospace">{upiConfig.upiId}</span>
                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-xs py-0 px-1"
                                    onClick={handleCopyUpi}
                                    title="Copy UPI ID"
                                  >
                                    <i className={`bi ${copiedUpi ? 'bi-check text-success' : 'bi-clipboard'}`}></i>
                                  </button>
                                </div>
                              </div>
                              <div className="d-flex justify-content-between">
                                <span className="text-secondary">Total Amount:</span>
                                <strong className="text-primary">₹{totalPrice.toLocaleString('en-IN')}</strong>
                              </div>
                            </div>

                            <div className="small text-secondary">
                              <strong className="text-dark d-block mb-1" style={{ fontSize: '0.75rem' }}>
                                Simple Instructions:
                              </strong>
                              <ol className="ps-3 mb-0 text-muted" style={{ fontSize: '0.72rem', lineHeight: '1.4' }}>
                                <li>Scan this QR code using your UPI app.</li>
                                <li>Complete the payment of <strong>₹{totalPrice.toLocaleString('en-IN')}</strong>.</li>
                                <li>Enter the <strong>12-digit UPI UTR</strong> from your receipt below.</li>
                                <li>Click <strong>Verify Payment</strong> to validate and confirm.</li>
                              </ol>
                            </div>
                          </div>
                        </div>

                        {/* UTR Verification Field */}
                        <div className="pt-2 border-top">
                          <label className="form-label small fw-bold text-dark mb-1 d-flex justify-content-between align-items-center">
                            <span>12-Digit UPI Reference Number (UTR):</span>
                            <span className="text-muted fw-normal" style={{ fontSize: '0.72rem' }}>Found in your UPI app receipt</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light">
                              <i className="bi bi-hash"></i>
                            </span>
                            <input
                              type="text"
                              maxLength="12"
                              className={`form-control form-control-sm ${isUpiVerified ? 'is-valid' : ''}`}
                              placeholder="e.g. 428910293847"
                              value={upiUtr}
                              onChange={(e) => {
                                setUpiUtr(e.target.value.replace(/\D/g, ''));
                                setIsUpiVerified(false);
                                setUpiVerifyError('');
                              }}
                            />
                            <button
                              type="button"
                              className={`btn btn-sm ${isUpiVerified ? 'btn-success' : 'btn-primary'} fw-bold px-3`}
                              onClick={handleVerifyUpi}
                              disabled={upiVerifying || upiUtr.length !== 12 || isUpiVerified}
                            >
                              {upiVerifying ? (
                                <span><span className="spinner-border spinner-border-sm me-1"></span>Verifying...</span>
                              ) : isUpiVerified ? (
                                <span><i className="bi bi-check-lg me-1"></i> Verified</span>
                              ) : (
                                'Verify Payment'
                              )}
                            </button>
                          </div>

                          {isUpiVerified && (
                            <div className="alert alert-success py-1 px-2 mt-2 mb-0 small d-flex align-items-center gap-1">
                              <i className="bi bi-check-circle-fill"></i>
                              <span><strong>UPI Payment Verified!</strong> Reference #{upiUtr} confirmed with bank gateway.</span>
                            </div>
                          )}

                          {upiVerifyError && (
                            <div className="alert alert-danger py-1 px-2 mt-2 mb-0 small d-flex align-items-center gap-1">
                              <i className="bi bi-exclamation-circle-fill"></i>
                              <span>{upiVerifyError}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CARD OPTION PREVIEW */}
                    {paymentMethod === 'card' && (
                      <div className="bg-white p-3 rounded-2 border mt-2 small text-muted">
                        <div className="d-flex align-items-center gap-2 mb-2 text-dark fw-semibold">
                          <i className="bi bi-credit-card text-primary"></i> Credit / Debit Card Processing
                        </div>
                        <p className="mb-0 small">
                          Processed securely via PCI-DSS compliant payment gateway. Instant authorization upon confirmation.
                        </p>
                      </div>
                    )}

                    {/* CASH OPTION PREVIEW */}
                    {paymentMethod === 'cash' && (
                      <div className="bg-white p-3 rounded-2 border mt-2 small text-muted">
                        <div className="d-flex align-items-center gap-2 mb-2 text-dark fw-semibold">
                          <i className="bi bi-wallet2 text-success"></i> Pay at Front Desk Reception
                        </div>
                        <p className="mb-0 small">
                          Payment will be collected during check-in. Booking status will be held as confirmed.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Price Breakdown & CTA */}
                <div className="col-md-5">
                  <div className="bg-light p-3 rounded-3 border h-100 d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="fw-bold text-dark mb-3">Booking Summary</h6>
                      <div
                        className="d-flex align-items-center gap-3 mb-3 p-2 bg-white rounded-3 border"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setShowRoomPhotosQR(true)}
                        title="Click to view all room photos & QR code"
                      >
                        <div className="position-relative">
                          <img
                            src={room.images?.[0]}
                            alt={room.type}
                            className="rounded-2"
                            style={{ width: 80, height: 60, objectFit: 'cover' }}
                          />
                          {room.images?.length > 1 && (
                            <span
                              className="badge bg-dark bg-opacity-75 text-white position-absolute bottom-0 end-0 m-1"
                              style={{ fontSize: '0.6rem' }}
                            >
                              <i className="bi bi-images me-1 text-warning"></i>
                              {room.images.length}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{room.type}</div>
                          <div className="text-secondary small">Room #{room.roomNumber}</div>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.68rem' }}>
                            <i className="bi bi-qr-code me-1"></i> View Photos & QR
                          </span>
                        </div>
                      </div>

                      <div className="border-top pt-2">
                        <div className="d-flex justify-content-between small text-secondary mb-1">
                          <span>Rate per Night:</span>
                          <span className="fw-semibold text-dark">₹{room.pricePerNight?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="d-flex justify-content-between small text-secondary mb-1">
                          <span>Total Duration:</span>
                          <span className="fw-semibold text-dark">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                        </div>
                        <div className="d-flex justify-content-between small text-secondary mb-1">
                          <span>Room Subtotal:</span>
                          <span className="fw-semibold text-dark">₹{roomSubtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="d-flex justify-content-between small text-secondary mb-2">
                          <span>Hospitality Tax & Fees (12%):</span>
                          <span className="fw-semibold text-dark">₹{taxAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-top pt-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-bold text-dark fs-6">Total Amount:</span>
                        <span className="price-tag text-primary fs-3">₹{totalPrice.toLocaleString('en-IN')}</span>
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
                          className={`btn w-100 fw-bold py-2 shadow-sm ${paymentMethod === 'upi' && !isUpiVerified ? 'btn-secondary disabled' : 'btn-primary'}`}
                          disabled={loading || nights <= 0 || (paymentMethod === 'upi' && !isUpiVerified)}
                        >
                          {loading ? (
                            <span><span className="spinner-border spinner-border-sm me-2"></span>Confirming...</span>
                          ) : paymentMethod === 'upi' && !isUpiVerified ? (
                            <span><i className="bi bi-qr-code me-1"></i> Verify UPI Payment to Book</span>
                          ) : (
                            <span><i className="bi bi-shield-lock-fill me-1"></i> Confirm & Pay ₹{totalPrice.toLocaleString('en-IN')}</span>
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

      {/* Room Photos & QR Code Viewer from Booking Modal */}
      <RoomPhotosQRModal
        room={room}
        show={showRoomPhotosQR}
        initialTab="photos"
        onClose={() => setShowRoomPhotosQR(false)}
        onBookNow={() => setShowRoomPhotosQR(false)}
      />
    </div>
  );
};

export default BookingModal;
