import React, { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../Components/Common/Form/RegisterForm";
import { userAPI } from "../api/api";

const RegisterContainer = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    setLoading(true);

    try {
      // Chuẩn bị dữ liệu user
      const newUser = {
        fullName: values.name,
        email: values.email,
        phoneNumber: values.phone,
        address: values.address || "chưa cập nhật",
        password: values.password,
        role: "renter",
        isVerified: false,
        createdAt: new Date().toISOString(),
      };

      console.log(" Sending new user:", newUser);

      const result = await userAPI.registerUser(newUser);
      
      if (result) {
        message.success(" Đăng ký thành công!");
        alert("Welcome! " + result.fullName);
        navigate("/login");
      } else {
        message.error("Không thể tạo tài khoản, vui lòng thử lại!");
      }
    } catch (error) {
      console.error(" Register error:", error);
      message.error("Lỗi khi đăng ký. Kiểm tra console để xem chi tiết.");
    } finally {
      setLoading(false);
    }
  };

  return <RegisterForm onSubmit={handleRegister} loading={loading} />;
};

export default RegisterContainer;