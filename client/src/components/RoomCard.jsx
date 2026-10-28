import React from 'react';

const RoomCard = ({ room, onBookNow, onViewDetails, onOpenQR, onOpenPhotos }) => {
  const isAvailable = room.status === 'available';
  const photoCount = room.images?.length || 1;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="status-pill status-available"><i className="bi bi-check-circle-fill"></i> Available</span>;
      case 'occupied':
        return <span className="status-pill status-occupied"><i className="bi bi-person-fill"></i> Occupied</span>;
      case 'maintenance':
        return <span className="status-pill status-maintenance"><i className="bi bi-tools"></i> Maintenance</span>;
      case 'cleaning':
        return <span className="status-pill status-cleaning"><i className="bi bi-stars"></i> Cleaning</span>;
      default:
        return <span className="status-pill bg-light text-dark">{status}</span>;
    }
  };

  const handleOpenPhotos = () => {
    if (onOpenPhotos) {
      onOpenPhotos(room);
    } else if (onViewDetails) {
      onViewDetails(room);
    }
  };

  const handleOpenQR = () => {
    if (onOpenQR) {
      onOpenQR(room);
    } else if (onViewDetails) {
      onViewDetails(room);
    }
  };

  return (
    <div className="card room-card h-100 shadow-sm">
      <div className="room-img-container position-relative">
        <img
          src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
          alt={room.type}
          loading="lazy"
          onClick={handleOpenPhotos}
          style={{ cursor: 'pointer' }}
        />
        <div className="room-badge">
          Room #{room.roomNumber}
        </div>
        <div className="position-absolute bottom-0 start-0 m-2">
          {getStatusBadge(room.status)}
        </div>
        <div className="position-absolute top-0 end-0 m-2">
          <span className="badge bg-warning text-dark fw-bold">
            <i className="bi bi-star-fill text-dark me-1"></i>
            {room.rating || 4.8}
          </span>
        </div>

        {/* Room Photos Counter Pill */}
        <button
          type="button"
          className="btn btn-sm p-0 position-absolute bottom-0 end-0 m-2 border-0"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenPhotos();
          }}
          title="Click to view all photos"
        >
          <span className="badge bg-dark bg-opacity-75 text-white py-1 px-2 rounded-pill shadow-xs d-inline-flex align-items-center gap-1">
            <i className="bi bi-images text-warning"></i>
            <span>{photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}</span>
          </span>
        </button>
      </div>

      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title fw-bold text-dark mb-0">{room.type}</h5>
          <span className="badge bg-light text-secondary border small">Floor {room.floor}</span>
        </div>

        <p className="card-text text-muted small line-clamp-2 mb-3" style={{ minHeight: '40px' }}>
          {room.description}
        </p>

        {/* Room Attributes */}
        <div className="d-flex flex-wrap gap-2 mb-3 text-secondary small">
          <span className="badge bg-light text-dark border">
            <i className="bi bi-people-fill text-primary me-1"></i> Up to {room.capacity} Guests
          </span>
          <span className="badge bg-light text-dark border">
            <i className="bi bi-moon-stars-fill text-primary me-1"></i> {room.bedType || 'King Bed'}
          </span>
        </div>

        {/* Amenities Highlights */}
        <div className="d-flex flex-wrap gap-1 mb-4">
          {room.amenities?.slice(0, 3).map((amenity, idx) => (
            <span key={idx} className="badge bg-secondary bg-opacity-10 text-secondary" style={{ fontSize: '0.72rem' }}>
              ✓ {amenity}
            </span>
          ))}
          {room.amenities?.length > 3 && (
            <span className="badge bg-light text-muted" style={{ fontSize: '0.72rem' }}>
              +{room.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
          <div>
            <div className="price-tag">₹{room.pricePerNight?.toLocaleString('en-IN')}</div>
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>per night (excl. tax)</div>
          </div>

          <div className="d-flex gap-2">
            {/* Room Photos QR Code Option Button */}
            <button
              type="button"
              className="btn btn-outline-primary btn-sm px-2 d-flex align-items-center gap-1"
              onClick={handleOpenQR}
              title="Scan Room Photos QR Code"
            >
              <i className="bi bi-qr-code-scan"></i>
              <span className="small fw-semibold d-none d-sm-inline">Photos QR</span>
            </button>

            {/* Quick Preview / View Photos Button */}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-2"
              onClick={handleOpenPhotos}
              title="View room photos & details"
            >
              <i className="bi bi-eye"></i>
            </button>

            {/* Book Stay CTA */}
            <button
              type="button"
              className={`btn btn-sm px-3 fw-bold ${isAvailable ? 'btn-primary shadow-sm' : 'btn-secondary disabled'}`}
              onClick={() => isAvailable && onBookNow(room)}
              disabled={!isAvailable}
            >
              {isAvailable ? 'Book Stay' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
