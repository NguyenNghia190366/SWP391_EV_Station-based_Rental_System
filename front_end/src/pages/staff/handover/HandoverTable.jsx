// pages/staff/components/HandoverTable.jsx
import React, { useState } from "react";
import { Table, Tag, Space, Button } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useContract } from "@/hooks/useContract";
import dayjs from "dayjs";
import { useRentalOrders } from "@/hooks/useRentalOrders";

const ORDER_STATUS = {
  APPROVED: { color: "green", text: "Approved" },
  PENDING_HANDOVER: { color: "orange", text: "Pending handover" },
  IN_USE: { color: "blue", text: "In Use" },
};

const DATE_FORMAT = "DD/MM/YYYY HH:mm";

export default function HandoverTable({ orders, onRefresh, onShowDetail }) {
  const { approveHandover, deliverVehicle, rejectHandover } = useContract();
  const { handOverOrder } = useRentalOrders(true);
  const [processingId, setProcessingId] = useState(null);

  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (id) => <b style={{ color: "#1890ff" }}>#{id}</b>,
    },
    {
      title: "Customer",
      render: (_, r) => (
        <div>
          <b>{r.renterName}</b>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{r.renterPhone}</div>
        </div>
      ),
    },
    {
      title: "Vehicle",
      render: (_, r) => (
        <div>
          <b>{r.vehicleName}</b>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{r.vehicleLicensePlate}</div>
        </div>
      ),
    },
    {
      title: "Pickup station",
      dataIndex: "pickupStationName",
    },
    {
      title: "Pickup time",
      render: (_, r) => dayjs(r.startTime).format(DATE_FORMAT),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const info = ORDER_STATUS[status] || { color: "default", text: status };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: "Actions",
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
                  Approve
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
                  Reject
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
                Deliver vehicle
              </Button>
            )}

            <Button onClick={() => onShowDetail(r)}>Details</Button>
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
