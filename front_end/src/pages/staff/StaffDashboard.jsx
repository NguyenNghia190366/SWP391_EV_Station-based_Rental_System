import React, { useState } from "react";
import { Menu, Card, Statistic } from "antd";
import { 
  BookOutlined, 
  DashboardOutlined
} from "@ant-design/icons";
import BookingRequestsManagement from "./Booking/BookingRequestsManagement";

const StaffDashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState("overview");

  const menuItems = [
    { key: "overview", icon: <DashboardOutlined />, label: "Tổng quan" },
    { key: "bookings", icon: <BookOutlined />, label: "Quản lý Booking" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Sidebar */}
      <div
        className="bg-white shadow-2xl flex flex-col"
        style={{ width: '260px', height: '100vh', position: 'sticky', top: 0 }}
      >
        <div className="p-6 border-b bg-gradient-to-r from-green-600 to-emerald-600">
          <h3 className="text-xl font-bold text-white mb-1">Staff Dashboard</h3>
          <p className="text-blue-100 text-sm">Quản lý hỗ trợ</p>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          onClick={({ key }) => setSelectedMenu(key)}
          className="border-0 pt-4"
          style={{ fontSize: "16px", fontWeight: "500" }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {selectedMenu === "overview" && (
          <Card className="shadow-lg p-6 rounded-xl bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tổng quan hệ thống</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <Statistic title="Booking đang chờ" value={10} prefix={<BookOutlined />} />
              </Card>
              <Card className="shadow-sm">
                <Statistic title="Trạm đang quản lý" value={3} prefix={<DashboardOutlined />} />
              </Card>
            </div>
          </Card>
        )}

        {selectedMenu === "bookings" && <BookingRequestsManagement />}
      </div>
    </div>
  );
};

export default StaffDashboard;
