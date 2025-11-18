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
      name: yup.string().required('Please enter full name!').min(2, 'Full name must be at least 2 characters!'),
      email: yup.string().required('Please enter email!').email('Invalid email!'),
      phone: yup.string().required('Please enter phone number!').matches(/^[0-9]{10}$/, 'Phone number must have 10 digits!'),
      dateOfBirth: yup.mixed().required('Please select date of birth!').test('age', 'You must be at least 18 years old!', value => {
        if (!value) return false;
        // value is a moment object from DatePicker
        const year = value.year ? value.year() : (new Date(value)).getFullYear();
        return new Date().getFullYear() - year >= 18;
      }),
      address: yup.string().required('Please enter address!').min(10, 'Address must be at least 10 characters!'),
      password: yup.string().required('Please enter password!').min(6, 'Password must be at least 6 characters!'),
      confirm: yup.string().required('Please confirm password!').oneOf([yup.ref('password')], 'Passwords do not match!'),
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
        address: values.address || 'N/A',
      };

      console.log('📝 Sending new user:', newUser);
      const result = await registerUser(newUser);

      if (result) {
        // Show react-toastify toast and redirect to login after short delay
          toast.success('Registration successful, please log in now', {
          position: 'top-right',
          autoClose: 2000,
        });
        // Also show antd message for accessibility/consistency
        message.success('✅ Registration successful! Please log in to continue.');
        setTimeout(() => navigate('/login'), 1800);
      } else {
        message.error('Unable to create account, please try again!');
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        // map yup errors to form fields
        const fields = err.inner.map(e => ({ name: e.path, errors: [e.message] }));
        form.setFields(fields);
      } else {
        console.error('❌ Register error:', err);
        message.error(err.message || 'An error occurred while registering. Please try again!');
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
            Create a new account
          </Title>
          <Text className="text-gray-600 text-sm">
            Join to experience EV rental services
          </Text>
        </div>

        <Form form={form} layout="vertical" onFinish={handleRegister} requiredMark={false}>
          {/* Full name */}
          <Form.Item
            name="name"
            rules={[
              { required: true, message: "Please enter full name!" },
              { min: 2, message: "Full name must be at least 2 characters!" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-purple-500" />}
              placeholder="Full name"
              size="large"
              disabled={loading}
              className="rounded-lg"
            />
          </Form.Item>

          {/* Email */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter email!" },
              { type: "email", message: "Invalid email!" },
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

          {/* Phone number */}
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: "Please enter phone number!" },
              {
                pattern: /^[0-9]{10}$/,
                message: "Phone number must have 10 digits!",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined className="text-purple-500" />}
              placeholder="Phone number"
              size="large"
              disabled={loading}
              className="rounded-lg"
              maxLength={10}
            />
          </Form.Item>

          {/* Date of birth */}
          <Form.Item
            name="dateOfBirth"
            rules={[
              { required: true, message: "Please select date of birth!" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const age = new Date().getFullYear() - value.year();
                  if (age < 18) {
                    return Promise.reject("You must be at least 18 years old!");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              placeholder="Date of birth"
              size="large"
              disabled={loading}
              className="rounded-lg w-full"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          {/* Address */}
          <Form.Item
            name="address"
            rules={[
              { required: true, message: "Please enter address!" },
              { min: 10, message: "Address must be at least 10 characters!" },
            ]}
          >
            <Input
              prefix={<HomeOutlined className="text-purple-500" />}
              placeholder="Address"
              size="large"
              disabled={loading}
              className="rounded-lg"
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please enter password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-purple-500" />}
              placeholder="Password"
              size="large"
              disabled={loading}
              className="rounded-lg"
            />
          </Form.Item>

          {/* Confirm password */}
          <Form.Item
            name="confirm"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-purple-500" />}
              placeholder="Confirm password"
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
              {loading ? "Processing..." : "Register"}
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Login
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
