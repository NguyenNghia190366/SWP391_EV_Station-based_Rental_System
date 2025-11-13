import { useCallback } from "react";
import { useAxiosInstance } from "./useAxiosInstance";

export const useUsers = () => {
  const instance = useAxiosInstance();

  // 🔐 Đăng nhập người dùng
  const loginUser = useCallback(
    async (payload) => {
      try {
        const res = await instance.post("/UserAccount/login", payload);
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi đăng nhập:", error.response?.data || error.message);
        
        // Xử lý lỗi chi tiết
        if (error.response?.status === 401) {
          throw new Error("Email hoặc mật khẩu không chính xác!");
        }
        if (error.response?.status === 404) {
          throw new Error("Email không tồn tại trong hệ thống!");
        }
        
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 📝 Đăng ký tài khoản mới
  const registerUser = useCallback(
    async (payload) => {
      try {
        const res = await instance.post("/Users/Register", payload);
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi đăng ký:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 👤 Lấy thông tin hồ sơ người dùng
  const getProfile = useCallback(
    async (userId) => {
      try {
        if (!userId) throw new Error("userId không hợp lệ!");
        
        const res = await instance.get(`/Users/${userId}`);
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi lấy hồ sơ:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // ✏️ Cập nhật thông tin hồ sơ
  const updateProfile = useCallback(
    async (userId, payload) => {
      try {
        if (!userId) throw new Error("userId không hợp lệ!");
        
        const res = await instance.put(`/Users/${userId}`, payload);
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi cập nhật hồ sơ:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 🖼️ Tải ảnh đại diện
  const uploadAvatar = useCallback(
    async (userId, formData) => {
      try {
        if (!userId) throw new Error("userId không hợp lệ!");
        
        const res = await instance.post(`/User/${userId}/avatar`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi tải ảnh:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 🔑 Đổi mật khẩu
  const changePassword = useCallback(
    async (userId, payload) => {
      try {
        if (!userId) throw new Error("userId không hợp lệ!");
        
        const res = await instance.put(`/User/${userId}/change-password`, payload);
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi đổi mật khẩu:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 📧 Quên mật khẩu - gửi email reset
  const forgotPassword = useCallback(
    async (email) => {
      try {
        if (!email) throw new Error("Email không hợp lệ!");
        
        const res = await instance.post("/auth/forgot-password", { email });
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi quên mật khẩu:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 🔄 Reset mật khẩu bằng token
  const resetPassword = useCallback(
    async (payload) => {
      try {
        const res = await instance.post("/auth/reset-password", payload);
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi reset mật khẩu:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 📋 Lấy danh sách tất cả người dùng (Admin)
  const getAllUsers = useCallback(
    async (params = {}) => {
      try {
        const res = await instance.get("/User", { params });
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi lấy danh sách người dùng:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 👥 Lấy danh sách người thuê xe (Renters)
  const getRentersList = useCallback(
    async (params = {}) => {
      try {
        const res = await instance.get("/Renters", { params });
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi lấy danh sách người thuê:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 🔍 Lấy thông tin người thuê theo ID
  const getRenterById = useCallback(
    async (renterId) => {
      try {
        if (!renterId) throw new Error("renterId không hợp lệ!");
        
        const res = await instance.get(`/Renters/${renterId}`);
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi lấy thông tin người thuê:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // ✏️ Cập nhật thông tin người thuê
  const updateRenter = useCallback(
    async (renterId, payload) => {
      try {
        if (!renterId) throw new Error("renterId không hợp lệ!");
        
        const res = await instance.put(`/Renters/${renterId}`, payload);
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi cập nhật người thuê:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 🗑️ Xóa tài khoản người dùng
  const deleteUser = useCallback(
    async (userId) => {
      try {
        if (!userId) throw new Error("userId không hợp lệ!");
        
        const res = await instance.delete(`/User/${userId}`);
        return res.data;
      } catch (error) {
        console.error("❌ Lỗi xóa người dùng:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  return {
    // Auth
    loginUser,
    registerUser,
    forgotPassword,
    resetPassword,
    changePassword,

    // User Profile
    getProfile,
    updateProfile,
    uploadAvatar,
    deleteUser,

    // Admin/Users Management
    getAllUsers,
    getRentersList,
    getRenterById,
    updateRenter,
  };
};
