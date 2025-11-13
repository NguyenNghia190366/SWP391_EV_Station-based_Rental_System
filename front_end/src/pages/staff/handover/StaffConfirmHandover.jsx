// pages/staff/StaffConfirmHandover.jsx
import React, { useEffect, useState } from "react";
import { Card, Spin, Empty, message } from "antd";
import { useContract } from "@/hooks/useContract";
import HandoverTable from "./HandoverTable";
import OrderDetailModal from "./OrderDetailModal";

export default function StaffConfirmHandover() {
  const { fetchHandoverOrders } = useContract();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModal, setDetailModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchHandoverOrders();
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Xác nhận nhận xe"
        extra={<span style={{ color: "#666", fontSize: 12 }}>Tổng: {orders.length} yêu cầu</span>}
      >
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Spin tip="Đang tải..." />
          </div>
        ) : orders.length === 0 ? (
          <Empty description="Không có yêu cầu nhận xe nào" />
        ) : (
          <HandoverTable
            orders={orders}
            onRefresh={loadData}
            onShowDetail={(order) => {
              setSelectedOrder(order);
              setDetailModal(true);
            }}
          />
        )}
      </Card>

      <OrderDetailModal
        open={detailModal}
        order={selectedOrder}
        onClose={() => setDetailModal(false)}
      />
    </div>
  );
}
