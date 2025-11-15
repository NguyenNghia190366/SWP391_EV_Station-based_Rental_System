import { useCallback } from "react";
import { useAxiosInstance } from "./useAxiosInstance";
import { message, notification } from "antd";

export const useRentalOrders = (withApi = false) => {
  const instance = useAxiosInstance(withApi);
  const axiosInstance = useAxiosInstance();

  // 🔹 1. Lấy danh sách đơn thuê theo renterId
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

  // 🔹 2. Tạo đơn thuê
  const createRentalOrder = useCallback(
    async (orderData) => {
      try {
        console.log("📤 POST /RentalOrders với data:", JSON.stringify(orderData, null, 2));
        const res = await instance.post(`/RentalOrders`, orderData, {
          headers: { "Content-Type": "application/json" },
        });
        console.log("✅ Response từ server:", res.data);
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi tạo đơn thuê:");
        console.error("  Status:", error.response?.status);
        console.error("  Response Data:", JSON.stringify(error.response?.data, null, 2));
        console.error("  Error Message:", error.message);
        console.error("  Full Error:", error);
        
        // Hiển thị chi tiết lỗi từ backend
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.response?.data?.title ||
                        "Không thể tạo đơn thuê. Vui lòng thử lại!";
        
        message.error(`❌ ${errorMsg}`);
        throw error;
      }
    },
    [instance]
  );

  // 🔹 3. Duyệt booking (Approve)
  const approveRentalOrder = useCallback(
    async (orderId, orderData) => {
      try {
        const res = await instance.put(`/RentalOrders/${orderId}`, {
          ...orderData,
          status: "APPROVED",
        });
        message.success("✅ Đã duyệt yêu cầu booking!");
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi approve:", error);
        message.error("Không thể duyệt yêu cầu. Vui lòng thử lại!");
        throw error;
      }
    },
    [instance]
  );

  // Giao xe
  const handOverOrder = useCallback(
    async (orderId) => {
      try {
        const res = await instance.put(`/Inuse?id=${orderId}`);
        message.success("✅ Đã bàn giao xe thành công!");
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi approve:", error);
        message.error("Không thể duyệt yêu cầu. Vui lòng thử lại!");
        throw error;
      }
    },
    [instance]
  );

  // Trả xe
  const handOverReturnOrder = useCallback(
    async (orderId) => {
      try {
        const res = await instance.put(`/Completed?id=${orderId}`);
        message.success("✅ Đã tiếp nhận xe thành công!");
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi approve:", error);
        message.error("Không thể duyệt yêu cầu. Vui lòng thử lại!");
        throw error;
      }
    },
    [instance]
  );

  // 🔹 4. Từ chối booking (Reject)
  const rejectRentalOrder = useCallback(
    async (orderId, orderData) => {
      try {
        const res = await instance.put(`/RentalOrders/${orderId}`, {
          ...orderData,
          status: "REJECTED",
        });
        message.success("✅ Đã từ chối yêu cầu booking!");
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi reject:", error);
        message.error("Không thể từ chối yêu cầu. Vui lòng thử lại!");
        throw error;
      }
    },
    [instance]
  );

  // 🔹 5. Cập nhật trạng thái booking
  const updateRentalOrderStatus = useCallback(
    async (orderId, status, orderData) => {
      try {
        const res = await instance.put(`/RentalOrders/${orderId}`, {
          ...orderData,
          status,
        });
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi cập nhật trạng thái:", error);
        throw error;
      }
    },
    [instance]
  );

  // Complete rental order (set status to COMPLETED and restore vehicle availability)
  const completeRentalOrder = useCallback(
    async (orderId, vehicleId) => {
      try {
        console.debug("completeRentalOrder -> orderId:", orderId, "vehicleId:", vehicleId);
        
        // Update order status to COMPLETED
        const orderResponse = await axiosInstance.put(`/RentalOrders/${orderId}`, {
          status: "COMPLETED"
        });
        console.debug("completeRentalOrder order update response:", orderResponse);

        // Update vehicle availability - increment quantityAvailable by 1
        if (vehicleId) {
          const vehicleResponse = await axiosInstance.put(`/Vehicles/${vehicleId}`, {
            quantityAvailable: { $inc: 1 }
          });
          console.debug("completeRentalOrder vehicle update response:", vehicleResponse);
        }

        return orderResponse.data;
      } catch (error) {
        console.error("Error completing rental order:", error);
        throw error;
      }
    },
    [axiosInstance]
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
