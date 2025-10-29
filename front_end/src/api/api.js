//  Configuration
// 🌐 BE của team (đang dùng)
// const BASE_URL = "https://alani-uncorroboratory-sympetaly.ngrok-free.dev/api";

// 🏠 Local BE với Vite proxy (comment lại khi dùng ngrok)
const BASE_URL = "/api"; // Use relative URL to work with Vite proxy

//  Headers
const HEADERS = {
  JSON: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  NGROK: {
    "ngrok-skip-browser-warning": "true",
  },
};

//  Helper function for fetch requests
// Handles JSON and empty/no-content responses safely.
const apiRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: HEADERS.JSON,
    ...options,
  });

  // If not OK, try to parse JSON error body but fall back to status text
  if (!response.ok) {
    let errorBody = null;
    try {
      // Attempt to parse JSON error body if present
      const text = await response.text();
      errorBody = text ? JSON.parse(text) : null;
    } catch {
      // ignore parse errors
      errorBody = null;
    }
    throw new Error(errorBody?.message || errorBody || `HTTP ${response.status}`);
  }

  // Handle 204 No Content or empty bodies
  if (response.status === 204) return null;

  // Check content-type header to decide how to parse
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  // If not JSON, return raw text
  return response.text();
};

// ==================== USER API ====================
export const userAPI = {
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

  registerUser: async (newUser) => {
    return apiRequest(`${BASE_URL}/Users/Register`, {
      method: "POST",
      body: JSON.stringify(newUser),
    });
  },

  loginUser: async (credentials) => {
    const data = await apiRequest(`${BASE_URL}/UserAccount/login`, {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (!data) {
      throw new Error("Không nhận được dữ liệu từ server");
    }

    console.log(data);
    return data;
  },

  updateUser: async (user) => {
    return apiRequest(`${BASE_URL}/Users/${user.userId}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });
  },

  uploadAvatar: async (formData) => {
    const response = await fetch(`${BASE_URL}/Users/upload-avatar`, {
      method: "POST",
      headers: HEADERS.NGROK,
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await response.json().catch(() => null);
      throw new Error(errorMessage?.message || "Upload avatar failed");
    }

    return response.json();
  },

  uploadLicense: async (formData) => {
    const response = await fetch(`${BASE_URL}/Users/upload-license`, {
      method: "POST",
      headers: HEADERS.NGROK,
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await response.json().catch(() => null);
      throw new Error(errorMessage?.message || "Upload license failed");
    }

    return response.json();
  },

  uploadIdCard: async (formData) => {
    const response = await fetch(`${BASE_URL}/Users/upload-idcard`, {
      method: "POST",
      headers: HEADERS.NGROK,
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await response.json().catch(() => null);
      throw new Error(errorMessage?.message || "Upload ID card failed");
    }

    return response.json();
  },
};

// ==================== LICENSE API ====================
export const licenseAPI = {
  getAll: async () => {
    return apiRequest(`${BASE_URL}/licenses`);
  },

  getByRenter: async (renterId) => {
    const data = await apiRequest(`${BASE_URL}/licenses?renter_id=${renterId}`);
    return data[0];
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    console.log(" Uploading to:", `${BASE_URL}/licenses/upload`);
    console.log(" File:", file.name, file.type, file.size);

    const response = await fetch(`${BASE_URL}/licenses/upload`, {
      method: "POST",
      headers: HEADERS.NGROK,
      body: formData,
    });

    console.log(" Upload response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(" Upload failed:", errorText);
      throw new Error(`Upload ảnh thất bại: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(" Upload response:", data);
    return data.filePath || data.url || data;
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

// ==================== CCCD API ====================
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

// ==================== DRIVER LICENSE API (for real database) ====================
export const driverLicenseAPI = {
  // Get all pending driver licenses
  getPending: async () => {
    return apiRequest(`${BASE_URL}/Driver_License/pending`);
  },

  // Get all driver licenses
  getAll: async () => {
    return apiRequest(`${BASE_URL}/Driver_License`);
  },

  // Get license by renter ID
  getByRenter: async (renterId) => {
    return apiRequest(`${BASE_URL}/Driver_License?renter_id=${renterId}`);
  },

  // Upload driver license image
  uploadLicense: async (formData) => {
    const response = await fetch(`${BASE_URL}/Driver_License/upload`, {
      method: "POST",
      headers: HEADERS.NGROK,
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await response.json().catch(() => null);
      throw new Error(errorMessage?.message || "Upload driver license failed");
    }

    return response.json();
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

// ==================== CCCD/CMND API (Updated for real database) ====================
export const cccdVerificationAPI = {
  // Get all pending CCCD
  getPending: async () => {
    return apiRequest(`${BASE_URL}/CCCD/pending`);
  },

  // Get all CCCD
  getAll: async () => {
    return apiRequest(`${BASE_URL}/CCCD`);
  },

  // Get CCCD by renter ID
  getByRenter: async (renterId) => {
    return apiRequest(`${BASE_URL}/CCCD/${renterId}`);
  },

  // Upload CCCD image
  uploadCCCD: async (formData) => {
    const response = await fetch(`${BASE_URL}/CCCD/upload`, {
      method: "POST",
      headers: HEADERS.NGROK,
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await response.json().catch(() => null);
      throw new Error(errorMessage?.message || "Upload CCCD failed");
    }

    return response.json();
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

// ==================== EXPORTS ====================
export default userAPI;

// ==================== STATIONS API ====================
export const stationAPI = {
  // Get all stations
  getAll: async () => {
    return apiRequest(`${BASE_URL}/Stations`);
  },
  // Get nearest station from backend by coordinates (if backend supports it)
  // Expects query params ?lat=...&lng=... and returns nearest station or { station, distanceKm }
  getNearest: async (lat, lng) => {
    if (lat == null || lng == null) {
      throw new Error('Latitude and longitude are required');
    }
    const url = `${BASE_URL}/Stations/nearest?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
      return apiRequest(url);
  },
};
