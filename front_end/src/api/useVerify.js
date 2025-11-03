// Verification API - Driver License & CCCD Verification
import { BASE_URL, apiRequest, buildHeaders } from "./client";

// ==================== DRIVER LICENSE VERIFICATION API ====================
export const driverLicenseVerifyAPI = {
  // RENTER: Upload driver license for verification
  // Backend teammate's endpoint: POST /api/DriverLicenses
  uploadLicense: async (licenseData) => {
    // Send minimal PascalCase payload expected by backend validation
    // Backend validated earlier: Renter.User is required => include UserId only
    const backendData = {
      DriverLicenseNumber: licenseData.driverLicenseNumber || licenseData.licenseNumber || "PENDING",
      UrlDriverLicense: licenseData.urlDriverLicense || licenseData.frontImageUrl || "",
      Renter: {
        RenterId: licenseData.renterId || 0,
        User: {
          UserId: licenseData.userId || 0
        }
      }
    }

    // Log summary (hide full base64 in log)
    const frontSize = (String(backendData.UrlDriverLicense).length / 1024).toFixed(2)
    console.log("🔄 Sending PascalCase payload (minimal Renter.User):", {
      DriverLicenseNumber: backendData.DriverLicenseNumber,
      UrlDriverLicense: `[Base64 ${frontSize} KB]`,
      Renter: {
        RenterId: backendData.Renter.RenterId,
        User: { UserId: backendData.Renter.User.UserId }
      }
    })

    return apiRequest(`${BASE_URL}/DriverLicenses`, {
      method: "POST",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(backendData),
    });
  },

  // STAFF: Get all pending license verifications
  getPending: async () => {
    return apiRequest(`${BASE_URL}/Driver_License/pending`, {
      method: "GET",

      
    });
  },

  // STAFF: Get license verification by ID
  getById: async (verificationId) => {
    return apiRequest(`${BASE_URL}/DriverLicenses/${verificationId}`, {
      method: "GET",
    });
  },

  // STAFF: Approve driver license
  approve: async (verificationId, staffInfo) => {
    return apiRequest(`${BASE_URL}/Driver_License/approve/${verificationId}`, {
      method: "POST",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(staffInfo),
    });
  },

  // STAFF: Reject driver license
  reject: async (verificationId, rejectData) => {
    return apiRequest(`${BASE_URL}/Driver_License/reject/${verificationId}`, {
      method: "POST",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(rejectData),
    });
  },

  // STAFF: Get verification history (approved/rejected)
  getHistory: async (status = null) => {
    const url = status 
      ? `${BASE_URL}/Driver_License/history?status=${status}`
      : `${BASE_URL}/Driver_License/history`;
    return apiRequest(url, {
      method: "GET",
    });
  },

  // RENTER: Get license by renter_id (existing endpoint)
  getByRenterId: async (renterId) => {
    return apiRequest(`${BASE_URL}/Driver_License?renter_id=${renterId}`, {
      method: "GET",
    });
  },
};

// ==================== CCCD VERIFICATION API ====================
export const cccdVerifyAPI = {
  // RENTER: Upload CCCD for verification
  // Backend teammate's endpoint: POST /api/Cccds
  // ⚠️ WARNING: Backend expects nested renter object, not string!
  uploadCCCD: async (cccdData) => {

    
    return apiRequest(`${BASE_URL}/Cccds/UploadCanCuoc`, {
      method: "POST",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(cccdData),
    });
  },

  // STAFF: Get all pending CCCD verifications
  getPending: async () => {
    return apiRequest(`${BASE_URL}/CCCD/pending`, {
      method: "GET",
    });
  },

  // STAFF: Get CCCD verification by ID
  getById: async (verificationId) => {
    return apiRequest(`${BASE_URL}/Cccds/${verificationId}`, {
      method: "GET",
    });
  },

  // STAFF: Approve CCCD
  approve: async (verificationId, staffInfo) => {
    return apiRequest(`${BASE_URL}/CCCD/approve/${verificationId}`, {
      method: "POST",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(staffInfo),
    });
  },

  // STAFF: Reject CCCD
  reject: async (verificationId, rejectData) => {
    return apiRequest(`${BASE_URL}/CCCD/reject/${verificationId}`, {
      method: "POST",
      headers: buildHeaders({ "Content-Type": "multipart/form-data" }),
      body: JSON.stringify(rejectData),
    });
  },

  // STAFF: Get verification history (approved/rejected)
  getHistory: async (status = null) => {
    const url = status 
      ? `${BASE_URL}/CCCD/history?status=${status}`
      : `${BASE_URL}/CCCD/history`;
    return apiRequest(url, {
      method: "GET",
    });
  },

  // RENTER: Get CCCD by renterId (existing endpoint)
  getByRenterId: async (renterId) => {
    return apiRequest(`${BASE_URL}/CCCD/${renterId}`, {
      method: "GET",
    });
  },
};

// ==================== COMBINED VERIFICATION API ====================
// Helper functions for both types
export const verificationAPI = {
  // Get all pending verifications (both license and CCCD)
  getAllPending: async () => {
    const [licenses, cccds] = await Promise.all([
      driverLicenseVerifyAPI.getPending(),
      cccdVerifyAPI.getPending(),
    ]);
    
    return {
      licenses: licenses.data || [],
      cccds: cccds.data || [],
      total: (licenses.count || 0) + (cccds.count || 0),
    };
  },

  // Get all history (both license and CCCD)
  getAllHistory: async (status = null) => {
    const [licenses, cccds] = await Promise.all([
      driverLicenseVerifyAPI.getHistory(status),
      cccdVerifyAPI.getHistory(status),
    ]);
    
    return {
      licenses: licenses.data || [],
      cccds: cccds.data || [],
      total: (licenses.count || 0) + (cccds.count || 0),
    };
  },

  // Get statistics
  getStats: async () => {
    const { licenses, cccds } = await verificationAPI.getAllPending();
    
    return {
      totalPending: licenses.length + cccds.length,
      pendingLicenses: licenses.length,
      pendingCCCDs: cccds.length,
    };
  },
};

// Export all
export default {
  driverLicense: driverLicenseVerifyAPI,
  cccd: cccdVerifyAPI,
  combined: verificationAPI,
};
