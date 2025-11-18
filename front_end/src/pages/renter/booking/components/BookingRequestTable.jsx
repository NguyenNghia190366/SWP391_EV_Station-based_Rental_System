import React from "react";
import { Table, Tag, Button, Space, message } from "antd";
import { EyeOutlined, SendOutlined } from "@ant-design/icons";

export default function BookingRequestsTable({ bookings, loading, onViewDetail }) {
  const handleSendRequest = (record) => {
    message.success("✅ Booking request sent successfully!");
  };

  const columns = [
    { title: "Booking ID", dataIndex: "bookingId", key: "id" },
    {
      title: "Customer",
      render: (_, record) => (
        <div>
          <strong>{record.user?.fullName}</strong><br />
          <span className="text-gray-500 text-xs">{record.user?.email}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "blue"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => onViewDetail(record)}
          >
            View
          </Button>
          {record.status === "payment_completed" && (
              <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={() => handleSendRequest(record)}
            >
              Upload image
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
