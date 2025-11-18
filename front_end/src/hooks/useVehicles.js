import { useAxiosInstance } from "../hooks/useAxiosInstance";
import { useCallback } from "react";

export const useVehicleAPI = () => {
  const instance = useAxiosInstance();

  // 🔹 Fetch all vehicles
  const getAll = useCallback(async () => {
    try {
      const res = await instance.get("/Vehicles");
      return res.data;
    } catch (error) {
      console.error("❌ Cannot load vehicle list:", error);
      throw (
        error.response?.data?.message ||
        new Error("Cannot load vehicle list")
      );
    }
  }, [instance]);

  // 🔹 Fetch vehicle by ID
  const getById = useCallback(
    async (id) => {
      try {
        const res = await instance.get(`/Vehicles/${id}`);
        return res.data;
      } catch (error) {
        console.error(
          `❌ Cannot load vehicle info ID=${id}:`,
          error
        );
        throw (
          error.response?.data?.message ||
          new Error("Cannot load vehicle info")
        );
      }
    },
    [instance]
  );

  // 🔹 Fetch all VehicleModels (to get prices)
  const getAllModels = useCallback(async () => {
    try {
      const res = await instance.get("/VehicleModels");
      return res.data;
    } catch (error) {
      console.error("❌ Cannot load vehicle model list:", error);
      throw (
        error.response?.data?.message ||
        new Error("Cannot load vehicle model list")
      );
    }
  }, [instance]);

  // 🔹 Fetch VehicleModel by ID (to get price_per_hour)
  const getModelById = useCallback(
    async (id) => {
      try {
        const res = await instance.get(`/VehicleModels/${id}`);
        return res.data;
      } catch (error) {
        console.error(
          `❌ Cannot load vehicle model ID=${id}:`,
          error
        );
        throw (
          error.response?.data?.message ||
          new Error("Cannot load vehicle model")
        );
      }
    },
    [instance]
  );

  // 🔹 Create booking
  const createBooking = useCallback(
    async (bookingPayload) => {
      try {
        const res = await instance.post("/Bookings", bookingPayload);
        return res.data;
      } catch (error) {
        console.error("❌ Cannot create booking:", error);
        throw (
          error.response?.data?.message ||
          new Error("Cannot create booking")
        );
      }
    },
    [instance]
  );

  // 🔹 Create new vehicle (for staff)
  const createVehicle = useCallback(
    async (vehiclePayload) => {
      try {
        const res = await instance.post("/Vehicles", vehiclePayload);
        return res.data;
      } catch (error) {
        // Log detailed axios error info for debugging
        console.error("❌ Cannot create vehicle: status=", error.response?.status, "data=", error.response?.data);
        // Re-throw a useful message or the original error object for callers to inspect
        const message = error.response?.data?.message || error.response?.data || error.message || "Cannot create vehicle";
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
