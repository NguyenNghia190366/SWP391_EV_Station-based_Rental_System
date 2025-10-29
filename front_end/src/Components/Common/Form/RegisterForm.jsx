import React from "react";
import { Form, Input, Button, Card, Typography, DatePicker, Row, Col } from "antd";
import {
  HomeOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  CalendarOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./RegisterForm.css";

const { Title, Text } = Typography;

const RegisterForm = ({ onSubmit, loading }) => {
  const [form] = Form.useForm();

  return (
    <div className="register-container">
      <div className="register-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <Card className="register-card">
        <div className="register-header">
          <div className="icon-wrapper">
            <RocketOutlined className="register-icon" />
          </div>
          <Title level={2} className="register-title">
            Tạo tài khoản mới
          </Title>
          <Text className="register-subtitle">
             Tham gia cùng chúng tôi để trải nghiệm dịch vụ thuê xe điện!
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          requiredMark={false}
          className="register-form"
        >
          <Row gutter={12}>
            {/* Left Column */}
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập họ tên!" },
                  { min: 2, message: "Họ tên phải có ít nhất 2 ký tự!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="input-icon" />}
                  placeholder="Họ và tên"
                  size="large"
                  disabled={loading}
                  className="custom-input"
                />
              </Form.Item>

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
                  prefix={<PhoneOutlined className="input-icon" />}
                  placeholder="Số điện thoại"
                  size="large"
                  disabled={loading}
                  className="custom-input"
                  maxLength={10}
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="input-icon" />}
                  placeholder="Email"
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
            </Col>

            {/* Right Column */}
            <Col xs={24} md={12}>
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
                  prefix={<CalendarOutlined className="input-icon" />}
                  placeholder="Ngày sinh"
                  size="large"
                  disabled={loading}
                  className="custom-input"
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>

              <Form.Item
                name="address"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ!" },
                  { min: 10, message: "Địa chỉ phải có ít nhất 10 ký tự!" },
                ]}
              >
                <Input
                  prefix={<HomeOutlined className="input-icon" />}
                  placeholder="Địa chỉ"
                  size="large"
                  disabled={loading}
                  className="custom-input"
                />
              </Form.Item>

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
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="Xác nhận mật khẩu"
                  size="large"
                  disabled={loading}
                  className="custom-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="submit-button-wrapper">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="submit-button"
              block
            >
              {loading ? "Đang xử lý..." : " Đăng ký ngay"}
            </Button>
          </Form.Item>

          <div className="login-link">
            <Text className="login-text">
              Đã có tài khoản?{" "}
              <Link to="/login" className="login-link-text">
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
