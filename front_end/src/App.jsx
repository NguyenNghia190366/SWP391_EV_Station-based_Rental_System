import { Routes, Route, Navigate } from "react-router-dom";
// Auth
import LoginPage from "./Components/Common/Pages/LoginPage.jsx";
import HomePage from "./Components/Common/Pages/HomePage.jsx";
import RegisterPage from "./Components/Common/Pages/RegisterPage.jsx";
// Shared
import ProfilePage from "./Components/Common/Profile/ProfilePage.jsx";
// Renter
import VehiclesPage from "./pages/renter/vehicles/VehiclesPage.jsx";
import BookingRequestPage from "./pages/renter/booking/BookingRequestPage.jsx";
import BookingFormPage from "./pages/renter/booking/BookingFormPage.jsx";
import VehiclePreviewNotification from "./pages/renter/VehiclePreviewNotification";
import VerifyPage from "./pages/renter/VerifyPage.jsx";
import RentalHistoryPage from "./pages/renter/RentalHistoryPage.jsx";
import ContractOnlinePage from "./pages/renter/ContractOnlinePage.jsx";
import ContractOfflinePage from "./pages/renter/ContractOfflinePage.jsx";
import PaymentSuccessPage from "./pages/renter/payment/PaymentSuccessPage.jsx";
import PaymentHistory from "./pages/renter/payment/PaymentHistory.jsx";
// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminVerificationDashboard from "./pages/admin/VerifyRenterPage.jsx";
import StationRegistrationPage from "./pages/admin/StationRegistrationPage";
// Staff
import StaffDashboard from "./pages/staff/StaffDashboard.jsx";
import SendVehiclePreview from "./pages/staff/SendVehiclePreview.jsx";
import StaffContractOfflinePage from "./pages/staff/StaffContractOfflinePage.jsx";
import StaffContractOnlinePage from "./pages/staff/StaffContractOnlinePage.jsx";
import StaffConfirmHandover from "./pages/staff/handover/StaffConfirmHandover.jsx";
import StaffReturnRequestPage from "./pages/staff/return/StaffReturnRequestPage.jsx";
import StaffReturnCheckPage from "./pages/staff/return/StaffReturnCheckPage.jsx";
import StaffReturnSummaryPage from "./pages/staff/return/StaffReturnSummaryPage.jsx";
// Common
import { roles } from "./Constant/Role";  
import { RequireAuth } from "./Router/RequireAuth.jsx";
import AuthRoute from "./Router/AuthRoute";
import Layout from "./Components/Common/layout/Layout/Layout.jsx";
import NotificationsPage from "./Components/Common/View/Notifications/pages/NotificationsPage.jsx";

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
        <Route path="/booking/:vehicleId" element={<BookingFormPage />} />
        <Route
          path="/booking-request/:vehicleId"
          element={<BookingRequestPage />}
        />
        <Route path="/contract/:vehicleId" element={<ContractOfflinePage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/history" element={<PaymentHistory />} />

        {/* User Account Routes */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/my-bookings" element={<RentalHistoryPage />} />

        <Route
          path="/renter/contract-online/:orderId"
          element={
            <RequireAuth allowRole={[roles.RENTER]}>
              <ContractOnlinePage />
            </RequireAuth>
          }
        />

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
          path="/staff/confirm-handover"
          element={
            <RequireAuth allowRole={[roles.STAFF]}>
              <StaffConfirmHandover />
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
        <Route
          path="/staff/contract-offline/:orderId"
          element={
            <RequireAuth allowRole={[roles.STAFF]}>
              <StaffContractOfflinePage />
            </RequireAuth>
          }
        />
        <Route
          path="/staff/contract-online/:orderId"
          element={
            <RequireAuth allowRole={[roles.STAFF]}>
              <StaffContractOnlinePage />
            </RequireAuth>
          }
        />
        <Route
          path="/staff/return-requests"
          element={
            <RequireAuth allowRole={[roles.STAFF]}>
              <StaffReturnRequestPage />
            </RequireAuth>
          }
        />

        <Route
          path="/staff/return-check/:orderId"
          element={
            <RequireAuth allowRole={[roles.STAFF]}>
              <StaffReturnCheckPage />
            </RequireAuth>
          }
        />

        <Route
          path="/staff/return-summary/:orderId"
          element={
            <RequireAuth allowRole={[roles.STAFF]}>
              <StaffReturnSummaryPage />
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
