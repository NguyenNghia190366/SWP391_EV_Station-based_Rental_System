// pages/staff/components/OrderDetailModal.jsx
import React from "react";
import { Modal, Descriptions, Tag } from "antd";
import dayjs from "dayjs";

const ORDER_STATUS = {
  APPROVED: { color: "green", text: "Approved" },
  PENDING_HANDOVER: { color: "orange", text: "Pending handover" },
  IN_USE: { color: "blue", text: "In Use" },
};

const DATE_FORMAT = "DD/MM/YYYY HH:mm";

export default function OrderDetailModal({ open, order, onClose }) {
  if (!order) return null;

  return (
    <Modal
      title={`Order details #${order.orderId}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Descriptions column={1} style={{ marginTop: 16 }}>
        <Descriptions.Item label="Customer">{order.renterName}</Descriptions.Item>
        <Descriptions.Item label="Phone">{order.renterPhone}</Descriptions.Item>
        <Descriptions.Item label="Vehicle">{order.vehicleName}</Descriptions.Item>
        <Descriptions.Item label="License plate">{order.vehicleLicensePlate}</Descriptions.Item>
        <Descriptions.Item label="Pickup station">{order.pickupStationName}</Descriptions.Item>
        <Descriptions.Item label="Return station">{order.returnStationName}</Descriptions.Item>
        <Descriptions.Item label="Pickup time">
          {dayjs(order.startTime).format(DATE_FORMAT)}
        </Descriptions.Item>
        <Descriptions.Item label="Return time">
          {dayjs(order.endTime).format(DATE_FORMAT)}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={ORDER_STATUS[order.status]?.color}>
            {ORDER_STATUS[order.status]?.text}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Total amount">
          {order.totalAmount?.toLocaleString("vi-VN") || "N/A"} VND
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
