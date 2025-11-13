import React, { useEffect, useState } from "react";
import { Card, Button, Spin, message, Tag, Descriptions, Empty, Modal } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import dayjs from "dayjs";

export default function PickupPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [handoverRequested, setHandoverRequested] = useState(false);
  const axiosInstance = useAxiosInstance();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/RentalOrders/${orderId}`);
        const orderData = res.data;

        // Fetch related vehicle, renter, station data
        const [vehicleRes, renterRes, stationRes] = await Promise.all([
          axiosInstance.get(`/Vehicles/${orderData.vehicleId}`).catch(() => null),
          axiosInstance.get(`/Renters`).catch(() => ({ data: [] })),
          axiosInstance.get(`/Stations`).catch(() => ({ data: [] })),
        ]);

        const vehicle = vehicleRes?.data || null;
        const renters = Array.isArray(renterRes?.data) ? renterRes.data : [];
        const stations = Array.isArray(stationRes?.data) ? stationRes.data : [];

        // Find matching renter
        const renter = renters.find(r => r.renterId === orderData.renterId);
        const pickupStation = stations.find(s => s.stationId === orderData.pickupStationId);

        const mergedOrder = {
          ...orderData,
          vehicleName: vehicle?.vehicleName || "N/A",
          vehicleLicensePlate: vehicle?.licensePlate || "N/A",
          renterName: renter?.renterName || orderData.renterName || "N/A",
          renterPhone: renter?.phone || orderData.renterPhone || "N/A",
          pickupStationName: pickupStation?.stationName || "N/A",
        };

        // reflect server-side status: if already pending handover, mark as requested so user cannot resend
        if (mergedOrder.status === "PENDING_HANDOVER") {
          setHandoverRequested(true);
        }
        setOrder(mergedOrder);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching order:", err);
        message.error("Không thể tải thông tin đơn hàng.");
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId, axiosInstance]);

  const handleRequestPickup = async () => {
    if (!order) return;
    // open inline confirmation modal
    setShowConfirmModal(true);
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const performRequestPickup = async () => {
    if (!order) return;
    setRequesting(true);
    setHandoverRequested(true);
    try {
      // Backend PUT expects RentalOrder with OrderId matching the URL param
      // Include minimal navigation properties to pass validation
      const payload = {
        OrderId: Number(orderId),
        RenterId: order.renterId || order.RenterId,
        VehicleId: order.vehicleId || order.VehicleId,
        PickupStationId: order.pickupStationId || order.PickupStationId || null,
        ReturnStationId: order.returnStationId || order.ReturnStationId || null,
        StartTime: order.startTime || order.StartTime,
        EndTime: order.endTime || order.EndTime || null,
        Status: "PENDING_HANDOVER",
        ImgVehicleBeforeUrl: order.imgVehicleBeforeUrl || order.ImgVehicleBeforeUrl || null,
        ImgVehicleAfterUrl: order.imgVehicleAfterUrl || order.ImgVehicleAfterUrl || null,
        CreatedAt: order.createdAt || order.CreatedAt,
        // Include empty navigation properties to avoid validation errors
        Renter: null,
        Vehicle: null,
        PickupStation: null,
        ReturnStation: null,
      };

      console.log("Sending PUT payload:", JSON.stringify(payload, null, 2));
      
      await axiosInstance.put(`/RentalOrders/${orderId}`, payload);
      message.success("Yêu cầu nhận xe đã được gửi tới nhân viên. Vui lòng chờ phê duyệt.");
    } catch (err) {
      console.error("Error requesting pickup:", err);
      console.error("Full error response:", err.response?.data);
      if (err.response?.data?.errors) {
        console.error("Validation errors:", err.response.data.errors);
      }
      message.error("Không thể gửi yêu cầu. Vui lòng thử lại sau.");
      setHandoverRequested(false);
    } finally {
      setRequesting(false);
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <Spin tip="Đang tải thông tin..." />
      </div>
    );
  }

  if (!order) {
    return <Empty description="Không tìm thấy đơn hàng." />;
  }

  return (
    <Card title={`Yêu cầu nhận xe - Đơn #${orderId}`} style={{ maxWidth: 800, margin: "0 auto" }}>
      <Descriptions column={1} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Tên khách hàng">{order.renterName}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{order.renterPhone}</Descriptions.Item>
        <Descriptions.Item label="Tên xe">{order.vehicleName}</Descriptions.Item>
        <Descriptions.Item label="Biển số">{order.vehicleLicensePlate}</Descriptions.Item>
        <Descriptions.Item label="Trạm nhận xe">{order.pickupStationName}</Descriptions.Item>
        <Descriptions.Item label="Thời gian bắt đầu">
          {dayjs(order.startTime).format("DD/MM/YYYY HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian kết thúc">
          {dayjs(order.endTime).format("DD/MM/YYYY HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={order.status === "PENDING_HANDOVER" ? "orange" : "processing"}>
            {order.status === "PENDING_HANDOVER" ? "Chờ phê duyệt" : "Đã thanh toán"}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      {handoverRequested ? (
        <div style={{ marginTop: 24 }}>
          <Button type="primary" disabled style={{ backgroundColor: "#d9f7be", borderColor: "#d9f7be", color: "#389e0d" }}>
            ✓ Đã gửi yêu cầu
          </Button>
          <div style={{ marginTop: 12, color: '#6b7280' }}>
            Nhân viên tại trạm sẽ kiểm tra xe và xác nhận với bạn. Vui lòng liên hệ nhân viên để hoàn tất thủ tục nhận xe.
          </div>
          <div style={{ marginTop: 12 }}>
            <Button onClick={() => navigate("/my-bookings")}>
              Quay về lịch sử đặt xe
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="primary"
            size="large"
            loading={requesting}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            onClick={handleRequestPickup}
          >
            Yêu cầu nhận xe
          </Button>
          <Button onClick={() => navigate("/my-bookings")}>
            Quay lại
          </Button>
        </div>
      )}
      <Modal
        title="Xác nhận yêu cầu nhận xe"
        open={showConfirmModal}
        onOk={performRequestPickup}
        onCancel={() => setShowConfirmModal(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={requesting}
      >
        <p>{`Bạn sẽ gửi yêu cầu nhận xe cho nhân viên. Nhân viên sẽ phê duyệt và xe sẽ sẵn sàng để bạn nhận tại ${order.pickupStationName} vào lúc ${dayjs(order.startTime).format('DD/MM/YYYY HH:mm')}.`}</p>
      </Modal>
    </Card>
  );
}
