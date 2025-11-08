import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Button, Modal, message, Input, Space, Card, Badge, Statistic } from 'antd';
import { 
  EyeOutlined, 
  SendOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ReloadOutlined,
  ClockCircleFilled,
  MailOutlined,
  CheckCircleFilled,
  CarFilled,
  FileTextOutlined,
  PhoneOutlined,
  CalendarOutlined,
  DollarOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const { Search } = Input;

const BookingRequestsManagement = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadBookingRequests();
  }, []);

  useEffect(() => {
    // Filter bookings based on search
    if (searchText) {
      const filtered = bookings.filter(booking =>
        booking.bookingId?.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.user?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.user?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.vehicle?.name?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredBookings(filtered);
    } else {
      setFilteredBookings(bookings);
    }
  }, [searchText, bookings]);

  const loadBookingRequests = async () => {
    try {
      setLoading(true);

      // In real app: await bookingAPI.getPendingBookings();
      // For now, get from localStorage
      const allBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
      
      // Sort by created date, newest first
      const sortedBookings = allBookings.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setBookings(sortedBookings);
      setFilteredBookings(sortedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      message.error('Không thể tải danh sách đặt xe!');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedBooking(record);
    setDetailModalVisible(true);
  };

  const handleSendVehicleInfo = (bookingId) => {
    navigate(`/staff/send-vehicle-preview/${bookingId}`);
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
      'payment_completed': 'Chờ gửi thông tin xe',
      'vehicle_preview_sent': 'Đã gửi thông tin xe',
      'confirmed_vehicle': 'Khách đã xác nhận',
      'active': 'Đang thuê',
      'completed': 'Đã hoàn thành',
      'cancelled': 'Đã hủy'
    };
    return statusTexts[status] || status;
  };

  const columns = [
    {
      title: 'Mã Booking',
      dataIndex: 'bookingId',
      key: 'bookingId',
      width: 150,
      render: (text) => (
        <div className="font-semibold text-blue-600">
          #{text}
        </div>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-800">{record.user?.fullName}</div>
          <div className="text-xs text-gray-500">{record.user?.email}</div>
        </div>
      ),
    },
    {
      title: 'Xe',
      key: 'vehicle',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {record.vehicle?.image && (
            <img 
              src={record.vehicle.image} 
              alt={record.vehicle.name}
              className="w-14 h-10 object-cover rounded-lg shadow-sm"
            />
          )}
          <span className="font-medium">{record.vehicle?.name}</span>
        </div>
      ),
    },
    {
      title: 'Thời gian nhận',
      dataIndex: ['bookingData', 'startDate'],
      key: 'startDate',
      width: 150,
      render: (date) => (
        <div className="text-gray-700">
          {new Date(date).toLocaleDateString('vi-VN')}
        </div>
      ),
    },
    {
      title: 'Số ngày',
      dataIndex: 'days',
      key: 'days',
      width: 100,
      align: 'center',
      render: (days) => (
        <Badge 
          count={`${days} ngày`} 
          style={{ backgroundColor: '#667eea' }}
        />
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      align: 'right',
      render: (price) => (
        <div className="font-semibold text-green-600">
          {(price || 0).toLocaleString('vi-VN')} đ
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status) => (
        <Tag color={getStatusColor(status)} className="font-medium">
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            className="hover:border-blue-400 hover:text-blue-500"
          >
            Xem
          </Button>
          {record.status === 'payment_completed' && (
            <Button
              type="primary"
              size="small"
              icon={<SendOutlined />}
              onClick={() => handleSendVehicleInfo(record.bookingId)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 border-0 hover:from-green-600 hover:to-emerald-600"
            >
              Gửi ảnh
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const summaryStats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'payment_completed').length,
    sent: bookings.filter(b => b.status === 'vehicle_preview_sent').length,
    confirmed: bookings.filter(b => b.status === 'confirmed_vehicle').length,
    active: bookings.filter(b => b.status === 'active').length,
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📋 Quản lý Booking Request</h2>
          <p className="text-gray-600 mt-1">Danh sách các đơn đặt xe cần xử lý</p>
        </div>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={loadBookingRequests}
          className="bg-gradient-to-r from-green-500 to-emerald-500 border-0 hover:from-green-600 hover:to-emerald-600 shadow-md"
          size="large"
        >
          Làm mới
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <FileTextOutlined className="text-2xl text-white" />
            </div>
            <div>
              <Statistic 
                value={summaryStats.total} 
                valueStyle={{ color: '#667eea', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className="text-gray-600 text-sm font-medium mt-1">Tổng booking</div>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <ClockCircleFilled className="text-2xl text-white" />
            </div>
            <div>
              <Statistic 
                value={summaryStats.pending} 
                valueStyle={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className="text-gray-600 text-sm font-medium mt-1">Chờ gửi ảnh</div>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              <MailOutlined className="text-2xl text-white" />
            </div>
            <div>
              <Statistic 
                value={summaryStats.sent} 
                valueStyle={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className="text-gray-600 text-sm font-medium mt-1">Đã gửi ảnh</div>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg">
              <CheckCircleFilled className="text-2xl text-white" />
            </div>
            <div>
              <Statistic 
                value={summaryStats.confirmed} 
                valueStyle={{ color: '#06b6d4', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className="text-gray-600 text-sm font-medium mt-1">Đã xác nhận</div>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <CarFilled className="text-2xl text-white" />
            </div>
            <div>
              <Statistic 
                value={summaryStats.active} 
                valueStyle={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className="text-gray-600 text-sm font-medium mt-1">Đang thuê</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div>
        <Search
          placeholder="🔍 Tìm theo mã booking, tên khách, email, xe..."
          allowClear
          size="large"
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-xl shadow-sm"
        />
      </div>

      {/* Table */}
      <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey="bookingId"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} booking`,
            className: 'px-4 py-2'
          }}
          className="booking-table"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            📄 Chi tiết Booking
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" size="large" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          selectedBooking?.status === 'payment_completed' && (
            <Button
              key="send"
              type="primary"
              size="large"
              icon={<SendOutlined />}
              onClick={() => {
                setDetailModalVisible(false);
                handleSendVehicleInfo(selectedBooking.bookingId);
              }}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 border-0 hover:from-blue-600 hover:to-cyan-600"
            >
              Gửi ảnh xe cho khách
            </Button>
          ),
        ]}
        width={800}
        className="booking-detail-modal"
      >
        {selectedBooking && (
          <div className="space-y-6 py-4">
            {/* Customer Info */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white text-sm">👤</span>
                </div>
                Thông tin khách hàng
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-blue-500 text-lg">👤</div>
                  <div>
                    <div className="text-xs text-gray-500">Họ tên</div>
                    <div className="font-semibold text-gray-800">{selectedBooking.user?.fullName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-blue-500 text-lg">✉️</div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-semibold text-gray-800">{selectedBooking.user?.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                  <PhoneOutlined className="text-blue-500 text-lg" />
                  <div>
                    <div className="text-xs text-gray-500">Số điện thoại</div>
                    <div className="font-semibold text-gray-800">{selectedBooking.bookingData?.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-blue-500 text-lg">🆔</div>
                  <div>
                    <div className="text-xs text-gray-500">Mã khách hàng</div>
                    <div className="font-semibold text-gray-800">{selectedBooking.user?.userId}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <CarFilled className="text-white text-sm" />
                </div>
                Thông tin xe
              </h4>
              <div className="flex items-center gap-6 bg-white p-4 rounded-lg shadow-sm">
                {selectedBooking.vehicle?.image && (
                  <img 
                    src={selectedBooking.vehicle.image} 
                    alt={selectedBooking.vehicle.name}
                    className="w-32 h-24 object-cover rounded-lg shadow-md"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <div className="text-xl font-bold text-gray-800">{selectedBooking.vehicle?.name}</div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Loại xe:</span>
                      <span className="font-medium text-gray-700">{selectedBooking.vehicle?.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Giá:</span>
                      <span className="font-bold text-green-600">{selectedBooking.vehicle?.price}k VNĐ/ngày</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rental Period */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <CalendarOutlined className="text-white text-sm" />
                </div>
                Thời gian thuê
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-green-500 text-lg">📅</div>
                  <div>
                    <div className="text-xs text-gray-500">Nhận xe</div>
                    <div className="font-semibold text-gray-800">
                      {new Date(selectedBooking.bookingData?.startDate).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-red-500 text-lg">📅</div>
                  <div>
                    <div className="text-xs text-gray-500">Trả xe</div>
                    <div className="font-semibold text-gray-800">
                      {new Date(selectedBooking.bookingData?.endDate).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                  <ClockCircleOutlined className="text-blue-500 text-lg" />
                  <div>
                    <div className="text-xs text-gray-500">Số ngày thuê</div>
                    <div className="font-semibold text-gray-800">{selectedBooking.days} ngày</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                  <EnvironmentOutlined className="text-red-500 text-lg" />
                  <div>
                    <div className="text-xs text-gray-500">Trạm</div>
                    <div className="font-semibold text-gray-800">{selectedBooking.bookingData?.pickupLocation}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <DollarOutlined className="text-white text-sm" />
                </div>
                Thanh toán
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-green-500 text-lg">💰</div>
                  <div>
                    <div className="text-xs text-gray-500">Tổng tiền</div>
                    <div className="font-bold text-green-600 text-lg">
                      {selectedBooking.totalPrice?.toLocaleString('vi-VN')} VNĐ
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-blue-500 text-lg">💳</div>
                  <div>
                    <div className="text-xs text-gray-500">Đặt cọc</div>
                    <div className="font-semibold text-blue-600">
                      {selectedBooking.deposit?.toLocaleString('vi-VN')} VNĐ
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-purple-500 text-lg">💳</div>
                  <div>
                    <div className="text-xs text-gray-500">Phương thức</div>
                    <div className="font-semibold text-gray-800">{selectedBooking.payment?.method}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-cyan-500 text-lg">📊</div>
                  <div>
                    <div className="text-xs text-gray-500">Trạng thái</div>
                    <Tag color={getStatusColor(selectedBooking.status)} className="mt-1 font-medium">
                      {getStatusText(selectedBooking.status)}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingRequestsManagement;