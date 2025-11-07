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
  const getById = useCallback(
    async (id) => {
      try {
        const res = await instance.get(`/Vehicles/${id}`);
        return res.data;
      } catch (error) {
        console.error(
          `❌ Không thể tải thông tin phương tiện ID=${id}:`,
          error
        );
        throw (
          error.response?.data?.message ||
          new Error("Không thể tải thông tin phương tiện")
        );
      }
    },
    [instance]
  );

  // 🔹 Lấy tất cả VehicleModels (để lấy giá tiền)
  const getAllModels = useCallback(async () => {
    try {
      const res = await instance.get("/VehicleModels");
      return res.data;
    } catch (error) {
      console.error("❌ Không thể tải danh sách model xe:", error);
      throw (
        error.response?.data?.message ||
        new Error("Không thể tải danh sách model xe")
      );
    }
  }, [instance]);

  // 🔹 Lấy VehicleModel theo ID (để lấy price_per_hour)
  const getModelById = useCallback(
    async (id) => {
      try {
        const res = await instance.get(`/VehicleModels/${id}`);
        return res.data;
      } catch (error) {
        console.error(
          `❌ Không thể tải model xe ID=${id}:`,
          error
        );
        throw (
          error.response?.data?.message ||
          new Error("Không thể tải thông tin model xe")
        );
      }
    },
    [instance]
  );

  return { getAll, getById, getAllModels, getModelById };
};
