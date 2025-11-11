// hooks/useStationStaff.js
import { useCallback } from "react";
import { useAxiosInstance } from "./useAxiosInstance";
import { message } from "antd";

export const useStationStaff = () => {
  const instance = useAxiosInstance();

  const approveRentalOrder = useCallback(async (orderId) => {
    try {
      const cleanId = Number(orderId);
      console.log("Approving order ID:", cleanId);

      const res = await instance.put(`/Approve`, {}, {
        params: { id: cleanId }
      });

      message.success("Duyệt đơn thuê thành công!");
      return res.data;
    } catch (error) {
      
      const errorMsg = error.response?.data?.title || 
                       error.response?.data?.message || 
                       "Không thể duyệt đơn thuê!";
      
      message.error(errorMsg);
      throw error;
    }
  }, [instance]);

  const rejectRentalOrder = useCallback(async (orderId) => {
    try {
      const cleanId = Number(orderId);
      console.log("Rejecting order ID:", cleanId);

      const res = await instance.put(`/Reject`, {}, {
        params: { id: cleanId }
      });

      message.success("Đã từ chối đơn thuê!");
      return res.data;
    } catch (error) {
      
      const errorMsg = error.response?.data?.title || 
                       error.response?.data?.message || 
                       "Không thể từ chối đơn thuê!";
      
      message.error(errorMsg);
      throw error;
    }
  }, [instance]);

  return { approveRentalOrder, rejectRentalOrder };
};