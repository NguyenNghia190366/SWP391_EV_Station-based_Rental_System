import { useAxiosInstance } from "./useAxiosInstance";
import { useCallback } from "react";
import { useRenter } from "./useRenter";

export const useCccd = () => {
  const instance = useAxiosInstance();
  const { getRenterId } = useRenter();

  // 🔹 1. Upload CCCD (URLs từ Cloudinary)
  const uploadCccd = useCallback(
    async (payload) => {
      try {
        // Lấy renterId từ database
        const renter_Id = await getRenterId();

        console.log("📤 Uploading CCCD with renter_Id:", renter_Id, "payload:", payload);

        try {
          // Try POST first (create new)
          const res = await instance.post("/Cccds/UploadCanCuoc", {
            renter_Id: Number(renter_Id),
            ...payload,
          });
          console.log("✅ CCCD uploaded successfully");
          return res.data;
        } catch (postError) {
          // If POST fails with duplicate key error (UNIQUE constraint), try to find and update existing
          if (postError.response?.status === 400 || 
              postError.response?.data?.message?.includes("Violation of UNIQUE KEY") ||
              postError.message?.includes("2627")) {
            
            console.log("🔄 Got duplicate key error, trying to update existing CCCD...");
            
            try {
              // Get all CCCDs to find existing one
              const cccdsRes = await instance.get("/Cccds");
              const cccds = Array.isArray(cccdsRes.data) ? cccdsRes.data : cccdsRes.data?.data || [];
              
              // Find CCCD for this renter
              const existingCCCD = cccds.find(c => 
                (c.renter_Id || c.renterId) === Number(renter_Id)
              );
              
              if (existingCCCD) {
                const cccdId = existingCCCD.id || existingCCCD.cccd_id;
                console.log("✏️ Found existing CCCD with id:", cccdId, "- updating...");
                
                const updateRes = await instance.put(`/Cccds/${cccdId}`, {
                  renter_Id: Number(renter_Id),
                  ...payload,
                });
                console.log("✅ CCCD updated successfully");
                return updateRes.data;
              } else {
                console.error("❌ Cannot find existing CCCD to update");
                throw postError;
              }
            } catch (updateError) {
              console.error("❌ Update failed:", updateError);
              throw updateError;
            }
          }
          
          // If not duplicate key error, re-throw original error
          throw postError;
        }
      } catch (error) {
        console.error("❌ Upload CCCD failed:", error);
        throw error;
      }
    },
    [instance, getRenterId]
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



  return { uploadCccd, getCccdById, getAllCccds };
};
