// pages/staff/return/StaffReturnSummaryPage.jsx
import React, { useState, useEffect } from "react";
import { Card, Descriptions, Button, message } from "antd";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";

export default function StaffReturnSummaryPage() {
  const { orderId } = useParams();
  const { state } = useLocation();
  const axios = useAxiosInstance();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await axios.get(`/RentalOrders/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      message.error("Không thể tải dữ liệu đơn.");
    }
  };

  if (!state || !order) return null;

  const finalAmount = order.deposit - state.totalFee;

  const handleConfirmReturn = async () => {
    setLoading(true);
    try {
      // 💥 GỌI API BACKEND ĐÚNG ĐỊNH DẠNG /Complete?id=xxx
      await axios.put(`/RentalOrders/Complete`, null, {
        params: { id: orderId }
      });

      message.success("Đã hoàn tất trả xe!");
      navigate("/staff/dashboard");
    } catch (err) {
      console.error(err);
      message.error("Không thể hoàn tất trả xe.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title={`Tổng kết trả xe #${order.orderId}`}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Tiền cọc">
            {order.deposit?.toLocaleString()} VND
          </Descriptions.Item>

          <Descriptions.Item label="Tổng phí phát sinh">
            {state.totalFee?.toLocaleString()} VND
          </Descriptions.Item>

          <Descriptions.Item label="Số tiền cuối cùng">
            {finalAmount >= 0 ? (
              <span style={{ color: "green" }}>
                Hoàn lại cho renter: {finalAmount.toLocaleString()} VND
              </span>
            ) : (
              <span style={{ color: "red" }}>
                Renter phải trả thêm: {Math.abs(finalAmount).toLocaleString()} VND
              </span>
            )}
          </Descriptions.Item>
        </Descriptions>

        <Button
          type="primary"
          loading={loading}
          block
          style={{ marginTop: 20 }}
          onClick={handleConfirmReturn}
        >
          Xác nhận hoàn tất trả xe
        </Button>
      </Card>
    </div>
  );
}
