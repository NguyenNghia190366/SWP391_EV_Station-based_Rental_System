import React from 'react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors mb-4" 
            onClick={onCancel}
          >
            ← Quay lại
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Đặt xe: {vehicle.name}
          </h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Vehicle Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
              <div className="relative h-64">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-indigo-600 font-bold">⚡ {vehicle.battery}%</span>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{vehicle.name}</h2>
                <p className="text-3xl font-bold text-indigo-600 mb-4">{vehicle.price}k VNĐ/ngày</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    📍 {vehicle.station.name}
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                    ⭐ {vehicle.rating}/5
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                📝 Thông tin đặt xe
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Khách hàng</label>
                  <input 
                    type="text" 
                    value={user.fullName} 
                    disabled 
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    disabled 
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại *</label>
                  <input 
                    type="tel" 
                    value={bookingData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Nhập số điện thoại"
                    required
                    className="w-full font-semibold text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày bắt đầu *</label>
                    <input 
                      type="datetime-local" 
                      value={bookingData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      required
                      className="w-full font-semibold text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày kết thúc *</label>
                    <input 
                      type="datetime-local" 
                      value={bookingData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      min={bookingData.startDate || new Date().toISOString().slice(0, 16)}
                      required
                      className="w-full font-semibold text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Địa điểm nhận xe</label>
                  <select 
                    value={bookingData.pickupLocation}
                    onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                    className="w-full font-semibold text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value={vehicle.station.name}>{vehicle.station.name}</option>
                    <option value="Trạm Quận 1">Trạm Quận 1</option>
                    <option value="Trạm Quận 3">Trạm Quận 3</option>
                    <option value="Trạm Quận 7">Trạm Quận 7</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú (tùy chọn)</label>
                  <textarea 
                    value={bookingData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Ghi chú đặc biệt..."
                    rows={3}
                    className="w-full font-semibold text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                {/* Price Summary */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Giá thuê:</span>
                    <span className="font-semibold text-gray-900">{calculateTotalPrice().toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Đặt cọc (30%):</span>
                    <span className="font-semibold text-orange-600">{calculateDeposit().toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <div className="border-t-2 border-indigo-200 pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Tổng thanh toán:</span>
                    <span className="text-2xl font-bold text-indigo-600">{calculateTotalPrice().toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button 
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors" 
                    onClick={onCancel}
                  >
                    Hủy
                  </button>
                  <button 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
};

export default BookingView;
