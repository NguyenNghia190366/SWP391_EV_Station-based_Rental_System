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

// ==================== VEHICLE API ====================
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

  // Create vehicle (Admin/Staff only)
  create: async (payload) => {
    return apiRequest(`${BASE_URL}/vehicles`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Update vehicle (Admin/Staff only)
  update: async (id, payload) => {
    return apiRequest(`${BASE_URL}/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // Delete vehicle (Admin only)
  delete: async (id) => {
    return apiRequest(`${BASE_URL}/vehicles/${id}`, {
      method: "DELETE",
    });
  },
};

// ==================== STATION API ====================
export const stationAPI = {
  // Get all stations
  getAll: async () => {
    return apiRequest(`${BASE_URL}/Stations`);
  },

  // Get station by ID
  getById: async (id) => {
    return apiRequest(`${BASE_URL}/Stations/${id}`);
  },

  // Get nearest station by coordinates
  getNearest: async (lat, lng) => {
    if (lat == null || lng == null) {
      throw new Error('Latitude and longitude are required');
    }
    const url = `${BASE_URL}/Stations/nearest?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
    return apiRequest(url);
  },

  // Create station (Admin only)
  create: async (payload) => {
    return apiRequest(`${BASE_URL}/Stations`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Update station (Admin/Staff only)
  update: async (id, payload) => {
    return apiRequest(`${BASE_URL}/Stations/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // Delete station (Admin only)
  delete: async (id) => {
    return apiRequest(`${BASE_URL}/Stations/${id}`, {
      method: "DELETE",
    });
  },
};

// ==================== BOOKING/RENTAL API ====================
export const rentalAPI = {
  // Get all rentals
  getAll: async () => {
    return apiRequest(`${BASE_URL}/rentals`);
  },

  // Get rental by ID
  getById: async (id) => {
    return apiRequest(`${BASE_URL}/rentals/${id}`);
  },

  // Get rentals by user
  getByUser: async (userId) => {
    return apiRequest(`${BASE_URL}/rentals/user/${userId}`);
  },

  // Get pending rentals (waiting for pickup)
  getPending: async () => {
    return apiRequest(`${BASE_URL}/rentals/pending`);
  },

  // Get active rentals (currently in use)
  getActive: async () => {
    return apiRequest(`${BASE_URL}/rentals/active`);
  },

  // Create new rental/booking
  create: async (payload) => {
    return apiRequest(`${BASE_URL}/rentals`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Update rental status
  updateStatus: async (id, status) => {
    return apiRequest(`${BASE_URL}/rentals/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  // Cancel rental
  cancel: async (id, reason) => {
    return apiRequest(`${BASE_URL}/rentals/${id}/cancel`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  },
};

// ==================== CHECK-IN/CHECK-OUT API ====================
export const checkInAPI = {
  // Check-in: Nhận xe tại quầy hoặc qua app
  checkIn: async (payload) => {
    return apiRequest(`${BASE_URL}/rentals/checkin`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Verify booking for check-in (scan QR or enter code)
  verifyBooking: async (bookingCode) => {
    return apiRequest(`${BASE_URL}/rentals/verify/${bookingCode}`);
  },

  // Get check-in details
  getCheckInDetails: async (rentalId) => {
    return apiRequest(`${BASE_URL}/rentals/${rentalId}/checkin-details`);
  },

  // Staff confirm check-in at counter
  staffConfirmCheckIn: async (rentalId, payload) => {
    return apiRequest(`${BASE_URL}/rentals/${rentalId}/staff-checkin`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Self check-in via app
  selfCheckIn: async (rentalId, payload) => {
    return apiRequest(`${BASE_URL}/rentals/${rentalId}/self-checkin`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Upload vehicle condition photos at check-in
  uploadConditionPhotos: async (rentalId, formData) => {
    const response = await fetch(`${BASE_URL}/rentals/${rentalId}/condition-photos`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await response.json().catch(() => null);
      throw new Error(errorMessage?.message || "Upload photos failed");
    }

    return response.json();
  },

  // Check-out: Trả xe
  checkOut: async (rentalId, payload) => {
    return apiRequest(`${BASE_URL}/rentals/${rentalId}/checkout`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Get check-out details
  getCheckOutDetails: async (rentalId) => {
    return apiRequest(`${BASE_URL}/rentals/${rentalId}/checkout-details`);
  },
};

export default vehicleAPI;
