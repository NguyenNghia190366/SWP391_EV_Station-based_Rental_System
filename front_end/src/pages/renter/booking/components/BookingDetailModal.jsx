import React from "react";
import { Modal, Tag } from "antd";

export default function BookingDetailModal({ visible, booking, onClose }) {
  if (!booking) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={`Chi tiết booking #${booking.bookingId}`}
      footer={null}
      width={700}
    >
      <p><strong>Tên khách:</strong> {booking.user?.fullName}</p>
      <p><strong>Email:</strong> {booking.user?.email}</p>
      <p><strong>Xe:</strong> {booking.vehicle?.name}</p>
      <p><strong>Tổng tiền:</strong> {booking.totalPrice?.toLocaleString("vi-VN")} đ</p>
      <p><strong>Trạng thái:</strong> <Tag>{booking.status}</Tag></p>
    </Modal>
  );
}
