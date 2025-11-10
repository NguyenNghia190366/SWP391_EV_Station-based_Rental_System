import { BASE_URL, JSON_HEADERS } from "./useAPI";

/**
 * Get headers with authentication token if available
 */
const getAuthHeaders = () => { // them token vao header
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  const headers = {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json"
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};


const normalizeStation = (station) => {
  if (!station) {
    return station;
  }
  
  // Ensure both lat/latitude and lng/longitude exist
  const lat = station.lat ?? station.latitude;
  const lng = station.lng ?? station.longitude;
  
  const normalized = {
    ...station,
    lat,
    lng,
    latitude: lat,
    longitude: lng,
    // Ensure name fields are consistent
    name: station.name || station.stationName || station.station_name,
    station_name: station.station_name || station.stationName || station.name,
  };
  
  return normalized;
};

// ==================== STATION API ====================
export const useStations = () => {
  const getAll = async () => {
    const res = await fetch(`${BASE_URL}/Stations`, { headers: getAuthHeaders() });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch stations: HTTP ${res.status}`);
    }
    
    const data = await res.json();
    
    // Normalize the response - handle both array and {data: array} formats
    const stations = Array.isArray(data) ? data : (data?.data || []);
    
    // Normalize each station to ensure lat/lng properties exist
    const normalized = stations.map(normalizeStation);
    
    return normalized;
  };

  // Try a nearest endpoint; if backend doesn't support it, callers should fallback
  const getNearest = async (lat, lng) => {
    // Prefer a query-based endpoint
    const url = `${BASE_URL}/Stations/nearest?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) {
      // If not implemented, try a different conventional path
      const altUrl = `${BASE_URL}/Stations/nearest/${encodeURIComponent(lat)}/${encodeURIComponent(lng)}`;
      const altRes = await fetch(altUrl, { headers: getAuthHeaders() });
      if (!altRes.ok) {
        const err = await altRes.json().catch(() => ({}));
        throw new Error(err.message || `Nearest station lookup failed: HTTP ${altRes.status}`);
      }
      const result = await altRes.json();
      // Normalize station in result
      if (result?.station) {
        result.station = normalizeStation(result.station);
      }
      return result;
    }
    const result = await res.json();
    // Normalize station in result
    if (result?.station) {
      result.station = normalizeStation(result.station);
    }
    return result;
  };

  const getById = async (id) => {
    const res = await fetch(`${BASE_URL}/Stations/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch station ${id}: HTTP ${res.status}`);
    }
    const station = await res.json();
    return normalizeStation(station);
  };

  const create = async (payload) => {
    const res = await fetch(`${BASE_URL}/Stations`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Create station failed: HTTP ${res.status}`);
    }
    return res.json();
  };

  const update = async (id, payload) => {
    const res = await fetch(`${BASE_URL}/Stations/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Update station failed: HTTP ${res.status}`);
    }
    return res.json();
  };

  const remove = async (id) => {
    const res = await fetch(`${BASE_URL}/Stations/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Delete station failed: HTTP ${res.status}`);
    }
    return res.json();
  };

  return { getAll, getNearest, getById, create, update, remove };
};