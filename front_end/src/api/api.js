const MOCKAPI_BASE = "https://68e62cc921dd31f22cc4769d.mockapi.io/api/ev/users";
// const MOCKAPI_BASE = "https://alani-uncorroboratory-sympetaly.ngrok-free.dev/Users";

export const userAPI = {
  // Lấy tất cả user
  getAllUsers: async () => {
    try {
      const response = await fetch(`${MOCKAPI_BASE}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Lấy danh sách user chưa xác thực
  getUnverifiedUsers: async () => {
    const response = await fetch(`${MOCKAPI_BASE}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.filter((u) => u.role === "renter" && !u.isVerified);
  },

  // Xác thực user
  verifyUser: async (userId, staffId) => {
    return fetch(`${MOCKAPI_BASE}/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isVerified: true,
        verifiedBy: staffId,
        verifiedAt: new Date().toISOString(),
      }),
    });
  },

  // Từ chối xác thực
  rejectUser: async (userId, reason) => {
    return fetch(`${MOCKAPI_BASE}/users/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isVerified: false,
        rejectedAt: new Date().toISOString(),
        rejectedReason: reason,
      }),
    });
  },

  //Register
  registerUser: async (newUser) => {
    try {
      const response = await fetch(`${MOCKAPI_BASE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },
};

export default userAPI;
