// User & Authentication API
import { BASE_URL, apiRequest, buildHeaders } from "./client";

// ==================== USER/AUTH API ====================
export const userAPI = {
  // Authentication
  registerUser: async (newUser) => {
    return apiRequest(`${BASE_URL}/Users/Register`, {
      method: "POST",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(newUser),
    });
  },

  loginUser: async (credentials) => {
    console.log("[authAPI] Calling login with:", credentials);
    const data = await apiRequest(`${BASE_URL}/UserAccount/login`, {
      method: "POST",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(credentials),
    });
    if (!data) throw new Error("Không nhận được dữ liệu từ server");
    console.log("✅ [authAPI] Login success:", data);
    return data;
  },

  // User Management
  getAllUsers: async () => {
    return apiRequest(`${BASE_URL}/Users`);
  },

  getUnverifiedUsers: async () => {
    const users = await apiRequest(`${BASE_URL}/Users`);
    return users.filter((user) => user.role === "renter" && !user.isVerified);
  },

  verifyUser: async (userId, staffId) => {
    return apiRequest(`${BASE_URL}/Users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({
        isVerified: true,
        verifiedBy: staffId,
        verifiedAt: new Date().toISOString(),
      }),
    });
  },

  rejectUser: async (userId, reason) => {
    return apiRequest(`${BASE_URL}/Users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({
        isVerified: false,
        rejectedAt: new Date().toISOString(),
        rejectedReason: reason,
      }),
    });
  },

  updateUser: async (user) => {
    return apiRequest(`${BASE_URL}/Users/${user.userId}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });
  },
};

// ==================== DRIVER LICENSE API ====================
export const driverLicenseAPI = {
  getAll: async () => {
    return apiRequest(`${BASE_URL}/Driver_License`);
  },

  getPending: async () => {
    return apiRequest(`${BASE_URL}/Driver_License/pending`);
  },

  getByRenter: async (renterId) => {
    return apiRequest(`${BASE_URL}/Driver_License?renter_id=${renterId}`);
  },

  create: async (payload) => {
    return apiRequest(`${BASE_URL}/Driver_License`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateStatus: async (id, payload) => {
    return apiRequest(`${BASE_URL}/Driver_License/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  approve: async (licenseNumber) => {
    return apiRequest(`${BASE_URL}/Driver_License/${licenseNumber}/approve`, {
      method: "PUT",
      body: JSON.stringify({
        is_read: true,
        is_verified: true,
        verified_at: new Date().toISOString()
      }),
    });
  },

  reject: async (licenseNumber, reason) => {
    return apiRequest(`${BASE_URL}/Driver_License/${licenseNumber}/reject`, {
      method: "PUT",
      body: JSON.stringify({
        is_read: true,
        is_verified: false,
        message: reason,
        rejected_at: new Date().toISOString()
      }),
    });
  },
};

// ==================== CCCD/CMND API ====================
export const cccdVerificationAPI = {
  getAll: async () => {
    return apiRequest(`${BASE_URL}/CCCD`);
  },

  getPending: async () => {
    return apiRequest(`${BASE_URL}/CCCD/pending`);
  },

  getByRenter: async (renterId) => {
    return apiRequest(`${BASE_URL}/CCCD/${renterId}`);
  },

  create: async (payload) => {
    return apiRequest(`${BASE_URL}/CCCD`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateStatus: async (id, payload) => {
    return apiRequest(`${BASE_URL}/CCCD/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  approve: async (renterId) => {
    return apiRequest(`${BASE_URL}/CCCD/${renterId}/approve`, {
      method: "PUT",
      body: JSON.stringify({
        is_read: true,
        is_verified: true,
        verified_at: new Date().toISOString()
      }),
    });
  },

  reject: async (renterId, reason) => {
    return apiRequest(`${BASE_URL}/CCCD/${renterId}/reject`, {
      method: "PUT",
      body: JSON.stringify({
        is_read: true,
        is_verified: false,
        message: reason,
        rejected_at: new Date().toISOString()
      }),
    });
  },
};

// Legacy CCCD API (old format)
export const cccdAPI = {
  getAll: async () => {
    return apiRequest(`${BASE_URL}/Cccd_Cmnd`);
  },

  create: async (payload) => {
    return apiRequest(`${BASE_URL}/Cccd_Cmnd`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateStatus: async (id, status, reason = "") => {
    return apiRequest(`${BASE_URL}/Cccd_Cmnd/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        status,
        verified_date: new Date().toISOString(),
        rejected_reason: reason,
      }),
    });
  },
};

// Legacy License API (old format)
export const licenseAPI = {
  getAll: async () => {
    return apiRequest(`${BASE_URL}/licenses`);
  },

  getByRenter: async (renterId) => {
    const data = await apiRequest(`${BASE_URL}/licenses?renter_id=${renterId}`);
    return data[0];
  },

  create: async (payload) => {
    return apiRequest(`${BASE_URL}/licenses`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateStatus: async (id, status, reason = "") => {
    return apiRequest(`${BASE_URL}/licenses/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        status,
        verified_date: new Date().toISOString(),
        rejected_reason: reason,
      }),
    });
  },
};

export default userAPI;

