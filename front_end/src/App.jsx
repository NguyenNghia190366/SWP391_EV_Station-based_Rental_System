import { Routes, Route, Navigate } from "react-router-dom";
// Auth
import LoginPage from "./Features/auth/Pages/LoginPage";
import HomePage from "./Features/auth/Pages/HomePage";
import RegisterPage from "./Features/auth/Pages/RegisterPage";
// Shared
import ProfilePage from "./Components/Common/View/Profile/pages/ProfilePage.jsx";
// Renter
import VehiclesPage from "./Components/renter/pages/VehiclesPage";
import BookingContainer from "./Components/Common/View/Booking/containers/BookingContainer.jsx";
import ContractContainer from "./Components/renter/containers/ContractContainer";
import PaymentContainer from "./Components/renter/containers/PaymentContainer";
import CheckInContainer from "./Components/renter/containers/CheckInContainer";
import BookingSuccessPage from "./Components/Common/View/Booking/pages/BookingSuccessPage";
import CheckInMethodSelectionPage from "./Components/renter/pages/CheckInMethodSelectionPage";
import DocumentVerificationPage from "./Components/renter/pages/DocumentVerificationPage";
import VehiclePreviewNotification from "./Components/renter/pages/VehiclePreviewNotification";
import PaymentSuccessBill from "./Components/renter/pages/PaymentSuccessBill";
import MyBookingsPage from "./Components/Common/View/Booking/pages/MyBookingsPage.jsx";
// Admin
import AdminDashboard from "./Components/Admin/pages/AdminDashboard";
import AdminVerificationDashboard from "./Components/Admin/pages/VerifyRenterPage.jsx";
import StationRegistrationContainer from "./Components/Admin/containers/StationRegistrationContainer";
// Staff
import StaffDashboard from "./Components/StationStaff/pages/StaffDashboard.jsx";
import SendVehiclePreview from "./Components/StationStaff/components/SendVehiclePreview.jsx";
// Common
import { roles } from "./Constant/Role";
import { RequireAuth } from "./Router/RequireAuth.jsx";
import AuthRoute from "./Router/AuthRoute";
import Layout from "./Components/Layout/Layout";
import NotificationsPage from "./Components/Common/View/Notifications/pages/NotificationsPage.jsx";
import VerifyPage from "./Components/renter/pages/VerifyPage.jsx";

function App() {
  console.log(" App component rendered");
  
  return (
    <Routes>
      {/* Routes with Layout (Header & Footer) */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
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