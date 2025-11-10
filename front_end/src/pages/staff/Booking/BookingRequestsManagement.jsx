import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import BookingTable from "./components/BookingTable";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";

export default function BookingRequestsManagement() {
  const api = useAxiosInstance();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/RentalOrders");
      const { data: renters } = await api.get("/Renters");
      const { data: vehicles } = await api.get("/Vehicles");
      const { data: stations } = await api.get("/Stations");

      const merged = data.map((order) => ({
        ...order,
        renterName:
          renters.find((r) => r.renterId === order.renterId)?.fullName ||
          `#${order.renterId}`,
        vehicleName:
          vehicles.find((v) => v.vehicleId === order.vehicleId)?.vehicleName ||
          `#${order.vehicleId}`,
        pickupStationName:
          stations.find((s) => s.stationId === order.pickupStationId)?.stationName ||
          `#${order.pickupStationId}`,
        returnStationName:
          stations.find((s) => s.stationId === order.returnStationId)?.stationName ||
          `#${order.returnStationId}`,
      }));

      setBookings(merged);
    } catch (err) {
      console.error("❌ Lỗi tải đơn:", err);
      message.error("Không thể tải danh sách đơn thuê!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
      <div className="flex justify-between items-center border-b pb-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            📋 Quản lý Booking Requests
          </h2>
          <p className="text-gray-500 text-sm">
            Xem và xử lý các yêu cầu đặt xe từ khách hàng
          </p>
        </div>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchData}
          className="bg-green-500 hover:bg-green-600"
        >
          Làm mới
        </Button>
      </div>

      <BookingTable bookings={bookings} loading={loading} onRefresh={fetchData} />
    </div>
  );
}
