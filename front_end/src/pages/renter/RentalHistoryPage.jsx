import React, { useEffect, useState } from "react";
import { Card, Table, Tag, Spin, Empty, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import { useRenters } from "@/hooks/useRenters";

export default function RentalHistoryPage() {
  const instance = useAxiosInstance();
  const navigate = useNavigate();
  const { getRenterIdByUserId } = useRenters();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) {
        message.warning("Không tìm thấy userId!");
        return;
      }

      // Lấy renterId từ userId
      const renterId = await getRenterIdByUserId(userId);
      
      // Fetch tất cả dữ liệu cần thiết
      const [rentalOrdersRes, vehiclesRes, stationsRes] = await Promise.all([
        instance.get(`/RentalOrders?renter_id=${renterId}`),
        instance.get("/Vehicles"),
        instance.get("/Stations"),
      ]);

      const rentalOrders = Array.isArray(rentalOrdersRes.data) 
        ? rentalOrdersRes.data 
        : rentalOrdersRes.data?.data || [];
      
      const vehicles = Array.isArray(vehiclesRes.data) 
        ? vehiclesRes.data 
        : vehiclesRes.data?.data || [];
      
      const stations = Array.isArray(stationsRes.data) 
        ? stationsRes.data 
        : stationsRes.data?.data || [];

      // Merge dữ liệu - thêm tên xe và trạm
      const merged = rentalOrders.map((order) => ({
        ...order,
        vehicleName: vehicles.find((v) => v.vehicleId === order.vehicleId)?.vehicleName || `#${order.vehicleId}`,
        pickupStationName: stations.find((s) => s.stationId === order.pickupStationId)?.stationName || `#${order.pickupStationId}`,
        returnStationName: stations.find((s) => s.stationId === order.returnStationId)?.stationName || `#${order.returnStationId}`,
      }));

      setOrders(merged);
    } catch (err) {
      console.error("❌ Lỗi tải lịch sử thuê:", err);
      message.error("Không thể tải lịch sử thuê!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      key: "orderId",
      render: (id) => <span className="font-semibold text-blue-600">#{id}</span>,
      width: 80,
    },
    {
      title: "Xe",
      dataIndex: "vehicleName",
      key: "vehicleName",
      width: 180,
    },
    {
      title: "Trạm (nhận → trả)",
      key: "stations",
      render: (_, record) => (
        <span>
          {record.pickupStationName} → {record.returnStationName}
        </span>
      ),
      width: 220,
    },
    {
      title: "Thời gian thuê",
      key: "rentalTime",
      render: (_, record) => (
        <span>
          {dayjs(record.startTime).format("DD/MM/YYYY HH:mm")} →{" "}
          {dayjs(record.endTime).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
      width: 240,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          BOOKED: { color: "blue", text: "Chờ duyệt" },
          APPROVED: { color: "green", text: "Đã duyệt" },
          CANCELED: { color: "red", text: "Từ chối" },
          IN_USE: { color: "orange", text: "Đang sử dụng" },
          COMPLETED: { color: "cyan", text: "Hoàn tất" },
        };
        const statusInfo = statusMap[status] || { color: "default", text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
      width: 120,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      width: 160,
    },
  ];

  return (
    <Card className="shadow-md rounded-xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📜 Lịch sử đặt xe</h2>
        <p className="text-gray-500">Xem tất cả các đơn thuê xe của bạn</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : orders.length === 0 ? (
        <Empty
          description="Chưa có lịch sử đặt xe"
          style={{ marginTop: "50px", marginBottom: "50px" }}
        >
          <Button type="primary" onClick={() => navigate("/vehicles")}>
            Thuê xe ngay
          </Button>
        </Empty>
      ) : (
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="orderId"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} đơn`,
          }}
          scroll={{ x: 900 }}
          className="shadow-md rounded-lg"
        />
      )}
    </Card>
  );
}
