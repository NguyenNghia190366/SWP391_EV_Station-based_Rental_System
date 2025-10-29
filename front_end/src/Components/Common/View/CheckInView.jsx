import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './CheckInView.css';

const CheckInView = ({ booking, onCheckIn }) => {
  const [checkInMethod, setCheckInMethod] = useState('qr'); // 'qr' or 'code'
  const [bookingCode, setBookingCode] = useState('');
  const [vehicleCondition, setVehicleCondition] = useState({
    exteriorCondition: 'good', // good, fair, damaged
    interiorCondition: 'good',
    batteryLevel: 100,
    mileage: 0,
    notes: '',
    photos: []
  });
  const [step, setStep] = useState(1); // 1: Verify, 2: Inspect, 3: Confirm

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    setVehicleCondition(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };

  const handleVerifyCode = () => {
    // Verify booking code
    if (bookingCode.trim()) {
      setStep(2);
    }
  };

  const handleConfirmCheckIn = () => {
    const checkInData = {
      bookingId: booking?.id || bookingCode,
      checkInTime: new Date().toISOString(),
      vehicleCondition,
      checkInMethod: checkInMethod === 'qr' ? 'QR_SCAN' : 'MANUAL_CODE'
    };
    
    onCheckIn(checkInData);
  };

  return (
    <div className="checkin-container">
      <div className="checkin-header">
        <h1>Nhận Xe</h1>
        <p>Vui lòng hoàn tất các bước để nhận xe</p>
      </div>

      {/* Step Indicator */}
      <div className="checkin-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Xác thực</div>
        </div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Kiểm tra xe</div>
        </div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Xác nhận</div>
        </div>
      </div>

      {/* Step 1: Verify Booking */}
      {step === 1 && (
        <div className="checkin-step-content">
          <h2>Bước 1: Xác thực đặt xe</h2>
          
          <div className="checkin-method-tabs">
            <button 
              className={`tab ${checkInMethod === 'qr' ? 'active' : ''}`}
              onClick={() => setCheckInMethod('qr')}
            >
              Quét mã QR
            </button>
            <button 
              className={`tab ${checkInMethod === 'code' ? 'active' : ''}`}
              onClick={() => setCheckInMethod('code')}
            >
              Nhập mã đặt xe
            </button>
          </div>

          {checkInMethod === 'qr' && booking && (
            <div className="qr-section">
              <p className="qr-instruction">Đưa mã QR này cho nhân viên quầy hoặc quét bằng máy tại trạm</p>
              <div className="qr-code-wrapper">
                <QRCodeSVG 
                  value={booking.bookingCode || `BOOKING_${booking.id}`}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="booking-info">
                <p><strong>Mã đặt xe:</strong> {booking.bookingCode || `BOOKING_${booking.id}`}</p>
                <p><strong>Xe:</strong> {booking.vehicle.name}</p>
                <p><strong>Trạm:</strong> {booking.station.name}</p>
              </div>
              <button className="btn-primary" onClick={() => setStep(2)}>
                Tiếp tục kiểm tra xe
              </button>
            </div>
          )}

          {checkInMethod === 'code' && (
            <div className="code-input-section">
              <p className="code-instruction">Nhập mã đặt xe 6-8 ký tự</p>
              <input
                type="text"
                className="booking-code-input"
                placeholder="VD: BK123456"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
              <button 
                className="btn-primary"
                onClick={handleVerifyCode}
                disabled={!bookingCode.trim()}
              >
                Xác thực mã
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Vehicle Inspection */}
      {step === 2 && (
        <div className="checkin-step-content">
          <h2>Bước 2: Kiểm tra tình trạng xe</h2>
          
          <div className="inspection-form">
            <div className="form-group">
              <label>Tình trạng ngoại thất</label>
              <select 
                value={vehicleCondition.exteriorCondition}
                onChange={(e) => setVehicleCondition({...vehicleCondition, exteriorCondition: e.target.value})}
              >
                <option value="good">Tốt - Không trầy xước</option>
                <option value="fair">Khá - Trầy xước nhẹ</option>
                <option value="damaged">Hư hỏng - Có vết lõm/trầy</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tình trạng nội thất</label>
              <select 
                value={vehicleCondition.interiorCondition}
                onChange={(e) => setVehicleCondition({...vehicleCondition, interiorCondition: e.target.value})}
              >
                <option value="good">Tốt - Sạch sẽ</option>
                <option value="fair">Khá - Hơi bẩn</option>
                <option value="damaged">Kém - Bẩn hoặc hư hỏng</option>
              </select>
            </div>

            <div className="form-group">
              <label>Mức pin hiện tại (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={vehicleCondition.batteryLevel}
                onChange={(e) => setVehicleCondition({...vehicleCondition, batteryLevel: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Số km hiện tại</label>
              <input
                type="number"
                min="0"
                value={vehicleCondition.mileage}
                onChange={(e) => setVehicleCondition({...vehicleCondition, mileage: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Ghi chú (nếu có)</label>
              <textarea
                rows="3"
                placeholder="Mô tả tình trạng xe, hư hỏng (nếu có)..."
                value={vehicleCondition.notes}
                onChange={(e) => setVehicleCondition({...vehicleCondition, notes: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Chụp ảnh xe (tùy chọn)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="btn-upload">
                Chọn ảnh ({vehicleCondition.photos.length})
              </label>
              {vehicleCondition.photos.length > 0 && (
                <div className="photo-preview">
                  {vehicleCondition.photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img src={URL.createObjectURL(photo)} alt={`Preview ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="button-group">
            <button className="btn-secondary" onClick={() => setStep(1)}>
              Quay lại
            </button>
            <button className="btn-primary" onClick={() => setStep(3)}>
              Tiếp tục
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm Check-in */}
      {step === 3 && (
        <div className="checkin-step-content">
          <h2>Bước 3: Xác nhận nhận xe</h2>
          
          <div className="checkin-summary">
            <h3>Thông tin nhận xe</h3>
            <div className="summary-item">
              <span>Thời gian nhận xe:</span>
              <strong>{new Date().toLocaleString('vi-VN')}</strong>
            </div>
            <div className="summary-item">
              <span>Tình trạng ngoại thất:</span>
              <strong>{vehicleCondition.exteriorCondition === 'good' ? 'Tốt' : vehicleCondition.exteriorCondition === 'fair' ? 'Khá' : 'Hư hỏng'}</strong>
            </div>
            <div className="summary-item">
              <span>Tình trạng nội thất:</span>
              <strong>{vehicleCondition.interiorCondition === 'good' ? 'Tốt' : vehicleCondition.interiorCondition === 'fair' ? 'Khá' : 'Kém'}</strong>
            </div>
            <div className="summary-item">
              <span>Mức pin:</span>
              <strong>{vehicleCondition.batteryLevel}%</strong>
            </div>
            <div className="summary-item">
              <span>Số km:</span>
              <strong>{vehicleCondition.mileage} km</strong>
            </div>
            {vehicleCondition.notes && (
              <div className="summary-item">
                <span>Ghi chú:</span>
                <p>{vehicleCondition.notes}</p>
              </div>
            )}
            {vehicleCondition.photos.length > 0 && (
              <div className="summary-item">
                <span>Ảnh đính kèm:</span>
                <strong>{vehicleCondition.photos.length} ảnh</strong>
              </div>
            )}
          </div>

          <div className="checkin-terms">
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span>Tôi xác nhận đã kiểm tra xe và đồng ý với tình trạng hiện tại</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span>Tôi cam kết sử dụng xe đúng mục đích và tuân thủ luật giao thông</span>
            </label>
          </div>

          <div className="button-group">
            <button className="btn-secondary" onClick={() => setStep(2)}>
              Quay lại
            </button>
            <button className="btn-primary btn-large" onClick={handleConfirmCheckIn}>
              Xác nhận nhận xe
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInView;
