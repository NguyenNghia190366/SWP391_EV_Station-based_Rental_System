import { useAxiosInstance } from "../hooks/useAxiosInstance";
import { useCallback } from "react";

export const useVehicleAPI = () => {
  const instance = useAxiosInstance();

  // 🔹 Lấy tất cả xe
  const getAll = useCallback(async () => {
    try {
      const res = await instance.get("/Vehicles");
      return res.data;
    } catch (error) {
      console.error("❌ Không thể tải danh sách phương tiện:", error);
      throw (
        error.response?.data?.message ||
        new Error("Không thể tải danh sách phương tiện")
      );
    }
  }, [instance]);

  // 🔹 Lấy xe theo ID
  const getById = useCallback(async (id) => {
    try {
      const res = await instance.get(`/Vehicles/${id}`);
      return res.data;
    } catch (error) {
      console.error(`❌ Không thể tải thông tin phương tiện ID=${id}:`, error);
      throw (
        error.response?.data?.message ||
        new Error("Không thể tải thông tin phương tiện")
      );
    }
  }, [instance]);

  return { getAll, getById };
};
