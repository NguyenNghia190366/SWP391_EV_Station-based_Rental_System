import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button } from "antd";

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
    "(Không có)";
  const amount = state.amount || search.get("amount") || null;
  const fullName =
    state.fullName ||
    search.get("fullName") ||
    search.get("Fullname") ||
    search.get("fullname") ||
    "(Khách hàng)";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div style={{ width: "100%", maxWidth: 900 }}>
        <Card>
          <div style={{ textAlign: "center", padding: 24 }}>
            <h1 style={{ color: "#22c55e", fontSize: 28, marginBottom: 8 }}>Thanh toán thành công ✅</h1>
            <p style={{ color: "#374151", marginBottom: 18 }}>Cảm ơn bạn đã thanh toán. Thông tin chi tiết phía dưới.</p>

            <div style={{ textAlign: "left", maxWidth: 680, margin: "0 auto" }}>
              {amount !== null && <p><strong>Số tiền:</strong> {formatCurrency(amount)}</p>}
              {description && <p><strong>Mô tả:</strong> {description}</p>}
            </div>

            <div style={{ marginTop: 22 }}>
              <Button type="primary" onClick={() => navigate(`/renter/contract-online/${orderId}`)} style={{ marginRight: 12 }}>
                Quay lại hợp đồng
              </Button>
              <Button onClick={() => navigate('/my-bookings')}>Xem lịch sử</Button>
            </div>

            {rawHtml && (
              <div style={{ marginTop: 24, textAlign: "left" }}>
                <h3>Nội dung máy chủ trả về</h3>
                <div style={{ border: '1px solid #e5e7eb', padding: 12, borderRadius: 6 }} dangerouslySetInnerHTML={{ __html: rawHtml }} />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
