import { useAxiosInstance } from "./useAxiosInstance";
import { useCallback } from "react";
import { useRenter } from "./useRenter";

export const useDriverLicense = () => {
  const instance = useAxiosInstance();
  const { getRenterId } = useRenter();

  //Upload Giấy phép lái xe (URLs từ Cloudinary)
  const uploadDriverLicense = useCallback(
    async (payload) => {
      try {
        // Lấy renterId từ database
        const renter_Id = await getRenterId();

        console.log("📤 Uploading Driver License with renter_Id:", renter_Id, "payload:", payload);

        try {
          // Try POST first (create new)
          const res = await instance.post("/DriverLicenses/UploadBang", {
            renter_Id: Number(renter_Id),
            ...payload,
          });
          console.log("✅ Driver License uploaded successfully");
          return res.data;
        } catch (postError) {
          // If POST fails with duplicate key error (UNIQUE constraint), try to find and update existing
          if (postError.response?.status === 400 || 
              postError.response?.data?.message?.includes("Violation of UNIQUE KEY") ||
              postError.message?.includes("2627")) {
            
            console.log("🔄 Got duplicate key error, trying to update existing license...");
            
            try {
              // Get all driver licenses to find existing one
              const licensesRes = await instance.get("/DriverLicenses");
              const licenses = Array.isArray(licensesRes.data) ? licensesRes.data : licensesRes.data?.data || [];
              
              // Find license for this renter
              const existingLicense = licenses.find(l => 
                (l.renter_Id || l.renterId) === Number(renter_Id)
              );
              
              if (existingLicense) {
                const licenseId = existingLicense.id || existingLicense.license_id;
                console.log("✏️ Found existing license with id:", licenseId, "- updating...");
                
                const updateRes = await instance.put(`/DriverLicenses/${licenseId}`, {
                  renter_Id: Number(renter_Id),
                  ...payload,
                });
                console.log("✅ Driver License updated successfully");
                return updateRes.data;
              } else {
                console.error("❌ Cannot find existing license to update");
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
        console.error("Upload Giấy phép lái xe failed:", error);
        throw error;
      }
    },
    [instance, getRenterId]
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
