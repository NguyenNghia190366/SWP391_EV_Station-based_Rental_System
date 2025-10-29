// Configuration
// 🌐 BE của team (đang dùng)
const BASE_URL = "https://alani-uncorroboratory-sympetaly.ngrok-free.dev/api";

// 🏠 Local BE với Vite proxy (comment lại khi dùng ngrok)
// const BASE_URL = "/api";

// Headers
const HEADERS = {
  NGROK: {
    "ngrok-skip-browser-warning": "true",
  },
};

// ==================== USER FILE UPLOAD API ====================
export const userFileAPI = {
  // Upload avatar
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

  // Upload license (legacy endpoint)
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

  // Upload ID card (legacy endpoint)
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

// ==================== DRIVER LICENSE FILE UPLOAD API ====================
export const driverLicenseFileAPI = {
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

  // Upload license image (alternative endpoint)
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/licenses/upload`, {
      method: "POST",
      headers: HEADERS.NGROK,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload ảnh thất bại: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.filePath || data.url || data;
  },
};

// ==================== CCCD FILE UPLOAD API ====================
export const cccdFileAPI = {
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
};

// ==================== VEHICLE IMAGE UPLOAD API ====================
export const vehicleFileAPI = {
  // Upload vehicle image
  uploadImage: async (formData) => {
    const response = await fetch(`${BASE_URL}/vehicles/upload-image`, {
      method: "POST",
      headers: HEADERS.NGROK,
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await response.json().catch(() => null);
      throw new Error(errorMessage?.message || "Upload vehicle image failed");
    }

    return response.json();
  },

  // Upload multiple vehicle images
  uploadImages: async (formData) => {
    const response = await fetch(`${BASE_URL}/vehicles/upload-images`, {
      method: "POST",
      headers: HEADERS.NGROK,
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await response.json().catch(() => null);
      throw new Error(errorMessage?.message || "Upload vehicle images failed");
    }

    return response.json();
  },
};

export default userFileAPI;
