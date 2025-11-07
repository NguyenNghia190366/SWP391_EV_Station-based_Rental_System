import React, { useState } from "react";
import { message, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../../../api/api";
import LoginForm from "../../../Components/Common/Form/LoginForm";
import { normalizeUserData } from "../../../utils/normalizeData";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
// Cấu hình mặc định cho toast messages
message.config({
  top: 80, // Hiển thị cao hơn một chút so với mặc định
  duration: 3, // Hiển thị trong 3 giây
  maxCount: 3, // Tối đa 3 thông báo cùng lúc
});

const LoginContainer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values) => {
    const { email, password } = values;
    setLoading(true);
    setError(""); // Reset error khi submit lại

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
      // Case 4: BE real format - { email, role, userName, token, user_id, renter_Id, ... }
      else if (result.email && result.role && result.token) {
        token = result.token;
        user = result; // Toàn bộ response là user data
      }
      // Case 5: Backend trả user trực tiếp (không có token)
      else if (result.email || result.user_id) {
        user = result;
        token = result.token || "dummy-token";
      } else {
        throw new Error("Format dữ liệu không đúng từ server");
      }

      console.log("📦 Extracted - token:", token ? "✅" : "❌", "user:", user ? "✅" : "❌");

      // ===== NORMALIZE USER DATA - Tương thích cả 2 BE =====
      // Sử dụng helper function để chuẩn hóa
      const normalizedUser = normalizeUserData(user);

      console.log("📋 Normalized User:", normalizedUser);
      console.log("📋 Raw user object:", user);

      // Kiểm tra user có role không
      if (!normalizedUser || !normalizedUser.role) {
        console.error("❌ User object không hợp lệ:", { normalizedUser, user });
        throw new Error("Dữ liệu người dùng không hợp lệ (thiếu role)");
      }

      // Lưu vào localStorage
      if (token) localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(normalizedUser));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", normalizedUser.role);
      
      // Lưu các IDs - support cả snake_case và camelCase
      const userId = normalizedUser.userId || normalizedUser.user_id;
      localStorage.setItem("userId", userId);
      localStorage.setItem("user_id", userId);
      
      // 🔹 Nếu backend không trả renterId, query từ Renters table
      let renterId = normalizedUser.renterId || normalizedUser.renter_id;
      
      if (!renterId && userId) {
        try {
          console.log("📡 Backend không trả renterId, query từ Renters table...");
          // Fetch từ Renters table để lấy renterId dựa vào userId
          const rentersRes = await useAxiosInstance().get("/Renters", {
            headers: { "ngrok-skip-browser-warning": "true" }
          });
          
          if (rentersRes.ok) {
            const renters = await rentersRes.json();
            const renterArray = Array.isArray(renters) ? renters : renters.data || [];
            const renter = renterArray.find(r => 
              (r.user_id || r.userId) === userId ||
              Number(r.user_id) === Number(userId) ||
              Number(r.userId) === Number(userId)
            );
            
            if (renter) {
              renterId = renter.renter_id || renter.renterId;
              console.log("✅ Tìm thấy renterId từ DB:", renterId);
            } else {
              console.warn("⚠️ Không tìm thấy renter cho userId:", userId);
            }
          }
        } catch (err) {
          console.warn("⚠️ Lỗi khi query Renters:", err);
        }
      }
      
      // Lưu renterId nếu có
      if (renterId) {
        localStorage.setItem("renterId", renterId);
        localStorage.setItem("renter_id", renterId);
        localStorage.setItem("renter_Id", renterId); // Backend uses this key
      }

      if (normalizedUser.staffId || normalizedUser.staff_id) {
        localStorage.setItem("staffId", normalizedUser.staffId || normalizedUser.staff_id);
        localStorage.setItem("staff_id", normalizedUser.staff_id || normalizedUser.staffId);
      }

      console.log("✅ Đã lưu localStorage:", {
        token: localStorage.getItem("token"),
        isLoggedIn: localStorage.getItem("isLoggedIn"),
        role: localStorage.getItem("role"),
        userId: localStorage.getItem("userId"),
        renterId: localStorage.getItem("renterId"),
        renter_Id: localStorage.getItem("renter_Id"),
        staffId: localStorage.getItem("staffId"),
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
        const role = (normalizedUser?.role || localStorage.getItem("role") || "").toUpperCase();
        console.log("🔀 Navigating based on role:", role);
        
        if (role === "ADMIN") navigate("/admin/dashboard");
        else if (role === "STAFF") navigate("/staff/verification");
        else navigate("/home");
      }, 1000);
    } catch (err) {
      console.error("❌ Login error:", err);

      // Xử lý các loại lỗi khác nhau
      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại!";
      let errorTitle = "Lỗi đăng nhập";

      // Kiểm tra lỗi network
      if (err.message?.includes("Network") || err.message?.includes("fetch")) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!";
        errorTitle = "Lỗi kết nối";
      } 
      // Kiểm tra lỗi xác thực (401 Unauthorized)
      else if (
        err.message?.toLowerCase().includes("password") ||
        err.message?.toLowerCase().includes("invalid") ||
        err.message?.toLowerCase().includes("credential") ||
        err.message?.toLowerCase().includes("unauthorized") ||
        err.message?.includes("401") ||
        err.message?.toLowerCase().includes("sai")
      ) {
        errorMessage = "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!";
        errorTitle = "❌ Sai thông tin đăng nhập";

        // Hiện modal rõ ràng cho lỗi xác thực
        Modal.error({
          title: errorTitle,
          content: (
            <div>
              <p style={{ marginBottom: 10 }}>
                <strong>Email hoặc mật khẩu không đúng.</strong>
              </p>
              <p style={{ marginBottom: 5 }}>Vui lòng kiểm tra:</p>
              <ul style={{ paddingLeft: 20 }}>
                <li>Email có đúng định dạng không?</li>
                <li>Mật khẩu có đúng không?</li>
                <li>Có gõ nhầm ký tự nào không?</li>
              </ul>
            </div>
          ),
          okText: "Thử lại",
          okType: "primary",
        });
      } 
      // Kiểm tra lỗi email không tồn tại
      else if (err.message?.toLowerCase().includes("email") || err.message?.toLowerCase().includes("not found")) {
        errorMessage = "Email không tồn tại trong hệ thống!";
        errorTitle = "Email không hợp lệ";
        
        Modal.warning({
          title: errorTitle,
          content: "Email này chưa được đăng ký. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.",
          okText: "Đã hiểu",
        });
      } 
      // Lỗi khác
      else if (err.message) {
        errorMessage = err.message;
      }

      // Set error state để hiển thị dưới form
      setError(errorMessage);

      // Hiển thị toast error (bổ sung cho mọi lỗi)
      message.error({
        content: `❌ ${errorMessage}`,
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
      error={error}
      onSubmit={handleSubmit}
    />
  );
};

export default LoginContainer;