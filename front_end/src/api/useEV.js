// EV Vehicles, Stations, Bookings/Rentals, Check-In/Check-Out APIs
import { BASE_URL, apiRequest, buildHeaders } from "./client";

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
    console.log("🏢 [stationAPI] Creating station:", payload);
    return apiRequest(`${BASE_URL}/Stations`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Update station (Admin/Staff only)
  update: async (id, payload) => {
    console.log("📤 [stationAPI] Updating station:", id, payload);
    return apiRequest(`${BASE_URL}/Stations/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // Delete station (Admin only)
  delete: async (id) => {
    console.log("🗑️ [stationAPI] Deleting station:", id);
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
      headers: buildHeaders({ "Content-Type": undefined }),
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

// ==================== VEHICLE PREVIEW/HANDOVER API ====================
export const vehiclePreviewAPI = {
  // Staff: Send vehicle preview (photos + condition) to customer
  sendVehiclePreview: async (bookingId, formData) => {
    const response = await fetch(`${BASE_URL}/bookings/${bookingId}/vehicle-preview`, {
      method: "POST",
      headers: buildHeaders({ "Content-Type": undefined }),
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await response.json().catch(() => null);
      throw new Error(errorMessage?.message || "Send vehicle preview failed");
    }

    return response.json();
  },

  // Customer: Get vehicle preview sent by staff
  getVehiclePreview: async (bookingId) => {
    return apiRequest(`${BASE_URL}/bookings/${bookingId}/vehicle-preview`);
  },

  // Customer: Confirm vehicle after viewing preview
  confirmVehiclePreview: async (bookingId, payload = {}) => {
    return apiRequest(`${BASE_URL}/bookings/${bookingId}/confirm-vehicle`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Customer: Request vehicle change (reject current vehicle)
  requestVehicleChange: async (bookingId, reason) => {
    return apiRequest(`${BASE_URL}/bookings/${bookingId}/request-change`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  // Update vehicle status (available -> booked -> in_use -> available)
  updateVehicleStatus: async (vehicleId, status) => {
    return apiRequest(`${BASE_URL}/vehicles/${vehicleId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },
};

export default vehicleAPI;

