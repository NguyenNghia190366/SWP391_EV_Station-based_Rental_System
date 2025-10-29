import { BASE_URL, HEADERS, apiRequest } from "./API_REAL_DATABASE.js";

// ==================== DRIVER LICENSE API ====================
export const driverLicenseAPI = {
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

  // Create driver license record
  create: async (payload) => {
    return apiRequest(`${BASE_URL}/Driver_License`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Get license by renter
  getByRenter: async (renterId) => {
    return apiRequest(`${BASE_URL}/Driver_License?renter_id=${renterId}`);
  },

  // Update license status
  updateStatus: async (id, payload) => {
    return apiRequest(`${BASE_URL}/Driver_License/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};

// ==================== CCCD API (Updated) ====================
export const cccdAPI = {
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

  // Create CCCD record
  create: async (payload) => {
    return apiRequest(`${BASE_URL}/CCCD`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Get CCCD by renter
  getByRenter: async (renterId) => {
    return apiRequest(`${BASE_URL}/CCCD?renter_id=${renterId}`);
  },

  // Update CCCD status
  updateStatus: async (id, payload) => {
    return apiRequest(`${BASE_URL}/CCCD/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
