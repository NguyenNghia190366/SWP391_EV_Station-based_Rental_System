// Configuration
// 🌐 BE của team (đang dùng)
const BASE_URL = "https://alani-uncorroboratory-sympetaly.ngrok-free.dev/api";

// 🏠 Local BE với Vite proxy (comment lại khi dùng ngrok)
// const BASE_URL = "/api";

// Headers
const HEADERS = {
  JSON: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  NGROK: {
    "ngrok-skip-browser-warning": "true",
  },
};

// Helper function for fetch requests
const apiRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: HEADERS.JSON,
    ...options,
  });

  if (!response.ok) {
    let errorBody = null;
    try {
      const text = await response.text();
      errorBody = text ? JSON.parse(text) : null;
    } catch {
      errorBody = null;
    }
    throw new Error(errorBody?.message || errorBody || `HTTP ${response.status}`);
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

// ==================== USER API ====================
export const userAPI = {
  // Authentication
  loginUser: async (credentials) => {
    const data = await apiRequest(`${BASE_URL}/UserAccount/login`, {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (!data) {
      throw new Error("Không nhận được dữ liệu từ server");
    }

    return data;
  },

  registerUser: async (newUser) => {
    return apiRequest(`${BASE_URL}/Users/Register`, {
      method: "POST",
      body: JSON.stringify(newUser),
    });
  },

  // User Management
  getAllUsers: async () => {
    return apiRequest(`${BASE_URL}/Users`);
  },

  getUnverifiedUsers: async () => {
    const users = await apiRequest(`${BASE_URL}/Users`);
    return users.filter((user) => user.role === "renter" && !user.isVerified);
  },

  updateUser: async (user) => {
    return apiRequest(`${BASE_URL}/Users/${user.userId}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });
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
};

// ==================== DRIVER LICENSE API ====================
export const driverLicenseAPI = {
  // Get all driver licenses
  getAll: async () => {
    return apiRequest(`${BASE_URL}/Driver_License`);
  },

  // Get pending driver licenses
  getPending: async () => {
    return apiRequest(`${BASE_URL}/Driver_License/pending`);
  },

  // Get license by renter ID
  getByRenter: async (renterId) => {
    return apiRequest(`${BASE_URL}/Driver_License?renter_id=${renterId}`);
  },

  // Create driver license record
  create: async (payload) => {
    return apiRequest(`${BASE_URL}/Driver_License`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Update license status
  updateStatus: async (id, payload) => {
    return apiRequest(`${BASE_URL}/Driver_License/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // Approve license
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

  // Reject license
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
  // Get all CCCD
  getAll: async () => {
    return apiRequest(`${BASE_URL}/CCCD`);
  },

  // Get pending CCCD
  getPending: async () => {
    return apiRequest(`${BASE_URL}/CCCD/pending`);
  },

  // Get CCCD by renter ID
  getByRenter: async (renterId) => {
    return apiRequest(`${BASE_URL}/CCCD/${renterId}`);
  },

  // Create CCCD record
  create: async (payload) => {
    return apiRequest(`${BASE_URL}/CCCD`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Update CCCD status
  updateStatus: async (id, payload) => {
    return apiRequest(`${BASE_URL}/CCCD/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // Approve CCCD
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

  // Reject CCCD
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

// Legacy CCCD API (for backward compatibility)
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

// Legacy License API (for backward compatibility)
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
