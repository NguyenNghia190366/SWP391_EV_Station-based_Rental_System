import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BookingSuccessPage.css';

const BookingSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="success-page error">
        <div className="error-content">
          <h1> Không tìm thấy thông tin đặt xe</h1>
          <button onClick={() => navigate('/vehicles')}>
            Quay lại trang xe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-animation">
          <div className="checkmark-circle">
            <div className="checkmark"></div>
          </div>
        </div>

        <h1> ĐẶT XE THÀNH CÔNG!</h1>
        <p className="success-message">
          Cảm ơn bạn đã sử dụng dịch vụ EV Rental System
        </p>

        <div className="booking-summary">
          <h2> Thông tin đặt xe</h2>
          
          <div className="summary-card">
            <div className="summary-row">
              <span className="label">Mã đặt xe:</span>
              <span className="value highlight">{booking.bookingId}</span>
            </div>
            
            <div className="summary-row">
              <span className="label">Mã hợp đồng:</span>
              <span className="value">{booking.contractNumber}</span>
            </div>

            <div className="summary-row">
              <span className="label">Xe:</span>
              <span className="value">{booking.vehicle.name}</span>
            </div>

            <div className="summary-row">
              <span className="label">Nhận xe:</span>
              <span className="value">
                {new Date(booking.bookingData.startDate).toLocaleString('vi-VN')}
              </span>
            </div>

            <div className="summary-row">
              <span className="label">Trả xe:</span>
              <span className="value">
                {new Date(booking.bookingData.endDate).toLocaleString('vi-VN')}
              </span>
            </div>

            <div className="summary-row">
              <span className="label">Địa điểm:</span>
              <span className="value">{booking.bookingData.pickupLocation}</span>
            </div>

            <div className="summary-row highlight">
              <span className="label">Tổng thanh toán:</span>
              <span className="value price">
                {booking.totalPrice.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>

            <div className="summary-row">
              <span className="label">Phương thức:</span>
              <span className="value">
                {booking.payment.method === 'momo' && ' MoMo'}
                {booking.payment.method === 'vnpay' && ' VNPay'}
                {booking.payment.method === 'zalopay' && ' ZaloPay'}
                {booking.payment.method === 'banking' && ' Chuyển khoản'}
                {booking.payment.method === 'cash' && ' Tiền mặt'}
              </span>
            </div>

            <div className="summary-row">
              <span className="label">Mã giao dịch:</span>
              <span className="value">{booking.payment.transactionId}</span>
            </div>
          </div>
        </div>

        <div className="next-steps">
          <h3> Bước tiếp theo:</h3>
          <ol>
            <li>Kiểm tra email để xem xác nhận đặt xe</li>
            <li>Mang theo GPLX và CCCD khi đến nhận xe</li>
            <li>Đến {booking.bookingData.pickupLocation} đúng giờ</li>
            <li>Nhận xe và bắt đầu hành trình! </li>
          </ol>
        </div>

        <div className="action-buttons">
          <button 
            className="btn-pickup" 
            onClick={() => navigate(`/checkin-method/${booking.bookingId}`)}
          >
            Lấy xe ngay
          </button>
          <button className="btn-primary" onClick={() => navigate('/my-bookings')}>
             Xem đơn của tôi
          </button>
          <button className="btn-secondary" onClick={() => navigate('/home')}>
             Về trang chủ
          </button>
          <button className="btn-tertiary" onClick={() => navigate('/vehicles')}>
             Đặt xe khác
          </button>
        </div>

        <div className="support-info">
          <p>Cần hỗ trợ? Liên hệ hotline: <strong>1900-xxxx</strong></p>
          <p>Email: support@evrental.com</p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
