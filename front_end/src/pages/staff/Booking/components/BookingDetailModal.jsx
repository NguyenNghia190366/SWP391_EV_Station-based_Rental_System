import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Tag, message, Spin } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import dayjs from "dayjs";

export default function BookingDetailPage() {
  const { id } = useParams();
  const api = useAxiosInstance();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/RentalOrders/${id}`);
      setBooking(data);
    } catch {
      message.error("Cannot load rental order info!");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (approved) => {
    try {
      await api.put(`/RentalOrders/${id}`, {
        ...booking,
        status: approved ? "APPROVED" : "REJECTED",
      });
      message.success(approved ? "✅ Order approved" : "❌ Order rejected");
      navigate("/staff/dashboard");
    } catch {
      message.error("Cannot update status!");
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  if (loading) return <Spin className="flex justify-center mt-20" />;

  return (
    <div className="max-w-4xl mx-auto py-10">
      <Card title={`Booking details #${id}`} bordered={false}>
            <p><b>Customer:</b> {booking.renterId}</p>
            <p><b>Vehicle:</b> {booking.vehicleId}</p>
            <p>
              <b>Time:</b> {dayjs(booking.startTime).format("DD/MM HH:mm")} →{" "}
              {dayjs(booking.endTime).format("DD/MM HH:mm")}
            </p>
            <p><b>Pickup station:</b> {booking.pickupStationId}</p>
            <p><b>Return station:</b> {booking.returnStationId}</p>
            <p>
              <b>Status:</b>{" "}
          <Tag color={booking.status === "BOOKED" ? "blue" : "green"}>
            {booking.status}
          </Tag>
        </p>

        <div className="flex gap-4 mt-6">
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleAction(true)}
          >
            Approve
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => handleAction(false)}
          >
            Reject
          </Button>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
      </Card>
    </div>
  );
}
