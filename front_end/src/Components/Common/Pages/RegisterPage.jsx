import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, DatePicker, message } from "antd";
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  HomeOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useUsers } from "@/hooks/useUsers";

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { registerUser } = useUsers();

  const handleRegister = async (values) => {
    setLoading(true);
    // Validate with Yup schema before submitting
    const schema = yup.object({
      name: yup.string().required('Vui lòng nhập họ tên!').min(2, 'Họ tên phải có ít nhất 2 ký tự!'),
      email: yup.string().required('Vui lòng nhập email!').email('Email không hợp lệ!'),
      phone: yup.string().required('Vui lòng nhập số điện thoại!').matches(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số!'),
      dateOfBirth: yup.mixed().required('Vui lòng chọn ngày sinh!').test('age', 'Bạn phải đủ 18 tuổi!', value => {
        if (!value) return false;
        // value is a moment object from DatePicker
        const year = value.year ? value.year() : (new Date(value)).getFullYear();
        return new Date().getFullYear() - year >= 18;
      }),
      address: yup.string().required('Vui lòng nhập địa chỉ!').min(10, 'Địa chỉ phải có ít nhất 10 ký tự!'),
      password: yup.string().required('Vui lòng nhập mật khẩu!').min(6, 'Mật khẩu phải có ít nhất 6 ký tự!'),
      confirm: yup.string().required('Vui lòng xác nhận mật khẩu!').oneOf([yup.ref('password')], 'Mật khẩu không khớp!'),
    });

    try {
      // prepare values for validation (dateOfBirth is moment)
      const toValidate = { ...values };
      // run validation
      await schema.validate(toValidate, { abortEarly: false });

      const newUser = {
        fullName: values.name,
        email: values.email,
        phoneNumber: values.phone,
        password: values.password,
        confirmPassword: values.confirm,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format('YYYY-MM-DD')
          : '2000-01-01',
        address: values.address || 'chưa cập nhật',
      };

      console.log('📝 Sending new user:', newUser);
      const result = await registerUser(newUser);

      if (result) {
        // Show react-toastify toast and redirect to login after short delay
        toast.success('Đã đăng ký thành công, bây giờ hãy đăng nhập', {
          position: 'top-right',
          autoClose: 2000,
        });
        // Also show antd message for accessibility/consistency
        message.success('✅ Đăng ký thành công! Hãy đăng nhập để tiếp tục.');
        setTimeout(() => navigate('/login'), 1800);
      } else {
        message.error('Không thể tạo tài khoản, vui lòng thử lại!');
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        // map yup errors to form fields
        const fields = err.inner.map(e => ({ name: e.path, errors: [e.message] }));
        form.setFields(fields);
      } else {
        console.error('❌ Register error:', err);
        message.error(err.message || 'Lỗi khi đăng ký. Vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

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

        <Form form={form} layout="vertical" onFinish={handleRegister} requiredMark={false}>
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
                message: "Số điện thoại phải có 10 chữ số!",
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

          {/* Submit */}
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
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Đăng nhập
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default RegisterPage;
