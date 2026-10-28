import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const RoomPhotosQRModal = ({
  room,
  show,
  onClose,
  onBookNow,
  initialTab = 'photos',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
    setActivePhotoIndex(0);
    setCopiedLink(false);
  }, [initialTab, show, room]);

  if (!show || !room) return null;

  const images = room.images && room.images.length > 0
    ? room.images
    : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'];

  // Construct mobile room photos & booking link
  const roomShareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?room=${room._id}&view=photos`
    : `https://hotelpro.com/?room=${room._id}&view=photos`;

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(roomShareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const isAvailable = room.status === 'available';

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.82)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-dark text-white p-3 p-md-4 no-print d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-warning text-dark fw-bold">Room #{room.roomNumber}</span>
              <h5 className="modal-title font-heading mb-0">{room.type}</h5>
            </div>

            {/* Tab navigation pills */}
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                className={`btn ${activeTab === 'photos' ? 'btn-light fw-bold text-dark' : 'btn-outline-light'}`}
                onClick={() => setActiveTab('photos')}
              >
                <i className="bi bi-images me-1 text-primary"></i>
                Photos ({images.length})
              </button>
              <button
                type="button"
                className={`btn ${activeTab === 'qr' ? 'btn-light fw-bold text-dark' : 'btn-outline-light'}`}
                onClick={() => setActiveTab('qr')}
              >
                <i className="bi bi-qr-code-scan me-1 text-primary"></i>
                Room QR Option
              </button>
            </div>

            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* TAB 1: ROOM PHOTOS GALLERY */}
          {activeTab === 'photos' && (
            <div className="modal-body p-0">
              {/* Main Photo Viewer */}
              <div
                className="position-relative bg-black d-flex align-items-center justify-content-center"
                style={{ height: '360px', overflow: 'hidden' }}
              >
                <img
                  src={images[activePhotoIndex]}
                  alt={`${room.type} view ${activePhotoIndex + 1}`}
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                />

                {/* Photo Counter Pill */}
                <div className="position-absolute top-0 start-0 m-3">
                  <span className="badge bg-dark bg-opacity-75 text-white px-3 py-2 rounded-pill shadow-sm">
                    <i className="bi bi-camera-fill me-1 text-warning"></i>
                    Photo {activePhotoIndex + 1} of {images.length}
                  </span>
                </div>

                {/* Room Status Pill */}
                <div className="position-absolute top-0 end-0 m-3">
                  <span className={`badge ${isAvailable ? 'bg-success' : 'bg-secondary'} px-3 py-2 rounded-pill text-uppercase`}>
                    {room.status}
                  </span>
                </div>

                {/* Left/Right Carousel Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="btn btn-dark btn-sm rounded-circle position-absolute start-0 top-50 translate-middle-y ms-3 opacity-75 hover-opacity-100 shadow"
                      style={{ width: '42px', height: '42px' }}
                      onClick={handlePrevPhoto}
                      title="Previous Photo"
                    >
                      <i className="bi bi-chevron-left fs-5"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-dark btn-sm rounded-circle position-absolute end-0 top-50 translate-middle-y me-3 opacity-75 hover-opacity-100 shadow"
                      style={{ width: '42px', height: '42px' }}
                      onClick={handleNextPhoto}
                      title="Next Photo"
                    >
                      <i className="bi bi-chevron-right fs-5"></i>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Strip */}
              {images.length > 1 && (
                <div className="bg-light p-3 border-bottom d-flex gap-2 overflow-auto align-items-center">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`btn p-0 rounded-2 overflow-hidden border-2 flex-shrink-0 ${
                        idx === activePhotoIndex ? 'border border-primary shadow-sm' : 'border opacity-75'
                      }`}
                      style={{
                        width: '74px',
                        height: '52px',
                        outline: idx === activePhotoIndex ? '2px solid #0d6efd' : 'none',
                      }}
                      onClick={() => setActivePhotoIndex(idx)}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                  <div className="text-muted small ms-auto ps-2 text-nowrap">
                    <i className="bi bi-hand-index-thumb me-1"></i>Click to view photo
                  </div>
                </div>
              )}

              {/* Room Details & Amenities */}
              <div className="p-4">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-start gap-2 mb-3">
                  <div>
                    <h5 className="font-heading fw-bold text-dark mb-1">{room.type}</h5>
                    <p className="text-muted small mb-0">{room.description}</p>
                  </div>
                  <div className="text-sm-end flex-shrink-0">
                    <div className="price-tag text-primary fs-3">
                      ₹{room.pricePerNight?.toLocaleString('en-IN')}
                    </div>
                    <div className="text-muted small">per night (excl. 12% tax)</div>
                  </div>
                </div>

                {/* Attributes */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-light text-dark border py-2 px-3">
                    <i className="bi bi-people-fill text-primary me-1"></i> Up to {room.capacity} Guests
                  </span>
                  <span className="badge bg-light text-dark border py-2 px-3">
                    <i className="bi bi-moon-stars-fill text-primary me-1"></i> {room.bedType || 'King Bed'}
                  </span>
                  <span className="badge bg-light text-dark border py-2 px-3">
                    <i className="bi bi-layers-fill text-primary me-1"></i> Floor {room.floor}
                  </span>
                  <span className="badge bg-warning bg-opacity-25 text-dark border py-2 px-3 fw-bold">
                    <i className="bi bi-star-fill text-warning me-1"></i> {room.rating || 4.8} Guest Rating
                  </span>
                </div>

                {/* Amenities */}
                <div className="mb-4">
                  <h6 className="fw-bold small text-uppercase text-secondary mb-2">Room Amenities</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {room.amenities?.map((amenity, idx) => (
                      <span key={idx} className="badge bg-light text-secondary border py-2 px-3">
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex flex-column flex-sm-row gap-2 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-primary fw-semibold d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setActiveTab('qr')}
                  >
                    <i className="bi bi-qr-code-scan"></i>
                    <span>Scan Room QR Code</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary ms-sm-auto"
                    onClick={onClose}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className={`btn fw-bold px-4 ${isAvailable ? 'btn-primary shadow-sm' : 'btn-secondary disabled'}`}
                    disabled={!isAvailable}
                    onClick={() => {
                      if (isAvailable) {
                        onClose();
                        onBookNow(room);
                      }
                    }}
                  >
                    {isAvailable ? 'Book This Room' : 'Currently Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROOM PHOTOS QR OPTION */}
          {activeTab === 'qr' && (
            <div className="modal-body p-4 p-md-5">
              {/* Printable Room QR Card Container */}
              <div
                id="printable-room-qr"
                className="bg-white border rounded-4 p-4 p-md-5 text-center shadow-xs mx-auto"
                style={{ maxWidth: '540px' }}
              >
                {/* Brand header */}
                <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                  <span className="bg-primary text-white p-2 rounded-2 d-inline-flex align-items-center justify-content-center">
                    <i className="bi bi-buildings-fill fs-5"></i>
                  </span>
                  <h4 className="font-heading fw-bold mb-0">
                    Hotel<span className="text-warning">Pro</span>
                  </h4>
                </div>

                <div className="badge bg-warning text-dark text-uppercase fw-bold px-3 py-2 rounded-pill mb-2">
                  Room #{room.roomNumber} • {room.type}
                </div>

                <h5 className="font-heading fw-bold text-dark mb-1">Room Photos & Digital Experience</h5>
                <p className="text-muted small mb-4">
                  Scan this QR code with any smartphone camera to view all high-resolution room photos, explore 360 amenities, and book directly.
                </p>

                {/* QR Code Container */}
                <div className="d-inline-block p-3 rounded-3 bg-light border shadow-sm mb-3">
                  <QRCodeSVG
                    value={roomShareUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                {/* Key features badges */}
                <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle small px-2 py-1">
                    <i className="bi bi-images me-1"></i> {images.length} High-Res Photos
                  </span>
                  <span className="badge bg-success-subtle text-success border border-success-subtle small px-2 py-1">
                    <i className="bi bi-check-circle me-1"></i> Live Rates & Booking
                  </span>
                  <span className="badge bg-info-subtle text-info border border-info-subtle small px-2 py-1">
                    <i className="bi bi-wifi me-1"></i> In-Room Directory
                  </span>
                </div>

                {/* Direct Link box */}
                <div className="p-2 bg-light rounded-3 border d-flex align-items-center justify-content-between gap-2 text-start mb-3">
                  <div className="text-truncate small font-monospace text-muted" style={{ fontSize: '0.8rem' }}>
                    {roomShareUrl}
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary flex-shrink-0"
                    onClick={handleCopyLink}
                    title="Copy URL"
                  >
                    <i className={`bi ${copiedLink ? 'bi-check-lg text-success' : 'bi-clipboard'}`}></i>{' '}
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                  Floor {room.floor} • Capacity {room.capacity} Guests • ₹{room.pricePerNight?.toLocaleString('en-IN')}/night
                </div>
              </div>

              {/* Action Buttons (Hidden when printing) */}
              <div className="d-flex flex-column flex-sm-row justify-content-between gap-2 mt-4 pt-3 border-top no-print">
                <button
                  type="button"
                  className="btn btn-outline-dark fw-semibold d-flex align-items-center justify-content-center gap-2"
                  onClick={handlePrintCard}
                >
                  <i className="bi bi-printer-fill text-primary"></i>
                  <span>Print QR Tent Card</span>
                </button>

                <div className="d-flex gap-2 ms-sm-auto">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setActiveTab('photos')}
                  >
                    <i className="bi bi-images me-1"></i>
                    View Photos
                  </button>

                  <button
                    type="button"
                    className={`btn fw-bold ${isAvailable ? 'btn-primary' : 'btn-secondary disabled'}`}
                    disabled={!isAvailable}
                    onClick={() => {
                      if (isAvailable) {
                        onClose();
                        onBookNow(room);
                      }
                    }}
                  >
                    {isAvailable ? 'Book Stay Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomPhotosQRModal;

