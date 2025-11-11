import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Checkbox, Alert, message, Modal } from "antd";
import { LockOutlined, MailOutlined, LoginOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as yup from 'yup';
import { useUsers } from "@/hooks/useUsers";
import { normalizeUserData } from "@/utils/normalizeData";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";

const { Title, Text } = Typography;

// ===================== LOGIN PAGE =====================
const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { loginUser } = useUsers();

  message.config({
    top: 80,
    duration: 3,
    maxCount: 3,
  });

  const handleSubmit = async (values) => {
    const { email, password } = values;
    // Yup validation (extra layer) - map errors to form
    const schema = yup.object({
      email: yup.string().required('Vui lòng nhập email!').email('Email không hợp lệ!'),
      password: yup.string().required('Vui lòng nhập mật khẩu!').min(6, 'Mật khẩu phải có ít nhất 6 ký tự!'),
    });
    try {
      await schema.validate(values, { abortEarly: false });
    } catch (err) {
      if (err.name === 'ValidationError') {
        const fields = err.inner.map(e => ({ name: e.path, errors: [e.message] }));
        form.setFields(fields);
        return;
      }
    }
    setLoading(true);
    setError("");

    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log("📤 Gửi request:", { email: normalizedEmail, password });

      const requestBody = { email: normalizedEmail, password };
      const result = await loginUser(requestBody);

      console.log("📥 Kết quả API:", result);

      // ===== Đa định dạng phản hồi từ backend =====
      let token, user;
      if (result.token && result.user) {
        token = result.token;
        user = result.user;
      } else if (result.accessToken && result.user) {
        token = result.accessToken;
        user = result.user;
      } else if (result.data) {
        token = result.data.token || result.data.accessToken;
        user = result.data.user || result.data;
      } else if (result.email && result.role && result.token) {
        token = result.token;
        user = result;
      } else if (result.email || result.user_id) {
        user = result;
        token = result.token || "dummy-token";
      } else throw new Error("Format dữ liệu không đúng từ server");

      const normalizedUser = normalizeUserData(user);
      console.log("📋 Normalized User:", normalizedUser);

      if (!normalizedUser || !normalizedUser.role) throw new Error("Thiếu role user");

      // ===== Lưu vào localStorage =====
      if (token) localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(normalizedUser));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", normalizedUser.role);

      const userId = normalizedUser.userId || normalizedUser.user_id;
      localStorage.setItem("userId", userId);
      localStorage.setItem("user_id", userId);

      let renterId = normalizedUser.renterId || normalizedUser.renter_id;
      if (!renterId && userId) {
        try {
          const api = useAxiosInstance();
          const rentersRes = await api.get("/Renters", {
            headers: { "ngrok-skip-browser-warning": "true" },
          });
          const renters = Array.isArray(rentersRes.data)
            ? rentersRes.data
            : rentersRes.data?.data || [];
          const renter = renters.find(
            (r) =>
              String(r.user_id || r.userId) === String(userId) ||
              Number(r.user_id) === Number(userId)
          );
          if (renter) {
            renterId = renter.renter_id || renter.renterId;
          }
        } catch (err) {
          console.warn("⚠️ Lỗi khi query Renters:", err);
        }
      }
      if (renterId) {
        localStorage.setItem("renterId", renterId);
        localStorage.setItem("renter_id", renterId);
        localStorage.setItem("renter_Id", renterId);
      }
      if (normalizedUser.staffId || normalizedUser.staff_id) {
        localStorage.setItem("staffId", normalizedUser.staffId || normalizedUser.staff_id);
        localStorage.setItem("staff_id", normalizedUser.staff_id || normalizedUser.staffId);
      }

      // ===== Thông báo =====
      const currentHour = new Date().getHours();
      let greeting =
        currentHour < 12
          ? "Chào buổi sáng"
          : currentHour < 18
          ? "Chào buổi chiều"
          : "Chào buổi tối";

      toast.success(`${greeting}, ${normalizedUser.userName || normalizedUser.fullName}!`, {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        const role = (normalizedUser?.role || "").toUpperCase();
        if (role === "ADMIN") navigate("/admin/dashboard");
        else if (role === "STAFF") navigate("/staff/dashboard");
        else navigate("/home");
      }, 1500);
    } catch (err) {
      console.error("❌ Login error:", err);
      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại!";
      let errorTitle = "Lỗi đăng nhập";

      if (err.message?.includes("Network")) {
        errorMessage = "Không thể kết nối đến máy chủ.";
        errorTitle = "Lỗi kết nối";
        toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
      } else if (
        err.message?.toLowerCase().includes("invalid") ||
        err.message?.toLowerCase().includes("password") ||
        err.message?.includes("401")
      ) {
        errorMessage = "Email hoặc mật khẩu không chính xác.";
        errorTitle = "Sai thông tin đăng nhập";
        toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
      } else if (err.message?.toLowerCase().includes("email")) {
        errorMessage = "Email không tồn tại trong hệ thống!";
        errorTitle = "Email không hợp lệ";
        toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
      } else if (err.message) {
        errorMessage = err.message;
        toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
      } else {
        toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Card className="w-full max-w-md shadow rounded-lg bg-white relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-3 shadow">
            <LoginOutlined className="text-2xl text-white" />
          </div>
          <Title level={2} className="mb-2 text-2xl text-gray-800">
            Chào mừng trở lại
          </Title>
          <Text className="text-gray-600">Đăng nhập để tiếp tục</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-indigo-500" />}
              placeholder="Email của bạn"
              size="large"
              disabled={loading}
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-indigo-500" />}
              placeholder="Mật khẩu"
              size="large"
              disabled={loading}
              className="rounded-lg"
            />
          </Form.Item>

          {error && (
            <Alert
              message="Đăng nhập thất bại"
              description={error}
              type="error"
              showIcon
              closable
              className="mb-4 rounded-lg"
            />
          )}

          <div className="flex items-center justify-between mb-4">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="text-gray-600">Ghi nhớ đăng nhập</Checkbox>
            </Form.Item>
            <Link
              to="/forgot-password"
              className="text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-0 rounded text-white font-medium"
              block
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text className="text-gray-600">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Đăng ký
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
