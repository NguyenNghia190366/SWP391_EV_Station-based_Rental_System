import React from "react";
import { Form, Input, Button, Card, Typography, Checkbox, Alert } from "antd";
import {
  LockOutlined,
  MailOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

const LoginForm = ({ onSubmit, loading, error }) => {
  const [form] = Form.useForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl rounded-2xl backdrop-blur-sm bg-white/95 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <LoginOutlined className="text-4xl text-white" />
          </div>
          <Title level={2} className="mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Chào mừng trở lại!
          </Title>
          <Text className="text-gray-600">
            ⚡ Đăng nhập để tiếp tục trải nghiệm dịch vụ thuê xe điện
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          requiredMark={false}
        >
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

          {/* Hiển thị lỗi đăng nhập */}
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
            <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-700 transition-colors">
              Quên mật khẩu?
            </Link>
          </div>

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0 rounded-lg shadow-lg text-white font-semibold"
              block
            >
              {loading ? "Đang đăng nhập..." : "⚡ Đăng nhập"}
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text className="text-gray-600">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                Đăng ký ngay
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginForm;
