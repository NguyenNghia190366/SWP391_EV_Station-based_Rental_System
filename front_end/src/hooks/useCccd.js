import { useAxiosInstance } from "./useAxiosInstance";
import { useCallback } from "react";

export const useCccd = () => {
  const instance = useAxiosInstance();

  // 🔹 1. Upload CCCD (dạng base64)
  const uploadCccd = useCallback(
    async (payload) => {
      const renter_Id = localStorage.getItem("renter_Id");
      try {
        const res = await instance.post("/Cccds/UploadCanCuoc", {
          renter_Id: Number(renter_Id),
          ...payload,
        });
        return res.data;
      } catch (error) {
        console.error("❌ Upload CCCD failed:", error);
        throw error;
      }
    },
    [instance]
  );

  // 🔹 2. Lấy CCCD theo ID
  const getCccdById = useCallback(
    async (id) => {
      try {
        const res = await instance.get(`/Cccds/${id}`);
        return res.data;
      } catch (error) {
        console.error(`❌ Fetch CCCD with id=${id} failed:`, error);
        throw error;
      }
    },
    [instance]
  );
  // 🔹 3. Lấy toàn bộ CCCD (cho Admin dashboard)
  const getAllCccds = useCallback(async () => {
    try {
      const res = await instance.get("/Cccds");
      return res.data;
    } catch (error) {
      console.error("❌ Fetch all CCCDs failed:", error);
      throw error;
    }
  }, [instance]);

  // // 🔹 4. Tạo mới CCCD (nếu không dùng UploadCanCuoc)
  // const createCccd = useCallback(
  //   async (data) => {
  //     try {
  //       const res = await instance.post("/Cccds", data);
  //       return res.data;
  //     } catch (error) {
  //       console.error("❌ Create CCCD failed:", error);
  //       throw error;
  //     }
  //   },
  //   [instance]
  // );
  
   // 🔹 5. Cập nhật CCCD theo ID (VD: duyệt / reject)
  const updateCccd = useCallback(
    async (id, data) => {
      try {
        const res = await instance.put(`/Cccds/${id}`, data);
        return res.data;
      } catch (error) {
        console.error(`❌ Update CCCD with id=${id} failed:`, error);
        throw error;
      }
    },
    [instance]
  );

  return { uploadCccd, getCccdById, getAllCccds, updateCccd};
};
