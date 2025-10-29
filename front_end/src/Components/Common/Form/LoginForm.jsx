import React from "react";
import { Form, Input, Button, Card, Typography, Checkbox } from "antd";
import {
  LockOutlined,
  MailOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./LoginForm.css";

const { Title, Text } = Typography;

const LoginForm = ({ onSubmit, loading }) => {
  const [form] = Form.useForm();

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <Card className="login-card">
        <div className="login-header">
          <div className="icon-wrapper">
            <LoginOutlined className="login-icon" />
          </div>
          <Title level={2} className="login-title">
            Chào mừng trở lại!
          </Title>
          <Text className="login-subtitle">
             Đăng nhập để tiếp tục trải nghiệm dịch vụ thuê xe điện
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          requiredMark={false}
          className="login-form"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="input-icon" />}
              placeholder="Email của bạn"
              size="large"
              disabled={loading}
              className="custom-input"
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
              prefix={<LockOutlined className="input-icon" />}
              placeholder="Mật khẩu"
              size="large"
              disabled={loading}
              className="custom-input"
            />
          </Form.Item>

          <div className="form-extras">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="remember-checkbox">Ghi nhớ đăng nhập</Checkbox>
            </Form.Item>
            <Link to="/forgot-password" className="forgot-link">
              Quên mật khẩu?
            </Link>
          </div>

          <Form.Item className="submit-button-wrapper">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="submit-button"
              block
            >
              {loading ? "Đang đăng nhập..." : " Đăng nhập"}
            </Button>
          </Form.Item>

          <div className="register-link">
            <Text className="register-text">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="register-link-text">
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
