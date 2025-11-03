import React, { useState } from 'react';

const PaymentView = ({ 
  contractData, 
  onPaymentComplete,
  onBack 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [processing, setProcessing] = useState(false);

  // Safe access to contractData properties
  const totalPrice = contractData?.totalPrice || 0;
  const deposit = contractData?.deposit || 0;
  const vehicle = contractData?.vehicle || {};
  const bookingData = contractData?.bookingData || {};
  const days = contractData?.days || 0;

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      onPaymentComplete({
        method: paymentMethod,
        transactionId: `TXN-${Date.now()}`,
        paidAt: new Date().toISOString(),
        amount: totalPrice
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            THANH TOÁN
          </h1>
          <p className="text-gray-600">Hoàn tất thanh toán để xác nhận đặt xe</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              Thông tin đơn hàng
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <img 
                  src={vehicle.image || '/placeholder-vehicle.png'} 
                  alt={vehicle.name || 'Vehicle'} 
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{vehicle.name || 'N/A'}</h3>
                  <p className="text-gray-600">{days} ngày × {vehicle.price || 0}k VNĐ</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">Tổng giá thuê:</span>
                  <span className="font-semibold text-gray-900">{totalPrice.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">Đặt cọc (30%):</span>
                  <span className="font-semibold text-orange-600">{deposit.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-4">
                  <span className="text-lg font-bold text-gray-900">TỔNG THANH TOÁN:</span>
                  <span className="text-2xl font-bold text-green-600">{totalPrice.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="font-semibold text-gray-800 mb-2">⏰ Thời gian:</p>
                <p className="text-gray-700">{bookingData.startDate ? new Date(bookingData.startDate).toLocaleString('vi-VN') : 'N/A'}</p>
                <p className="text-gray-500 text-center my-1">↓</p>
                <p className="text-gray-700">{bookingData.endDate ? new Date(bookingData.endDate).toLocaleString('vi-VN') : 'N/A'}</p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <p className="font-semibold text-gray-800">📍 Nhận xe tại: <span className="text-purple-600">{bookingData.pickupLocation || 'N/A'}</span></p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              hương thức thanh toán
            </h2>
            
            <div className="space-y-3 mb-6">
              <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'momo' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="momo"
                  checked={paymentMethod === 'momo'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <img src="https://developers.momo.vn/v3/img/logo.svg" alt="MoMo" className="w-10 h-10" />
                  <span className="font-semibold text-gray-800">Ví MoMo</span>
                </div>
              </label>

              <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="vnpay"
                  checked={paymentMethod === 'vnpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png" alt="VNPay" className="w-10 h-10" />
                  <span className="font-semibold text-gray-800">VNPay</span>
                </div>
              </label>

              <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'zalopay' ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="zalopay"
                  checked={paymentMethod === 'zalopay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" alt="ZaloPay" className="w-10 h-10" />
                  <span className="font-semibold text-gray-800">ZaloPay</span>
                </div>
              </label>

              <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'banking' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="banking"
                  checked={paymentMethod === 'banking'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  {/* <span className="text-3xl">🏦</span> */}
                  <span className="font-semibold text-gray-800">Chuyển khoản ngân hàng</span>
                </div>
              </label>

              <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  {/* <span className="text-3xl">💵</span> */}
                  <span className="font-semibold text-gray-800">Thanh toán khi nhận xe</span>
                </div>
              </label>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 space-y-2 mb-6">
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <span></span> Thông tin thanh toán được mã hóa và bảo mật tuyệt đối
              </p>
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <span></span> Bạn có thể hủy đơn miễn phí trước 24h
              </p>
            </div>

            {/* Payment Actions */}
            <div className="flex gap-4">
              <button 
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors" 
                onClick={onBack}
              >
                ← Quay lại
              </button>
              <button 
                className="flex-[2] px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Đang xử lý...
                  </span>
                ) : (
                  `Thanh toán ${totalPrice.toLocaleString('vi-VN')} VNĐ`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentView;
