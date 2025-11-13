import { useAxiosInstance } from "./useAxiosInstance";
import { useCallback } from "react";
import { useRenters } from "./useRenters";

export const useDriverLicense = () => {
  const instance = useAxiosInstance();
  const { getRenterId } = useRenters();

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
            renter_id: Number(renter_Id),  // Use snake_case to match backend API
            url_Driver_License_front: payload.url_Driver_License_front,
            url_Driver_License_back: payload.url_Driver_License_back,
            driverLicenseNumber: payload.driverLicenseNumber,
          });
          console.log("✅ Driver License uploaded successfully");
          return res.data;
        } catch (postError) {
          // If POST fails with duplicate key error (UNIQUE constraint), try to find and update existing
          const errData = postError.response?.data || postError.message || "";
          const isDuplicateError =
            postError.response?.status === 400 ||
            postError.response?.status === 500 ||
            String(errData).includes("Violation of UNIQUE KEY") ||
            String(errData).toLowerCase().includes("duplicate key") ||
            String(errData).includes("2627");

          if (isDuplicateError) {
            console.log("🔄 Got duplicate key (or similar) error, trying to update existing license...");
            
            try {
              // Get all driver licenses to find existing one
              const licensesRes = await instance.get("/DriverLicenses");
              const licenses = Array.isArray(licensesRes.data) ? licensesRes.data : licensesRes.data?.data || [];
              
              // Try find existing license by renter id first
              let existingLicense = licenses.find((l) =>
                (l.renter_Id || l.renterId) === Number(renter_Id)
              );

              // If not found by renter, try to find by driver license number from payload
              const dlNumber = payload.driverLicenseNumber || payload.licenseNumber || payload.license_number || payload.driver_license_number;
              if (!existingLicense && dlNumber) {
                existingLicense = licenses.find((l) => {
                  const candidates = [
                    l.driverLicenseNumber,
                  ];
                  return candidates.some((val) => String(val) === String(dlNumber));
                });
              }

              if (existingLicense) {
                // robust id extraction
                let licenseId = existingLicense.id || existingLicense.license_id || existingLicense.licenseId || existingLicense.driverLicenseId || existingLicense.DriverLicenseId;
                if (!licenseId) {
                  for (const k of Object.keys(existingLicense)) {
                    const val = existingLicense[k];
                    if (val === null || val === undefined) continue;
                    const kLower = String(k).toLowerCase();
                    if ((kLower.includes("id") || kLower.includes("license") || kLower.includes("driver")) && (typeof val === "number" || !Number.isNaN(Number(val)))) {
                      licenseId = val;
                      break;
                    }
                  }
                }

                if (!licenseId) {
                  console.error("❌ Found existing license but could not extract id. Object:", existingLicense);
                  throw new Error("Cannot extract id from existing license record");
                }

                console.log("✏️ Found existing license with id:", licenseId, "- updating...");

                // Only send URL fields (not renter_Id which is PK)
                const updatePayload = { ...payload };
                console.log("➡️ PUT /DriverLicenses/" + licenseId + " payload:", updatePayload);

                try {
                  const updateRes = await instance.put(`/DriverLicenses/${licenseId}`, updatePayload);
                  console.log("✅ Driver License updated successfully");
                  return updateRes.data;
                } catch (updateErr) {
                  console.error("❌ Update failed:", updateErr);
                  console.error("❌ Update error response:", updateErr.response?.data);
                  throw updateErr;
                }
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
