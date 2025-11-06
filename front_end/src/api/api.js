// API service objects - wrapper for hooks
const BASE_URL = "https://alani-uncorroboratory-sympetaly.ngrok-free.dev/api";
const JSON_HEADERS = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
};

// ==================== USER API ====================
export const userAPI = {
  async loginUser(credentials) {
    const res = await fetch(`${BASE_URL}/UserAccount/login`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error("Email hoặc mật khẩu không chính xác!");
      if (res.status === 404) throw new Error("Email không tồn tại trong hệ thống!");
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Lỗi ${res.status}: Đăng nhập thất bại`);
    }

    return res.json();
  },

  async registerUser(newUser) {
    const res = await fetch(`${BASE_URL}/Users/Register`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(newUser),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Lỗi ${res.status}: Đăng ký thất bại`);
    }

    return res.json();
  },

  async updateUser(user) {
    const res = await fetch(`${BASE_URL}/Users/${user.userId}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(user),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Cập nhật người dùng thất bại!");
    }

    return res.json();
  },

  async getUserById(userId) {
    const res = await fetch(`${BASE_URL}/Users/${userId}`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });

    if (!res.ok) throw new Error("Không thể tải thông tin người dùng");
    return res.json();
  },
};

// ==================== DRIVER LICENSE API ====================
export const driverLicenseVerifyAPI = {
  async getByRenterId(renterId) {
    const res = await fetch(`${BASE_URL}/DriverLicenses/GetByRenter/${renterId}`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });

    if (!res.ok) {
      if (res.status === 404) return null; // Chưa có giấy phép
      throw new Error("Không thể tải thông tin giấy phép lái xe");
    }

    return res.json();
  },

  async uploadLicense(payload) {
    const res = await fetch(`${BASE_URL}/DriverLicenses/UploadBang`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Upload giấy phép lái xe thất bại!");
    }

    return res.json();
  },

  async getDriverLicenseById(id) {
    const res = await fetch(`${BASE_URL}/DriverLicenses/${id}`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });

    if (!res.ok) throw new Error("Không thể tải thông tin giấy phép");
    return res.json();
  },
};

// ==================== CCCD API ====================
export const cccdVerifyAPI = {
  async getByRenterId(renterId) {
    const res = await fetch(`${BASE_URL}/Cccds/GetByRenter/${renterId}`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });

    if (!res.ok) {
      if (res.status === 404) return null; // Chưa có CCCD
      throw new Error("Không thể tải thông tin CCCD/CMND");
    }

    return res.json();
  },

  async uploadCCCD(payload) {
    const res = await fetch(`${BASE_URL}/Cccds/UploadCanCuoc`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Upload CCCD/CMND thất bại!");
    }

    return res.json();
  },

  async getCccdById(id) {
    const res = await fetch(`${BASE_URL}/Cccds/${id}`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });

    if (!res.ok) throw new Error("Không thể tải thông tin CCCD");
    return res.json();
  },
};

// ==================== CHECK-IN API ====================
export const checkInAPI = {
  async getCheckInDetails(bookingId) {
    const res = await fetch(`${BASE_URL}/CheckIn/Details/${bookingId}`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Không thể tải thông tin check-in");
    }

    return res.json();
  },

  async uploadConditionPhotos(bookingId, formData) {
    const res = await fetch(`${BASE_URL}/CheckIn/${bookingId}/UploadPhotos`, {
      method: "POST",
      body: formData,
      // Let browser set Content-Type for multipart/form-data
      headers: { "ngrok-skip-browser-warning": "true" },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Upload ảnh tình trạng xe thất bại");
    }

    return res.json();
  },

  async selfCheckIn(bookingId, payload) {
    const res = await fetch(`${BASE_URL}/CheckIn/Self/${bookingId}`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Nhận xe thất bại");
    }

    return res.json();
  },
};

// ==================== VEHICLE API ====================

// Backwards-compatible aliases for older import names used across the codebase
// Backwards-compatible driverLicenseAPI with multiple method names used across the codebase
export const driverLicenseAPI = {
  // Old callers often use getByRenter(id)
  getByRenter: async (renterId) => {
    return driverLicenseVerifyAPI.getByRenterId(renterId);
  },
  // Keep newer name as well
  getByRenterId: driverLicenseVerifyAPI.getByRenterId,
  // Upload helpers
  upload: async (payload) => driverLicenseVerifyAPI.uploadLicense(payload),
  uploadLicense: driverLicenseVerifyAPI.uploadLicense,
  // Fetch by id
  getById: driverLicenseVerifyAPI.getDriverLicenseById,
};

// Backwards-compatible cccdVerificationAPI
export const cccdVerificationAPI = {
  getByRenter: async (renterId) => {
    return cccdVerifyAPI.getByRenterId(renterId);
  },
  getByRenterId: cccdVerifyAPI.getByRenterId,
  uploadCCCD: cccdVerifyAPI.uploadCCCD,
  upload: async (payload) => cccdVerifyAPI.uploadCCCD(payload),
  getById: cccdVerifyAPI.getCccdById,
};

// ==================== Verification management (staff endpoints) ====================
// The backend exposes /api/Driver_License and /api/CCCD controllers with pending/approve/reject
driverLicenseAPI.getPending = async () => {
  const res = await fetch(`${BASE_URL}/Driver_License/pending`, { headers: { "ngrok-skip-browser-warning": "true" } });
  if (!res.ok) throw new Error(`Failed to fetch pending driver licenses: HTTP ${res.status}`);
  return res.json();
};

driverLicenseAPI.approve = async (id) => {
  const res = await fetch(`${BASE_URL}/Driver_License/approve/${id}`, { method: 'PUT', headers: JSON_HEADERS });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Approve failed: HTTP ${res.status}`);
  }
  return res.json();
};

driverLicenseAPI.reject = async (id, body) => {
  const res = await fetch(`${BASE_URL}/Driver_License/reject/${id}`, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(body || {}) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Reject failed: HTTP ${res.status}`);
  }
  return res.json();
};

cccdVerificationAPI.getPending = async () => {
  const res = await fetch(`${BASE_URL}/CCCD/pending`, { headers: { "ngrok-skip-browser-warning": "true" } });
  if (!res.ok) throw new Error(`Failed to fetch pending CCCDs: HTTP ${res.status}`);
  return res.json();
};

cccdVerificationAPI.approve = async (id) => {
  const res = await fetch(`${BASE_URL}/CCCD/approve/${id}`, { method: 'PUT', headers: JSON_HEADERS });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Approve failed: HTTP ${res.status}`);
  }
  return res.json();
};

cccdVerificationAPI.reject = async (id, body) => {
  const res = await fetch(`${BASE_URL}/CCCD/reject/${id}`, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(body || {}) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Reject failed: HTTP ${res.status}`);
  }
  return res.json();
};

// Re-export stationAPI moved to hooks so existing imports keep working
export { stationAPI } from "../hooks/useStations";


