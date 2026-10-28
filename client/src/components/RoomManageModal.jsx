import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import API from '../services/api';

const RoomManageModal = ({ show, onClose, editingRoom, onSaveSuccess }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [type, setType] = useState('Deluxe Room');
  const [pricePerNight, setPricePerNight] = useState(3999);
  const [capacity, setCapacity] = useState(2);
  const [bedType, setBedType] = useState('King Bed');
  const [floor, setFloor] = useState(1);
  const [status, setStatus] = useState('available');
  const [imagesInput, setImagesInput] = useState('');
  const [description, setDescription] = useState('');
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQRPreview, setShowQRPreview] = useState(false);

  useEffect(() => {
    if (editingRoom) {
      setRoomNumber(editingRoom.roomNumber || '');
      setType(editingRoom.type || 'Deluxe Room');
      setPricePerNight(editingRoom.pricePerNight || 3999);
      setCapacity(editingRoom.capacity || 2);
      setBedType(editingRoom.bedType || 'King Bed');
      setFloor(editingRoom.floor || 1);
      setStatus(editingRoom.status || 'available');
      setImagesInput(editingRoom.images ? editingRoom.images.join('\n') : '');
      setDescription(editingRoom.description || '');
      setAmenitiesInput(editingRoom.amenities ? editingRoom.amenities.join(', ') : '');
    } else {
      setRoomNumber('');
      setType('Deluxe Room');
      setPricePerNight(3999);
      setCapacity(2);
      setBedType('King Bed');
      setFloor(1);
      setStatus('available');
      setImagesInput(
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80\nhttps://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
      );
      setDescription('Thoughtfully appointed hotel room featuring luxury linens, modern comforts, and en-suite facilities.');
      setAmenitiesInput('High-speed Wi-Fi, Smart TV, Air Conditioning, En-suite Bathroom, Room Service');
    }
    setShowQRPreview(false);
  }, [editingRoom, show]);

  if (!show) return null;

  // Parsed image list for preview
  const parsedImages = imagesInput
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.startsWith('http://') || s.startsWith('https://'));

  const roomQrUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?room=${editingRoom?._id || ''}&view=photos`
    : `https://hotelpro.com/?room=${editingRoom?._id || ''}&view=photos`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const imagesToSave = parsedImages.length > 0
      ? parsedImages
      : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'];

    const payload = {
      roomNumber,
      type,
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity),
      bedType,
      floor: Number(floor),
      status,
      images: imagesToSave,
      description,
      amenities: amenitiesInput.split(',').map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (editingRoom) {
        await API.put(`/rooms/${editingRoom._id}`, payload);
      } else {
        await API.post('/rooms', payload);
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save room details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-dark text-white p-4 d-flex justify-content-between align-items-center">
            <h5 className="modal-title font-heading mb-0">
              {editingRoom ? `Edit Room #${editingRoom.roomNumber}` : 'Add New Inventory Room'}
            </h5>
            <div className="d-flex align-items-center gap-2">
              {editingRoom && (
                <button
                  type="button"
                  className={`btn btn-sm ${showQRPreview ? 'btn-warning text-dark' : 'btn-outline-light'} fw-semibold`}
                  onClick={() => setShowQRPreview(!showQRPreview)}
                >
                  <i className="bi bi-qr-code me-1"></i>
                  {showQRPreview ? 'Hide QR Code' : 'Room Photos QR'}
                </button>
              )}
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              {/* QR Code Preview Box when toggled */}
              {showQRPreview && editingRoom && (
                <div className="alert alert-light border rounded-3 p-3 mb-4 d-flex flex-column flex-sm-row align-items-center gap-3">
                  <div className="bg-white p-2 rounded-2 border shadow-xs flex-shrink-0">
                    <QRCodeSVG value={roomQrUrl} size={110} level="M" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                      <i className="bi bi-qr-code-scan text-primary"></i>
                      <span>Room #{editingRoom.roomNumber} Photos & Details QR Code</span>
                    </h6>
                    <p className="text-muted small mb-2">
                      Guests scan this code with their smartphone camera to browse room photos and book online.
                    </p>
                    <span className="badge bg-light text-dark font-monospace border small">
                      {roomQrUrl}
                    </span>
                  </div>
                </div>
              )}

              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Room Number</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. 305"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Category / Type</label>
                  <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="Single Room">Single Room</option>
                    <option value="Double Room">Double Room</option>
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Executive Suite">Executive Suite</option>
                    <option value="Presidential Suite">Presidential Suite</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Nightly Price (₹ INR)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    required
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-semibold text-secondary">Max Guests</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="10"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-semibold text-secondary">Bed Configuration</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="King Bed"
                    value={bedType}
                    onChange={(e) => setBedType(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-semibold text-secondary">Floor</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-semibold text-secondary">Operational Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="cleaning">Needs Cleaning</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                {/* Multiple Room Photos URLs */}
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-semibold text-secondary mb-0">
                      <i className="bi bi-images text-primary me-1"></i> Room Photos URLs (One per line or comma-separated)
                    </label>
                    <span className="badge bg-light text-secondary border small">
                      {parsedImages.length} {parsedImages.length === 1 ? 'Photo' : 'Photos'} detected
                    </span>
                  </div>
                  <textarea
                    className="form-control font-monospace small"
                    rows="3"
                    placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2..."
                    value={imagesInput}
                    onChange={(e) => setImagesInput(e.target.value)}
                  ></textarea>
                  <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                    First photo serves as the primary cover image; all photos will display in the guest photo carousel & mobile QR tour.
                  </div>

                  {/* Photo Thumbnails Preview */}
                  {parsedImages.length > 0 && (
                    <div className="d-flex gap-2 mt-2 p-2 bg-light rounded-2 border overflow-auto">
                      {parsedImages.map((url, idx) => (
                        <div key={idx} className="position-relative flex-shrink-0" style={{ width: '70px', height: '50px' }}>
                          <img
                            src={url}
                            alt={`Room Photo ${idx + 1}`}
                            className="w-100 h-100 rounded-2 border"
                            style={{ objectFit: 'cover' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/70x50?text=Invalid'; }}
                          />
                          <span
                            className="badge bg-dark bg-opacity-75 position-absolute top-0 start-0 m-1 p-0 px-1"
                            style={{ fontSize: '0.6rem' }}
                          >
                            {idx === 0 ? 'Cover' : `#${idx + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Amenities (Comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Wi-Fi, Smart TV, AC, Balcony, Mini Bar"
                    value={amenitiesInput}
                    onChange={(e) => setAmenitiesInput(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Room Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light p-3">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary fw-bold px-4" disabled={loading}>
                {loading ? 'Saving...' : editingRoom ? 'Update Room' : 'Add Room'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoomManageModal;
