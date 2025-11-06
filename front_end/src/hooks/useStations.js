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

/**
 * Normalize station data to ensure both lat/lng and latitude/longitude are available
 * Backend may return either format, we ensure both exist for compatibility
 */
const normalizeStation = (station) => {
  if (!station) {
    console.warn('⚠️ Null station passed to normalizeStation');
    return station;
  }
  
  // Ensure both lat/latitude and lng/longitude exist
  const lat = station.lat ?? station.latitude;
  const lng = station.lng ?? station.longitude;
  
  // Log if coordinates are missing
  if (lat == null || lng == null) {
    console.warn('⚠️ Station missing coordinates:', station);
  }
  
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
export const stationAPI = {
  async getAll() {
    console.log('🔄 Fetching stations from:', `${BASE_URL}/Stations`);
    
    const res = await fetch(`${BASE_URL}/Stations`, { headers: getAuthHeaders() });
    
    console.log('📡 Station API response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('❌ Station API error:', err);
      throw new Error(err.message || `Failed to fetch stations: HTTP ${res.status}`);
    }
    
    const data = await res.json();
    console.log('📦 Raw station data from backend:', data);
    
    // Normalize the response - handle both array and {data: array} formats
    const stations = Array.isArray(data) ? data : (data?.data || []);
    console.log('📊 Extracted stations array:', stations.length, 'stations');
    
    // Normalize each station to ensure lat/lng properties exist
    const normalized = stations.map(normalizeStation);
    console.log('✅ Normalized stations:', normalized);
    
    return normalized;
  },

  // Try a nearest endpoint; if backend doesn't support it, callers should fallback
  async getNearest(lat, lng) {
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
  },

  async getById(id) {
    const res = await fetch(`${BASE_URL}/Stations/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch station ${id}: HTTP ${res.status}`);
    }
    const station = await res.json();
    return normalizeStation(station);
  },

  async create(payload) {
    const res = await fetch(`${BASE_URL}/Stations`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Create station failed: HTTP ${res.status}`);
    }
    return res.json();
  },

  async update(id, payload) {
    const res = await fetch(`${BASE_URL}/Stations/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Update station failed: HTTP ${res.status}`);
    }
    return res.json();
  },

  async remove(id) {
    const res = await fetch(`${BASE_URL}/Stations/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Delete station failed: HTTP ${res.status}`);
    }
    return res.json();
  },
};