import { useCallback } from "react";
import { useAxiosInstance } from "./useAxiosInstance";

export const useRenters = () => {
  const instance = useAxiosInstance();

  // 🔹 Lấy renterId từ userId
  const getRenterIdByUserId = useCallback(
    async (userId) => {
      try {
        const res = await instance.get("/Renters");
        const renters = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const renter = renters.find(
          (r) =>
            (r.user_id || r.userId) === userId ||
            Number(r.user_id) === Number(userId) ||
            Number(r.userId) === Number(userId)
        );
        if (!renter) throw new Error("Không tìm thấy renter!");
        return renter.renter_Id || renter.renterId;
      } catch (err) {
        console.error("❌ Lỗi khi lấy renterId:", err);
        throw err;
      }
    },
    [instance]
  );

  return {
    getRenterIdByUserId,
  };
};
