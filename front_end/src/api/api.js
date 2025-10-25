// 🔹 Base URLs
const BASE_URL = "https://alani-uncorroboratory-sympetaly.ngrok-free.dev/api";

// const BASE_URL = "https://68e62cc921dd31f22cc4769d.mockapi.io/api/ev";

// 🔹 Common headers
const JSON_HEADERS = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
};

const NGROK_HEADER = { "ngrok-skip-browser-warning": "true" };

//
// ==================== USER API ====================
//
export const userAPI = {
  // 🔹 Lấy tất cả người dùng
  getAllUsers: async () => {
    const res = await fetch(`${BASE_URL}/Users`, { headers: NGROK_HEADER });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // 🔹 Lấy danh sách người dùng chưa xác minh
  getUnverifiedUsers: async () => {
    const res = await fetch(`${BASE_URL}/Users`);
    const data = await res.json();
    return data.filter((u) => u.role === "renter" && !u.isVerified);
  },

  // 🔹 Duyệt người dùng
  verifyUser: async (userId, staffId) => {
    const res = await fetch(`${BASE_URL}/Users/${userId}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        isVerified: true,
        verifiedBy: staffId,
        verifiedAt: new Date().toISOString(),
      }),
    });
    if (!res.ok) throw new Error("Xác minh người dùng thất bại!");
    return res.json();
  },

  // 🔹 Từ chối người dùng
  rejectUser: async (userId, reason) => {
    const res = await fetch(`${BASE_URL}/Users/${userId}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        isVerified: false,
        rejectedAt: new Date().toISOString(),
        rejectedReason: reason,
      }),
    });
    if (!res.ok) throw new Error("Từ chối người dùng thất bại!");
    return res.json();
  },

  // 🔹 Đăng ký người dùng
  registerUser: async (newUser) => {
    const res = await fetch(`${BASE_URL}/Users/Register`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(newUser),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // Đăng nhập
  loginUser: async (credentials) => {
    const res = await fetch(`${BASE_URL}/UserAccount/login`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(credentials),
    });

    // Kiểm tra response status
    if (!res.ok) {
      try {
        const errorData = await res.json();
        throw new Error(errorData.message || "Đăng nhập thất bại");
      } catch {
        throw new Error(`Đăng nhập thất bại: ${res.status}`);
      }
    }

    try {
      const data = await res.json();
      console.log(data);
      if (!data) throw new Error("Không nhận được dữ liệu từ server");
      return data; // Trả về { token, user } từ API
    } catch {
      throw new Error("Lỗi xử lý dữ liệu đăng nhập");
    }

  },

  // 🔹 Cập nhật người dùng
  updateUser: async (user) => {
    const res = await fetch(`${BASE_URL}/Users/${user.userId}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error("Cập nhật người dùng thất bại!");
    return res.json();
  },
};

//
// ==================== LICENSE API ====================
//
export const licenseAPI = {
  base: `${BASE_URL}/licenses`,

  // 🔹 Lấy tất cả license (Staff/Admin)
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/licenses`, { headers: JSON_HEADERS });
    if (!res.ok) throw new Error("Không thể tải danh sách license");
    return res.json();
  },

  // 🔹 Lấy license theo renter_id (User)
  getByRenter: async (renterId) => {
    const res = await fetch(`${BASE_URL}/licenses?renter_id=${renterId}`, {
      headers: JSON_HEADERS,
    });
    if (!res.ok) throw new Error("Không thể tải giấy phép người dùng");
    const data = await res.json();
    return data[0];
  },

  // 🔹 Upload ảnh giấy phép thật (FormData)
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/licenses/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload ảnh thất bại");
    const data = await res.json();
    return data.filePath; // giả định server trả về { filePath: "https://..." }
  },

  // 🔹 Gửi license (User nộp)
  create: async (payload) => {
    const res = await fetch(`${BASE_URL}/licenses`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Gửi xác minh thất bại!");
    return res.json();
  },

  // 🔹 Cập nhật trạng thái (Staff duyệt)
  updateStatus: async (id, status, reason = "") => {
    const res = await fetch(`${BASE_URL}/licenses/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        status,
        verified_date: new Date().toISOString(),
        rejected_reason: reason,
      }),
    });
    if (!res.ok) throw new Error("Cập nhật trạng thái thất bại!");
    return res.json();
  },
};

//
// ==================== CCCD API ====================
//
export const cccdAPI = {
  base: `${BASE_URL}/Cccd_Cmnd`,

  // 🔹 Lấy tất cả CCCD
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/Cccd_Cmnd`, { headers: JSON_HEADERS });
    if (!res.ok) throw new Error("Không thể tải danh sách CCCD");
    return res.json();
  },

  // 🔹 Tạo CCCD mới
  create: async (payload) => {
    const res = await fetch(`${BASE_URL}/Cccd_Cmnd`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Gửi CCCD thất bại!");
    return res.json();
  },

  // 🔹 Cập nhật trạng thái CCCD
  updateStatus: async (id, status, reason = "") => {
    const res = await fetch(`${BASE_URL}/Cccd_Cmnd/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        status,
        verified_date: new Date().toISOString(),
        rejected_reason: reason,
      }),
    });
    if (!res.ok) throw new Error("Cập nhật trạng thái CCCD thất bại!");
    return res.json();
  },
};

// ✅ Xuất mặc định để có thể import userAPI nhanh
export default userAPI;
