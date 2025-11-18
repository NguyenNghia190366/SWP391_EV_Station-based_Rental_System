// hooks/useStationStaff.js
import { useCallback } from "react";
import { useAxiosInstance } from "./useAxiosInstance";
import { message } from "antd";

export const useStationStaff = () => {
  const instance = useAxiosInstance(true);

  const approveRentalOrder = useCallback(async (orderId) => {
    try {
      const cleanId = Number(orderId);
      console.log("Approving order ID:", cleanId);

      const res = await instance.put(`/Approve`, {}, {
        params: { id: cleanId }
      });

      message.success("Booking request approved successfully!");
      return res.data;
    } catch (error) {
      
      const errorMsg = error.response?.data?.title || 
                       error.response?.data?.message || 
                       "Cannot approve rental order!";
      
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

      message.success("Booking request rejected!");
      return res.data;
    } catch (error) {
      
      const errorMsg = error.response?.data?.title || 
                       error.response?.data?.message || 
                       "Cannot reject rental order!";
      
      message.error(errorMsg);
      throw error;
    }
  }, [instance]);

  return { approveRentalOrder, rejectRentalOrder };
};