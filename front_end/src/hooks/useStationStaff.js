// hooks/useStationStaff.js
import { useCallback } from "react";
import { useAxiosInstance } from "./useAxiosInstance";
import { message } from "antd";

export const useStationStaff = () => {
  const instance = useAxiosInstance();

  const approveRentalOrder = useCallback(async (record) => {
    try {
      const payload = {
        id: Number(record.orderId),
        renterId: record.renterId,
        vehicleId: record.vehicleId,
        pickupStationId: record.pickupStationId,
        returnStationId: record.returnStationId,
        startTime: record.startTime,
        endTime: record.endTime,
        status: "APPROVED"
      };

      console.log("📤 Sending approve payload:", payload);

      const res = await instance.put(
        `/RentalOrders/Approve`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );

      message.success("✅ Duyệt đơn thuê thành công!");
      return res.data;
    } catch (error) {
      console.error("❌ Approve error:", error);
      
      // Hiển thị chi tiết lỗi
      const errorMsg = error.response?.data?.title || 
                       error.response?.data?.message || 
                       JSON.stringify(error.response?.data?.errors) ||
                       "Không thể duyệt đơn thuê!";
      
      message.error(errorMsg);
      throw error;
    }
  }, [instance]);

  const rejectRentalOrder = useCallback(async (record) => {
    try {
      const payload = {
        id: Number(record.orderId),
        renterId: record.renterId,
        vehicleId: record.vehicleId,
        pickupStationId: record.pickupStationId,
        returnStationId: record.returnStationId,
        startTime: record.startTime,
        endTime: record.endTime,
        status: "REJECTED"
      };

      console.log("📤 Sending reject payload:", payload);

      const res = await instance.put(
        `/RentalOrders/Reject`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );

      message.success("🚫 Đã từ chối đơn thuê!");
      return res.data;
    } catch (error) {
      console.error("❌ Reject error:", error);
      
      const errorMsg = error.response?.data?.title || 
                       error.response?.data?.message || 
                       JSON.stringify(error.response?.data?.errors) ||
                       "Không thể từ chối đơn thuê!";
      
      message.error(errorMsg);
      throw error;
    }
  }, [instance]);

  return { approveRentalOrder, rejectRentalOrder };
};