import React, { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../Components/Form/RegisterForm";
import { userAPI } from "../api/api";

const RegisterContainer = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    setLoading(true);

    try {
      // 🧱 Chuẩn bị dữ liệu user
      const newUser = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: "renter", // dùng lowercase để khớp logic login
        isVerified: false, // chỉ cho license verification, không ảnh hưởng login
        createdAt: new Date().toISOString(),
      };

      console.log("📦 Sending user to MockAPI:", newUser);
      const result = await userAPI.registerUser(newUser);

      if (result) {
        message.success("🎉 Đăng ký thành công!");
        navigate("/login");
      } else {
        message.error("Không thể tạo tài khoản, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("❌ Register error:", error);
      message.error("Lỗi khi đăng ký. Kiểm tra console để xem chi tiết.");
    } finally {
      setLoading(false);
    }
  };

  return <RegisterForm onSubmit={handleRegister} loading={loading} />;
};

export default RegisterContainer;
