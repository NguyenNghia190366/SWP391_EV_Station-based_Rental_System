// pages/staff/return/StaffReturnSummaryPage.jsx
import React, { useState, useEffect } from "react";
import { Card, Descriptions, Button, message } from "antd";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import { usePayment } from "@/hooks/usePayment";

export default function StaffReturnSummaryPage() {
  const { orderId } = useParams();
  const { state } = useLocation();
  const axios = useAxiosInstance();
  const navigate = useNavigate();
  const { createRefund } = usePayment();

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
      message.error("Cannot load order data.");
    }
  };

  if (!state || !order) return null;

  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // compute rental price (hours * pricePerHour) to use as fallback for deposit
  const getOrderRentalPrice = () => {
    try {
      const pricePerHour = toNumber(
        order.pricePerHour ||
          order.price_per_hour ||
          state?.vehicle?.vehicleModel?.price_per_hour ||
          state?.vehicle?.pricePerHour ||
          state?.vehicle?.price_per_hour
      );

      if (!order.startTime || !order.endTime) return 0;
      const start = new Date(order.startTime);
      const end = new Date(order.endTime);
      const hours = Math.max(0, (end - start) / (1000 * 60 * 60));
      return hours * pricePerHour;
    } catch (err) {
      console.error("Error computing rental price for deposit fallback", err);
      return 0;
    }
  };

  const rentalPrice = getOrderRentalPrice();

  const depositFromOrder = toNumber(
    order.deposit || order.depositAmount || order.deposit_amount
  );
  // use deposit from order when present (>0), otherwise default to 30% of rental price
  const depositNum =
    depositFromOrder > 0 ? depositFromOrder : +(rentalPrice * 0.3).toFixed(0);

  const totalFeeNum = toNumber(state.totalFee);

  const finalAmount = depositNum - totalFeeNum;

  const formatCurrency = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v || 0);

  const handleConfirmReturn = async () => {
    setLoading(true);
    try {
      // If renter is to receive money (finalAmount > 0), process refund payment
      if (finalAmount > 0) {
        try {
          console.log("Processing refund for amount:", finalAmount);
          const refundResult = await createRefund(
            orderId,
            finalAmount,
            "rental",
            order.renterName || state?.order?.renterName || "Renter",
            `Refund for order #${orderId} after deducting fees`
          );
          console.log("Refund result:", refundResult);

          // If refund returns a redirect URL, redirect to it (similar to payment flow)
          if (refundResult?.url || refundResult?.refundUrl) {
            window.location.href = refundResult.url || refundResult.refundUrl;
            return;
          }

          // If backend returned HTML or details, navigate to a success page to show them
          const successState = {
            orderId,
            amount: finalAmount,
            fullName:
              order.renter?.fullName ||
              order.renterName ||
              state?.order?.renterName ||
              "Renter",
            description:
              refundResult?.description || `Refund for order #${orderId}`,
            html:
              refundResult?.html ||
              refundResult?.paymentHtml ||
              refundResult?.successHtml ||
              null,
          };

          // Complete the rental order before navigating to success page

          navigate(`/staff/return-refund-success/${orderId}`, {
            state: successState,
          });
          return;
        } catch (refundErr) {
          console.error("Refund error:", refundErr);
          message.warning("Cannot initiate refund. Please try again.");
          setLoading(false);
          return;
        }
      }

      // No refund needed (finalAmount <= 0), just navigate back to dashboard
      await axios.put(`/api/RentalOrders/${orderId}/Complete`);

      // Navigate back to dashboard
      navigate("/staff/dashboard");
    } catch (err) {
      console.error(err);
      message.error("An error occurred while completing the return.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title={`Return summary #${order.orderId}`}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Deposit">
            {formatCurrency(depositNum)}
          </Descriptions.Item>

          <Descriptions.Item label="Total additional fees">
            {formatCurrency(totalFeeNum)}
          </Descriptions.Item>

          <Descriptions.Item label="Final amount">
            {finalAmount >= 0 ? (
              <span style={{ color: "green" }}>
                Refund to renter: {formatCurrency(finalAmount)}
              </span>
            ) : (
              <span style={{ color: "red" }}>
                Renter must pay additional: {formatCurrency(Math.abs(finalAmount))}
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
          Confirm deposit payment
        </Button>
      </Card>
    </div>
  );
}
