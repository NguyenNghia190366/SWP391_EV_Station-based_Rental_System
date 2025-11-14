// pages/staff/return/StaffReturnRequestPage.jsx
import React, { useEffect, useState } from "react";
import { Card, Table, Button, message, Space } from "antd";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

export default function StaffReturnRequestPage() {
  const axios = useAxiosInstance();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  const load = async () => {
    try {
      // Fetch orders + related data in parallel
      const [ordersRes, rentersRes, usersRes, vehiclesRes, stationsRes] = await Promise.all([
        axios.get("/RentalOrders").catch(() => ({ data: [] })),
        axios.get("/Renters").catch(() => ({ data: [] })),
        axios.get("/Users").catch(() => ({ data: [] })),
        axios.get("/Vehicles").catch(() => ({ data: [] })),
        axios.get("/Stations").catch(() => ({ data: [] })),
      ]);

      const ordersRaw = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.data || [];
      const renters = Array.isArray(rentersRes.data) ? rentersRes.data : rentersRes.data?.data || [];
      const users = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.data || [];
      const vehicles = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : vehiclesRes.data?.data || [];
      const stations = Array.isArray(stationsRes.data) ? stationsRes.data : stationsRes.data?.data || [];

      const renterMap = new Map(renters.map((r) => [r.renterId ?? r.renter_id, r]));
      const userMap = new Map(users.map((u) => [u.userId ?? u.id ?? u.user_id, u]));
      const vehicleMap = new Map(vehicles.map((v) => [v.vehicleId ?? v.id, v]));
      const stationMap = new Map(stations.map((s) => [s.stationId ?? s.id, s]));

      // lấy thông tin đơn thuê
      const merged = ordersRaw.map((order) => {
  const renter = renterMap.get(order.renterId ?? order.renter_id);
  const vehicle = vehicleMap.get(order.vehicleId ?? order.vehicle_id ?? order.vehicle);
  const returnStation = stationMap.get(order.returnStationId ?? order.return_station_id ?? order.returnStation);

  const user = renter ? userMap.get(renter.userId ?? renter.user_id) : null;

  return {
    ...order,
    renterName: user?.fullName || "N/A", 
    vehicleName:
      vehicle?.vehicleName || vehicle?.model || vehicle?.licensePlate || `#${order.vehicleId ?? order.vehicle_id}`,
    returnStationName:
      returnStation?.stationName || returnStation?.station_name || returnStation?.name || `#${order.returnStationId ?? order.return_station_id}`,
  };
});

      // Debug: log sample order to see actual status values
      if (ordersRaw.length > 0) {
        console.log("Sample order:", ordersRaw[0]);
      }

      // Filter for RETURN_REQUESTED or approved status (adjust as needed)
      const filtered = merged.filter(
        (o) => {
          const status = (o.status || o.Status || "").toString().toUpperCase();
          return status === "RETURN_REQUESTED" || status === "APPROVED" || status === "IN_USE";
        }
      );

      setOrders(filtered);
    } catch (err) {
      console.error("Error loading return requests:", err);
      message.error("Không thể tải danh sách trả xe.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      render: (id) => <b>#{id}</b>,
    },
    {
      title: "Khách Hàng  ",
      dataIndex: "renterName",
    },
    {
      title: "Xe",
      dataIndex: "vehicleName",
    },
    {
      title: "Trạm trả yêu cầu",
      dataIndex: "returnStationName",
    },
    {
      title: "Thời gian yêu cầu",
      render: (_, r) =>
        r.returnRequestedAt ? dayjs(r.returnRequestedAt).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: "Hành động",
      render: (_, row) => (
        <Space>
          <Button type="default" onClick={() => navigate(`/staff/return-check/${row.orderId}`)}>
            Xử lý trả xe
          </Button>
          <Button type="primary" onClick={() => navigate(`/staff/return-summary/${row.orderId}`)}>
            Trả xe
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Yêu cầu trả xe">
        <Table rowKey={(r) => r.orderId ?? r.id} dataSource={orders} columns={columns} />
      </Card>
    </div>
  );
}
