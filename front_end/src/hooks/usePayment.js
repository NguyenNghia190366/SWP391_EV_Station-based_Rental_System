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
        console.log("🔵 createPayment -> baseURL:", axiosInstance.defaults?.baseURL, "payload:", payload);

        // Use relative path without duplicating 'api' in case baseURL already contains it
        const response = await axiosInstance.post("vnpay/create-payment", payload);
        console.log("🟢 createPayment response:", response);
        return response.data;
      } catch (error) {
        console.error("❌ Error creating payment:", error);
        console.error("Response status:", error?.response?.status);
        console.error("Response data:", error?.response?.data);
        throw error;
      }
    },
    [axiosInstance]
  );

  const createRefund = useCallback(
    async (orderId, amount, orderType = "rental", fullName = "Refund", description = "Refund deposit") => {
      try {
        const payload = { orderId, amount: Math.round(amount), orderType, fullName, description };
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
    createRefund,
    updateOrderStatusToInUse,
  };
};
