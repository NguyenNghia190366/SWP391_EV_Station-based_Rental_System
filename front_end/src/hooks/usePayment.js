import { useCallback } from "react";
import { useAxiosInstance } from "./useAxiosInstance";

export const usePayment = () => {
  const axiosInstance = useAxiosInstance();

  const createPayment = useCallback(
    async (orderId, amount, orderType = "rental", fullName, description) => {
      try {
        const payload = {
          orderId,
          amount: Math.round(amount),
          orderType,
          fullName,
          description,
        };
        // Debugging info: show baseURL and payload so developer can inspect console when 404 occurs
        console.debug("createPayment -> baseURL:", axiosInstance.defaults?.baseURL, "payload:", payload);

        // Use relative path without duplicating 'api' in case baseURL already contains it
        const response = await axiosInstance.post("vnpay/create-payment", payload);
        console.debug("createPayment response:", response);
        return response.data;
      } catch (error) {
        console.error("Error creating payment:", error);
        throw error;
      }
    },
    [axiosInstance]
  );

  const handlePaymentReturn = useCallback(
    async (params = {}) => {
      try {
        // params: object of query params returned from VNPay (e.g., vnp_TxnRef, vnp_ResponseCode)
        console.debug("handlePaymentReturn -> baseURL:", axiosInstance.defaults?.baseURL, "params:", params);
        const response = await axiosInstance.get("vnpay/vnpay_return", { params });
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
        const payload = { orderId, amount: Math.round(amount), reason };
        console.debug("createRefund -> baseURL:", axiosInstance.defaults?.baseURL, "payload:", payload);
        const response = await axiosInstance.post("vnpay/create-refund", payload);
        console.debug("createRefund response:", response);
        return response.data;
      } catch (error) {
        console.error("Error creating refund:", error);
        throw error;
      }
    },
    [axiosInstance]
  );

  // Update rental order status to IN_USE after successful payment
  const updateOrderStatusToInUse = useCallback(
    async (orderId) => {
      try {
        console.debug("updateOrderStatusToInUse -> orderId:", orderId);
        const response = await axiosInstance.put(`/RentalOrders/${orderId}`, {
          status: "IN_USE"
        });
        console.debug("updateOrderStatusToInUse response:", response);
        return response.data;
      } catch (error) {
        console.error("Error updating order status to IN_USE:", error);
        // Non-fatal error - log but don't throw
        return null;
      }
    },
    [axiosInstance]
  );

  return {
    createPayment,
    handlePaymentReturn,
    createRefund,
    updateOrderStatusToInUse,
  };
};
