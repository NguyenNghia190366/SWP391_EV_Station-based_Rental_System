/**
 * Normalize user data from different backend sources
 * Supports both local BE and real team BE
 */
export const normalizeUserData = (user) => {
  if (!user) return null;

  // Generate a temporary userId if not provided (for BE real)
  const tempUserId = user.userId || user.id || `temp_${user.email?.split('@')[0]}_${Date.now()}`;

  return {
    // IDs
    userId: tempUserId,
    
    // Names
    fullName: user.fullName || user.userName || user.email?.split('@')[0] || '',
    userName: user.userName || user.fullName || user.email?.split('@')[0] || '',
    
    // Contact
    email: user.email || '',
    phone: user.phone || user.phoneNumber || '',
    phoneNumber: user.phoneNumber || user.phone || '',
    
    // Role & Status - KEEP UPPERCASE for consistency with backend
    role: (user.role || '').toUpperCase(), // Always uppercase: ADMIN, STAFF, RENTER
    isVerified: user.isVerified !== undefined ? user.isVerified : (user.status === 'active' || true),
    status: user.status || (user.isVerified ? 'active' : 'inactive'),
    
    // Additional Info
    avatar: user.avatar || null,
    createdAt: user.createdAt,
    dateOfBirth: user.dateOfBirth,
    lastLogin: user.lastLogin,
    
    // Token info (if from login response)
    token: user.token,
    expirationInMinutes: user.expirationInMinutes,
    
    // Keep original data for reference
    _original: user,
  };
};

/**
 * Normalize vehicle data
 * BE Real format: vehicleId, licensePlate, batteryCapacity, imgCarUrl, condition, isAvailable
 * Frontend expect: id, name, type, battery, range, price, image, status
 */
export const normalizeVehicleData = (vehicle) => {
  if (!vehicle) return null;

  return {
    // IDs
    id: vehicle.vehicleId || vehicle.id,
    vehicleId: vehicle.vehicleId || vehicle.id,
    
    // Basic Info
    name: vehicle.name || vehicle.licensePlate || `Xe ${vehicle.vehicleId}`,
    licensePlate: vehicle.licensePlate || '',
    type: vehicle.type || vehicle.vehicleType || 'Xe điện',
    
    // Battery & Range
    battery: vehicle.battery || vehicle.batteryCapacity || 100,
    batteryCapacity: vehicle.batteryCapacity || vehicle.battery || 100,
    range: vehicle.range || vehicle.maxRange || (vehicle.batteryCapacity ? vehicle.batteryCapacity * 5 : 0), // Estimate: 1 kWh = 5km
    currentMileage: vehicle.currentMileage || 0,
    
    // Pricing (estimate if not provided)
    price: vehicle.price || vehicle.pricePerDay || vehicle.dailyRate || 100,
    
    // Images
    image: vehicle.image || vehicle.imageUrl || vehicle.imgCarUrl || '/default-car.png',
    imgCarUrl: vehicle.imgCarUrl || vehicle.image || vehicle.imageUrl || '/default-car.png',
    
    // Status & Availability
    status: vehicle.status || (vehicle.isAvailable ? 'available' : 'unavailable'),
    isAvailable: vehicle.isAvailable !== undefined ? vehicle.isAvailable : (vehicle.status === 'available'),
    condition: vehicle.condition || 'GOOD',
    
    // Location & Model
    location: vehicle.location || vehicle.stationId || '',
    stationId: vehicle.stationId || vehicle.location || null,
    vehicleModelId: vehicle.vehicleModelId || null,
    releaseYear: vehicle.releaseYear || new Date().getFullYear(),
    
    // Metadata
    createdAt: vehicle.createdAt,
    
    // Keep original for reference
    _original: vehicle,
  };
};

/**
 * Normalize booking/rental data
 */
export const normalizeBookingData = (booking) => {
  if (!booking) return null;

  return {
    bookingId: booking.bookingId || booking.id,
    vehicleId: booking.vehicleId || booking.vehicle_id,
    userId: booking.userId || booking.user_id || booking.renterId,
    startDate: booking.startDate || booking.start_date || booking.pickupDate,
    endDate: booking.endDate || booking.end_date || booking.returnDate,
    pickupLocation: booking.pickupLocation || booking.pickup_location || booking.station,
    status: booking.status || 'pending',
    totalPrice: booking.totalPrice || booking.total_price || booking.price || 0,
    deposit: booking.deposit || booking.deposit_amount || 0,
    phone: booking.phone || booking.phoneNumber || booking.contactPhone || '',
    _original: booking,
  };
};

/**
 * Normalize API response
 * Handles different response formats: { data }, { result }, direct object, etc.
 */
export const normalizeApiResponse = (response) => {
  if (!response) return null;

  // Case 1: { data: { ... } }
  if (response.data) {
    return response.data;
  }

  // Case 2: { result: { ... } }
  if (response.result) {
    return response.result;
  }

  // Case 3: { success: true, data: { ... } }
  if (response.success && response.data) {
    return response.data;
  }

  // Case 4: Direct object
  return response;
};

/**
 * Safe field accessor with fallbacks
 * Usage: getField(user, ['userName', 'fullName', 'email'], 'Unknown')
 */
export const getField = (obj, fieldNames, defaultValue = '') => {
  if (!obj) return defaultValue;
  
  if (Array.isArray(fieldNames)) {
    for (const field of fieldNames) {
      const value = obj[field];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    return defaultValue;
  }
  
  return obj[fieldNames] ?? defaultValue;
};
