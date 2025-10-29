import React from 'react';
import './BookingView.css';

const BookingView = ({ 
  vehicle, 
  user,
  bookingData,
  onBookingDataChange,
  onProceedToContract,
  onCancel 
}) => {
  const handleInputChange = (field, value) => {
    onBookingDataChange({ ...bookingData, [field]: value });
  };

  const calculateTotalPrice = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    return days > 0 ? days * vehicle.price : 0;
  };

  const calculateDeposit = () => {
    return calculateTotalPrice() * 0.3; // 30% deposit
  };

  return (
    <div className="booking-view">
      <div className="booking-container">
        <div className="booking-header">
          <button className="back-button" onClick={onCancel}>
            ← Quay lại
          </button>
          <h1>Đặt xe: {vehicle.name}</h1>
        </div>

        <div className="booking-content">
          {/* Left: Vehicle Info */}
          <div className="vehicle-summary">
            <img src={vehicle.image} alt={vehicle.name} />
            <div className="vehicle-details">
              <h2>{vehicle.name}</h2>
              <p className="price">{vehicle.price}k VNĐ/ngày</p>
              <div className="specs">
                <span> Pin: {vehicle.battery}%</span>
                <span> {vehicle.station.name}</span>
                <span> {vehicle.rating}/5</span>
              </div>
            </div>
          </div>

          {/* Right: Booking Form */}
          <div className="booking-form">
            <h3>Thông tin đặt xe</h3>

            <div className="form-group">
              <label>Khách hàng</label>
              <input 
                type="text" 
                value={user.fullName} 
                disabled 
                className="disabled-input"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={user.email} 
                disabled 
                className="disabled-input"
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input 
                type="tel" 
                value={bookingData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Nhập số điện thoại"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ngày bắt đầu *</label>
                <input 
                  type="datetime-local" 
                  value={bookingData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ngày kết thúc *</label>
                <input 
                  type="datetime-local" 
                  value={bookingData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={bookingData.startDate || new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Địa điểm nhận xe</label>
              <select 
                value={bookingData.pickupLocation}
                onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
              >
                <option value={vehicle.station.name}>{vehicle.station.name}</option>
                <option value="Trạm Quận 1">Trạm Quận 1</option>
                <option value="Trạm Quận 3">Trạm Quận 3</option>
                <option value="Trạm Quận 7">Trạm Quận 7</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ghi chú (tùy chọn)</label>
              <textarea 
                value={bookingData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Ghi chú đặc biệt..."
                rows={3}
              />
            </div>

            {/* Price Summary */}
            <div className="price-summary">
              <div className="price-row">
                <span>Giá thuê:</span>
                <span>{calculateTotalPrice().toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="price-row">
                <span>Đặt cọc (30%):</span>
                <span className="deposit">{calculateDeposit().toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="price-row total">
                <span>Tổng thanh toán:</span>
                <span>{calculateTotalPrice().toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="btn-cancel" onClick={onCancel}>
                Hủy
              </button>
              <button 
                className="btn-proceed" 
                onClick={onProceedToContract}
                disabled={!bookingData.startDate || !bookingData.endDate || !bookingData.phone}
              >
                Tiếp tục → Tạo hợp đồng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingView;
