import React, { useState } from 'react';

const ContractView = ({ 
  contractData, 
  onAccept, 
  onDecline,
  onSignatureChange,
  signingMethod,
  onSigningMethodChange
}) => {
  const { vehicle, bookingData, user, totalPrice, deposit } = contractData;
  
  // State for signature method selection - use prop if provided, otherwise local state
  const [localSignatureMethod, setLocalSignatureMethod] = useState('electronic');
  const signatureMethod = signingMethod !== undefined ? signingMethod : localSignatureMethod;
  
  const [isAgreed, setIsAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  
  const handleSignatureMethodChange = (method) => {
    if (onSigningMethodChange) {
      onSigningMethodChange(method);
    } else {
      setLocalSignatureMethod(method);
    }
    setIsAgreed(false);
    setSignature('');
    if (onSignatureChange) {
      onSignatureChange('');
    }
  };
  
  const handleAgreementChange = (checked) => {
    setIsAgreed(checked);
    // Don't auto-fill signature, let user type
    if (!checked) {
      setSignature('');
      if (onSignatureChange) {
        onSignatureChange('');
      }
    }
  };
  
  const handleSignatureInput = (value) => {
    setSignature(value);
    if (onSignatureChange) {
      onSignatureChange(value);
    }
    // Automatically check agreement when user starts typing signature
    if (value && !isAgreed) {
      setIsAgreed(true);
    }
  };

  const calculateDays = () => {
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-8 px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">📄 HỢP ĐỒNG THUÊ XE ĐIỆN</h1>
          <p className="text-indigo-100 text-sm md:text-base">Số hợp đồng: EVR-{Date.now()}</p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Parties Section */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">I</span>
              CÁC BÊN THAM GIA HỢP ĐỒNG
            </h2>
            
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-4 border border-indigo-100">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center">
                🏢 BÊN CHO THUÊ (Bên A):
              </h3>
              <div className="space-y-2 text-gray-700">
                <p><strong className="text-gray-900">Công ty:</strong> EV Rental System Co., Ltd</p>
                <p><strong className="text-gray-900">Địa chỉ:</strong> 123 Nguyễn Huệ, Quận 1, TP.HCM</p>
                <p><strong className="text-gray-900">Điện thoại:</strong> 1900-xxxx</p>
                <p><strong className="text-gray-900">Mã số thuế:</strong> 0123456789</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                👤 BÊN THUÊ (Bên B):
              </h3>
              <div className="space-y-2 text-gray-700">
                <p><strong className="text-gray-900">Họ tên:</strong> {user.fullName}</p>
                <p><strong className="text-gray-900">Email:</strong> {user.email}</p>
                <p><strong className="text-gray-900">Số điện thoại:</strong> {bookingData.phone}</p>
                <p><strong className="text-gray-900">Mã khách hàng:</strong> {user.userId}</p>
              </div>
            </div>
          </section>

          {/* Vehicle Details */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">II</span>
              THÔNG TIN XE THUÊ
            </h2>
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name} 
                  className="w-full md:w-48 h-48 object-cover rounded-lg shadow-md"
                />
                <div className="flex-1 space-y-2 text-gray-700">
                  <p className="text-xl font-bold text-gray-900">{vehicle.name}</p>
                  <p><strong className="text-gray-900">Loại xe:</strong> {vehicle.type === 'car' ? 'Ô tô' : vehicle.type === 'scooter' ? 'Xe máy' : 'Xe đạp'} điện</p>
                  <p><strong className="text-gray-900">Trạm nhận xe:</strong> {bookingData.pickupLocation}</p>
                  <p><strong className="text-gray-900">Dung lượng pin:</strong> {vehicle.battery}%</p>
                  <p><strong className="text-gray-900">Quãng đường:</strong> ~{vehicle.range} km</p>
                </div>
              </div>
            </div>
          </section>

          {/* Rental Period */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">III</span>
              THỜI GIAN THUÊ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-600 font-semibold mb-1">📅 Ngày bắt đầu</p>
                <p className="text-lg font-bold text-green-900">{new Date(bookingData.startDate).toLocaleString('vi-VN')}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-sm text-red-600 font-semibold mb-1">📅 Ngày kết thúc</p>
                <p className="text-lg font-bold text-red-900">{new Date(bookingData.endDate).toLocaleString('vi-VN')}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-600 font-semibold mb-1">⏱️ Tổng số ngày</p>
                <p className="text-lg font-bold text-blue-900">{calculateDays()} ngày</p>
              </div>
            </div>
          </section>

          {/* Financial Terms */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">IV</span>
              ĐIỀU KHOẢN TÀI CHÍNH
            </h2>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-200 space-y-3">
              <div className="flex justify-between items-center text-gray-700 py-2 border-b border-amber-200">
                <span>Giá thuê:</span>
                <span className="font-semibold">{vehicle.price}k VNĐ/ngày</span>
              </div>
              <div className="flex justify-between items-center text-gray-700 py-2 border-b border-amber-200">
                <span>Số ngày thuê:</span>
                <span className="font-semibold">{calculateDays()} ngày</span>
              </div>
              <div className="flex justify-between items-center text-lg text-gray-800 py-2 border-b-2 border-amber-300">
                <span className="font-semibold">Tổng giá thuê:</span>
                <span className="font-bold">{totalPrice.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between items-center text-lg text-orange-700 py-2 border-b-2 border-amber-300">
                <span className="font-semibold">Đặt cọc (30%):</span>
                <span className="font-bold">{deposit.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between items-center text-2xl text-indigo-900 py-3 bg-amber-100 rounded-lg px-4 mt-2">
                <span className="font-bold">💰 TỔNG THANH TOÁN:</span>
                <span className="font-bold">{totalPrice.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>
          </section>

          {/* Terms & Conditions */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">V</span>
              ĐIỀU KHOẢN & ĐIỀU KIỆN
            </h2>
            <ol className="space-y-3 text-gray-700">
              <li className="flex gap-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
                <span className="font-bold text-indigo-600 min-w-[24px]">1.</span>
                <span>Bên B cam kết sử dụng xe đúng mục đích và tuân thủ luật giao thông.</span>
              </li>
              <li className="flex gap-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
                <span className="font-bold text-indigo-600 min-w-[24px]">2.</span>
                <span>Bên B chịu trách nhiệm về mọi vi phạm luật giao thông trong thời gian thuê.</span>
              </li>
              <li className="flex gap-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
                <span className="font-bold text-indigo-600 min-w-[24px]">3.</span>
                <span>Bên B phải trả xe đúng thời hạn và ở tình trạng như khi nhận.</span>
              </li>
              <li className="flex gap-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
                <span className="font-bold text-indigo-600 min-w-[24px]">4.</span>
                <span>Mọi hư hỏng do Bên B gây ra sẽ được Bên A khấu trừ từ tiền đặt cọc.</span>
              </li>
              <li className="flex gap-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
                <span className="font-bold text-indigo-600 min-w-[24px]">5.</span>
                <span>Bên B phải có Giấy phép lái xe hợp lệ (đã được xác thực).</span>
              </li>
              <li className="flex gap-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
                <span className="font-bold text-indigo-600 min-w-[24px]">6.</span>
                <span>Bên A có quyền từ chối cho thuê nếu phát hiện vi phạm điều khoản.</span>
              </li>
              <li className="flex gap-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
                <span className="font-bold text-indigo-600 min-w-[24px]">7.</span>
                <span>Trả xe trễ sẽ bị tính phí: 50.000 VNĐ/giờ.</span>
              </li>
              <li className="flex gap-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
                <span className="font-bold text-indigo-600 min-w-[24px]">8.</span>
                <span>Hợp đồng có hiệu lực kể từ khi cả hai bên ký xác nhận.</span>
              </li>
            </ol>
          </section>

          {/* Signatures */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">VI</span>
              PHƯƠNG THỨC KÝ HỢP ĐỒNG
            </h2>
            
            {/* Signature Method Selection */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label 
                  className={`cursor-pointer transition-all duration-300 ${
                    signatureMethod === 'electronic' 
                      ? 'ring-4 ring-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50' 
                      : 'bg-white hover:bg-gray-50'
                  } rounded-xl border-2 ${
                    signatureMethod === 'electronic' ? 'border-indigo-500' : 'border-gray-200'
                  } p-6`}
                  onClick={() => handleSignatureMethodChange('electronic')}
                >
                  <input 
                    type="radio" 
                    name="signatureMethod" 
                    value="electronic"
                    checked={signatureMethod === 'electronic'}
                    onChange={() => handleSignatureMethodChange('electronic')}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <span className="text-5xl mb-3 block">📱</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ký điện tử</h3>
                    <p className="text-gray-600 text-sm">Ký ngay trực tuyến, nhanh chóng và tiện lợi</p>
                  </div>
                </label>
                
                <label 
                  className={`cursor-pointer transition-all duration-300 ${
                    signatureMethod === 'paper' 
                      ? 'ring-4 ring-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50' 
                      : 'bg-white hover:bg-gray-50'
                  } rounded-xl border-2 ${
                    signatureMethod === 'paper' ? 'border-indigo-500' : 'border-gray-200'
                  } p-6`}
                  onClick={() => handleSignatureMethodChange('paper')}
                >
                  <input 
                    type="radio" 
                    name="signatureMethod" 
                    value="paper"
                    checked={signatureMethod === 'paper'}
                    onChange={() => handleSignatureMethodChange('paper')}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <span className="text-5xl mb-3 block">📄</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ký trực tiếp</h3>
                    <p className="text-gray-600 text-sm">Ký tại trạm với nhân viên, có giấy tờ xác thực</p>
                  </div>
                </label>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center mt-8">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">VII</span>
              CHỮ KÝ XÁC NHẬN
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center justify-center">
                  🏢 BÊN CHO THUÊ
                </h4>
                <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-center min-h-[80px] border border-indigo-200">
                  <img 
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='80'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23667eea' font-size='24' font-family='Brush Script MT, cursive'%3EEV Rental%3C/text%3E%3C/svg%3E" 
                    alt="Company signature" 
                  />
                </div>
                <p className="text-center text-sm text-gray-600">
                  Ngày: {new Date().toLocaleDateString('vi-VN')}
                </p>
              </div>

              {signatureMethod === 'electronic' ? (
                // Electronic Signature
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                  <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center justify-center">
                    👤 BÊN THUÊ
                  </h4>
                  {signature ? (
                    <div className="bg-white rounded-lg p-4 mb-4 min-h-[80px] border border-blue-200">
                      <p className="text-2xl font-bold text-center text-indigo-600 italic" style={{fontFamily: 'Brush Script MT, cursive'}}>
                        {signature}
                      </p>
                      <button 
                        className="mt-3 w-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm"
                        onClick={() => {
                          setSignature('');
                          setIsAgreed(false);
                          if (onSignatureChange) {
                            onSignatureChange('');
                          }
                        }}
                      >
                        ✕ Xóa chữ ký
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-4 mb-4 min-h-[80px] border border-blue-200">
                      <input 
                        type="text" 
                        placeholder="Nhập họ tên để xác nhận"
                        className="w-full text-center text-lg font-semibold text-gray-700 bg-transparent border-b-2 border-blue-300 focus:border-indigo-500 outline-none pb-2 mb-2"
                        value={signature}
                        onChange={(e) => handleSignatureInput(e.target.value)}
                      />
                      <p className="text-center text-xs text-gray-500 mt-2">
                        ✍️ Gõ tên của bạn để ký điện tử
                      </p>
                    </div>
                  )}
                  <p className="text-center text-sm text-gray-600">
                    Ngày: {new Date().toLocaleDateString('vi-VN')}
                  </p>
                </div>
              ) : (
                // Paper Signature Info
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
                  <h4 className="text-lg font-bold text-amber-900 mb-4 flex items-center justify-center">
                    👤 BÊN THUÊ
                  </h4>
                  <div className="bg-white rounded-lg p-4 mb-4 border border-amber-200">
                    <p className="flex items-center gap-2 mb-3 text-amber-900 font-semibold">
                      <span className="text-2xl">📝</span>
                      <strong>Hợp đồng sẽ được ký trực tiếp tại trạm</strong>
                    </p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p className="flex items-start gap-2">
                        <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded min-w-[24px] text-center">1</span>
                        <span>Mang theo CCCD/CMND gốc</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded min-w-[24px] text-center">2</span>
                        <span>Mang theo Giấy phép lái xe gốc</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded min-w-[24px] text-center">3</span>
                        <span>Đến trạm: <strong className="text-amber-900">{bookingData.pickupLocation}</strong></span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded min-w-[24px] text-center">4</span>
                        <span>Nhân viên sẽ in hợp đồng để bạn ký</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded min-w-[24px] text-center">5</span>
                        <span>Ký xác nhận và nhận xe</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-600">
                    Ngày hẹn: {new Date(bookingData.startDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Agreement Checkbox */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
            <label className="flex items-start gap-4 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isAgreed}
                onChange={(e) => handleAgreementChange(e.target.checked)}
                className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-gray-700 leading-relaxed">
                {signatureMethod === 'electronic' ? (
                  <>
                    Tôi đã đọc và đồng ý với tất cả các điều khoản trong hợp đồng này. 
                    Tôi cam kết chịu trách nhiệm về mọi thiệt hại phát sinh trong thời gian thuê xe.
                  </>
                ) : (
                  <>
                    Tôi xác nhận sẽ đến trạm <strong className="text-indigo-900">{bookingData.pickupLocation}</strong> vào ngày{' '}
                    <strong className="text-indigo-900">{new Date(bookingData.startDate).toLocaleDateString('vi-VN')}</strong> để ký hợp đồng 
                    và nhận xe. Tôi sẽ mang theo đầy đủ giấy tờ cần thiết.
                  </>
                )}
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              onClick={onDecline}
            >
              <span className="text-xl">✕</span>
              <span>Từ chối</span>
            </button>
            <button 
              className={`flex-1 font-bold py-4 px-6 rounded-xl shadow-lg transition duration-300 transform flex items-center justify-center gap-2 ${
                !isAgreed || (signatureMethod === 'electronic' && !signature)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:shadow-xl hover:scale-105'
              }`}
              onClick={onAccept}
              disabled={!isAgreed || (signatureMethod === 'electronic' && !signature)}
            >
              {signatureMethod === 'electronic' ? (
                <>
                  <span className="text-xl">✓</span>
                  <span>Đồng ý & Thanh toán</span>
                </>
              ) : (
                <>
                  <span className="text-xl">📅</span>
                  <span>Xác nhận đặt lịch</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractView;
