import React, { useState } from "react";
import { Menu, Card, Statistic } from "antd";
import { 
  EnvironmentOutlined, 
  CarOutlined, 
  UserOutlined, 
  BarChartOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined
} from "@ant-design/icons";
import VerificationDashboard from "../components/VerificationDashboard";
import StationRegistrationContainer from "../containers/StationRegistrationContainer";

const AdminDashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState("overview");

  const menuItems = [
    {
      key: "overview",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: "verification",
      icon: <SafetyCertificateOutlined />,
      label: "Xác minh tài liệu",
    },
    {
      key: "register-station",
      icon: <EnvironmentOutlined />,
      label: "Đăng ký trạm",
    },
    {
      key: "vehicles",
      icon: <CarOutlined />,
      label: "Quản lý xe",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Quản lý user",
    },
    {
      key: "statistics",
      icon: <BarChartOutlined />,
      label: "Thống kê",
    },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case "overview":
        return (
          <Card className="shadow-lg" style={{ minHeight: '500px' }}>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">📊 Tổng quan hệ thống</h2>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Tổng Trạm Xe"
                  value={12}
                  prefix={<EnvironmentOutlined className="text-blue-500" />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Tổng Xe"
                  value={48}
                  prefix={<CarOutlined className="text-green-500" />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Người Dùng"
                  value={234}
                  prefix={<UserOutlined className="text-purple-500" />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </div>

            {/* Welcome Card */}
            <Card className="shadow-md bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
              <h3 className="text-2xl font-bold text-indigo-900 mb-4">
                🎯 Chào mừng đến Admin Dashboard
              </h3>
              <p className="text-gray-700 mb-4">
                Quản lý toàn bộ hệ thống EV Rental - Station Based. Sử dụng menu bên trái để truy cập các chức năng.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-indigo-800 mb-2">✅ Xác minh tài liệu</h4>
                  <p className="text-sm text-gray-600">Duyệt GPLX và CCCD từ renters</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-indigo-800 mb-2">🏢 Đăng ký trạm</h4>
                  <p className="text-sm text-gray-600">Thêm trạm xe mới vào hệ thống</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-indigo-800 mb-2">🚗 Quản lý xe</h4>
                  <p className="text-sm text-gray-600">Xem và quản lý danh sách xe</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-indigo-800 mb-2">👥 Quản lý user</h4>
                  <p className="text-sm text-gray-600">Quản lý tài khoản người dùng</p>
                </div>
              </div>
            </Card>
          </Card>
        );

      case "verification":
        return (
          <Card className="shadow-lg" style={{ minHeight: '500px' }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <SafetyCertificateOutlined className="text-red-500" />
                Xác minh tài liệu
              </h2>
              <p className="text-gray-600 mt-2">
                Duyệt Giấy phép lái xe (GPLX) và Căn cước công dân (CCCD) từ renters
              </p>
            </div>
            <VerificationDashboard />
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

      case "vehicles":
        return (
          <Card className="shadow-lg" style={{ minHeight: '500px' }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <CarOutlined className="text-green-500" />
                Quản lý xe
              </h2>
              <p className="text-gray-600 mt-2">
                Xem và quản lý danh sách xe trong hệ thống
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <CarOutlined className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Chức năng đang phát triển...</p>
            </div>
          </Card>
        );

      case "users":
        return (
          <Card className="shadow-lg" style={{ minHeight: '500px' }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <UserOutlined className="text-orange-500" />
                Quản lý người dùng
              </h2>
              <p className="text-gray-600 mt-2">
                Quản lý tài khoản và phân quyền người dùng
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <UserOutlined className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Chức năng đang phát triển...</p>
            </div>
          </Card>
        );

      case "statistics":
        return (
          <Card className="shadow-lg" style={{ minHeight: '500px' }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <BarChartOutlined className="text-pink-500" />
                Thống kê
              </h2>
              <p className="text-gray-600 mt-2">
                Xem báo cáo và thống kê hệ thống
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <BarChartOutlined className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Chức năng đang phát triển...</p>
            </div>
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
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600">
          <h3 className="text-xl font-bold text-white mb-1">Admin Dashboard</h3>
          <p className="text-indigo-100 text-sm">Quản lý hệ thống</p>
        </div>

        {/* Menu */}
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

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;