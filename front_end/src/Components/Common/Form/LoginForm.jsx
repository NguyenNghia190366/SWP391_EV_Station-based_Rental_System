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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow rounded-lg bg-white relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-3 shadow">
            <LoginOutlined className="text-2xl text-white" />
          </div>
          <Title level={2} className="mb-2 text-2xl text-gray-800">
            Chào mừng trở lại
          </Title>
          <Text className="text-gray-600">
            Đăng nhập để tiếp tục
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
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-0 rounded text-white font-medium"
              block
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text className="text-gray-600">
              Chưa có tài khoản?{' '}
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

export default LoginForm;
