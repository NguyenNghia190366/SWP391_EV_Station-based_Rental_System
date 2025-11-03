// Shared HTTP client helpers: base URL, headers, interceptors and apiRequest

// 🔧 Get BASE_URL from environment variable (.env file)
// Switch backend by editing .env file
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Log current API endpoint (helpful for debugging)
console.log("🌐 [API Client] Using BASE_URL:", BASE_URL);

// Get token from localStorage safely
export const getAuthToken = () => {
  try {
    const token = localStorage.getItem("token");
    return token ? `Bearer ${token}` : null;
  } catch (error) {
    console.error("❌ [client] Error getting token:", error);
    return null;
  }
};

// Build headers and allow overriding; set Content-Type removal when undefined
export const buildHeaders = (customHeaders = {}) => {
  const baseHeaders = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };

  const authToken = getAuthToken();
  if (authToken) baseHeaders["Authorization"] = authToken;

  const merged = { ...baseHeaders, ...customHeaders };
  if (customHeaders["Content-Type"] === undefined) delete merged["Content-Type"];
  return merged;
};

// Centralized error handling
export const handleApiError = (response, errorBody) => {
  const status = response.status;
  if (status === 401) {
    console.warn("🚨 [client] 401 - clearing token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }
  if (status === 403) throw new Error("Bạn không có quyền truy cập tài nguyên này.");
  if (status === 404) throw new Error("Không tìm thấy tài nguyên yêu cầu.");
  if (status >= 500) throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");

  // Make sure the thrown Error contains a readable string (not [object Object])
  let errorMessage = null;
  if (!errorBody) {
    errorMessage = `HTTP ${status}: ${response.statusText}`;
  } else if (typeof errorBody === "string") {
    errorMessage = errorBody;
  } else if (typeof errorBody === "object") {
    // Prefer human-friendly fields, fall back to JSON string
    errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
  } else {
    errorMessage = String(errorBody);
  }
  throw new Error(errorMessage);
};

// Generic fetch wrapper with interceptors
export const apiRequest = async (url, options = {}) => {
  const headers = buildHeaders(options.headers);
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorBody = null;
    try {
      const text = await response.text();
      errorBody = text ? JSON.parse(text) : null;
    } catch {
      errorBody = null;
    }
    handleApiError(response, errorBody);
  }

  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json();
  return response.text();
};

export { BASE_URL };
