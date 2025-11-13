// pages/staff/components/HandoverTable.jsx
import React, { useState } from "react";
import { Table, Tag, Space, Button } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useContract } from "@/hooks/useContract";
import dayjs from "dayjs";
import { useRentalOrders } from "@/hooks/useRentalOrders";

const ORDER_STATUS = {
  APPROVED: { color: "green", text: "Đã duyệt" },
  PENDING_HANDOVER: { color: "orange", text: "Chờ nhận" },
  IN_USE: { color: "blue", text: "Đang sử dụng" },
};

const DATE_FORMAT = "DD/MM/YYYY HH:mm";

export default function HandoverTable({ orders, onRefresh, onShowDetail }) {
  const { approveHandover, deliverVehicle, rejectHandover } = useContract();
  const { handOverOrder } = useRentalOrders(true);
  const [processingId, setProcessingId] = useState(null);

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      key: "orderId",
      render: (id) => <b style={{ color: "#1890ff" }}>#{id}</b>,
    },
    {
      title: "Khách hàng",
      render: (_, r) => (
        <div>
          <b>{r.renterName}</b>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{r.renterPhone}</div>
        </div>
      ),
    },
    {
      title: "Xe",
      render: (_, r) => (
        <div>
          <b>{r.vehicleName}</b>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{r.vehicleLicensePlate}</div>
        </div>
      ),
    },
    {
      title: "Trạm nhận",
      dataIndex: "pickupStationName",
    },
    {
      title: "Thời gian nhận",
      render: (_, r) => dayjs(r.startTime).format(DATE_FORMAT),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        const info = ORDER_STATUS[status] || { color: "default", text: status };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: "Hành động",
      render: (_, r) => {
        const processing = processingId === r.orderId;

        return (
          <Space>
            {r.status === "PENDING_HANDOVER" && (
              <>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={processing}
                  onClick={async () => {
                    setProcessingId(r.orderId);
                    const ok = await handOverOrder(r.orderId);
                    setProcessingId(null);
                    ok && onRefresh();
                  }}
                >
                  Phê duyệt
                </Button>

                <Button
                  danger
                  icon={<CloseOutlined />}
                  loading={processing}
                  onClick={async () => {
                    setProcessingId(r.orderId);
                    const ok = await rejectHandover(r.orderId);
                    setProcessingId(null);
                    ok && onRefresh();
                  }}
                >
                  Từ chối
                </Button>
              </>
            )}

            {r.status === "APPROVED" && (
              <Button
                type="primary"
                loading={processing}
                onClick={async () => {
                  setProcessingId(r.orderId);
                  const ok = await handOverOrder(r.orderId);
                  setProcessingId(null);
                  await onRefresh()
                }}
              >
                Giao xe
              </Button>
            )}

            <Button onClick={() => onShowDetail(r)}>Chi tiết</Button>
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="orderId"
      pagination={{ pageSize: 10 }}
    />
  );
}
