import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Features/auth/Pages/LoginPage";
import HomePage from "./Features/auth/Pages/HomePage";
import RegisterPage from "./Features/auth/Pages/RegisterPage";
import ProfilePage from "./Features/auth/Pages/ProfilePage";
import VehiclesPage from "./Features/auth/Pages/VehiclesPage";
import { roles } from "./Constant/Role";
import { RequireAuth } from "./Router/RequireAuth.jsx";
import AdminDashboard from "./Features/admin/AdminDashboard";
import AdminVerificationDashboard from "./Features/admin/AdminVerificationDashboard";
import StaffDashboard from "./Features/staff/StaffDashboard";
import AuthRoute from "./Router/AuthRoute";
import Layout from "./Components/Layout/Layout";
import BookingContainer from "./Container/BookingContainer";
import ContractContainer from "./Container/ContractContainer";
import PaymentContainer from "./Container/PaymentContainer";
import BookingSuccessPage from "./Components/Common/Page/BookingSuccessPage";
import CheckInContainer from "./Container/CheckInContainer";
import CheckInMethodSelectionPage from "./Components/Common/Page/CheckInMethodSelectionPage";
import DocumentVerificationPage from "./Components/Common/Page/DocumentVerificationPage";
import VehiclePreviewNotification from "./Components/Common/Page/VehiclePreviewNotification";
import SendVehiclePreview from "./Components/StationStaff/SendVehiclePreview";
import PaymentSuccessBill from "./Components/Common/Page/PaymentSuccessBill";
import NotificationsPage from "./Components/Common/Page/NotificationsPage";
import MyBookingsPage from "./Components/Common/Page/MyBookingsPage";
import StationRegistrationContainer from "./Container/StationRegistrationContainer";
import VerifyPage from "./pages/VerifyPage.jsx";

function App() {
  console.log(" App component rendered");
  
  return (
    <Routes>
      {/* Routes with Layout (Header & Footer) */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/profile/cccd" element={<VerifyPage />} />
        
        
        {/* Booking Flow Routes */}
        <Route path="/booking/:vehicleId" element={<BookingContainer />} />
        <Route path="/contract/:vehicleId" element={<ContractContainer />} />
        <Route path="/payment/:vehicleId" element={<PaymentContainer />} />
        <Route path="/payment-success" element={<PaymentSuccessBill />} />
        <Route path="/booking-success" element={<BookingSuccessPage />} />
        
        {/* User Account Routes */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        
        {/* Vehicle Preview & Handover Routes */}
        <Route path="/vehicle-preview/:bookingId" element={<VehiclePreviewNotification />} />
        <Route path="/checkin-prepare/:bookingId" element={<CheckInMethodSelectionPage />} />
        
        {/* Check-in Flow Routes */}
        <Route path="/checkin-method/:bookingId" element={<CheckInMethodSelectionPage />} />
        <Route path="/verify-documents/:bookingId" element={<DocumentVerificationPage />} />
        <Route path="/checkin/:bookingId" element={<CheckInContainer />} />
        <Route path="/checkin" element={<CheckInContainer />} />
        
        {/* Admin & Staff Routes */}
        <Route element={<RequireAuth allowRole={[roles.ADMIN]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/verification" element={<AdminVerificationDashboard />} />
          <Route path="/admin/register-station" element={<StationRegistrationContainer />} />
        </Route>
        <Route path="/staff/dashboard" element={<RequireAuth allowRole={[roles.STAFF]}><StaffDashboard /></RequireAuth>} />
        <Route path="/staff/register-station" element={<RequireAuth allowRole={[roles.STAFF]}><StationRegistrationContainer /></RequireAuth>} />
        <Route path="/staff/send-vehicle-preview/:bookingId" element={<RequireAuth allowRole={[roles.STAFF]}><SendVehiclePreview /></RequireAuth>} />
      </Route>

      {/* Routes without Layout (Auth pages - Login/Register) */}
      <Route element={<AuthRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
}

export default App;