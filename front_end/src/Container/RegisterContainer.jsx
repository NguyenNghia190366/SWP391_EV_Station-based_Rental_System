import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import RegisterForm from "../Components/Form/RegisterForm";

const RegisterContainer = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    // Reset error
    setError("");

    // Email validation
    if (!email) {
      setError("Email is required!");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address!");
      return false;
    }

    // Password validation
    if (!password) {
      setError("Password is required!");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      setError("Please confirm your password!");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Create new user
      const newUser = {
        email,
        password,
        role: "renter",
        isVerified: false,
        createdAt: new Date().toISOString(),
        name: email.split('@')[0], // Default name from email
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random`,
      };

      // Send registration request
      const response = await api.post("/Users", newUser);
      console.log("✅ Registration successful:", response.data);

      // Show success message
      alert("Registration successful! Please login to continue.");
      
      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("❌ Registration failed:", error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        setError("This email is already registered!");
      } else {
        setError(error.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterForm
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      error={error}
      loading={loading}
      onSubmit={handleSubmit}
    />
  );
};

export default RegisterContainer;
