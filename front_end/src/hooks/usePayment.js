import { useCallback } from "react";
import { useAxiosInstance } from "./useAxiosInstance";

export const usePayment = () => {
  const axiosInstance = useAxiosInstance();

  const createPayment = useCallback(
    async (orderId, amount, orderType = "rental") => {
      try {
        const response = await axiosInstance.post("/api/vnpay/create-payment", {
          orderId,
          amount: Math.round(amount),
          orderType,
        });
        return response.data;
      } catch (error) {
        console.error("Error creating payment:", error);
        throw error;
      }
    },
    [axiosInstance]
  );

  const handlePaymentReturn = useCallback(
    async (paymentCode) => {
      try {
        const response = await axiosInstance.get("/api/vnpay/vnpay_return", {
          params: { code: paymentCode },
        });
        return response.data;
      } catch (error) {
        console.error("Error handling payment return:", error);
        throw error;
      }
    },
    [axiosInstance]
  );

  const createRefund = useCallback(
    async (orderId, amount, reason = "Customer request") => {
      try {
        const response = await axiosInstance.post("/api/vnpay/create-refund", {
          orderId,
          amount: Math.round(amount),
          reason,
        });
        return response.data;
      } catch (error) {
        console.error("Error creating refund:", error);
        throw error;
      }
    },
    [axiosInstance]
  );

  return {
    createPayment,
    handlePaymentReturn,
    createRefund,
  };
};
