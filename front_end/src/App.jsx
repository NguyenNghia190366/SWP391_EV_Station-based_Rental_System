import { Routes, Route, Navigate } from "react-router-dom";
// Auth
import LoginPage from "./components/Common/Pages/LoginPage.jsx";
import HomePage from "./components/Common/Pages/HomePage.jsx";
import RegisterPage from "./components/Common/Pages/RegisterPage.jsx";
// Shared
import ProfilePage from "./Components/Common/Profile/ProfilePage.jsx";
// Renter
import VehiclesPage from "./pages/renter/vehicles/VehiclesPage.jsx";
import BookingRequestPage from "./pages/renter/booking/BookingRequestPage.jsx";
import ContractPage from "./pages/renter/ContractPage.jsx";
import PaymentPage from "./pages/renter/payment/PaymentPage.jsx";
import VehiclePreviewNotification from "./pages/renter/VehiclePreviewNotification";
import VerifyPage from "./pages/renter/VerifyPage.jsx";
// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminVerificationDashboard from "./pages/admin/VerifyRenterPage.jsx";
import StationRegistrationPage from "./pages/admin/StationRegistrationPage";
// Staff
import StaffDashboard from "./pages/staff/StaffDashboard.jsx";
import SendVehiclePreview from "./pages/staff/SendVehiclePreview.jsx";
// Common
import { roles } from "./Constant/Role";
import { RequireAuth } from "./Router/RequireAuth.jsx";
import AuthRoute from "./Router/AuthRoute";
import Layout from "./Components/Common/layout/Layout/Layout.jsx";
import NotificationsPage from "./components/Common/View/Notifications/pages/NotificationsPage.jsx";

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
        <Route path="/verify" element={<VerifyPage />} />

        {/* Booking Flow Routes */}
        <Route
          path="/booking-request/:vehicleId"
          element={<BookingRequestPage />}
        />
        <Route path="/booking/:vehicleId" element={<ContractPage />} />
        <Route path="/contract/:vehicleId" element={<ContractPage />} />
        <Route path="/payment/:vehicleId" element={<PaymentPage />} />

        {/* User Account Routes */}
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Vehicle Preview & Handover Routes */}
        <Route
          path="/vehicle-preview/:bookingId"
          element={<VehiclePreviewNotification />}
        />

        {/* Admin & Staff Routes */}
        <Route element={<RequireAuth allowRole={[roles.ADMIN]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route
            path="/admin/verification"
            element={<AdminVerificationDashboard />}
          />
          <Route
            path="/admin/register-station"
            element={<StationRegistrationPage />}
          />
        </Route>
        <Route
          path="/staff/dashboard"
          element={
            <RequireAuth allowRole={[roles.STAFF]}>
              <StaffDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/staff/register-station"
          element={
            <RequireAuth allowRole={[roles.STAFF]}>
              <StationRegistrationPage />
            </RequireAuth>
          }
        />
        <Route
          path="/staff/send-vehicle-preview/:bookingId"
          element={
            <RequireAuth allowRole={[roles.STAFF]}>
              <SendVehiclePreview />
            </RequireAuth>
          }
        />
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
