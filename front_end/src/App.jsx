import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Features/auth/Pages/LoginPage";
import HomePage from "./Features/auth/Pages/HomePage";
import RegisterPage from "./Features/auth/Pages/RegisterPage";
import ProfilePage from "./Features/auth/Pages/ProfilePage";

function App() {
  return (
      <Routes>
        {/* Nếu chỉ vào http://localhost:5173 hoặc http://localhost:5173/ → tự chuyển sang /home */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
  );
}

export default App;