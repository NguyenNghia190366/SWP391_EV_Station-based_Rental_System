import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin } from "antd";

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // If an orderId is present, forward the user to the contract-online flow
    if (orderId) {
      navigate(`/renter/contract-online/${orderId}`);
    }
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card style={{ width: 480, textAlign: "center" }}>
        <h3>Đang chuyển tới trang thanh toán...</h3>
        <div style={{ marginTop: 24 }}><Spin /></div>
      </Card>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message, Spin } from "antd";
import { usePayment } from "@/hooks/usePayment";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { createPayment } = usePayment();
  const axiosInstance = useAxiosInstance();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("vnpay");

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/RentalOrders/${orderId}`);
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching order:", error);
        message.error("Không thể tải thông tin đơn hàng");
        navigate("/my-bookings");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, axiosInstance, navigate]);

  // Handle payment
  const handlePayment = async () => {
    if (!order) return;

    setProcessing(true);
    try {
      if (paymentMethod === "vnpay") {
        // Tính tổng tiền: tiền thuê + tiền cọc (30%)
        const rentalPrice = order.rentalPrice || 0;
        const depositPrice = rentalPrice * 0.3;
        const totalAmount = rentalPrice + depositPrice;

        // Gọi API tạo thanh toán VNPay
        const paymentResponse = await createPayment(orderId, totalAmount, "rental");

        if (paymentResponse?.paymentUrl) {
          // Redirect đến VNPay
          window.location.href = paymentResponse.paymentUrl;
        } else {
          message.error("Không thể khởi tạo thanh toán VNPay");
        }
      } else {
        message.info(`Phương thức thanh toán "${paymentMethod}" sẽ được triển khai sau`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      message.error("Lỗi khi xử lý thanh toán");
    } finally {
      setProcessing(false);
    }
  };

  const handleBack = () => {
    navigate(`/renter/contract-online/${orderId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin tip="Đang tải thông tin thanh toán..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Không tìm thấy đơn hàng</h2>
          <button
            onClick={() => navigate("/my-bookings")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Quay lại lịch sử
          </button>
        </div>
      </div>
    );
  }

  const rentalPrice = order.rentalPrice || 0;
  const depositPrice = rentalPrice * 0.3;
  const totalPrice = rentalPrice + depositPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            THANH TOÁN
          </h1>
          <p className="text-gray-600">Hoàn tất thanh toán để xác nhận đơn thuê xe</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ======= Order Summary ======= */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              📋 Thông tin đơn hàng
            </h2>
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-700">
                  <b>Mã đơn:</b> #{order.orderId}
                </p>
                <p className="text-gray-700 mt-2">
                  <b>Thời gian:</b> {order.startTime && new Date(order.startTime).toLocaleDateString("vi-VN")} → {order.endTime && new Date(order.endTime).toLocaleDateString("vi-VN")}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">Tiền thuê xe:</span>
                  <span className="font-semibold text-gray-900">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(rentalPrice)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">Tiền cọc (30%):</span>
                  <span className="font-semibold text-orange-600">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(depositPrice)}
                  </span>
                </div>
                <div className="flex justify-between py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-4">
                  <span className="text-lg font-bold text-gray-900">TỔNG THANH TOÁN:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">
                  � Tiền cọc sẽ được trừ từ khoản thanh toán cuối cùng khi bạn hoàn trả xe
                </p>
              </div>
            </div>
          </div>

          {/* ======= Payment Methods ======= */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              💳 Phương thức thanh toán
            </h2>

            <div className="space-y-3 mb-6">
              {[
                { value: "vnpay", label: "VNPay", description: "An toàn, nhanh chóng" },
                { value: "momo", label: "Ví MoMo", description: "Sắp có" },
                { value: "zalopay", label: "ZaloPay", description: "Sắp có" },
                { value: "bank", label: "Chuyển khoản ngân hàng", description: "Sắp có" },
              ].map((m) => (
                <label
                  key={m.value}
                  className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === m.value
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.value}
                    checked={paymentMethod === m.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={m.value !== "vnpay"}
                    className="hidden"
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">{m.label}</span>
                    <span className="text-xs text-gray-500">{m.description}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 space-y-2 mb-6">
              <p className="text-sm text-gray-700">✔️ Thông tin thanh toán được mã hóa và bảo mật</p>
              <p className="text-sm text-gray-700">🕐 Bạn có thể hủy đơn miễn phí trước 24h</p>
            </div>

            {/* ======= Payment Buttons ======= */}
            <div className="flex gap-4">
              <button
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                onClick={handleBack}
                disabled={processing}
              >
                ← Quay lại
              </button>
              <button
                className="flex-[2] px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePayment}
                disabled={processing || paymentMethod !== "vnpay"}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Đang xử lý...
                  </span>
                ) : (
                  `Thanh toán ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

