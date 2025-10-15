import React from "react";
import RegisterContainer from "../../../Container/RegisterContainer";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>Đăng ký tài khoản</h1>
            <p>Trải nghiệm dịch vụ thuê xe điện tốt nhất</p>
          </div>
          <RegisterContainer />
          <div className="register-footer">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
