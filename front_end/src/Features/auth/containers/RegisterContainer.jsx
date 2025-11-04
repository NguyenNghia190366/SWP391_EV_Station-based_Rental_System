import React, { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../../../Components/Common/Form/RegisterForm";
import { userAPI } from "../../../api/api";

const RegisterContainer = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    setLoading(true);

    try {
      // Chuẩn bị dữ liệu theo schema BE yêu cầu
      const newUser = {
        fullName: values.name,
        email: values.email,
        phoneNumber: values.phone,
        password: values.password,
        confirmPassword: values.confirm, // Map từ form field 'confirm'
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : "2000-01-01",
        address: values.address || "chưa cập nhật"
      };

      console.log("📝 Sending new user:", newUser);

      const result = await userAPI.registerUser(newUser);
      
      if (result) {
        message.success("✅ Đăng ký thành công!");
        navigate("/login");
      } else {
        message.error("Không thể tạo tài khoản, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("❌ Register error:", error);
      message.error(error.message || "Lỗi khi đăng ký. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return <RegisterForm onSubmit={handleRegister} loading={loading} />;
};

export default RegisterContainer;