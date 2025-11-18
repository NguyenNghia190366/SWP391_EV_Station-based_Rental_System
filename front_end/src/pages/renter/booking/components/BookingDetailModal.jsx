import React from "react";
import { Modal, Tag } from "antd";

export default function BookingDetailModal({ visible, booking, onClose }) {
  if (!booking) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={`Booking details #${booking.bookingId}`}
      footer={null}
      width={700}
    >
      <p><strong>Customer name:</strong> {booking.user?.fullName}</p>
      <p><strong>Email:</strong> {booking.user?.email}</p>
      <p><strong>Vehicle:</strong> {booking.vehicle?.name}</p>
      <p><strong>Total amount:</strong> {booking.totalPrice?.toLocaleString("vi-VN")} VND</p>
      <p><strong>Status:</strong> <Tag>{booking.status}</Tag></p>
    </Modal>
  );
}
