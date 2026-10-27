import React, { useState, useEffect } from 'react';
import API from '../services/api';

const RoomManageModal = ({ show, onClose, editingRoom, onSaveSuccess }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [type, setType] = useState('Deluxe Room');
  const [pricePerNight, setPricePerNight] = useState(150);
  const [capacity, setCapacity] = useState(2);
  const [bedType, setBedType] = useState('King Bed');
  const [floor, setFloor] = useState(1);
  const [status, setStatus] = useState('available');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingRoom) {
      setRoomNumber(editingRoom.roomNumber || '');
      setType(editingRoom.type || 'Deluxe Room');
      setPricePerNight(editingRoom.pricePerNight || 150);
      setCapacity(editingRoom.capacity || 2);
      setBedType(editingRoom.bedType || 'King Bed');
      setFloor(editingRoom.floor || 1);
      setStatus(editingRoom.status || 'available');
      setImageUrl(editingRoom.images?.[0] || '');
      setDescription(editingRoom.description || '');
      setAmenitiesInput(editingRoom.amenities ? editingRoom.amenities.join(', ') : '');
    } else {
      setRoomNumber('');
      setType('Deluxe Room');
      setPricePerNight(150);
      setCapacity(2);
      setBedType('King Bed');
      setFloor(1);
      setStatus('available');
      setImageUrl('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80');
      setDescription('Thoughtfully appointed hotel room featuring luxury linens, modern comforts, and en-suite facilities.');
      setAmenitiesInput('High-speed Wi-Fi, Smart TV, Air Conditioning, En-suite Bathroom, Room Service');
    }
  }, [editingRoom, show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      roomNumber,
      type,
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity),
      bedType,
      floor: Number(floor),
      status,
      images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
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
          <div className="modal-header bg-dark text-white p-4">
            <h5 className="modal-title font-heading">
              {editingRoom ? `Edit Room #${editingRoom.roomNumber}` : 'Add New Inventory Room'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{error}</span>
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
                  <label className="form-label small fw-semibold text-secondary">Nightly Price ($ USD)</label>
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

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Cover Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
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
