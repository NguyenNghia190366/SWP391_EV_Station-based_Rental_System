import React, { useState } from "react";
import { Menu, Card, Statistic } from "antd";
import { 
  EnvironmentOutlined, 
  BookOutlined, 
  DashboardOutlined
} from "@ant-design/icons";
import BookingRequestsManagement from "../components/BookingRequestsManagement";
import StationRegistrationContainer from "../../admin/containers/StationRegistrationContainer";

const StaffDashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState("overview");

  const menuItems = [
    {
      key: "overview",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: "bookings",
      icon: <BookOutlined />,
      label: "Quản lý Booking",
    },
    {
      key: "register-station",
      icon: <EnvironmentOutlined />,
      label: "Đăng ký trạm",
    },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case "overview":
        return (
          <Card className="shadow-lg" style={{ minHeight: '500px' }}>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Tổng quan hệ thống</h2>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Booking Đang Chờ"
                  value={10}
                  prefix={<BookOutlined className="text-blue-500" />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Trạm Đang Quản Lý"
                  value={3}
                  prefix={<EnvironmentOutlined className="text-green-500" />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </div>

            {/* Welcome Card */}
            <Card className="shadow-md bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                Chào mừng đến Staff Dashboard
              </h3>
              <p className="text-gray-700 mb-4">
                Quản lý booking requests và hỗ trợ khách hàng. Sử dụng menu bên trái để truy cập các chức năng.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4 border border-blue-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-blue-800 mb-2">Quản lý Booking</h4>
                  <p className="text-sm text-gray-600">Xem và xử lý các yêu cầu đặt xe từ khách hàng</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-blue-800 mb-2">Đăng ký trạm</h4>
                  <p className="text-sm text-gray-600">Thêm trạm xe mới vào hệ thống</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-blue-800 mb-2">Hỗ trợ khách hàng</h4>
                  <p className="text-sm text-gray-600">Giải đáp thắc mắc và hỗ trợ kỹ thuật</p>
                </div>
              </div>
            </Card>
          </Card>
        );

      case "bookings":
        return (
          <Card className="shadow-lg" style={{ minHeight: '500px' }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <BookOutlined className="text-blue-500" />
                Quản lý Booking Requests
              </h2>
              <p className="text-gray-600 mt-2">
                Xem và xử lý các yêu cầu đặt xe từ khách hàng
              </p>
            </div>
            <BookingRequestsManagement />
          </Card>
        );

      case "register-station":
        return (
          <Card className="shadow-lg" style={{ minHeight: '500px' }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <EnvironmentOutlined className="text-purple-500" />
                Đăng ký trạm xe
              </h2>
              <p className="text-gray-600 mt-2">
                Thêm trạm xe mới vào hệ thống
              </p>
            </div>
            <StationRegistrationContainer />
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <div
        className="bg-white shadow-2xl flex flex-col"
        style={{
          width: '280px',
          minWidth: '280px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-cyan-600">
          <h3 className="text-xl font-bold text-white mb-1">Staff Dashboard</h3>
          <p className="text-blue-100 text-sm">Quản lý hỗ trợ</p>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto">
          <Menu
            mode="inline"
            selectedKeys={[selectedMenu]}
            items={menuItems}
            onClick={({ key }) => setSelectedMenu(key)}
            className="border-0 pt-4"
            style={{
              fontSize: "16px",
              fontWeight: "500",
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default StaffDashboard;