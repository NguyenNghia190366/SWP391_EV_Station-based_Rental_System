// Vehicle API
// 🌐 BE của team (đang dùng)
const BASE_URL = "https://alani-uncorroboratory-sympetaly.ngrok-free.dev/api";

// 🏠 Local BE với Vite proxy (comment lại khi dùng ngrok)
// const BASE_URL = "/api";

const HEADERS = {
  JSON: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
};

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

export const vehicleAPI = {
  // Get all vehicles
  getAll: async () => {
    return apiRequest(`${BASE_URL}/vehicles`);
  },

  // Get vehicle by ID
  getById: async (id) => {
    return apiRequest(`${BASE_URL}/vehicles/${id}`);
  },

  // Search vehicles
  search: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${BASE_URL}/vehicles/search?${queryString}`);
  },

  // Filter by type
  filterByType: async (type) => {
    return apiRequest(`${BASE_URL}/vehicles/type/${type}`);
  },

  // Get available vehicles
  getAvailable: async () => {
    return apiRequest(`${BASE_URL}/vehicles/available`);
  },
};
