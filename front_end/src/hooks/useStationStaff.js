import { useCallback } from "react";
import { useAxiosInstance } from "./useAxiosInstance";
import { message } from "antd";

export const useStationStaff = () => {
  const instance = useAxiosInstance();

  // 🔹 Approve Rental Order
  const approveRentalOrder = useCallback(
    async (orderId) => {
      try {
        const cleanId = String(orderId).trim();
        console.log(`📤 PUT /RentalOrders/Approve?id=${cleanId}`);
        const res = await instance.put(`/RentalOrders/Approve?id=${cleanId}`);
        message.success("Duyệt đơn thuê thành công!");
        return res.data;
      } catch (error) {
        console.error(
          "Lỗi duyệt đơn:",
          error.response?.data || error.message
        );
        message.error("Không thể duyệt đơn thuê!");
        throw error;
      }
    },
    [instance]
  );

  // 🔹 Reject Rental Order
  const rejectRentalOrder = useCallback(
    async (orderId) => {
      try {
        const cleanId = String(orderId).trim();
        console.log(`📤 PUT /RentalOrders/Reject?id=${cleanId}`);
        const res = await instance.put(`/RentalOrders/Reject?id=${cleanId}`);
        message.success("Đã từ chối đơn thuê!");
        return res.data;
      } catch (error) {
        console.error(
          "Lỗi từ chối đơn:",
          error.response?.data || error.message
        );
        message.error("Không thể từ chối đơn thuê!");
        throw error;
      }
    },
    [instance]
  );

  return { approveRentalOrder, rejectRentalOrder };
};
