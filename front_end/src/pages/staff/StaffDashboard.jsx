import React, { useState, useMemo } from "react";
import { Menu, Card, Statistic } from "antd";
import { 
  BookOutlined, 
  DashboardOutlined,
  CarOutlined,
  PlusOutlined
} from "@ant-design/icons";
import BookingRequestsManagement from "./Booking/BookingRequestsManagement";
import VehicleStatus from "../shared/VehicleStatus";
import CreateVehicleForm from "./vehicles/CreateVehicleForm";
import StaffConfirmHandover from "./handover/StaffConfirmHandover";

const StaffDashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState("overview");

  const menuItems = useMemo(() => [
    { key: "overview", icon: <DashboardOutlined />, label: "Tổng quan" },
    { key: "bookings", icon: <BookOutlined />, label: "Quản lý Booking" },
    { key: "confirm-handover", icon: <BookOutlined />, label: "Xác nhận nhận xe" },
    { key: "vehicle-status", icon: <CarOutlined />, label: "Trạng thái xe" },
    { key: "create-vehicle", icon: <PlusOutlined />, label: "Tạo xe mới" },
  ], []);

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
        {/* Keep all components mounted but hide with CSS */}
        <div style={{ display: selectedMenu === "overview" ? "block" : "none" }}>
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
        </div>

        <div style={{ display: selectedMenu === "bookings" ? "block" : "none" }}>
          <BookingRequestsManagement />
        </div>

        <div style={{ display: selectedMenu === "confirm-handover" ? "block" : "none" }}>
          <StaffConfirmHandover />
        </div>

        <div style={{ display: selectedMenu === "vehicle-status" ? "block" : "none" }}>
          <VehicleStatus />
        </div>

        <div style={{ display: selectedMenu === "create-vehicle" ? "block" : "none" }}>
          <Card className="shadow-lg p-6 rounded-xl bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tạo xe mới</h2>
            <CreateVehicleForm onSuccess={() => setSelectedMenu("vehicle-status")} />
          </Card>
        </div>
      </div>

      {/* Create Vehicle is available as a dashboard menu item */}
    </div>
  );
};

export default StaffDashboard;