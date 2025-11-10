import { use } from "react"
import { useAxiosInstance } from "./useAxiosInstance"
import { message, notification } from "antd";

export const useRentalOrders = () => {
    const instance = useAxiosInstance();
    // 🔹 1. Lấy danh sách đơn thuê theo renterId
    const getRentalOrdersByRenterId = async (renterId) => {
        try {
            const res = await instance.get(`/RentalOrders?renter_id=${renterId}`);
            return res.data;
        } catch (error) {
            console.error(`❌ Fetch Rental Orders for renterId=${renterId} failed:`, error);
            throw error;
        }
    }

    const createRentalOrder = async (orderData) => {
        try {
            const res = await instance.post(`/RentalOrders`, orderData);
            notification({message: "Đã tạo đơn thuê thành công!", type: "success"});
            return res.data;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    return { getRentalOrdersByRenterId, createRentalOrder };
}

