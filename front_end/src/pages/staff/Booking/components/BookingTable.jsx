import React, { useState, useMemo, useCallback } from "react";
import { Table, Button, Tag, Space, Tooltip, message, Popconfirm } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined, FileTextOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useStationStaff } from "@/hooks/useStationStaff";

export default function BookingTable({ bookings = [], loading = false, onRefresh = () => {} }) {
  const navigate = useNavigate();
  const { approveRentalOrder, rejectRentalOrder } = useStationStaff();

  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  // ✅ Memoize handlers to prevent re-creation
  const handleApprove = useCallback(async (record) => {
    if (approvingId) return;
    setApprovingId(record.orderId);

    try {
      await approveRentalOrder(record.orderId);
      message.success("Booking request approved!");
      setTimeout(() => onRefresh?.(), 500);
    } catch (error) {
      console.error("Approve error:", error);
    } finally {
      setApprovingId(null);
    }
  }, [approvingId, approveRentalOrder, onRefresh]);

  const handleReject = useCallback(async (record) => {
    if (rejectingId) return;
    setRejectingId(record.orderId);

    try {
    await rejectRentalOrder(record.orderId);
    message.success("Booking request rejected!");
      setTimeout(() => onRefresh?.(), 500);
    } catch (error) {
      console.error("Reject error:", error);
    } finally {
      setRejectingId(null);
    }
  }, [rejectingId, rejectRentalOrder, onRefresh]);

  // ✅ Memoize columns definition
  const columns = useMemo(() => [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (id) => (
        <span className="font-semibold text-blue-600">#{id}</span>
      ),
      width: 80,
    },
    {
      title: "Customer",
      dataIndex: "renterName",
      key: "renterName",
      render: (text) => text || "N/A",
      width: 180,
    },
    {
      title: "Vehicle",
      dataIndex: "vehicleName",
      key: "vehicleName",
      render: (text) => text || "N/A",
      width: 180,
    },
    {
      title: "Stations (pickup → return)",
      key: "stations",
      render: (_, record) => (
        <span>
          {record.pickupStationName} → {record.returnStationName}
        </span>
      ),
      width: 220,
    },
    {
      title: "Rental time",
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
          const statusMap = {
          BOOKED: { color: "blue", text: "Pending" },
          APPROVED: { color: "green", text: "Approved" },
          CANCELED: { color: "red", text: "Canceled" },
          IN_USE: { color: "orange", text: "In Use" },
          COMPLETED: { color: "cyan", text: "Completed" },
        };
        const info = statusMap[status] || {
          color: "default",
          text: "Unknown",
        };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
      width: 140,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      width: 160,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/staff/booking-detail/${record.orderId}`);
              }}
              disabled={
                approvingId === record.orderId || rejectingId === record.orderId
              }
            />
          </Tooltip>

          {record.status === "BOOKED" && (
            <>
              <Popconfirm
                title="Approve request?"
                  description="Are you sure you want to approve this rental request?"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleApprove(record);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  loading={approvingId === record.orderId}
                  disabled={rejectingId === record.orderId}
                  style={{ backgroundColor: "#52c41a" }}
                />
              </Popconfirm>

              <Popconfirm
                title="Reject request?"
                description="Are you sure you want to reject this rental request?"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleReject(record);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  icon={<CloseOutlined />}
                  size="small"
                  danger
                  loading={rejectingId === record.orderId}
                  disabled={approvingId === record.orderId}
                />
              </Popconfirm>
            </>
          )}
          {(record.status === "BOOKED" || record.status === "APPROVED") && (
            <Popconfirm
              title="Choose contract type"
              description={
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    block
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/staff/contract-online/${record.orderId}`);
                    }}
                  >
                    Online contract
                  </Button>
                  <Button 
                    block
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/staff/contract-offline/${record.orderId}`);
                    }}
                  >
                    Offline contract
                  </Button>
                </Space>
              }
              icon={null}
              showCancel={false}
              okButtonProps={{ style: { display: 'none' } }}
            >
              <Tooltip title="Create contract">
                <Button
                  type="text"
                  icon={<FileTextOutlined />}
                  onClick={(e) => e.stopPropagation()}
                  disabled={
                    approvingId === record.orderId || rejectingId === record.orderId
                  }
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
      width: 200,
    },
  ], [navigate, approvingId, rejectingId, handleApprove, handleReject]);

  // ✅ Memoize pagination config
  const paginationConfig = useMemo(() => ({
    pageSize: 10,
    showTotal: (total) => `Total ${total} orders`,
  }), []);

  return (
    <div className="shadow-md rounded-xl bg-white p-4">
      <Table
        rowKey="orderId"
        columns={columns}
        dataSource={bookings}
        loading={loading}
        pagination={paginationConfig}
        scroll={{ x: 900 }}
      />
    </div>
  );
}