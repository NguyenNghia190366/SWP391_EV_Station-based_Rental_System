import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button } from "antd";
import { CheckCircleTwoTone } from "@ant-design/icons";

export default function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Accept data from either location.state or query string
  const state = location.state || {};
  const search = new URLSearchParams(location.search);

  // Accept various query param names (orderId, order_id) and Fullname casing
  const orderId =
    state.orderId ||
    search.get("orderId") ||
    search.get("order_id") ||
    "(N/A)";
  const amount = state.amount || search.get("amount") || null;
  const fullName =
    state.fullName ||
    search.get("fullName") ||
    search.get("Fullname") ||
    search.get("fullname") ||
    "(Customer)";
  const description = state.description || search.get("description") || null;
  const rawHtml = state.html || search.get("html") || null;

  // If URL has `order_id` and the backend returned `response.order_id`, allow that too
  // Also treat `Fullname` (capital F) as requested in the URL structure

  const formatCurrency = (v) => {
    const n = Number(v);
    if (isNaN(n)) return v || "";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div style={{ width: "100%", maxWidth: 500 }}>
        <Card bordered={false} style={{ borderRadius: 16, boxShadow: "0 4px 24px #0001" }}>
          <div style={{ textAlign: "center", padding: 32 }}>
            <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 64, marginBottom: 12 }} />
            <h1 style={{ color: "#22c55e", fontSize: 32, marginBottom: 8, fontWeight: 700 }}>Thanh toán thành công!</h1>



            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 16 }}>
              <Button type="primary" size="large" onClick={() => navigate(`/renter/contract-online/${orderId}`)}>
                Xem hợp đồng
              </Button>
              <Button size="large" onClick={() => navigate('/user-dashboard')}>
                Lịch sử đặt xe
              </Button>
            </div>

            {rawHtml && (
              <div style={{ marginTop: 32, textAlign: "left" }}>
                <h3>Server response</h3>
                <div style={{ border: '1px solid #e5e7eb', padding: 12, borderRadius: 6 }} dangerouslySetInnerHTML={{ __html: rawHtml }} />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
