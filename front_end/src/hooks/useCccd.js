import { useAxiosInstance } from "./useAxiosInstance";
import { useCallback } from "react";
import { useRenters } from "./useRenters";

export const useCccd = () => {
  const instance = useAxiosInstance();
  const { getRenterId } = useRenters();

  // 🔹 1. Upload ID card (URLs from Cloudinary)
  const uploadCccd = useCallback(
    async (payload) => {
      try {
        // Get renterId from database
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
          const errorMsg = postError.response?.data || postError.message || "";
          const isDuplicateError = 
            postError.response?.status === 400 || 
            postError.response?.status === 500 ||
            String(errorMsg).includes("Violation of UNIQUE KEY") ||
            String(errorMsg).includes("duplicate key") ||
            String(errorMsg).includes("2627");
          
          if (isDuplicateError) {
            
            console.log("🔄 Got duplicate key error, trying to update existing CCCD...");
            
            try {
              // Get all CCCDs to find existing one
              const cccdsRes = await instance.get("/Cccds");
              const cccds = Array.isArray(cccdsRes.data) ? cccdsRes.data : cccdsRes.data?.data || [];
              
              // Try to find existing CCCD by renter id first
              let existingCCCD = cccds.find((c) =>
                (c.renter_Id || c.renterId) === Number(renter_Id)
              );

              // If not found by renter, try to find by id number (payload may contain id_Card_Number)
              const idNumber = payload.id_Card_Number || payload.idCardNumber || payload.idNumber || payload.id;
              if (!existingCCCD && idNumber) {
                existingCCCD = cccds.find((c) => {
                  // check multiple possible field names in the returned object
                  const candidates = [
                    c.id_Card_Number,
                  ];
                  return candidates.some((val) => String(val) === String(idNumber));
                });
              }

              if (existingCCCD) {
                // robustly extract id from existing object
                let cccdId = existingCCCD.id || existingCCCD.cccd_id || existingCCCD.cccdId || existingCCCD.cccd_id || existingCCCD.CccdId || existingCCCD.CCCD_ID;
                if (!cccdId) {
                  // try keys that include 'id' or 'cccd' and are numeric
                  for (const k of Object.keys(existingCCCD)) {
                    const val = existingCCCD[k];
                    if (val === null || val === undefined) continue;
                    const kLower = String(k).toLowerCase();
                    if ((kLower.includes("id") || kLower.includes("cccd")) && (typeof val === "number" || !Number.isNaN(Number(val)))) {
                      cccdId = val;
                      break;
                    }
                  }
                }

                if (!cccdId) {
                  console.error("❌ Found existing CCCD but could not extract id. Object:", existingCCCD);
                  throw new Error("Cannot extract id from existing CCCD record");
                }

                console.log("✏️ Found existing CCCD with id:", cccdId, "- updating...");

                const updatePayload = {
                  ...payload,
                };
                console.log("➡️ PUT /Cccds/" + cccdId + " payload:", updatePayload);

                try {
                  const updateRes = await instance.put(`/Cccds/${cccdId}`, updatePayload);
                  console.log("✅ CCCD updated successfully");
                  return updateRes.data;
                } catch (updateErr) {
                  console.error("❌ Update failed:", updateErr);
                  console.error("❌ Update error response:", updateErr.response?.data);
                  throw updateErr;
                }
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

  // 🔹 2. Get CCCD by ID
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

  // 🔹 3. Fetch all CCCDs (for Admin dashboard)
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
