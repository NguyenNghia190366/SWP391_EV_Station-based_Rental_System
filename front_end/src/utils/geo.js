/**
 * Geolocation utility functions
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Find the nearest station from a list based on user's coordinates
 * @param {Array} stations - Array of station objects
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @returns {Object|null} Object with station and distance, or null if no stations
 */
export const findNearestStation = (stations, userLat, userLng) => {
  if (!stations || stations.length === 0) {
    return null;
  }

  let nearestStation = null;
  let minDistance = Infinity;

  stations.forEach((station) => {
    // Handle different property names (latitude/lat, longitude/lng)
    const stationLat = station.latitude || station.lat;
    const stationLng = station.longitude || station.lng;

    if (stationLat && stationLng) {
      const distance = calculateDistance(
        userLat,
        userLng,
        stationLat,
        stationLng
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestStation = station;
      }
    }
  });

  if (nearestStation) {
    return {
      station: nearestStation,
      distanceKm: Math.round(minDistance * 100) / 100, // Round to 2 decimal places
    };
  }

  return null;
};

/**
 * Get user's current position using browser geolocation API
 * @param {Object} options - Geolocation options
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCurrentPosition = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    );
  });
};

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

/**
 * Check if coordinates are valid
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean}
 */
export const isValidCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

export default {
  calculateDistance,
  findNearestStation,
  getCurrentPosition,
  formatDistance,
  isValidCoordinates,
};
