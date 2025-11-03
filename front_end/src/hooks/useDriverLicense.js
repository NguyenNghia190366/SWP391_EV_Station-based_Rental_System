import { useAxiosInstance } from "./useAxiosInstance";
import { useCallback } from "react";

export const useDriverLicense = () => {
  const instance = useAxiosInstance();

  // 🔹 1. Upload Giấy phép lái xe (dạng base64)
  const uploadDriverLicense = useCallback(
    async (payload) => {
        const renter_Id = localStorage.getItem("renter_Id");
      try {
        const res = await instance.post("/DriverLicenses/UploadBang", {renter_Id: Number(renter_Id), ...payload});
        return res.data;
      } catch (error) {
        console.error("Upload Giấy phép lái xe failed:", error);
        throw error;
      }
    },
    [instance]
  );

  // 🔹 2. Lấy license theo ID
  const getDriverLicenseById = useCallback(
    async (id) => {
      try {
        const res = await instance.get(`/DriverLicenses/${id}`);
        return res.data;
      } catch (error) {
        console.error(`Fetch Driver License with id=${id} failed:`, error);
        throw error;
      }
    },
    [instance]
  );

  return { uploadDriverLicense, getDriverLicenseById };
};
