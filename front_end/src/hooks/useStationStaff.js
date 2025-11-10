// hooks/useStationStaff.js
import { useCallback } from "react";
import { useAxiosInstance } from "./useAxiosInstance";
import { message } from "antd";

export const useStationStaff = () => {
  const instance = useAxiosInstance();

  const approveRentalOrder = useCallback(async (orderId) => {
    try {
      const cleanId = Number(orderId);
      console.log("✅ PUT /RentalOrders/Approve?id=", cleanId);

      const res = await instance.put(
        `/RentalOrders/Approve?id=${cleanId}`,
        {}, // ⚠️ Thử gửi empty object thay vì null
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
      console.error("❌ Full error:", error);
      console.error("❌ Response:", error.response?.data);
      console.error("❌ Status:", error.response?.status);
      console.error("❌ Headers sent:", error.config?.headers);
      
      // Hiển thị chi tiết lỗi
      const errorMsg = error.response?.data?.title || 
                       error.response?.data?.message || 
                       JSON.stringify(error.response?.data?.errors) ||
                       "Không thể duyệt đơn thuê!";
      
      message.error(errorMsg);
      throw error;
    }
  }, [instance]);

  const rejectRentalOrder = useCallback(async (orderId) => {
    try {
      const cleanId = Number(orderId);
      console.log("🚫 PUT /RentalOrders/Reject?id=", cleanId);

      const res = await instance.put(
        `/RentalOrders/Reject?id=${cleanId}`,
        {}, // ⚠️ Thử gửi empty object thay vì null
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
      console.error("❌ Full error:", error);
      console.error("❌ Response:", error.response?.data);
      
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