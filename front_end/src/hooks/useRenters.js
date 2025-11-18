import { useCallback } from "react";
import { message } from "antd";
import { useAxiosInstance } from "./useAxiosInstance";

export const useRenter = () => {
  // Primary instance for /Renters endpoint (needs /api path from primary URL)
  const instance = useAxiosInstance();
  // Backup instance for /Reject endpoint (uses ngrok URL without /api path, like staff)
  const backupInstance = useAxiosInstance(true);

  // 🔹 Get renterId from database by userId
  const getRenterIdByUserId = useCallback(
    async (userId) => {
      try {
        if (!userId) {
          throw new Error("Invalid userId!");
        }

        console.log("🔍 Fetching renterId from DB for userId:", userId);

          // Query Renters table from the primary API (includes /api path)
        const res = await instance.get("/Renters");
        const renters = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];

        const renter = renters.find(
          (r) =>
            (r.user_id || r.userId) === userId ||
            Number(r.user_id) === Number(userId) ||
            Number(r.userId) === Number(userId)
        );

        if (!renter) {
          throw new Error(`No renter found for userId: ${userId}`);
        }

        const renterId = renter.renter_Id || renter.renterId;
        console.log("✅ Found renterId in DB:", renterId);

        return renterId;
      } catch (error) {
          console.error("❌ Error fetching renterId from DB:", error);
        throw error;
      }
    },
    [instance]
  );

  // 🔹 Get renterId - automatically from localStorage or DB
  const getRenterId = useCallback(async () => {
    try {
        // 1️⃣ Try to get renterId from localStorage first (cache)
      const cachedRenterId =
        localStorage.getItem("renter_Id") ||
        localStorage.getItem("renterId") ||
        localStorage.getItem("renter_id");

      // Check if cached renterId is valid (not just leftover from old login)
      if (
        cachedRenterId &&
        cachedRenterId !== "1" &&
        cachedRenterId !== "undefined"
      ) {
        console.log("✅ Using cached renterId from localStorage:", cachedRenterId);
        return Number(cachedRenterId);
      }

        // 2️⃣ If no cache or the cached value is the hardcoded renterId=1, query the DB
      const userId =
        localStorage.getItem("userId") || localStorage.getItem("user_id");

      if (!userId || userId === "undefined") {
        throw new Error(
          "userId not found in localStorage! Please log in again."
        );
      }

      console.log(
        "📡 Fetching renterId from DB because no cache or hardcoded value found..."
      );
      const renterId = await getRenterIdByUserId(Number(userId));

      if (!renterId || renterId === undefined) {
        throw new Error(
          `User ${userId} has no record in Renters table. Please check the backend data.`
        );
      }

      // 3️⃣ Save to localStorage cache
      localStorage.setItem("renter_Id", renterId);
      localStorage.setItem("renterId", renterId);
      localStorage.setItem("renter_id", renterId);

      return Number(renterId);
    } catch (error) {
        console.error("❌ Unable to fetch renterId:", error);
      throw error;
    }
  }, [getRenterIdByUserId]);

  // Reject rental order

  const rejectRentalOrder = useCallback(
    async (orderId) => {
      try {
        const cleanId = Number(orderId);
        console.log("Rejecting order ID:", cleanId);

        // Use backup instance (with true) for /Reject endpoint (same as staff)
        const res = await backupInstance.put(
          `/Reject`,
          {},
          {
            params: { id: cleanId },
          }
        );

        message.success("Rental order rejected!");
        return res.data;
      } catch (error) {
        const errorMsg =
          error.response?.data?.title ||
          error.response?.data?.message ||
          "Cannot reject rental order!";

        message.error(errorMsg);
        throw error;
      }
    },
    [backupInstance]
  );

  return { getRenterId, getRenterIdByUserId, rejectRentalOrder };
};

  // alias for backwards-compatibility: some files import `useRenters` or `useRenter`
export const useRenters = useRenter;
