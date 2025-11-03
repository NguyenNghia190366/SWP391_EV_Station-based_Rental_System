import React from "react";
import StaffVerificationDashboard from "../staff/StaffVerificationDashboard";

const AdminVerificationDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ✅ Xác Minh Tài Liệu
          </h1>
          <p className="text-gray-600 text-lg">
            Duyệt Giấy phép lái xe (GPLX) và Căn cước công dân (CCCD) từ renters
          </p>
        </div>

        {/* Verification Dashboard */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <StaffVerificationDashboard />
        </div>
      </div>
    </div>
  );
};

export default AdminVerificationDashboard;
