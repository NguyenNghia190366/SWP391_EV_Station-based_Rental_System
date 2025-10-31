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
        message.error('Không tìm thấy booking');
        navigate('/staff/bookings');
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      message.error('Lỗi tải thông tin booking');
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
      message.warning('Vui lòng chụp ít nhất 1 ảnh xe!');
      return;
    }

    try {
      setSending(true);
      message.loading({ content: 'Đang gửi thông tin xe...', key: 'send' });

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
        title: 'Thông tin xe đã sẵn sàng! 🚗',
        message: `Nhân viên đã gửi thông tin và hình ảnh xe ${booking.vehicle?.name}. Vui lòng kiểm tra và xác nhận.`,
        bookingId: bookingId,
        vehicleName: booking.vehicle?.name,
        read: false,
        timestamp: new Date().toISOString()
      };
      userNotifications.unshift(newNotification);
      localStorage.setItem('userNotifications', JSON.stringify(userNotifications));

      message.success({
        content: 'Đã gửi thông tin xe cho khách hàng!',
        key: 'send',
        duration: 3
      });

      setTimeout(() => {
        navigate('/staff/bookings');
      }, 1500);

    } catch (error) {
      console.error('Error sending preview:', error);
      message.error({
        content: 'Không thể gửi thông tin. Vui lòng thử lại!',
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
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="send-preview-container">
      <div className="send-preview-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
        <div>
          <h1>📸 Gửi Thông Tin Xe Cho Khách</h1>
          <p>Mã booking: <strong>{bookingId}</strong></p>
        </div>
      </div>

      <div className="send-preview-content">
        {/* Booking Info */}
        <div className="booking-info-card">
          <h3>Thông tin booking</h3>
          <div className="info-grid">
            <div className="info-item">
              <span>Khách hàng:</span>
              <strong>{booking.user?.fullName}</strong>
            </div>
            <div className="info-item">
              <span>Xe:</span>
              <strong>{booking.vehicle?.name}</strong>
            </div>
            <div className="info-item">
              <span>Thời gian nhận:</span>
              <strong>{new Date(booking.bookingData?.startDate).toLocaleString('vi-VN')}</strong>
            </div>
            <div className="info-item">
              <span>Trạm:</span>
              <strong>{booking.bookingData?.pickupLocation}</strong>
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="photo-upload-section">
          <h3>📷 Chụp ảnh xe</h3>
          <p className="section-note">Chụp ít nhất 4 ảnh: trước, sau, 2 bên, và nội thất</p>
          
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
              📸 Chụp/Chọn ảnh
            </label>
            <p className="upload-hint">Đã chọn {photos.length} ảnh</p>
          </div>

          {photos.length > 0 && (
            <div className="photos-preview-grid">
              {photos.map((photo, index) => (
                <div key={index} className="preview-photo-card">
                  <img src={photo.preview} alt={`Preview ${index + 1}`} />
                  <input
                    type="text"
                    placeholder="Mô tả vị trí (VD: Phía trước)"
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
          <h3>📋 Tình trạng xe</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Ngoại thất</label>
              <select 
                value={vehicleCondition.exteriorCondition}
                onChange={(e) => setVehicleCondition({...vehicleCondition, exteriorCondition: e.target.value})}
              >
                <option value="good">✓ Tốt - Không trầy xước</option>
                <option value="fair">⚠ Khá - Trầy xước nhẹ</option>
                <option value="damaged">✗ Có vấn đề - Hư hỏng rõ</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nội thất</label>
              <select 
                value={vehicleCondition.interiorCondition}
                onChange={(e) => setVehicleCondition({...vehicleCondition, interiorCondition: e.target.value})}
              >
                <option value="good">✓ Tốt - Sạch sẽ</option>
                <option value="fair">⚠ Khá - Hơi bẩn</option>
                <option value="damaged">✗ Có vấn đề - Bẩn/hư</option>
              </select>
            </div>

            <div className="form-group">
              <label>Mức pin (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={vehicleCondition.batteryLevel}
                onChange={(e) => setVehicleCondition({...vehicleCondition, batteryLevel: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Quãng đường còn lại (km)</label>
              <input
                type="number"
                min="0"
                value={vehicleCondition.range}
                onChange={(e) => setVehicleCondition({...vehicleCondition, range: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Ghi chú cho khách (nếu có)</label>
            <textarea
              rows="3"
              placeholder="VD: Xe có vết xước nhỏ ở cánh cửa phải, đã kiểm tra đầy đủ..."
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
            Hủy
          </button>
          <button 
            className="btn-send"
            onClick={handleSendPreview}
            disabled={sending || photos.length === 0}
          >
            {sending ? 'Đang gửi...' : '✉️ Gửi cho khách hàng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendVehiclePreview;
