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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow rounded-lg bg-white relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-3 shadow">
            <RocketOutlined className="text-2xl text-white" />
          </div>
          <Title level={2} className="mb-1 text-2xl text-gray-800">
            Tạo tài khoản mới
          </Title>
          <Text className="text-gray-600 text-sm">
            Tham gia để trải nghiệm dịch vụ thuê xe điện
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
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-0 rounded text-white font-medium"
              block
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text className="text-gray-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Đăng nhập
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterForm;
