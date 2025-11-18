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
import GoogleSignIn from './GoogleSignIn';

const { Title, Text } = Typography;

// ===================== LOGIN PAGE =====================
const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { loginUser } = useUsers();
  const api = useAxiosInstance();

  message.config({
    top: 80,
    duration: 3,
    maxCount: 3,
  });

  const handleSubmit = async (values) => {
    const { email, password } = values;
    // Yup validation (extra layer) - map errors to form
    const schema = yup.object({
      email: yup.string().required('Please enter email!').email('Invalid email!'),
      password: yup.string().required('Please enter password!').min(6, 'Password must be at least 6 characters!'),
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
      console.log("📤 Sending request:", { email: normalizedEmail, password });

      const requestBody = { email: normalizedEmail, password };
      const result = await loginUser(requestBody);

      console.log("📥 API result:", result);

      // ===== Normalize backend response formats =====
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
      } else throw new Error("Invalid server response format");

  const normalizedUser = normalizeUserData(user);
      console.log("📋 Normalized User:", normalizedUser);

      if (!normalizedUser || !normalizedUser.role) throw new Error("Missing user role");

      // ===== Save to localStorage =====
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
          console.warn("⚠️ Error querying Renters:", err);
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
          ? "Good morning"
          : currentHour < 18
          ? "Good afternoon"
          : "Good evening";

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
      let errorMessage = "Login failed. Please try again!";
      let errorTitle = "Login error";

          if (err.message?.includes("Network")) {
            errorMessage = "Cannot connect to server.";
            errorTitle = "Connection error";
        toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
      } else if (
        err.message?.toLowerCase().includes("invalid") ||
        err.message?.toLowerCase().includes("password") ||
        err.message?.includes("401")
      ) {
        errorMessage = "Incorrect email or password.";
        errorTitle = "Invalid credentials";
        toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
      } else if (err.message?.toLowerCase().includes("email")) {
        errorMessage = "Email not registered in the system!";
        errorTitle = "Invalid email";
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

  // Helper to process login result object (used by both normal login and Google login)
  const processLoginResult = async (result) => {
    // This duplicates the successful-login handling above; keep in sync
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
    } else throw new Error("Invalid server response format");

    const normalizedUser = normalizeUserData(user);
    if (!normalizedUser || !normalizedUser.role) throw new Error("Missing user role");

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
        const rentersRes = await api.get("/Renters", { headers: { "ngrok-skip-browser-warning": "true" } });
        const renters = Array.isArray(rentersRes.data) ? rentersRes.data : rentersRes.data?.data || [];
        const renter = renters.find(
          (r) => String(r.user_id || r.userId) === String(userId) || Number(r.user_id) === Number(userId)
        );
        if (renter) renterId = renter.renter_id || renter.renterId;
      } catch (err) {
        console.warn("⚠️ Error querying Renters:", err);
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

    const currentHour = new Date().getHours();
    let greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
    toast.success(`${greeting}, ${normalizedUser.userName || normalizedUser.fullName}!`, { position: "top-right", autoClose: 2000 });

    setTimeout(() => {
      const role = (normalizedUser?.role || "").toUpperCase();
      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "STAFF") navigate("/staff/dashboard");
      else navigate("/home");
    }, 1500);
  };

  // Handler for credential from GoogleSignIn
  const handleGoogleCredential = async (idToken) => {
    try {
      setLoading(true);
      if (!idToken) throw new Error('No token received from Google');
      const res = await api.post('/UserAccount/google-login', { idToken });
      const data = res.data || res;
      await processLoginResult(data);
    } catch (err) {
      console.error('❌ Google login error:', err);
      // Provide actionable errors for common problems
      const status = err.response?.status;
      const responseBody = err.response?.data;

      if (status === 404) {
        toast.error('API endpoint /UserAccount/google-login not found (404). Check backend or VITE_API_BASE_URL.', { position: 'top-right', autoClose: 5000 });
      } else if (status === 403) {
        // Common when Google rejects origin or credentials
        const serverMsg = responseBody?.message || JSON.stringify(responseBody) || '';
        if ((serverMsg || '').toLowerCase().includes('origin') || (serverMsg || '').toLowerCase().includes('not allowed')) {
          toast.error('Google returned 403: origin not allowed for this client id. Add your origin (e.g., http://localhost:5173) to the OAuth client in Google Cloud Console.', { position: 'top-right', autoClose: 8000 });
        } else {
          toast.error('Google login rejected (403). Check OAuth configuration in Google Cloud Console and API paths.', { position: 'top-right', autoClose: 6000 });
        }
      } else if (err.message && err.message.includes('Request failed with status code')) {
        toast.error('Google login failed: ' + err.message, { position: 'top-right', autoClose: 4000 });
      } else {
        let msg = 'Google login failed.';
        if (responseBody?.message) msg = responseBody.message;
        else if (err.message) msg = err.message;
        toast.error(msg, { position: 'top-right', autoClose: 3000 });
      }

      // Helpful console output for debugging
      console.debug('Google login debug: status=', status, 'body=', responseBody, 'err=', err);
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
            Welcome back
          </Title>
          <Text className="text-gray-600">Sign in to continue</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter email!" },
              { type: "email", message: "Invalid email!" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-indigo-500" />}
              placeholder="Your email"
              size="large"
              disabled={loading}
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please enter password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-indigo-500" />}
              placeholder="Password"
              size="large"
              disabled={loading}
              className="rounded-lg"
            />
          </Form.Item>

          {error && (
              <Alert
              message="Login failed"
              description={error}
              type="error"
              showIcon
              closable
              className="mb-4 rounded-lg"
            />
          )}

          <div className="flex items-center justify-between mb-4">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="text-gray-600">Remember me</Checkbox>
            </Form.Item>
              <Link
              to="/forgot-password"
              className="text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Forgot password?
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
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </Form.Item>

          <div className="text-center mb-4">
            <GoogleSignIn onCredential={handleGoogleCredential} />
          </div>

          <div className="text-center">
            <Text className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Register
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
