import { Routes, Route } from "react-router-dom";
import LoginPage from "./Features/auth/Pages/LoginPage";
import HomePage from "./Features/auth/Pages/HomePage";
import RegisterPage from "./Features/auth/Pages/RegisterPage";
import ProfilePage from './Features/auth/Pages/ProfilePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />}/> 
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;
