import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BookingSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-red-600 mb-4">⚠️ Không tìm thấy thông tin đặt xe</h1>
          <button 
            onClick={() => navigate('/vehicles')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all"
          >
            Quay lại trang xe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="absolute inset-0 w-32 h-32 bg-green-400 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          🎉 ĐẶT XE THÀNH CÔNG!
        </h1>
        <p className="text-center text-gray-600 text-lg mb-8">
          Cảm ơn bạn đã sử dụng dịch vụ EV Rental System
        </p>

        {/* Booking Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📋 Thông tin đặt xe
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Mã đặt xe:</span>
              <span className="font-bold text-xl text-indigo-600">{booking.bookingId}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Mã hợp đồng:</span>
              <span className="font-semibold text-gray-800">{booking.contractNumber}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Xe:</span>
              <span className="font-semibold text-gray-800">{booking.vehicle.name}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Nhận xe:</span>
              <span className="font-semibold text-gray-800">
                {new Date(booking.bookingData.startDate).toLocaleString('vi-VN')}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Trả xe:</span>
              <span className="font-semibold text-gray-800">
                {new Date(booking.bookingData.endDate).toLocaleString('vi-VN')}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Địa điểm:</span>
              <span className="font-semibold text-gray-800">{booking.bookingData.pickupLocation}</span>
            </div>

            <div className="flex justify-between items-center py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-4">
              <span className="text-lg font-bold text-gray-800">Tổng thanh toán:</span>
              <span className="text-2xl font-bold text-green-600">
                {booking.totalPrice.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Phương thức:</span>
              <span className="font-semibold text-gray-800">
                {booking.payment.method === 'momo' && '💳 MoMo'}
                {booking.payment.method === 'vnpay' && '💳 VNPay'}
                {booking.payment.method === 'zalopay' && '💳 ZaloPay'}
                {booking.payment.method === 'banking' && '🏦 Chuyển khoản'}
                {booking.payment.method === 'cash' && '💵 Tiền mặt'}
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Mã giao dịch:</span>
              <span className="font-semibold text-gray-800">{booking.payment.transactionId}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🎯 Bước tiếp theo:
          </h3>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
              <span className="text-gray-700 pt-1">Kiểm tra email để xem xác nhận đặt xe</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
              <span className="text-gray-700 pt-1">Mang theo GPLX và CCCD khi đến nhận xe</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
              <span className="text-gray-700 pt-1">Đến {booking.bookingData.pickupLocation} đúng giờ</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
              <span className="text-gray-700 pt-1">Nhận xe và bắt đầu hành trình! 🚗</span>
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button 
            className="px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-lg shadow-lg transition-all"
            onClick={() => navigate(`/checkin-method/${booking.bookingId}`)}
          >
            🚗 Lấy xe ngay
          </button>
          <button 
            className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transition-all"
            onClick={() => navigate('/my-bookings')}
          >
            📋 Xem đơn của tôi
          </button>
          <button 
            className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg transition-all"
            onClick={() => navigate('/home')}
          >
            🏠 Về trang chủ
          </button>
          <button 
            className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg transition-all"
            onClick={() => navigate('/vehicles')}
          >
            ⚡ Đặt xe khác
          </button>
        </div>

        {/* Support Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-gray-700 mb-2">
            Cần hỗ trợ? Liên hệ hotline: <strong className="text-indigo-600">1900-xxxx</strong>
          </p>
          <p className="text-gray-700">
            Email: <strong className="text-indigo-600">support@evrental.com</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
