// Geospatial utilities: Haversine distance and nearest-station helper
// Returns distances in kilometers

/**
 * Haversine distance between two points (lat/lng in degrees)
 * @returns distance in kilometers
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find nearest station from an array of stations.
 * Stations may have latitude/longitude, lat/lng, or location.{lat,lng}.
 * Returns { station, distanceKm } or null if no valid coordinates.
 */
export function findNearestStation(stations = [], userLat, userLng) {
  if (!Array.isArray(stations) || stations.length === 0) return null;

  let best = null;

  stations.forEach((st) => {
    const lat = parseFloat(st.latitude ?? st.lat ?? (st.location && st.location.lat));
    const lng = parseFloat(st.longitude ?? st.lng ?? (st.location && st.location.lng));
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const dist = haversineDistanceKm(userLat, userLng, lat, lng);
      if (!best || dist < best.distanceKm) {
        best = { station: st, distanceKm: dist };
      }
    }
  });

  return best;
}

export default { haversineDistanceKm, findNearestStation };
