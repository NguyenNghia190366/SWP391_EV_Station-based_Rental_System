import React, { useEffect, useState } from "react";
import { Menu, Card, Statistic } from "antd";
import {
  EnvironmentOutlined,
  CarOutlined,
  UserOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import VerifyRenterPage from "./VerifyRenterPage";
import StationRegistrationPage from "./StationRegistrationPage";
import VehicleStatus from "../shared/VehicleStatus";

const AdminDashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState("overview");
  const [totalStations, setTotalStations] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  const menuItems = [
    {
      key: "overview",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: "verify-renter",
      icon: <UserAddOutlined />,
      label: "Xác thực người dùng",
    },
    {
      key: "register-station",
      icon: <EnvironmentOutlined />,
      label: "Đăng ký trạm",
    },
    {
      key: "vehicle-status",
      icon: <CarOutlined />,
      label: "Trạng thái xe",
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
    useEffect(() => {
      const fetchData = async () => {
        try {
          // 🔹 Nếu BE .NET của bạn có endpoint /api/Stations
          const [vehiclesRes, stationsRes, usersRes] = await Promise.all([
            axios.get(
              "https://alani-uncorroboratory-sympetaly.ngrok-free.dev/api/Vehicles",
              {
                headers: { "ngrok-skip-browser-warning": "true" },
              }
            ),
            axios.get(
              "https://alani-uncorroboratory-sympetaly.ngrok-free.dev/api/Stations",
              {
                headers: { "ngrok-skip-browser-warning": "true" },
              }
            ),
            axios.get("https://alani-uncorroboratory-sympetaly.ngrok-free.dev/api/Users", {
              headers: { "ngrok-skip-browser-warning": "true" },
            }),
          ]);

          // 🔹 Cập nhật số lượng trạm
          setTotalStations(stationsRes.data.length);
          setTotalVehicles(vehiclesRes.data.length);
          setTotalUsers(usersRes.data.length);
        } catch (error) {
          console.error("❌ Lỗi khi lấy danh sách trạm:", error);
        }
      };

      fetchData();
    }, []);

    switch (selectedMenu) {
      case "overview":
        return (
          <Card className="shadow-lg" style={{ minHeight: "500px" }}>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              📊 Tổng quan hệ thống
            </h2>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Tổng Trạm Xe"
                  value={totalStations}
                  prefix={<EnvironmentOutlined className="text-blue-500" />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Tổng Xe"
                  value={totalVehicles}
                  prefix={<CarOutlined className="text-green-500" />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Người Dùng"
                  value={totalUsers}
                  prefix={<UserOutlined className="text-purple-500" />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </div>

            {/* Welcome Card */}
            <Card className="shadow-md bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <h3 className="text-2xl font-bold text-indigo-900 mb-4">
                🎯 Chào mừng đến Admin Dashboard
              </h3>
              <p className="text-gray-700 mb-4">
                Quản lý toàn bộ hệ thống EV Rental - Station Based. Sử dụng menu
                bên trái để truy cập các chức năng.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                
                <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-indigo-800 mb-2">
                    👤 Xác thực người dùng  
                  </h4>
                  <p className="text-sm text-gray-600">
                    Quản lý và xác minh người thuê
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-indigo-800 mb-2">
                    🏢 Đăng ký trạm
                  </h4>
                  <p className="text-sm text-gray-600">
                    Thêm trạm xe mới vào hệ thống
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-indigo-800 mb-2">
                    � Quản lý xe
                  </h4>
                  <p className="text-sm text-gray-600">
                    Xem và quản lý danh sách xe
                  </p>
                </div>
              </div>
            </Card>
          </Card>
        );

      case "verify-renter":
        return (
          <Card className="shadow-lg" style={{ minHeight: "500px" }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <UserAddOutlined className="text-blue-500" />
                Xác thực người dùng
              </h2>
              <p className="text-gray-600 mt-2">
                Quản lý và xác thực thông tin người thuê xe
              </p>
            </div>
            <VerifyRenterPage />
          </Card>
        );

      case "register-station":
        return (
          <Card className="shadow-lg" style={{ minHeight: "500px" }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <EnvironmentOutlined className="text-purple-500" />
                Đăng ký trạm xe
              </h2>
              <p className="text-gray-600 mt-2">
                Thêm trạm xe mới vào hệ thống
              </p>
            </div>
            <StationRegistrationPage />
          </Card>
        );

      case "vehicle-status":
        return (
          <div>
            <VehicleStatus />
          </div>
        );

      case "vehicles":
        return (
          <Card className="shadow-lg" style={{ minHeight: "500px" }}>
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
              <p className="text-gray-500 text-lg">
                Chức năng đang phát triển...
              </p>
            </div>
          </Card>
        );

      case "users":
        return (
          <Card className="shadow-lg" style={{ minHeight: "500px" }}>
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
              <p className="text-gray-500 text-lg">
                Chức năng đang phát triển...
              </p>
            </div>
          </Card>
        );

      case "statistics":
        return (
          <Card className="shadow-lg" style={{ minHeight: "500px" }}>
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
              <p className="text-gray-500 text-lg">
                Chức năng đang phát triển...
              </p>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    // Match the header's width constraint and center alignment
    // Add overflow-x-hidden here (not on body) to hide purple strip without blocking internal scrolls
    <div className="flex min-h-screen w-full bg-gray-50 overflow-x-hidden">
      {/* Sidebar */}
      <div
        className="bg-white shadow-2xl flex flex-col"
        style={{
          width: "280px",
          minWidth: "280px",
          height: "100vh",
          position: "sticky",
          top: 0,
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600">
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
      <div className="flex-1 p-6 md:p-8 bg-gray-50 w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
