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
      label: "Overview",
    },
    {
      key: "verify-renter",
      icon: <UserAddOutlined />,
      label: "Verify Users",
    },
    {
      key: "register-station",
      icon: <EnvironmentOutlined />,
      label: "Register Station",
    },
    {
      key: "vehicle-status",
      icon: <CarOutlined />,
      label: "Vehicle Status",
    },
    {
      key: "vehicles",
      icon: <CarOutlined />,
      label: "Manage Vehicles",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Manage Users",
    },
    {
      key: "statistics",
      icon: <BarChartOutlined />,
      label: "Statistics",
    },
  ];

  const renderContent = () => {
    useEffect(() => {
      const fetchData = async () => {
        try {
          // 🔹 If your .NET backend has /api/Stations endpoint
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

          // 🔹 Update station counts
          setTotalStations(stationsRes.data.length);
          setTotalVehicles(vehiclesRes.data.length);
          setTotalUsers(usersRes.data.length);
        } catch (error) {
          console.error("❌ Error fetching stations list:", error);
        }
      };

      fetchData();
    }, []);

    switch (selectedMenu) {
      case "overview":
        return (
          <Card className="shadow-lg" style={{ minHeight: "500px" }}>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              📊 System Overview
            </h2>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Total Stations"
                  value={totalStations}
                  prefix={<EnvironmentOutlined className="text-blue-500" />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Total Vehicles"
                  value={totalVehicles}
                  prefix={<CarOutlined className="text-green-500" />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Total Users"
                  value={totalUsers}
                  prefix={<UserOutlined className="text-purple-500" />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </div>

            {/* Welcome Card */}
            <Card className="shadow-md bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <h3 className="text-2xl font-bold text-indigo-900 mb-4">
                🎯 Welcome to Admin Dashboard
              </h3>
              <p className="text-gray-700 mb-4">
                Manage the EV Rental Station-based system. Use the left menu
                to access functions and admin tools.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                
                <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-indigo-800 mb-2">
                    👤 Verify Users
                  </h4>
                  <p className="text-sm text-gray-600">
                    Manage and verify renters
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-indigo-800 mb-2">
                    🏢 Register Station
                  </h4>
                  <p className="text-sm text-gray-600">
                    Add a new charging station to the system
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-indigo-800 mb-2">
                    🚗 Manage Vehicles
                  </h4>
                  <p className="text-sm text-gray-600">
                    View and manage the vehicle inventory
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
                Verify Users
              </h2>
              <p className="text-gray-600 mt-2">
                Manage and verify renter information
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
                Register station
              </h2>
              <p className="text-gray-600 mt-2">
                Add a new charging station to the system
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
                Manage Vehicles
              </h2>
              <p className="text-gray-600 mt-2">
                View and manage the vehicle list in the system
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <CarOutlined className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                Feature under development...
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
                Manage Users
              </h2>
              <p className="text-gray-600 mt-2">
                Manage accounts and user roles
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <UserOutlined className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                Feature under development...
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
                Statistics
              </h2>
              <p className="text-gray-600 mt-2">
                View system reports and statistics
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <BarChartOutlined className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                Feature under development...
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
          <p className="text-indigo-100 text-sm">System management</p>
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
