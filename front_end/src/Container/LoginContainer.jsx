import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import api from "../utils/axios";
import { userAPI } from "../utils/api";
import LoginForm from "../Components/Form/LoginForm";

const LoginContainer = () => {
  const navigate = useNavigate();

  // ===== STATE =====
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ===== HANDLERS =====
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError("");
  };

  // ===== VALIDATION =====
  const validateForm = () => {
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin đăng nhập");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Địa chỉ email không hợp lệ");
      return false;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }

    return true;
  };

  // ===== FETCH USER + AUTHENTICATE =====
  const fetchAndAuthenticateUser = async (userEmail, userPassword) => {
    try {
      console.log("🔍 Fetching users from API...");
      // const response = await userAPI.get("/users"); // <-- dùng mockAPI hoặc BE thật của bạn
      // const users = response.data;
      const users = await userAPI.getAllUsers();


      // ✅ Match email & password
      const matchedUser = users.find(
        (u) =>
          u.email.toLowerCase() === userEmail.toLowerCase() &&
          u.password === userPassword
      );

      return matchedUser;
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      throw new Error("Không thể kết nối tới máy chủ. Vui lòng thử lại.");
    }
  };

  // ===== SUBMIT LOGIN =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const matchedUser = await fetchAndAuthenticateUser(email, password);
      console.log("🔍 Kết quả xác thực:", matchedUser ? "Tìm thấy" : "Không tìm thấy");

      if (matchedUser) {
        // ===== CHECK VERIFICATION (nếu là renter) =====
        if (matchedUser.role === "renter" && !matchedUser.isVerified) {
          setError(
            "⚠️ Tài khoản chưa được xác thực. Vui lòng đến điểm thuê để nhân viên xác thực!"
          );
          console.log("❌ Login blocked - renter chưa xác thực");
          return;
        }

        console.log("✅ Đăng nhập thành công!");

        // ===== LƯU THÔNG TIN USER =====
        localStorage.setItem("currentUser", JSON.stringify(matchedUser)); // ✅ KHỚP key với ProfileContainer + Homepage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", matchedUser.id);
        localStorage.setItem("token", `token_${matchedUser.id}_${Date.now()}`);

        // ===== THÔNG BÁO + CHUYỂN HƯỚNG =====
        alert(`Xin chào ${matchedUser.name || matchedUser.email}!`);

        if (
          matchedUser.role === "station_staff" ||
          matchedUser.role === "admin"
        ) {
          navigate("/staff/verification");
        } else {
          navigate("/home"); // ✅ có thể đổi thành "/" nếu homepage là root
        }
      } else {
        setError("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
        console.log("❌ Login failed - no matching user");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.message || "Lỗi kết nối, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ===== JSX =====
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
