import React from 'react';

const InvoiceModal = ({ booking, show, onClose }) => {
  if (!show || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-dark text-white p-3 no-print">
            <h5 className="modal-title font-heading">Official Booking Invoice & Receipt</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 p-md-5" id="printable-invoice">
            {/* Invoice Header */}
            <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="bg-primary text-white p-2 rounded-2 d-inline-flex align-items-center justify-content-center">
                    <i className="bi bi-buildings-fill fs-5"></i>
                  </span>
                  <h3 className="font-heading fw-bold mb-0">Hotel<span className="text-warning">Pro</span></h3>
                </div>
                <div className="text-muted small">
                  777 Hospitality Grand Boulevard, Suite 100<br />
                  Metropolis, NY 10001, United States<br />
                  Email: reservations@hotelpro.com | Tel: +1 (800) 555-HOTEL
                </div>
              </div>

              <div className="text-end">
                <span className="badge bg-success-subtle text-success border border-success-subtle fs-6 px-3 py-2 text-uppercase fw-bold mb-2 d-inline-block">
                  ● Payment {booking.paymentStatus || 'PAID'}
                </span>
                <div className="fw-bold text-dark fs-5">Invoice #{booking.bookingNumber}</div>
                <div className="text-muted small">Issued: {formatDate(booking.createdAt || new Date())}</div>
              </div>
            </div>

            {/* Bill To & Stay Details Grid */}
            <div className="row g-4 mb-4">
              <div className="col-sm-6">
                <h6 className="text-uppercase text-secondary small fw-bold mb-2">Guest / Bill To:</h6>
                <div className="fw-bold text-dark fs-5">{booking.guestName || booking.guest?.name || 'Valued Guest'}</div>
                <div className="text-muted small">{booking.guestEmail || booking.guest?.email}</div>
                <div className="text-muted small">{booking.guestPhone || booking.guest?.phone}</div>
              </div>

              <div className="col-sm-6 text-sm-end">
                <h6 className="text-uppercase text-secondary small fw-bold mb-2">Reservation Info:</h6>
                <div className="fw-bold text-dark">Room #{booking.room?.roomNumber || 'N/A'} — {booking.room?.type}</div>
                <div className="text-muted small">Check-In: <strong>{formatDate(booking.checkInDate)}</strong></div>
                <div className="text-muted small">Check-Out: <strong>{formatDate(booking.checkOutDate)}</strong></div>
                <div className="text-muted small">Total Duration: <strong>{booking.totalNights} Night(s)</strong> | Guests: <strong>{booking.totalGuests}</strong></div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="table-responsive mb-4">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Description</th>
                    <th className="text-center">Rate / Night</th>
                    <th className="text-center">Nights</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="fw-bold">{booking.room?.type || 'Hotel Room Stay'}</div>
                      <div className="text-muted small">Room #{booking.room?.roomNumber} (Includes complimentary breakfast & Wi-Fi)</div>
                    </td>
                    <td className="text-center">${booking.roomRate || booking.room?.pricePerNight}</td>
                    <td className="text-center">{booking.totalNights}</td>
                    <td className="text-end fw-semibold">
                      ${(booking.roomRate || booking.room?.pricePerNight || 0) * (booking.totalNights || 1)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end text-muted small">State Hospitality & Occupancy Tax (12%)</td>
                    <td className="text-end fw-semibold">${booking.taxAmount || Math.round(booking.totalPrice * 0.12)}</td>
                  </tr>
                  <tr className="table-light">
                    <td colSpan="3" className="text-end fw-bold fs-5">Total Paid</td>
                    <td className="text-end fw-bold fs-5 text-primary">${booking.totalPrice}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Special notes & footer */}
            <div className="border-top pt-3 text-muted small">
              <p className="mb-1"><strong>Special Requests:</strong> {booking.specialRequests || 'None provided'}</p>
              <p className="mb-0">
                <em>Thank you for choosing HotelPro. Check-in is at 3:00 PM; Check-out is at 11:00 AM. For inquiries, present this invoice receipt at the reception desk.</em>
              </p>
            </div>
          </div>

          {/* Modal Footer (Hidden when printing) */}
          <div className="modal-footer bg-light p-3 no-print">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary fw-bold px-4" onClick={handlePrint}>
              <i className="bi bi-printer-fill me-1"></i> Print / Save as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
