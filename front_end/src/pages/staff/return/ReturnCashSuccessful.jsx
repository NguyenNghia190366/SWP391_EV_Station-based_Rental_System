import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button } from "antd";

export default function ReturnCashSuccessful() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const search = new URLSearchParams(location.search);

  const orderId = state.orderId || search.get("orderId") || "(N/A)";
  const amount = state.amount || search.get("amount") || null;
  const fullName = state.fullName || search.get("fullName") || search.get("Fullname") || "(Customer)";
  const description = state.description || search.get("description") || null;
  const rawHtml = state.html || search.get("html") || null;

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
            <h1 style={{ color: "#22c55e", fontSize: 28, marginBottom: 8 }}>Refund successful ✅</h1>
            <p style={{ color: "#374151", marginBottom: 18 }}>A refund has been initiated for the customer. Details are below.</p>


            <div style={{ marginTop: 22 }}>
              <Button type="primary" onClick={() => navigate(`/staff/dashboard`)} style={{ marginRight: 12 }}>
                Back to dashboard
              </Button>
              <Button onClick={() => navigate(`/staff/return-requests`)}>Back to return requests</Button>
            </div>

            {rawHtml && (
              <div style={{ marginTop: 24, textAlign: "left" }}>
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
