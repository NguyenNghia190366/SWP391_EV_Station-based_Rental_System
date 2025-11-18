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
        <h3>Redirecting to payment page...</h3>
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
        message.error("Cannot load order details");
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
        // Calculate total: rental + deposit (30%)
        const rentalPrice = order.rentalPrice || 0;
        const depositPrice = rentalPrice * 0.3;
        const totalAmount = rentalPrice + depositPrice;

        // Call API to create VNPay payment
        const paymentResponse = await createPayment(orderId, totalAmount, "rental");

        if (paymentResponse?.paymentUrl) {
          // Redirect to VNPay
          window.location.href = paymentResponse.paymentUrl;
        } else {
          message.error("Cannot initialize VNPay payment");
        }
      } else {
        message.info(`Payment method "${paymentMethod}" will be implemented later`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      message.error("Error processing payment");
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
        <Spin tip="Loading payment details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Order not found</h2>
          <button
            onClick={() => navigate("/my-bookings")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Back to history
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
            PAYMENT
          </h1>
          <p className="text-gray-600">Complete the payment to confirm your rental order</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ======= Order Summary ======= */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              📋 Order information
            </h2>
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-700">
                  <b>Order ID:</b> #{order.orderId}
                </p>
                  <p className="text-gray-700 mt-2">
                  <b>Time:</b> {order.startTime && new Date(order.startTime).toLocaleDateString("vi-VN")} → {order.endTime && new Date(order.endTime).toLocaleDateString("vi-VN")}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">Rental fee:</span>
                  <span className="font-semibold text-gray-900">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(rentalPrice)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">Deposit (30%):</span>
                  <span className="font-semibold text-orange-600">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(depositPrice)}
                  </span>
                </div>
                <div className="flex justify-between py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-4">
                  <span className="text-lg font-bold text-gray-900">TOTAL PAYMENT:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">
                  � The deposit will be deducted from the final payment when you return the vehicle
                </p>
              </div>
            </div>
          </div>

          {/* ======= Payment Methods ======= */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              💳 Payment method
            </h2>

            <div className="space-y-3 mb-6">
              {[
                { value: "vnpay", label: "VNPay", description: "Secure, fast" },
                { value: "momo", label: "MoMo", description: "Coming soon" },
                { value: "zalopay", label: "ZaloPay", description: "Coming soon" },
                { value: "bank", label: "Bank transfer", description: "Coming soon" },
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
              <p className="text-sm text-gray-700">✔️ Payment information is encrypted and secured</p>
              <p className="text-sm text-gray-700">🕐 You can cancel for free up to 24 hours before the start time</p>
            </div>

            {/* ======= Payment Buttons ======= */}
            <div className="flex gap-4">
              <button
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                onClick={handleBack}
                disabled={processing}
              >
                ← Back
              </button>
              <button
                className="flex-[2] px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePayment}
                disabled={processing || paymentMethod !== "vnpay"}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </span>
                ) : (
                  `Pay ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}`
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

