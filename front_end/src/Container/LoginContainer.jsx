import React, { useState } from "react";
import { message, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../api/api";
import LoginForm from "../Components/Common/Form/LoginForm";
import { normalizeUserData } from "../utils/normalizeData";

// Cấu hình mặc định cho toast messages
message.config({
  top: 80, // Hiển thị cao hơn một chút so với mặc định
  duration: 3, // Hiển thị trong 3 giây
  maxCount: 3, // Tối đa 3 thông báo cùng lúc
});

const LoginContainer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    const { email, password } = values;
    setLoading(true);

    try {
      // Normalize email to lowercase để tránh case-sensitive issue
      const normalizedEmail = email.trim().toLowerCase();
      
      console.log("📤 Gửi request với:", { email: normalizedEmail, password });
      
      // Thử cả 2 format để tương thích với BE
      const requestBody = {
        email: normalizedEmail,
        password: password,
      };
      
      console.log("📦 Request body:", JSON.stringify(requestBody));
      
      const result = await userAPI.loginUser(requestBody);

      console.log("📥 Nhận từ API:", result);

      //  XỬ LÝ NHIỀU TRƯỜNG HỢP (Compatible với cả BE local và BE real)
      let token, user;

      // Case 1: { token, user } - BE local format
      if (result.token && result.user) {
        token = result.token;
        user = result.user;
      }
      // Case 2: { accessToken, user }
      else if (result.accessToken && result.user) {
        token = result.accessToken;
        user = result.user;
      }
      // Case 3: { data: { token, user } }
      else if (result.data) {
        token = result.data.token || result.data.accessToken;
        user = result.data.user || result.data;
      }
      // Case 4: BE real format - { email, role, userName, token }
      else if (result.email && result.token) {
        token = result.token;
        user = result; // Toàn bộ response là user data
      }
      // Case 5: Backend trả user trực tiếp (không có token)
      else if (result.email || result.userId) {
        user = result;
        token = "dummy-token";
      } else {
        throw new Error("Format dữ liệu không đúng từ server");
      }

      // ===== NORMALIZE USER DATA - Tương thích cả 2 BE =====
      // Sử dụng helper function để chuẩn hóa
      const normalizedUser = normalizeUserData(user);

      console.log(" Normalized User:", normalizedUser);

      // Kiểm tra user có role không
      if (!normalizedUser.role) {
        console.error(" User object:", user);
        throw new Error("Dữ liệu người dùng không hợp lệ (thiếu role)");
      }

      // Lưu vào localStorage
      if (token) localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(normalizedUser));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", normalizedUser.role);
      localStorage.setItem("userId", normalizedUser.userId);

      console.log(" Đã lưu localStorage:", {
        token: localStorage.getItem("token"),
        isLoggedIn: localStorage.getItem("isLoggedIn"),
        role: localStorage.getItem("role"),
        user: localStorage.getItem("currentUser"),
      });

      // Hiển thị thông báo chào mừng
      const currentHour = new Date().getHours();
      let greeting = "Chào buổi sáng";
      if (currentHour >= 12 && currentHour < 18) greeting = "Chào buổi chiều";
      else if (currentHour >= 18) greeting = "Chào buổi tối";

      message.success({
        content: `${greeting}, ${normalizedUser.userName || normalizedUser.fullName}! `,
        icon: "",
        duration: 4,
        className: "custom-message-success"
      });

      // Loading message cho chuyển hướng
      message.loading({
        content: "Đang chuyển hướng...",
        duration: 1,
        className: "custom-message-loading"
      });

      // Điều hướng sau 1 giây
      setTimeout(() => {
        const role = normalizedUser.role.toUpperCase();
        if (role === "ADMIN") navigate("/admin/dashboard");
        else if (role === "STAFF") navigate("/staff/verification");
        else navigate("/home");
      }, 1000);
    } catch (err) {
      console.error(" Login error:", err);

      // Xử lý các loại lỗi khác nhau
      let errorMessage = "Lỗi đăng nhập không xác định";

      if (err.message?.includes("Network") || err.message?.includes("fetch")) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!";
      } else if (
        err.message?.toLowerCase().includes("password") ||
        err.message?.toLowerCase().includes("invalid") ||
        err.message?.toLowerCase().includes("credential") ||
        err.message?.toLowerCase().includes("unauthorized") ||
        err.message?.includes("401")
      ) {
        errorMessage = "Email hoặc mật khẩu không chính xác.";

        // Hiện modal rõ ràng cho lỗi xác thực
        Modal.error({
          title: "Đăng nhập thất bại",
          content: "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.",
          okText: "Thử lại",
        });
      } else if (err.message?.toLowerCase().includes("email")) {
        errorMessage = "Email không tồn tại trong hệ thống!";
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Hiển thị toast error (bổ sung)
      message.error({
        content: errorMessage,
        icon: "",
        duration: 5,
        className: "custom-message-error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginForm
      loading={loading}
      onSubmit={handleSubmit}
    />
  );
};

export default LoginContainer;