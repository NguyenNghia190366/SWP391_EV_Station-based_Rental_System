import React from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import './RegisterForm.css';

const RegisterForm = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  error,
  loading,
  onSubmit,
}) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="shadow-lg border border-gray-200 w-[400px]">
        <Card.Body className="p-6">
          <h2 className="text-2xl font-semibold text-center text-indigo-700 mb-4">
            Register
          </h2>

          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-sm font-medium text-gray-700">
                Email
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus:ring-2 focus:ring-indigo-300"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-sm font-medium text-gray-700">
                Password
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus:ring-2 focus:ring-indigo-300"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-sm font-medium text-gray-700">
                Confirm Password
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="focus:ring-2 focus:ring-indigo-300"
                disabled={loading}
              />
            </Form.Group>

            {error && (
              <Alert variant="danger" className="text-center py-2 text-sm">
                {error}
              </Alert>
            )}

            <div className="d-grid mt-3">
              <Button
                type="submit"
                variant="primary"
                className="bg-indigo-600 border-0 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span>Registering...</span>
                  </div>
                ) : (
                  "Register"
                )}
              </Button>
            </div>
          </Form>

          <p className="text-center text-sm text-gray-600 mt-3">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="text-indigo-600 hover:underline"
            >
              Login
            </Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default RegisterForm;
