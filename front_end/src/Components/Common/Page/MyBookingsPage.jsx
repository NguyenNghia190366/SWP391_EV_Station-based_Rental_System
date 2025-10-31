import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Tabs, Tag, Empty } from 'antd';
import { CarOutlined, HistoryOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    loadMyBookings();
  }, []);

  const loadMyBookings = () => {
    try {
      setLoading(true);
      
      // In real app: await bookingAPI.getMyBookings();
      // For now, get from localStorage
      const myBookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
      
      // Sort by created date, newest first
      const sortedBookings = myBookings.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setBookings(sortedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      message.error('Không thể tải lịch sử thuê xe!');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'payment_completed': 'orange',
      'vehicle_preview_sent': 'blue',
      'confirmed_vehicle': 'cyan',
      'active': 'green',
      'completed': 'default',
      'cancelled': 'red'
    };
    return statusColors[status] || 'default';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'payment_completed': 'Chờ xác nhận',
      'vehicle_preview_sent': 'Chờ bạn xác nhận xe',
      'confirmed_vehicle': 'Đã xác nhận',
      'active': 'Đang thuê',
      'completed': 'Đã hoàn thành',
      'cancelled': 'Đã hủy'
    };
    return statusTexts[status] || status;
  };

  const handleViewDetails = (booking) => {
    if (booking.status === 'vehicle_preview_sent') {
      navigate(`/vehicle-preview/${booking.bookingId}`);
    } else if (booking.status === 'confirmed_vehicle') {
      navigate(`/checkin-prepare/${booking.bookingId}`);
    } else if (booking.status === 'active') {
      navigate(`/rental/${booking.bookingId}`);
    }
  };

  const getActionButton = (booking) => {
    if (booking.status === 'vehicle_preview_sent') {
      return (
        <button 
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-all"
          onClick={() => handleViewDetails(booking)}
        >
          📸 Xem ảnh xe
        </button>
      );
    } else if (booking.status === 'confirmed_vehicle') {
      return (
        <button 
          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg transition-all"
          onClick={() => handleViewDetails(booking)}
        >
          ✅ Chuẩn bị nhận xe
        </button>
      );
    } else if (booking.status === 'active') {
      return (
        <button 
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg transition-all"
          onClick={() => handleViewDetails(booking)}
        >
          📋 Xem chi tiết
        </button>
      );
    }
    return null;
  };

  const filterBookingsByTab = (tab) => {
    if (tab === 'active') {
      return bookings.filter(b => 
        ['payment_completed', 'vehicle_preview_sent', 'confirmed_vehicle', 'active'].includes(b.status)
      );
    } else if (tab === 'completed') {
      return bookings.filter(b => b.status === 'completed');
    } else if (tab === 'cancelled') {
      return bookings.filter(b => b.status === 'cancelled');
    }
    return bookings;
  };

  const activeBookings = filterBookingsByTab('active');
  const completedBookings = filterBookingsByTab('completed');
  const cancelledBookings = filterBookingsByTab('cancelled');

  const BookingCard = ({ booking }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Mã booking:</span>
          <strong className="text-indigo-600 font-bold">{booking.bookingId}</strong>
        </div>
        <Tag color={getStatusColor(booking.status)}>
          {getStatusText(booking.status)}
        </Tag>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex gap-4 pb-4 border-b border-gray-200">
          {booking.vehicle?.image && (
            <img 
              src={booking.vehicle.image} 
              alt={booking.vehicle.name} 
              className="w-24 h-24 object-cover rounded-lg shadow-md"
            />
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-1">{booking.vehicle?.name}</h3>
            <p className="text-gray-600">
              {booking.vehicle?.type === 'car' ? '🚗 Ô tô' : 
               booking.vehicle?.type === 'scooter' ? '🛵 Xe máy' : 
               '🚲 Xe đạp'} điện
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">📍</span>
            <div className="flex-1">
              <span className="text-sm text-gray-600">Trạm nhận:</span>
              <p className="font-semibold text-gray-800">{booking.bookingData?.pickupLocation}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">📅</span>
            <div className="flex-1">
              <span className="text-sm text-gray-600">Thời gian:</span>
              <p className="font-semibold text-gray-800">
                {new Date(booking.bookingData?.startDate).toLocaleDateString('vi-VN')} - {new Date(booking.bookingData?.endDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">⏱️</span>
            <div className="flex-1">
              <span className="text-sm text-gray-600">Số ngày:</span>
              <p className="font-semibold text-gray-800">{booking.days} ngày</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">💰</span>
            <div className="flex-1">
              <span className="text-sm text-gray-600">Tổng tiền:</span>
              <p className="text-xl font-bold text-indigo-600">{booking.totalPrice?.toLocaleString('vi-VN')} VNĐ</p>
            </div>
          </div>
        </div>

        {getActionButton(booking) && (
          <div className="pt-4 border-t border-gray-200">
            {getActionButton(booking)}
          </div>
        )}
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <span className="text-sm text-gray-500">
          🕐 Đặt lúc: {new Date(booking.createdAt).toLocaleString('vi-VN')}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <HistoryOutlined /> Lịch sử thuê xe
          </h1>
          <p className="text-gray-600 mt-2">Quản lý các đơn thuê xe của bạn</p>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <TabPane 
            tab={
              <span className="flex items-center gap-2">
                <ClockCircleOutlined />
                Đang hoạt động ({activeBookings.length})
              </span>
            } 
            key="active"
          >
            {activeBookings.length === 0 ? (
              <div className="py-12">
                <Empty description="Chưa có booking nào đang hoạt động" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {activeBookings.map(booking => (
                  <BookingCard key={booking.bookingId} booking={booking} />
                ))}
              </div>
            )}
          </TabPane>

          <TabPane 
            tab={
              <span className="flex items-center gap-2">
                <CarOutlined />
                Đã hoàn thành ({completedBookings.length})
              </span>
            } 
            key="completed"
          >
            {completedBookings.length === 0 ? (
              <div className="py-12">
                <Empty description="Chưa có booking nào đã hoàn thành" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {completedBookings.map(booking => (
                  <BookingCard key={booking.bookingId} booking={booking} />
                ))}
              </div>
            )}
          </TabPane>

          <TabPane 
            tab={
              <span className="flex items-center gap-2">
                ❌ Đã hủy ({cancelledBookings.length})
              </span>
            } 
            key="cancelled"
          >
            {cancelledBookings.length === 0 ? (
              <div className="py-12">
                <Empty description="Chưa có booking nào bị hủy" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {cancelledBookings.map(booking => (
                  <BookingCard key={booking.bookingId} booking={booking} />
                ))}
              </div>
            )}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default MyBookingsPage;
