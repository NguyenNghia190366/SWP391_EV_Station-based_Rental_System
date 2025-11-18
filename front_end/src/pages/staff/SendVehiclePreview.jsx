import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';

const SendVehiclePreview = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [vehicleCondition, setVehicleCondition] = useState({
    exteriorCondition: 'good',
    interiorCondition: 'good',
    batteryLevel: 100,
    range: 0,
    notes: ''
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      // In real app, fetch from API
      // For demo, get from localStorage
      const bookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
      const found = bookings.find(b => b.bookingId === bookingId);
      
      if (found) {
        setBooking(found);
        // Pre-fill vehicle info
        setVehicleCondition(prev => ({
          ...prev,
          range: found.vehicle?.range || 0
        }));
      } else {
        message.error('Booking not found');
        navigate('/staff/bookings');
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      message.error('Error loading booking info');
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // Create preview URLs
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      caption: ''
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handlePhotoCaption = (index, caption) => {
    setPhotos(prev => prev.map((photo, i) => 
      i === index ? { ...photo, caption } : photo
    ));
  };

  const handleSendPreview = async () => {
    if (photos.length === 0) {
      message.warning('Please take at least 1 vehicle photo!');
      return;
    }

    try {
      setSending(true);
      message.loading({ content: 'Sending vehicle info...', key: 'send' });

      // In real app: Upload photos to server and send notification
      // const formData = new FormData();
      // photos.forEach((photo, index) => {
      //   formData.append(`photos[${index}]`, photo.file);
      //   formData.append(`captions[${index}]`, photo.caption);
      // });
      // formData.append('vehicleCondition', JSON.stringify(vehicleCondition));
      // await vehicleAPI.sendVehiclePreview(bookingId, formData);

      // For demo: Save to localStorage
      const previewData = {
        bookingId,
        photos: photos.map(p => ({
          url: p.preview,
          caption: p.caption || ''
        })),
        ...vehicleCondition,
        sentAt: new Date().toISOString(),
        sentBy: 'Staff User' // In real app, get from auth context
      };

      localStorage.setItem(`vehiclePreview_${bookingId}`, JSON.stringify(previewData));

      // Update booking status
      const bookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
      const updatedBookings = bookings.map(b => 
        b.bookingId === bookingId 
          ? { ...b, status: 'vehicle_preview_sent', previewSent: true }
          : b
      );
      localStorage.setItem('allBookings', JSON.stringify(updatedBookings));

      // Create notification for customer
      const userNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
      const newNotification = {
        id: `notif_${Date.now()}`,
        type: 'vehicle_preview',
        title: 'Vehicle information ready! 🚗',
        message: `Staff has sent the vehicle information and photos for ${booking.vehicle?.name}. Please check and confirm.`,
        bookingId: bookingId,
        vehicleName: booking.vehicle?.name,
        read: false,
        timestamp: new Date().toISOString()
      };
      userNotifications.unshift(newNotification);
      localStorage.setItem('userNotifications', JSON.stringify(userNotifications));

      message.success({
        content: 'Vehicle information sent to customer!',
        key: 'send',
        duration: 3
      });

      setTimeout(() => {
        navigate('/staff/bookings');
      }, 1500);

    } catch (error) {
      console.error('Error sending preview:', error);
      message.error({
        content: 'Cannot send data. Please try again!',
        key: 'send'
      });
    } finally {
      setSending(false);
    }
  };

  if (!booking) {
    return (
      <div className="send-preview-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="send-preview-container">
      <div className="send-preview-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div>
          <h1>📸 Send Vehicle Info to Customer</h1>
            <p>Booking ID: <strong>{bookingId}</strong></p>
        </div>
      </div>

      <div className="send-preview-content">
        {/* Booking Info */}
        <div className="booking-info-card">
          <h3>Booking information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span>Customer:</span>
              <strong>{booking.user?.fullName}</strong>
            </div>
            <div className="info-item">
              <span>Vehicle:</span>
              <strong>{booking.vehicle?.name}</strong>
            </div>
            <div className="info-item">
              <span>Pickup time:</span>
              <strong>{new Date(booking.bookingData?.startDate).toLocaleString('vi-VN')}</strong>
            </div>
            <div className="info-item">
              <span>Station:</span>
              <strong>{booking.bookingData?.pickupLocation}</strong>
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="photo-upload-section">
          <h3>📷 Vehicle Photos</h3>
          <p className="section-note">Take at least 4 photos: front, rear, both sides, and interior</p>
          
          <div className="upload-area">
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handlePhotoUpload}
              id="photo-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="photo-input" className="upload-btn">
              📸 Capture/Choose photos
            </label>
            <p className="upload-hint">{photos.length} photos selected</p>
          </div>

          {photos.length > 0 && (
            <div className="photos-preview-grid">
              {photos.map((photo, index) => (
                <div key={index} className="preview-photo-card">
                  <img src={photo.preview} alt={`Preview ${index + 1}`} />
                    <input
                    type="text"
                    placeholder="Location description (e.g., Front)"
                    value={photo.caption}
                    onChange={(e) => handlePhotoCaption(index, e.target.value)}
                    className="photo-caption-input"
                  />
                  <button 
                    className="btn-remove-photo"
                    onClick={() => handleRemovePhoto(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle Condition Form */}
        <div className="condition-form-section">
          <h3>📋 Vehicle Condition</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Exterior</label>
              <select 
                value={vehicleCondition.exteriorCondition}
                onChange={(e) => setVehicleCondition({...vehicleCondition, exteriorCondition: e.target.value})}
              >
                <option value="good">✓ Good - No scratches</option>
                <option value="fair">⚠ Fair - Minor scratches</option>
                <option value="damaged">✗ Damaged - Significant issues</option>
              </select>
            </div>

            <div className="form-group">
              <label>Interior</label>
              <select 
                value={vehicleCondition.interiorCondition}
                onChange={(e) => setVehicleCondition({...vehicleCondition, interiorCondition: e.target.value})}
              >
                <option value="good">✓ Good - Clean</option>
                <option value="fair">⚠ Fair - Slightly dirty</option>
                <option value="damaged">✗ Damaged - Dirty/issue</option>
              </select>
            </div>

            <div className="form-group">
              <label>Battery level (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={vehicleCondition.batteryLevel}
                onChange={(e) => setVehicleCondition({...vehicleCondition, batteryLevel: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Remaining range (km)</label>
              <input
                type="number"
                min="0"
                value={vehicleCondition.range}
                onChange={(e) => setVehicleCondition({...vehicleCondition, range: e.target.value})}
              />
            </div>
          </div>

            <div className="form-group full-width">
            <label>Note for customer (optional)</label>
              <textarea
              rows="3"
              placeholder="e.g., Minor scratch on right door, full inspection completed..."
              value={vehicleCondition.notes}
              onChange={(e) => setVehicleCondition({...vehicleCondition, notes: e.target.value})}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="send-actions">
          <button 
            className="btn-cancel"
            onClick={() => navigate(-1)}
            disabled={sending}
          >
            Cancel
          </button>
          <button 
            className="btn-send"
            onClick={handleSendPreview}
            disabled={sending || photos.length === 0}
          >
            {sending ? 'Sending...' : '✉️ Send to customer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendVehiclePreview;
