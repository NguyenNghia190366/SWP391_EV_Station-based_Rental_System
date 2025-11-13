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

  // 🔹 Tạo booking mới
  const createBooking = useCallback(
    async (bookingPayload) => {
      try {
        const res = await instance.post("/Bookings", bookingPayload);
        return res.data;
      } catch (error) {
        console.error("❌ Không thể tạo booking:", error);
        throw (
          error.response?.data?.message ||
          new Error("Không thể tạo booking")
        );
      }
    },
    [instance]
  );

  // 🔹 Tạo xe mới (dành cho staff)
  const createVehicle = useCallback(
    async (vehiclePayload) => {
      try {
        const res = await instance.post("/Vehicles", vehiclePayload);
        return res.data;
      } catch (error) {
        // Log detailed axios error info for debugging
        console.error("❌ Không thể tạo xe: status=", error.response?.status, "data=", error.response?.data);
        // Re-throw a useful message or the original error object for callers to inspect
        const message = error.response?.data?.message || error.response?.data || error.message || "Không thể tạo xe";
        // Throw the original axios error so caller can inspect response if needed
        const errToThrow = message instanceof Error ? message : new Error(String(message));
        errToThrow.response = error.response;
        throw errToThrow;
      }
    },
    [instance]
  );

  return { getAll, getById, getAllModels, getModelById, createBooking, createVehicle };
};
