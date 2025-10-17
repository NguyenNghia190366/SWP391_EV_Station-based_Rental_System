import React from "react";
import { Form, Input, Button, Card, Typography, Spin } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

const RegisterForm = ({ onSubmit, loading }) => {
  const [form] = Form.useForm();

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-sdzDark via-indigo-900 to-sdzBlue">
      <Card className="w-[400px] bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl p-6">
        <Title level={2} className="text-center text-indigo-600 mb-2">
          Đăng ký tài khoản
        </Title>
        <Text type="secondary" className="block text-center mb-6">
          Tham gia cộng đồng SDZ để trải nghiệm thuê xe điện
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          requiredMark={false}
        >
          <Form.Item
        
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập họ tên"
              size="large"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập email"
              size="large"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              size="large"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Xác nhận mật khẩu"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng nhập lại mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu không trùng khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu"
              size="large"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 border-none rounded-lg font-semibold shadow-md hover:opacity-90"
              disabled={loading}
            >
              {loading ? <Spin size="small" /> : "Đăng ký"}
            </Button>
          </Form.Item>

          <p className="text-center text-sm text-gray-600 mt-4 mb-0">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-indigo-600 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterForm;
