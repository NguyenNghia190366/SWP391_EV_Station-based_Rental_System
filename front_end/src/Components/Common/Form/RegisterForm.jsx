import React from "react";
import { Form, Input, Button, Card, Typography, DatePicker } from "antd";
import {
  HomeOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

const RegisterForm = ({ onSubmit, loading }) => {
  const [form] = Form.useForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl rounded-2xl backdrop-blur-sm bg-white/95 relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-3 shadow-lg">
            <RocketOutlined className="text-3xl text-white" />
          </div>
          <Title level={2} className="mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-2xl">
            Tạo tài khoản mới
          </Title>
          <Text className="text-gray-600 text-sm">
            ⚡ Tham gia cùng chúng tôi để trải nghiệm dịch vụ thuê xe điện!
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          requiredMark={false}
        >
          {/* Họ tên */}
          <Form.Item
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập họ tên!" },
              { min: 2, message: "Họ tên phải có ít nhất 2 ký tự!" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-purple-500" />}
              placeholder="Họ và tên"
              size="large"
              disabled={loading}
              className="rounded-lg"
            />
          </Form.Item>

          {/* Email */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-purple-500" />}
              placeholder="Email"
              size="large"
              disabled={loading}
              className="rounded-lg"
            />
          </Form.Item>

          {/* Số điện thoại */}
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              { 
                pattern: /^[0-9]{10}$/, 
                message: "Số điện thoại phải có 10 chữ số!" 
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined className="text-purple-500" />}
              placeholder="Số điện thoại"
              size="large"
              disabled={loading}
              className="rounded-lg"
              maxLength={10}
            />
          </Form.Item>

          {/* Ngày sinh */}
          <Form.Item
            name="dateOfBirth"
            rules={[
              { required: true, message: "Vui lòng chọn ngày sinh!" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const age = new Date().getFullYear() - value.year();
                  if (age < 18) {
                    return Promise.reject("Bạn phải đủ 18 tuổi!");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              placeholder="Ngày sinh"
              size="large"
              disabled={loading}
              className="rounded-lg w-full"
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          {/* Địa chỉ */}
          <Form.Item
            name="address"
            rules={[
              { required: true, message: "Vui lòng nhập địa chỉ!" },
              { min: 10, message: "Địa chỉ phải có ít nhất 10 ký tự!" },
            ]}
          >
            <Input
              prefix={<HomeOutlined className="text-purple-500" />}
              placeholder="Địa chỉ"
              size="large"
              disabled={loading}
              className="rounded-lg"
            />
          </Form.Item>

          {/* Mật khẩu */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-purple-500" />}
              placeholder="Mật khẩu"
              size="large"
              disabled={loading}
              className="rounded-lg"
            />
          </Form.Item>

          {/* Xác nhận mật khẩu */}
          <Form.Item
            name="confirm"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-purple-500" />}
              placeholder="Xác nhận mật khẩu"
              size="large"
              disabled={loading}
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 rounded-lg shadow-lg text-white font-semibold"
              block
            >
              {loading ? "Đang xử lý..." : "🚀 Đăng ký ngay"}
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text className="text-gray-600">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                Đăng nhập tại đây
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterForm;
