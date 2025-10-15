import { Routes, Route } from "react-router-dom";
import LoginPage from "./Features/auth/Pages/LoginPage";
import HomePage from "./Features/auth/Pages/HomePage";
import RegisterPage from "./Features/auth/Pages/RegisterPage";
import VerificationQueuePage from './Features/auth/Pages/VerificationQueuePage';
import ProfilePage from './Features/auth/Pages/ProfilePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/staff/verification" element={<VerificationQueuePage />}/>
      <Route path="/register" element={<RegisterPage />}/> 
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;
