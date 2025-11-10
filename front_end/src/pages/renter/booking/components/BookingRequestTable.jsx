import React from "react";
import { Table, Tag, Button, Space } from "antd";
import { EyeOutlined, SendOutlined } from "@ant-design/icons";

export default function BookingRequestsTable({ bookings, loading, onViewDetail }) {
  const columns = [
    { title: "Mã Booking", dataIndex: "bookingId", key: "id" },
    {
      title: "Khách hàng",
      render: (_, record) => (
        <div>
          <strong>{record.user?.fullName}</strong><br />
          <span className="text-gray-500 text-xs">{record.user?.email}</span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "blue"}>{status}</Tag>
      ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => onViewDetail(record)}
          >
            Xem
          </Button>
          {record.status === "payment_completed" && (
            <Button type="primary" icon={<SendOutlined />}>
              Gửi ảnh
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={bookings}
      rowKey="bookingId"
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
}
