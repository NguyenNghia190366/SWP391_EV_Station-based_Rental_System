import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentSuccessBill = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // Get booking from location state or localStorage
    const bookingData = location.state?.booking || 
                       JSON.parse(localStorage.getItem('currentBooking') || 'null');
    
    if (!bookingData) {
      navigate('/vehicles');
      return;
    }

    setBooking(bookingData);
  }, [location, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleContinue = () => {
    navigate(`/vehicle-preview/${booking.bookingId}`);
  };

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600 text-lg">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Success Icon */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 py-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(255,255,255,0.1)_100%)]"></div>
          </div>
          <div className="relative">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-2xl mb-4 animate-bounce">
              <svg className="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Thanh Toán Thành Công!</h1>
            <p className="text-lg text-white opacity-90">Cảm ơn bạn đã đặt xe. Thông tin đặt xe đã được gửi cho nhân viên.</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Invoice Header */}
          <div className="flex flex-col md:flex-row justify-between gap-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-l-4 border-indigo-500">
            <div>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">EV Rental System</h2>
              <div className="space-y-1 text-gray-700">
                <p>123 Nguyễn Huệ, Quận 1, TP.HCM</p>
                <p>Hotline: 1900-xxxx</p>
                <p>Email: support@evrental.com</p>
              </div>
            </div>
            <div className="md:text-right">
              <h3 className="text-xl font-bold text-purple-600 mb-3">HÓA ĐƠN THANH TOÁN</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong className="text-gray-900">Số HĐ:</strong> {booking.bookingId}</p>
                <p><strong className="text-gray-900">Ngày:</strong> {new Date().toLocaleString('vi-VN')}</p>
                <p>
                  <strong className="text-gray-900">Trạng thái:</strong>{' '}
                  <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Đã thanh toán
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-blue-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>👤</span> Thông tin khách hàng
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <span className="text-sm text-gray-500 block mb-1">Họ tên</span>
                <span className="font-semibold text-gray-900">{booking.user?.fullName}</span>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <span className="text-sm text-gray-500 block mb-1">Email</span>
                <span className="font-semibold text-gray-900">{booking.user?.email}</span>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <span className="text-sm text-gray-500 block mb-1">Số điện thoại</span>
                <span className="font-semibold text-gray-900">{booking.bookingData?.phone}</span>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <span className="text-sm text-gray-500 block mb-1">Mã khách hàng</span>
                <span className="font-semibold text-gray-900">{booking.user?.userId}</span>
              </div>
            </div>
          </div>

          {/* Vehicle & Rental Info */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-purple-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🚗</span> Thông tin thuê xe
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm">
                {booking.vehicle?.image && (
                  <img 
                    src={booking.vehicle.image} 
                    alt={booking.vehicle.name} 
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{booking.vehicle?.name}</h4>
                  <p className="text-gray-600">
                    {booking.vehicle?.type === 'car' ? 'Ô tô' : 
                     booking.vehicle?.type === 'scooter' ? 'Xe máy' : 
                     'Xe đạp'} điện
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <span className="text-sm text-gray-500 block mb-1">Trạm nhận</span>
                  <span className="font-semibold text-gray-900">{booking.bookingData?.pickupLocation}</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <span className="text-sm text-gray-500 block mb-1">Ngày nhận</span>
                  <span className="font-semibold text-gray-900">{new Date(booking.bookingData?.startDate).toLocaleString('vi-VN')}</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <span className="text-sm text-gray-500 block mb-1">Ngày trả</span>
                  <span className="font-semibold text-gray-900">{new Date(booking.bookingData?.endDate).toLocaleString('vi-VN')}</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <span className="text-sm text-gray-500 block mb-1">Số ngày thuê</span>
                  <span className="font-semibold text-indigo-600 text-lg">{booking.days} ngày</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>💰</span> Chi tiết thanh toán
            </h3>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mô tả</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Số lượng</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Đơn giá</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">Thuê xe {booking.vehicle?.name}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{booking.days} ngày</td>
                    <td className="px-4 py-3 text-right text-gray-700">{(booking.vehicle?.price || 0).toLocaleString('vi-VN')}k VNĐ/ngày</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{(booking.totalPrice || 0).toLocaleString('vi-VN')} VNĐ</td>
                  </tr>
                  <tr className="bg-yellow-50 hover:bg-yellow-100">
                    <td colSpan="3" className="px-4 py-3 text-gray-700 font-medium">Đặt cọc (30%)</td>
                    <td className="px-4 py-3 text-right font-bold text-yellow-600">{(booking.deposit || 0).toLocaleString('vi-VN')} VNĐ</td>
                  </tr>
                </tbody>
                <tfoot className="bg-gradient-to-r from-green-100 to-emerald-100">
                  <tr>
                    <td colSpan="3" className="px-4 py-4 text-gray-900 font-bold text-lg">TỔNG THANH TOÁN</td>
                    <td className="px-4 py-4 text-right font-bold text-green-600 text-xl">{(booking.totalPrice || 0).toLocaleString('vi-VN')} VNĐ</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>💳</span> Phương thức thanh toán
            </h3>
            <div className="bg-white rounded-lg p-5 shadow-sm flex items-center gap-4">
              <span className="text-5xl">
                {booking.payment?.method === 'credit_card' ? '💳' :
                 booking.payment?.method === 'bank_transfer' ? '🏦' :
                 booking.payment?.method === 'momo' ? '📱' : '💰'}
              </span>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">
                  {booking.payment?.method === 'credit_card' ? 'Thẻ tín dụng/Ghi nợ' :
                   booking.payment?.method === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                   booking.payment?.method === 'momo' ? 'Ví MoMo' : 'Tiền mặt'}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {new Date(booking.payment?.paidAt || booking.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border-l-4 border-orange-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📋</span> Các bước tiếp theo
            </h3>
            <ol className="space-y-4 bg-white rounded-lg p-5 shadow-sm">
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-bold flex-shrink-0">1</span>
                <div>
                  <strong className="text-gray-900 block mb-1">Chờ nhân viên gửi thông tin xe</strong>
                  <p className="text-gray-600 text-sm">Nhân viên sẽ kiểm tra và chụp ảnh xe cho bạn</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-bold flex-shrink-0">2</span>
                <div>
                  <strong className="text-gray-900 block mb-1">Xác nhận thông tin xe</strong>
                  <p className="text-gray-600 text-sm">Bạn sẽ nhận được thông báo khi ảnh xe đã sẵn sàng</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-bold flex-shrink-0">3</span>
                <div>
                  <strong className="text-gray-900 block mb-1">Đến trạm nhận xe</strong>
                  <p className="text-gray-600 text-sm">Mang theo CCCD/CMND và GPLX gốc đến trạm đúng giờ</p>
                </div>
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              className="flex-1 px-8 py-4 bg-white border-2 border-indigo-500 text-indigo-600 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg print:hidden"
              onClick={handlePrint}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              In hóa đơn
            </button>
            <button 
              className="flex-1 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 print:hidden"
              onClick={handleContinue}
            >
              Tiếp tục
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* Footer Note */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-center print:hidden">
            <p className="text-gray-700 leading-relaxed">
              <span className="text-2xl mr-2">⚠️</span>
              <strong className="text-gray-900">Lưu ý:</strong> Vui lòng giữ hóa đơn này để đối chiếu khi nhận xe. 
              Mọi thắc mắc xin liên hệ hotline <strong className="text-indigo-600">1900-xxxx</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessBill;
