import React from "react";
import './LoginForm.css';

const LoginForm = ({
  email,
  password,
  error,
  loading = false,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) => {
  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="login-title">Login</h2>

        <form onSubmit={onSubmit}>
          <div className="form-item">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={onEmailChange}
              required
            />
          </div>

          <div className="form-item">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={onPasswordChange}
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="submit-button btn btn-primary"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="register-link">
          <a href="/register">Don't have account? Create here!</a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
