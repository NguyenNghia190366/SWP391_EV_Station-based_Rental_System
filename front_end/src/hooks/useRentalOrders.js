import { useCallback } from "react";
import { useAxiosInstance } from "./useAxiosInstance";
import { message, notification } from "antd";
import { toast } from "react-toastify";
import axios from "axios";

export const useRentalOrders = (withApi = false) => {
  const instance = useAxiosInstance(withApi);
  const axiosInstance = useAxiosInstance();

  // 🔹 1. Get rental orders by renterId
  const getRentalOrdersByRenterId = useCallback(
    async (renterId) => {
      try {
        const res = await instance.get(`/RentalOrders?renter_id=${renterId}`);
        return res.data;
      } catch (error) {
        console.error(
          `❌ Fetch Rental Orders for renterId=${renterId} failed:`,
          error
        );
        throw error;
      }
    },
    [instance]
  );

  // 🔹 2. Create rental order
  const createRentalOrder = useCallback(
    async (orderData) => {
      try {
        console.log(
          "📤 POST /RentalOrders with data:",
          JSON.stringify(orderData, null, 2)
        );
        const res = await instance.post(`/RentalOrders`, orderData, {
          headers: { "Content-Type": "application/json" },
        });
        console.log("✅ Response from server:", res.data);
        return res.data;
      } catch (error) {
        console.error("❌ Error creating rental order:");
        console.error("  Status:", error.response?.status);
        console.error(
          "  Response Data:",
          JSON.stringify(error.response?.data, null, 2)
        );
        console.error("  Error Message:", error.message);
        console.error("  Full Error:", error);

        // Show backend error details
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data?.title ||
          "Cannot create rental order. Please try again!";

        message.error(`❌ ${errorMsg}`);
        throw error;
      }
    },
    [instance]
  );

  // 🔹 3. Approve booking
  const approveRentalOrder = useCallback(
    async (orderId, orderData) => {
      try {
        const res = await instance.put(`/RentalOrders/${orderId}`, {
          ...orderData,
          status: "APPROVED",
        });
        message.success("✅ Booking request approved!");
        return res.data;
      } catch (error) {
        console.error("❌ Approve error:", error);
        message.error("Cannot approve request. Please try again!");
        throw error;
      }
    },
    [instance]
  );

  // Hand over vehicle
  const handOverOrder = useCallback(
    async (orderId) => {
      try {
        const res = await instance.put(`/Inuse?id=${orderId}`);
        message.success("✅ Vehicle delivered successfully!");
        return res.data;
      } catch (error) {
        console.error("❌ Hand over error:", error);
        message.error("Cannot approve request. Please try again!");
        throw error;
      }
    },
    [instance]
  );

  // Return vehicle
  const handOverReturnOrder = useCallback(
    async (orderId) => {
      try {
        const res = await instance.put(`/Complete?id=${orderId}`);
        toast.success("🚗 Xe đã được trả thành công!");
        return res.data;
      } catch (error) {
        console.error("❌ Return error:", error);
        toast.error("Không thể xác nhận trả xe. Vui lòng thử lại!");
        throw error;
      }
    },
    [instance]
  );

  // 🔹 4. Reject booking
  const rejectRentalOrder = useCallback(
    async (orderId, orderData) => {
      try {
        const res = await instance.put(`/api/RentalOrders/${orderId}`, {
          ...orderData,
          status: "REJECTED",
        });
        message.success("✅ Booking request rejected!");
        return res.data;
      } catch (error) {
        console.error("❌ Reject error:", error);
        message.error("Cannot reject request. Please try again!");
        throw error;
      }
    },
    [instance]
  );

  // 🔹 5. Update booking status
  const updateRentalOrderStatus = useCallback(
    async (orderId, status, orderData) => {
      try {
        const res = await instance.put(`/api/RentalOrders/${orderId}`, {
          ...orderData,
          status,
        });
        return res.data;
      } catch (error) {
        console.error("❌ Error updating status:", error);
        throw error;
      }
    },
    [instance]
  );

  // Complete rental order (set status from IN_USE to COMPLETED)
const completeRentalOrder = useCallback(
  async (orderId) => {
    try {
      console.debug("completeRentalOrder -> orderId:", orderId);
      
      // Lấy token từ localStorage (hoặc nơi bạn lưu token)
      const token = localStorage.getItem('token'); // Hoặc tên key bạn dùng để lưu token
      
      // Gọi trực tiếp URL đầy đủ với Authorization header
      const res = await axios.put(
        `https://alani-uncorroboratory-sympetaly.ngrok-free.dev/Complete?id=${orderId}`,
        null,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.debug("completeRentalOrder response:", res);
      message.success("✅ Vehicle return completed successfully!");
      return res.data;
    } catch (error) {
      console.error("Error completing rental order:", error);
      message.error("Cannot complete vehicle return. Please try again!");
      throw error;
    }
  },
  []
);

  return {
    getRentalOrdersByRenterId,
    createRentalOrder,
    approveRentalOrder,
    handOverOrder,
    rejectRentalOrder,
    updateRentalOrderStatus,
    handOverReturnOrder,
    completeRentalOrder,
  };
};
