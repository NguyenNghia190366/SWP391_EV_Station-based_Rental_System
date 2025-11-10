import React, { useState, useEffect } from "react";
import { message } from "antd";
import BookingRequestTable from "./components/BookingRequestTable";
import BookingDetailModal from "./components/BookingDetailModal";

export default function BookingRequestsPage() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // ✅ load data
  const loadBookingRequests = async () => {
    try {
      setLoading(true);
      const allBookings = JSON.parse(localStorage.getItem("allBookings") || "[]");
      setBookings(allBookings);
    } catch (e) {
      message.error("Không thể tải dữ liệu booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookingRequests();
  }, []);

  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  return (
    <div className="space-y-6">
      <BookingRequestTable
        bookings={bookings}
        loading={loading}
        onViewDetail={handleViewDetail}
      />
      <BookingDetailModal
        visible={modalVisible}
        booking={selectedBooking}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
}
