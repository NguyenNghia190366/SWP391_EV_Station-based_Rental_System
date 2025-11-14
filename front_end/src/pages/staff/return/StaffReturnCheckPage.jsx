// pages/staff/return/StaffReturnCheckPage.jsx
import React, { useEffect, useState } from "react";
import { Card, Form, InputNumber, Input, Button, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";

export default function StaffReturnCheckPage() {
  const { orderId } = useParams();
  const axios = useAxiosInstance();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await axios.get(`/RentalOrders/${orderId}`);
      setOrder(res.data);
    } catch {
      message.error("Không thể tải thông tin đơn.");
    }
  };

  const onFinish = (values) => {
    const totalFee =
      (values.damageFee || 0) +
      (values.lateFee || 0) +
      (values.extraKmFee || 0);

    navigate(`/staff/return-summary/${orderId}`, {
      state: { ...values, totalFee },
    });
  };

  if (!order) return null;

  return (
    <div style={{ padding: 24 }}>
      <Card title={`Kiểm tra xe thuê #${order.orderId}`}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Km vượt quá" name="extraKmFee">
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item label="Phí hư hỏng" name="damageFee">
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item label="Phí trễ hạn" name="lateFee">
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Tiếp tục
          </Button>
        </Form>
      </Card>
    </div>
  );
}
