import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  Empty, 
  Tag, 
  Avatar, 
  Spin,
  message,
  Badge
} from 'antd';
import { 
  CarOutlined, 
  FileTextOutlined, 
  DollarOutlined, 
  HistoryOutlined,
  RightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const OverviewPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRentals: 0,
    completedRentals: 0,
    activeRentals: 0,
    totalSpent: 0
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      setLoading(true);

      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setUser(currentUser);

      // Get user's bookings
      const myBookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
      setBookings(myBookings);

      // Calculate statistics
      const totalRentals = myBookings.length;
      const completedRentals = myBookings.filter(b => b.status === 'completed').length;
      const activeRentals = myBookings.filter(b => b.status === 'active').length;
      const totalSpent = myBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      setStats({
        totalRentals,
        completedRentals,
        activeRentals,
        totalSpent
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      message.error('Không thể tải dữ liệu người dùng!');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'payment_completed': { color: 'orange', icon: <ClockCircleOutlined />, text: 'Chờ xác nhận' },
      'vehicle_preview_sent': { color: 'blue', icon: <ClockCircleOutlined />, text: 'Chờ xác nhận xe' },
      'confirmed_vehicle': { color: 'cyan', icon: <CheckCircleOutlined />, text: 'Đã xác nhận' },
      'active': { color: 'green', icon: <CarOutlined />, text: 'Đang thuê' },
      'completed': { color: 'default', icon: <CheckCircleOutlined />, text: 'Đã hoàn thành' },
      'cancelled': { color: 'red', icon: <ExclamationCircleOutlined />, text: 'Đã hủy' }
    };
    const config = statusConfig[status] || statusConfig['completed'];
    return (
      <Tag icon={config.icon} color={config.color}>
        {config.text}
      </Tag>
    );
  };

  const handleViewBooking = (booking) => {
    if (booking.status === 'vehicle_preview_sent') {
      navigate(`/vehicle-preview/${booking.bookingId}`);
    } else if (booking.status === 'confirmed_vehicle') {
      navigate(`/checkin-prepare/${booking.bookingId}`);
    } else if (booking.status === 'active') {
      navigate(`/rental/${booking.bookingId}`);
    }
  };

  const handleRentNow = () => {
    navigate('/vehicles');
  };

  const handleViewAllBookings = () => {
    navigate('/my-bookings');
  };

  // Get recent active and pending bookings
  const recentBookings = bookings
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const pendingBookings = bookings.filter(b => 
    b.status === 'vehicle_preview_sent' || b.status === 'confirmed_vehicle'
  );

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-emerald-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                👋 Xin chào, {user?.fullName || 'Bạn'}!
              </h1>
              <p className="text-gray-600 mt-2">Quản lý và theo dõi các đơn thuê xe của bạn</p>
            </div>
            <Button 
              type="primary" 
              size="large"
              onClick={handleRentNow}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0"
            >
              <CarOutlined /> Thuê xe ngay
            </Button>
          </div>
        </div>

        {/* Statistics Section */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="hover:shadow-xl transition-shadow"
              style={{ 
                borderTop: '4px solid #4f46e5',
                background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)'
              }}
            >
              <Statistic
                title="💰 Tổng tiêu chí"
                value={stats.totalSpent.toLocaleString('vi-VN')}
                suffix="₫"
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#4f46e5', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="hover:shadow-xl transition-shadow"
              style={{ 
                borderTop: '4px solid #7c3aed',
                background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)'
              }}
            >
              <Statistic
                title="📊 Tổng số lần thuê"
                value={stats.totalRentals}
                prefix={<HistoryOutlined />}
                valueStyle={{ color: '#7c3aed', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="hover:shadow-xl transition-shadow"
              style={{ 
                borderTop: '4px solid #10b981',
                background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)'
              }}
            >
              <Statistic
                title="✅ Đã hoàn thành"
                value={stats.completedRentals}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="hover:shadow-xl transition-shadow"
              style={{ 
                borderTop: '4px solid #f59e0b',
                background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)'
              }}
            >
              <Statistic
                title="🚗 Đang thuê"
                value={stats.activeRentals}
                prefix={<CarOutlined />}
                valueStyle={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Pending Bookings Section */}
          <Col xs={24} lg={12}>
            <Card 
              className="shadow-lg hover:shadow-xl transition-shadow"
              title={
                <div className="flex items-center gap-2">
                  <Badge count={pendingBookings.length} style={{ backgroundColor: '#ff4d4f' }}>
                    <ClockCircleOutlined style={{ fontSize: '20px', color: '#ff4d4f' }} />
                  </Badge>
                  <span className="font-bold text-lg">Cần hành động của bạn</span>
                </div>
              }
              extra={
                pendingBookings.length > 0 && (
                  <Button type="link" onClick={handleViewAllBookings}>
                    Xem tất cả <RightOutlined />
                  </Button>
                )
              }
            >
              {pendingBookings.length > 0 ? (
                <div className="space-y-3">
                  {pendingBookings.slice(0, 3).map((booking, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{booking.vehicle?.name || 'Xe'}</h4>
                          <p className="text-sm text-gray-600">Ngày: {booking.startDate}</p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      <Button 
                        type="primary"
                        block
                        onClick={() => handleViewBooking(booking)}
                        className="mt-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0"
                      >
                        📸 Xem chi tiết
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty 
                  description="Không có đơn cần hành động" 
                  style={{ marginTop: '20px' }}
                />
              )}
            </Card>
          </Col>

          {/* Recent Bookings Section */}
          <Col xs={24} lg={12}>
            <Card 
              className="shadow-lg hover:shadow-xl transition-shadow"
              title={
                <div className="flex items-center gap-2">
                  <HistoryOutlined style={{ fontSize: '20px', color: '#4f46e5' }} />
                  <span className="font-bold text-lg">Đơn thuê gần đây</span>
                </div>
              }
              extra={
                recentBookings.length > 0 && (
                  <Button type="link" onClick={handleViewAllBookings}>
                    Xem tất cả <RightOutlined />
                  </Button>
                )
              }
            >
              {recentBookings.length > 0 ? (
                <div className="space-y-3">
                  {recentBookings.slice(0, 5).map((booking, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewBooking(booking)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CarOutlined style={{ color: '#4f46e5' }} />
                            <h4 className="font-bold text-gray-800">{booking.vehicle?.name || 'Xe'}</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            📅 {booking.startDate} → {booking.endDate}
                          </p>
                          <p className="text-sm font-semibold text-indigo-600 mt-1">
                            💰 {(booking.totalPrice || 0).toLocaleString('vi-VN')} ₫
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(booking.status)}
                          <RightOutlined style={{ marginTop: '8px', color: '#9ca3af' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty 
                  description="Chưa có đơn thuê nào" 
                  style={{ marginTop: '20px' }}
                >
                  <Button 
                    type="primary"
                    onClick={handleRentNow}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0"
                  >
                    🚗 Bắt đầu thuê xe
                  </Button>
                </Empty>
              )}
            </Card>
          </Col>
        </Row>

        {/* Quick Actions Section */}
        <Row gutter={[16, 16]} className="mt-8">
          <Col xs={24}>
            <Card className="shadow-lg">
              <h3 className="text-xl font-bold mb-6 text-gray-800">
                ⚡ Hành động nhanh
              </h3>
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12} md={8}>
                  <Button 
                    block 
                    size="large"
                    onClick={handleRentNow}
                    className="h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 font-semibold text-lg"
                  >
                    🚗 Thuê xe mới
                  </Button>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Button 
                    block 
                    size="large"
                    onClick={handleViewAllBookings}
                    className="h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 font-semibold text-lg"
                  >
                    📋 Xem lịch sử
                  </Button>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Button 
                    block 
                    size="large"
                    onClick={() => navigate('/profile')}
                    className="h-12 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 font-semibold text-lg"
                  >
                    👤 Hồ sơ
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Info Cards */}
        <Row gutter={[16, 16]} className="mt-8 mb-8">
          <Col xs={24} sm={12}>
            <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
              <div className="flex items-center gap-4">
                <div className="text-5xl">💡</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Mẹo sử dụng</h4>
                  <p className="text-sm text-gray-600">Hãy kiểm tra các yêu cầu cần hành động để tránh trễ hẹn.</p>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12}>
            <Card className="shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🎁</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Ưu đãi đặc biệt</h4>
                  <p className="text-sm text-gray-600">Nhận khuyến mãi khi thuê xe liên tục.</p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default OverviewPage;
