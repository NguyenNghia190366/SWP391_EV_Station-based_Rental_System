import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CheckInMethodSelectionPage = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // Get booking from localStorage
    const bookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
    const foundBooking = bookings.find(b => b.bookingId === bookingId);
    
    if (!foundBooking) {
      alert('Không tìm thấy thông tin đặt xe!');
      navigate('/home');
      return;
    }
    
    setBooking(foundBooking);
  }, [bookingId, navigate]);

  const handleAppCheckIn = () => {
    // Navigate to document verification first
    navigate(`/verify-documents/${bookingId}`);
  };

  const handleCounterCheckIn = () => {
    // Navigate directly to check-in with staff assistance
    alert('Vui lòng đến quầy để nhân viên hỗ trợ check-in!\n\nĐịa điểm: ' + booking?.bookingData?.pickupLocation);
    // In real app, might navigate to a page showing directions or QR code for staff
  };

  if (!booking) {
    return (
      <div className="loading-container">
        <div>Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="checkin-method-page">
      <div className="checkin-method-container">
        <div className="method-header">
          <h1>🚗 Chọn cách nhận xe</h1>
          <div className="booking-info-box">
            <div className="info-row">
              <span className="info-label">Mã đặt xe:</span>
              <span className="info-value">{bookingId}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Xe:</span>
              <span className="info-value">{booking.vehicle.name}</span>
            </div>
          </div>
        </div>

        <div className="methods-grid">
          {/* Method 1: App Check-in */}
          <div className="method-card app-method" onClick={handleAppCheckIn}>
            <div className="method-icon">📱</div>
            <h2>Nhận xe qua App</h2>
            <ul className="method-features">
              <li>✅ Tự động hóa, không cần chờ đợi</li>
              <li>✅ Kiểm tra giấy tờ trực tuyến</li>
              <li>✅ Nhận mã unlock xe tự động</li>
              <li>✅ Tiết kiệm thời gian</li>
            </ul>
            <div className="method-note">
              ⚠️ Cần xác thực giấy tờ trước khi check-in
            </div>
            <button className="method-btn primary">
              Bắt đầu nhận xe
            </button>
          </div>

          {/* Method 2: Counter Check-in */}
          <div className="method-card counter-method" onClick={handleCounterCheckIn}>
            <div className="method-icon">🏢</div>
            <h2>Nhận xe tại quầy</h2>
            <ul className="method-features">
              <li>✅ Có nhân viên hỗ trợ trực tiếp</li>
              <li>✅ Kiểm tra xe kỹ lưỡng</li>
              <li>✅ Hướng dẫn sử dụng chi tiết</li>
              <li>✅ Giải đáp thắc mắc ngay</li>
            </ul>
            <div className="method-note">
              📍 Địa điểm: {booking.bookingData.pickupLocation}
            </div>
            <button className="method-btn secondary">
              Đến quầy nhận xe
            </button>
          </div>
        </div>

        <div className="method-comparison">
          <h3>📊 So sánh hai phương thức</h3>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Tiêu chí</th>
                <th>Qua App</th>
                <th>Tại quầy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Thời gian</td>
                <td className="highlight">~5 phút</td>
                <td>~15 phút</td>
              </tr>
              <tr>
                <td>Hỗ trợ nhân viên</td>
                <td>❌</td>
                <td className="highlight">✅</td>
              </tr>
              <tr>
                <td>Cần chờ đợi</td>
                <td className="highlight">❌</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>Tự động unlock</td>
                <td className="highlight">✅</td>
                <td>✅</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="back-action">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
        </div>

        <div className="help-info">
          <p>💡 <strong>Mẹo:</strong> Nếu đây là lần đầu thuê xe, chúng tôi khuyên bạn nên nhận xe tại quầy để được hướng dẫn chi tiết!</p>
          <p>📞 Cần hỗ trợ? Hotline: <strong>1900-xxxx</strong></p>
        </div>
      </div>
    </div>
  );
};

export default CheckInMethodSelectionPage;
