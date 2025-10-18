// const MOCKAPI_BASE = "https://68e62cc921dd31f22cc4769d.mockapi.io/api/ev/users";
const MOCKAPI_BASE = "https://alani-uncorroboratory-sympetaly.ngrok-free.dev/api/Users";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
  // "Authorization": `Bearer ${token}` // nếu có auth
};

const NGROK_HEADER = { "ngrok-skip-browser-warning": "true" };

export const userAPI = {
  // Lấy tất cả user
  getAllUsers: async () => {
    try {
      const response = await fetch(MOCKAPI_BASE, { headers: NGROK_HEADER });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Lấy danh sách user chưa xác thực
  getUnverifiedUsers: async () => {
    try {
      const response = await fetch(MOCKAPI_BASE, { headers: NGROK_HEADER });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.filter((u) => u.role === "renter" && !u.isVerified);
    } catch (error) {
      console.error("Error fetching unverified users:", error);
      throw error;
    }
  },

  // Xác thực user
  verifyUser: async (userId, staffId) => {
    try {
      const response = await fetch(`${MOCKAPI_BASE}/${userId}`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          isVerified: true,
          verifiedBy: staffId,
          verifiedAt: new Date().toISOString(),
        }),
      });
      return response;
    } catch (error) {
      console.error("Error verifying user:", error);
      throw error;
    }
  },

  // Từ chối xác thực
  rejectUser: async (userId, reason) => {
    try {
      const response = await fetch(`${MOCKAPI_BASE}/users/${userId}`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          isVerified: false,
          rejectedAt: new Date().toISOString(),
          rejectedReason: reason,
        }),
      });
      return response;
    } catch (error) {
      console.error("Error rejecting user:", error);
      throw error;
    }
  },

  // Đăng ký user
  registerUser: async (newUser) => {
    try {
      const response = await fetch(MOCKAPI_BASE, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(newUser),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },
};

export default userAPI;
