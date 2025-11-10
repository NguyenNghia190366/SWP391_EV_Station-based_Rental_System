import React, { useState } from "react";
import { Table, Button, Tag, Space, Tooltip, message, Popconfirm } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useStationStaff } from "@/hooks/useStationStaff";

export default function BookingTable({ bookings = [], loading, onRefresh }) {
  const navigate = useNavigate();
  const { approveRentalOrder, rejectRentalOrder } = useStationStaff();
  const [updatingId, setUpdatingId] = useState(null);

  // 🔹 Xử lý Approve
  const handleApprove = async (record) => {
    if (updatingId) return;

    try {
      setUpdatingId(record.orderId);
      await approveRentalOrder(record.orderId);
      message.success("✅ Đã duyệt yêu cầu booking!");
      setTimeout(() => onRefresh?.(), 500);
    } catch (error) {
      console.error("❌ Approve error:", error);
      message.error("❌ Không thể duyệt yêu cầu!");
    } finally {
      setUpdatingId(null);
    }
  };

  // 🔹 Xử lý Reject
  const handleReject = async (record) => {
    if (updatingId) return;

    try {
      setUpdatingId(record.orderId);
      await rejectRentalOrder(record.orderId);
      message.success("✅ Đã từ chối yêu cầu booking!");
      setTimeout(() => onRefresh?.(), 500);
    } catch (error) {
      console.error("❌ Reject error:", error);
      message.error("❌ Không thể từ chối yêu cầu!");
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      key: "orderId",
      render: (id) => <span className="font-semibold text-blue-600">#{id}</span>,
      width: 80,
    },
    {
      title: "Khách hàng",
      dataIndex: "renterName",
      key: "renterName",
      render: (text) => text || "N/A",
      width: 180,
    },
    {
      title: "Xe",
      dataIndex: "vehicleName",
      key: "vehicleName",
      render: (text) => text || "N/A",
      width: 180,
    },
    {
      title: "Trạm (nhận → trả)",
      key: "stations",
      render: (_, record) => (
        <span>{record.pickupStationName} → {record.returnStationName}</span>
      ),
      width: 200,
    },
    {
      title: "Thời gian thuê",
      key: "rentalTime",
      render: (_, record) => (
        <span>
          {dayjs(record.startTime).format("DD/MM HH:mm")} →{" "}
          {dayjs(record.endTime).format("DD/MM HH:mm")}
        </span>
      ),
      width: 220,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          BOOKED: { color: "blue", text: "Chờ duyệt"},
          APPROVED: { color: "green", text: "Đã duyệt"},
          REJECTED: { color: "red", text: "Từ chối" },
          IN_PROGRESS: { color: "orange", text: "Đang thuê" },
          COMPLETED: { color: "cyan", text: "Hoàn tất" },
          CANCELLED: { color: "default", text: "Huỷ" },
        };
        const statusInfo = statusMap[status] || { color: "default", text: "Không xác định" };
        return (
          <Tag color={statusInfo.color}>
            {statusInfo.text}
          </Tag>
        );
      },
      width: 140,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      width: 160,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/staff/booking-detail/${record.orderId}`)}
              disabled={updatingId === record.orderId}
            />
          </Tooltip>

          {/* Chỉ hiển thị Approve/Reject khi status là BOOKED */}
          {record.status === "BOOKED" && (
            <>
              <Popconfirm
                title="Duyệt yêu cầu?"
                description="Bạn có chắc muốn duyệt đơn thuê này?"
                onConfirm={() => handleApprove(record)}
                okText="Có"
                cancelText="Không"
              >
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  loading={updatingId !== null}
                  disabled={updatingId !== null}
                  style={{ backgroundColor: "#52c41a" }}
                  title="Duyệt yêu cầu"
                />
              </Popconfirm>

              <Popconfirm
                title="Từ chối yêu cầu?"
                description="Bạn có chắc muốn từ chối đơn thuê này?"
                onConfirm={() => handleReject(record)}
                okText="Có"
                cancelText="Không"
              >
                <Button
                  type="primary"
                  icon={<CloseOutlined />}
                  size="small"
                  danger
                  loading={updatingId !== null}
                  disabled={updatingId !== null}
                  title="Từ chối yêu cầu"
                />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
      width: 180,
    },
  ];

  return (
    <div className="shadow-md rounded-xl bg-white p-4">
      <Table
        rowKey="orderId"
        columns={columns}
        dataSource={bookings}
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng ${total} đơn`,
        }}
        scroll={{ x: 900 }}
      />
    </div>
  );
}
