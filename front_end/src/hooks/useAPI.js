import { useState, useCallback } from 'react';

//  Base URLs
// 🌐 BE của team (uncomment khi team deploy)
const BASE_URL = "https://alani-uncorroboratory-sympetaly.ngrok-free.dev/api";

// 🏠 Local BE (đang sử dụng)
// const BASE_URL = "http://localhost:5189/api";

//  Common headers
const JSON_HEADERS = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
};

const NGROK_HEADER = { "ngrok-skip-browser-warning": "true" };

// ==================== BASE HOOK ====================
const useAPICall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callAPI = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  return { loading, error, callAPI };
};

// ==================== USER HOOKS ====================
export const useUserAPI = () => {
  const { loading, error, callAPI } = useAPICall();

  const getAllUsers = useCallback(async () => {
    return callAPI(async () => {
      const res = await fetch(`${BASE_URL}/Users`, { headers: NGROK_HEADER });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    });
  }, [callAPI]);

  const getUnverifiedUsers = useCallback(async () => {
    return callAPI(async () => {
      const res = await fetch(`${BASE_URL}/Users`, { headers: NGROK_HEADER });
      const data = await res.json();
      return data.filter((u) => u.role === "renter" && !u.isVerified);
    });
  }, [callAPI]);

  const verifyUser = useCallback(async (userId, staffId) => {
    return callAPI(async () => {
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
    });
  }, [callAPI]);

  const rejectUser = useCallback(async (userId, reason) => {
    return callAPI(async () => {
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
    });
  }, [callAPI]);

  const registerUser = useCallback(async (newUser) => {
    return callAPI(async () => {
      const res = await fetch(`${BASE_URL}/Users/Register`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    });
  }, [callAPI]);

  const loginUser = useCallback(async (credentials) => {
    return callAPI(async () => {
      const res = await fetch(`${BASE_URL}/UserAccount/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",  // ← IMPORTANT for ngrok
        },
        body: JSON.stringify(credentials),
      });

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
        return data;
      } catch {
        throw new Error("Lỗi xử lý dữ liệu đăng nhập");
      }
    });
  }, [callAPI]);

  const updateUser = useCallback(async (user) => {
    return callAPI(async () => {
      const res = await fetch(`${BASE_URL}/Users/${user.userId}`, {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify(user),
      });
      if (!res.ok) throw new Error("Cập nhật người dùng thất bại!");
      return res.json();
    });
  }, [callAPI]);

  return {
    loading,
    error,
    getAllUsers,
    getUnverifiedUsers,
    verifyUser,
    rejectUser,
    registerUser,
    loginUser,
    updateUser,
  };
};

// ==================== LICENSE HOOKS ====================
export const useLicenseAPI = () => {
  const { loading, error, callAPI } = useAPICall();

  const getAll = useCallback(async () => {
    return callAPI(async () => {
      const res = await fetch(`${BASE_URL}/licenses`, { headers: JSON_HEADERS });
      if (!res.ok) throw new Error("Không thể tải danh sách license");
      return res.json();
    });
  }, [callAPI]);

  const getByRenter = useCallback(async (renterId) => {
    return callAPI(async () => {
      const res = await fetch(`${BASE_URL}/licenses?renter_id=${renterId}`, {
        headers: JSON_HEADERS,
      });
      if (!res.ok) throw new Error("Không thể tải giấy phép người dùng");
      const data = await res.json();
      return data[0];
    });
  }, [callAPI]);

  const uploadImage = useCallback(async (file) => {
    return callAPI(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BASE_URL}/licenses/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload ảnh thất bại");
      const data = await res.json();
      return data.filePath;
    });
  }, [callAPI]);

  const create = useCallback(async (payload) => {
    return callAPI(async () => {
      const res = await fetch(`${BASE_URL}/licenses`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gửi xác minh thất bại!");
      return res.json();
    });
  }, [callAPI]);

  const updateStatus = useCallback(async (id, status, reason = "") => {
    return callAPI(async () => {
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
    });
  }, [callAPI]);

  return {
    loading,
    error,
    getAll,
    getByRenter,
    uploadImage,
    create,
    updateStatus,
  };
};

// ==================== CCCD HOOKS ====================
export const useCCCDAPI = () => {
  const { loading, error, callAPI } = useAPICall();

  const getAll = useCallback(async () => {
    return callAPI(async () => {
      const res = await fetch(`${BASE_URL}/Cccd_Cmnd`, { headers: JSON_HEADERS });
      if (!res.ok) throw new Error("Không thể tải danh sách CCCD");
      return res.json();
    });
  }, [callAPI]);

  const create = useCallback(async (payload) => {
    return callAPI(async () => {
      const res = await fetch(`${BASE_URL}/Cccd_Cmnd`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gửi CCCD thất bại!");
      return res.json();
    });
  }, [callAPI]);

  const updateStatus = useCallback(async (id, status, reason = "") => {
    return callAPI(async () => {
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
    });
  }, [callAPI]);

  return {
    loading,
    error,
    getAll,
    create,
    updateStatus,
  };
};
