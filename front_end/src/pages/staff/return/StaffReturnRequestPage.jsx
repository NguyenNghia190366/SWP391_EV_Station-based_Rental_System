// pages/staff/return/StaffReturnRequestsPage.jsx
import React, { useEffect, useState } from "react";
import { Card, Table, Tag, Button, message } from "antd";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

export default function StaffReturnRequestPage() {
  const axios = useAxiosInstance();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  const load = async () => {
    try {
      const res = await axios.get("/RentalOrders");
      const list = res.data.filter((o) => o.status === "RETURN_REQUESTED");
      setOrders(list);
    } catch (err) {
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
      title: "Renter",
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
      render: (_, r) => dayjs(r.returnRequestedAt).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hành động",
      render: (_, row) => (
        <Button
          type="primary"
          onClick={() =>
            navigate(`/staff/return-check/${row.orderId}`)
          }
        >
          Xử lý trả xe
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Yêu cầu trả xe">
        <Table rowKey="orderId" dataSource={orders} columns={columns} />
      </Card>
    </div>
  );
}
