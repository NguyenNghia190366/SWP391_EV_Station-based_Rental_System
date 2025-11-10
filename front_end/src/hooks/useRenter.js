import { useCallback } from "react";
import { useAxiosInstance } from "./useAxiosInstance";

export const useRenter = () => {
  const instance = useAxiosInstance();

  // 🔹 Lấy renterId từ database dựa vào userId
  const getRenterIdByUserId = useCallback(
    async (userId) => {
      try {
        if (!userId) {
          throw new Error("userId không hợp lệ!");
        }

        console.log("🔍 Lấy renterId từ database cho userId:", userId);

        // Query Renters table để lấy renterId từ userId
        const res = await instance.get("/Renters");
        const renters = Array.isArray(res.data) ? res.data : res.data?.data || [];
        
        const renter = renters.find(r => 
          (r.user_id || r.userId) === userId ||
          Number(r.user_id) === Number(userId) ||
          Number(r.userId) === Number(userId)
        );

        if (!renter) {
          throw new Error(`Không tìm thấy renter cho userId: ${userId}`);
        }

        const renterId = renter.renter_Id || renter.renterId;
        console.log("✅ Tìm thấy renterId từ DB:", renterId);

        return renterId;
      } catch (error) {
        console.error("❌ Lỗi khi lấy renterId từ DB:", error);
        throw error;
      }
    },
    [instance]
  );

  // 🔹 Lấy renterId - tự động từ localStorage hoặc DB
  const getRenterId = useCallback(
    async () => {
      try {
        // 1️⃣ Thử lấy từ localStorage trước (cache)
        const cachedRenterId = 
          localStorage.getItem("renter_Id") ||
          localStorage.getItem("renterId") ||
          localStorage.getItem("renter_id");

        // Check if cached renterId is valid (not just leftover from old login)
        if (cachedRenterId && cachedRenterId !== "1" && cachedRenterId !== "undefined") {
          console.log("✅ Dùng renterId từ localStorage cache:", cachedRenterId);
          return Number(cachedRenterId);
        }

        // 2️⃣ Nếu không có cache hoặc là hardcoded renterId=1, query DB
        const userId = 
          localStorage.getItem("userId") ||
          localStorage.getItem("user_id");

        if (!userId || userId === "undefined") {
          throw new Error("Không tìm thấy userId trong localStorage! Vui lòng đăng nhập lại.");
        }

        console.log("📡 Lấy renterId từ DB vì không có cache hoặc là hardcoded...");
        const renterId = await getRenterIdByUserId(Number(userId));

        if (!renterId || renterId === undefined) {
          throw new Error(`User ${userId} không có record trong Renters table. Vui lòng kiểm tra dữ liệu backend.`);
        }

        // 3️⃣ Lưu vào localStorage cache
        localStorage.setItem("renter_Id", renterId);
        localStorage.setItem("renterId", renterId);
        localStorage.setItem("renter_id", renterId);

        return Number(renterId);
      } catch (error) {
        console.error("❌ Không thể lấy renterId:", error);
        throw error;
      }
    },
    [getRenterIdByUserId]
  );
  
  return { getRenterId, getRenterIdByUserId };
};
