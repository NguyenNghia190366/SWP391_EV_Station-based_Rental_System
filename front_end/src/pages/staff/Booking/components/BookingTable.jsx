import React, { useState, useMemo, useCallback } from "react";
import { Table, Button, Tag, Space, Tooltip, message, Popconfirm } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined, FileTextOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useStationStaff } from "@/hooks/useStationStaff";

export default function BookingTable({ bookings = [], loading, onRefresh }) {
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
      message.success("Đã duyệt yêu cầu booking!");
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
      message.success("Đã từ chối yêu cầu booking!");
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
      title: "Mã đơn",
      dataIndex: "orderId",
      key: "orderId",
      render: (id) => (
        <span className="font-semibold text-blue-600">#{id}</span>
      ),
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
          BOOKED: { color: "blue", text: "Chờ duyệt" },
          APPROVED: { color: "green", text: "Đã duyệt" },
          CANCELED: { color: "red", text: "Từ chối" },
          IN_USE: { color: "orange", text: "Đang thuê" },
          COMPLETED: { color: "cyan", text: "Hoàn tất" },
        };
        const info = statusMap[status] || {
          color: "default",
          text: "Không xác định",
        };
        return <Tag color={info.color}>{info.text}</Tag>;
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
                title="Duyệt yêu cầu?"
                description="Bạn có chắc muốn duyệt đơn thuê này?"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleApprove(record);
                }}
                okText="Có"
                cancelText="Không"
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
                title="Từ chối yêu cầu?"
                description="Bạn có chắc muốn từ chối đơn thuê này?"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleReject(record);
                }}
                okText="Có"
                cancelText="Không"
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
              title="Chọn loại hợp đồng"
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
                    Hợp đồng Online
                  </Button>
                  <Button 
                    block
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/staff/contract-offline/${record.orderId}`);
                    }}
                  >
                    Hợp đồng Offline
                  </Button>
                </Space>
              }
              icon={null}
              showCancel={false}
              okButtonProps={{ style: { display: 'none' } }}
            >
              <Tooltip title="Tạo hợp đồng">
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
    showTotal: (total) => `Tổng ${total} đơn`,
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