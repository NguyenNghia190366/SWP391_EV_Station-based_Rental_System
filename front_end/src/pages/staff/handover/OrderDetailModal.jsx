// pages/staff/components/OrderDetailModal.jsx
import React from "react";
import { Modal, Descriptions, Tag } from "antd";
import dayjs from "dayjs";

const ORDER_STATUS = {
  APPROVED: { color: "green", text: "Đã duyệt" },
  PENDING_HANDOVER: { color: "orange", text: "Chờ nhận" },
  IN_USE: { color: "blue", text: "Đang sử dụng" },
};

const DATE_FORMAT = "DD/MM/YYYY HH:mm";

export default function OrderDetailModal({ open, order, onClose }) {
  if (!order) return null;

  return (
    <Modal
      title={`Chi tiết đơn #${order.orderId}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Descriptions column={1} style={{ marginTop: 16 }}>
        <Descriptions.Item label="Khách hàng">{order.renterName}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{order.renterPhone}</Descriptions.Item>
        <Descriptions.Item label="Tên xe">{order.vehicleName}</Descriptions.Item>
        <Descriptions.Item label="Biển số">{order.vehicleLicensePlate}</Descriptions.Item>
        <Descriptions.Item label="Trạm nhận">{order.pickupStationName}</Descriptions.Item>
        <Descriptions.Item label="Trạm trả">{order.returnStationName}</Descriptions.Item>
        <Descriptions.Item label="Thời gian nhận">
          {dayjs(order.startTime).format(DATE_FORMAT)}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian trả">
          {dayjs(order.endTime).format(DATE_FORMAT)}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={ORDER_STATUS[order.status]?.color}>
            {ORDER_STATUS[order.status]?.text}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Tổng tiền">
          {order.totalAmount?.toLocaleString("vi-VN") || "N/A"} VNĐ
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
