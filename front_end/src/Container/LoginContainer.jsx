import React, { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../api/api";
import LoginForm from "../Components/Form/LoginForm";

// Cấu hình mặc định cho toast messages
message.config({
  top: 80, // Hiển thị cao hơn một chút so với mặc định
  duration: 3, // Hiển thị trong 3 giây
  maxCount: 3, // Tối đa 3 thông báo cùng lúc
});

const LoginContainer = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email.trim()) {
      setError("Vui lòng nhập email!");
      message.warning({
        content: "Vui lòng nhập email!",
        icon: "⚠️",
        className: "custom-message-warning"
      });
      return;
    }
    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu!");
      message.warning({
        content: "Vui lòng nhập mật khẩu!",
        icon: "⚠️",
        className: "custom-message-warning"
      });
      return;
    }
    if (!email.includes("@")) {
      setError("Email không hợp lệ!");
      message.error({
        content: "Email không hợp lệ!",
        icon: "❌",
        className: "custom-message-error"
      });
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      message.error({
        content: "Mật khẩu phải có ít nhất 6 ký tự!",
        icon: "❌",
        className: "custom-message-error"
      });
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Gửi:", { email: email.trim(), password });
      const result = await userAPI.loginUser({
        email: email.trim(),
        password,
      });

      console.log("📦 Nhận từ API:", result);

      // 🔥 XỬ LÝ NHIỀU TRƯỜNG HỢP
      let token, user;

      // Case 1: { token, user }
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
      // Case 4: Backend trả user trực tiếp (không có token)
      else if (result.email || result.userId) {
        user = result;
        token = "dummy-token"; // Nếu backend không cần token
      } else {
        throw new Error("Format dữ liệu không đúng từ server");
      }

      // Kiểm tra user có role không
      if (!user || !user.role) {
        console.error("❌ User object:", user);
        throw new Error("Dữ liệu người dùng không hợp lệ (thiếu role)");
      }

      // Lưu vào localStorage
      if (token) localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user.userId || user.id);

      console.log("✅ Đã lưu localStorage:", {
        token: localStorage.getItem("token"),
        isLoggedIn: localStorage.getItem("isLoggedIn"),
        role: localStorage.getItem("role"),
        user: localStorage.getItem("currentUser"),
      });

      // Hiển thị thông báo chào mừng
      alert("Welcome! ", user.fullName);
      message.success({
        content: `Xin chào ${user.fullName || user.email}! 🎉`,
        icon: "✨",
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
        const role = user.role.toUpperCase();
        if (role === "ADMIN") navigate("/admin/dashboard");
        else if (role === "STAFF") navigate("/staff/verification");
        else navigate("/home");
      }, 1000);
    } catch (err) {
      console.error("❌ Login error:", err);
      
      // Xử lý các loại lỗi khác nhau
      let errorMessage = "Lỗi đăng nhập không xác định";
      
      if (err.message?.includes('Network') || err.message?.includes('fetch')) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng! 🌐";
      } else if (err.message?.includes('password')) {
        errorMessage = "Mật khẩu không chính xác! 🔒";
      } else if (err.message?.includes('email')) {
        errorMessage = "Email không tồn tại trong hệ thống! 📧";
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Hiển thị toast error
      message.error({
        content: errorMessage,
        icon: "❌",
        duration: 5,
        className: "custom-message-error"
      });

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <LoginForm
      email={email}
      password={password}
      error={error}
      loading={loading}
      onEmailChange={handleEmailChange}
      onPasswordChange={handlePasswordChange}
      onSubmit={handleSubmit}
    />
  );
};

export default LoginContainer;