import { useCallback } from "react";
import { useAxiosInstance } from "./useAxiosInstance";

export const useUsers = () => {
  const instance = useAxiosInstance();

  // 🔐 User login
  const loginUser = useCallback(
    async (payload) => {
      try {
        const res = await instance.post("/UserAccount/login", payload);
        return res.data;
      } catch (error) {
        console.error("❌ Login error:", error.response?.data || error.message);
        
        // Handle detailed errors
        if (error.response?.status === 401) {
          throw new Error("Incorrect email or password!");
        }
        if (error.response?.status === 404) {
          throw new Error("Email not found in the system!");
        }
        
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 📝 Register new account
  const registerUser = useCallback(
    async (payload) => {
      try {
        const res = await instance.post("/Users/Register", payload);
        return res.data;
      } catch (error) {
        console.error("❌ Register error:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 👤 Get user profile
  const getProfile = useCallback(
    async (userId) => {
      try {
        if (!userId) throw new Error("Invalid userId!");
        
        const res = await instance.get(`/Users/${userId}`);
        return res.data;
      } catch (error) {
        console.error("❌ Error fetching profile:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // ✏️ Update user profile
  const updateProfile = useCallback(
    async (userId, payload) => {
      try {
        if (!userId) throw new Error("Invalid userId!");
        
        const res = await instance.put(`/Users/${userId}`, payload);
        return res.data;
      } catch (error) {
        console.error("❌ Error updating profile:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 🖼️ Upload avatar
  const uploadAvatar = useCallback(
    async (userId, formData) => {
      try {
        if (!userId) throw new Error("Invalid userId!");
        
        const res = await instance.post(`/User/${userId}/avatar`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
      } catch (error) {
        console.error("❌ Error uploading avatar:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 🔑 Change password
  const changePassword = useCallback(
    async (userId, payload) => {
      try {
        if (!userId) throw new Error("Invalid userId!");
        
        const res = await instance.put(`/User/${userId}/change-password`, payload);
        return res.data;
      } catch (error) {
        console.error("❌ Error changing password:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 📧 Forgot password - send reset email
  const forgotPassword = useCallback(
    async (email) => {
      try {
        if (!email) throw new Error("Invalid email!");
        
        const res = await instance.post("/auth/forgot-password", { email });
        return res.data;
      } catch (error) {
        console.error("❌ Forgot password error:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 🔄 Reset password with token
  const resetPassword = useCallback(
    async (payload) => {
      try {
        const res = await instance.post("/auth/reset-password", payload);
        return res.data;
      } catch (error) {
        console.error("❌ Reset password error:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 📋 Get all users (Admin)
  const getAllUsers = useCallback(
    async (params = {}) => {
      try {
        const res = await instance.get("/Users", { params });
        return res.data;
      } catch (error) {
        console.error("❌ Error fetching users list:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 👥 Get renters list
  const getRentersList = useCallback(
    async (params = {}) => {
      try {
        const res = await instance.get("/Renters", { params });
        return res.data;
      } catch (error) {
        console.error("❌ Error fetching renters list:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 🔍 Get renter information by ID
  const getRenterById = useCallback(
    async (renterId) => {
      try {
        if (!renterId) throw new Error("Invalid renterId!");
        
        const res = await instance.get(`/Renters/${renterId}`);
        return res.data;
      } catch (error) {
        console.error("❌ Error fetching renter info:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // ✏️ Update renter information
  const updateRenter = useCallback(
    async (renterId, payload) => {
      try {
        if (!renterId) throw new Error("Invalid renterId!");
        
        const res = await instance.put(`/Renters/${renterId}`, payload);
        return res.data;
      } catch (error) {
        console.error("❌ Error updating renter:", error.response?.data || error.message);
        throw error.response?.data || error;
      }
    },
    [instance]
  );

  // 🗑️ Delete user account
  const deleteUser = useCallback(
    async (userId) => {
      try {
        if (!userId) throw new Error("Invalid userId!");
        
        const res = await instance.delete(`/User/${userId}`);
        return res.data;
      } catch (error) {
        console.error("❌ Error deleting user:", error.response?.data || error.message);
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
