// Main API facade - Re-exports from modular files for backward compatibility
// See: client.js, useAuth.js, useFile.js, useEV.js, useVerify.js

// Re-export shared client utilities
export { BASE_URL, getAuthToken, buildHeaders, handleApiError, apiRequest } from "./client";

// Re-export auth/user APIs
export { 
  userAPI, 
  driverLicenseAPI, 
  cccdVerificationAPI, 
  cccdAPI, 
  licenseAPI 
} from "./useAuth";

// Re-export file upload APIs
export { 
  userFileAPI, 
  driverLicenseFileAPI, 
  cccdFileAPI, 
  vehicleFileAPI 
} from "./useFile";

// Re-export EV/vehicle/station APIs
export { 
  vehicleAPI, 
  stationAPI, 
  rentalAPI, 
  checkInAPI, 
  vehiclePreviewAPI 
} from "./useEV";

// Re-export verification APIs
export { 
  driverLicenseVerifyAPI, 
  cccdVerifyAPI, 
  verificationAPI 
} from "./useVerify";

// Re-export notifications API
export { notificationsAPI } from "./useNotifications";

// Default export for backward compatibility
export { userAPI as default } from "./useAuth";

