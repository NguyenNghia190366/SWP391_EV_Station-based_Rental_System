import React, { useEffect, useState } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import { useAxiosInstance } from "../../hooks/useAxiosInstance";
import RenterListTable from "./RenterListTable";
import { message } from "antd";

const VerifyRenterPage = () => {
  const api = useAxiosInstance();
  const { verifyRenter, loading, error } = useAdmin();
  const [renters, setRenters] = useState([]);
  const [fetchingRenters, setFetchingRenters] = useState(false);

  // ======================== FETCH =========================
  const fetchRenters = async () => {
    setFetchingRenters(true);
    try {
      const [rentersRes, usersRes, licensesRes, cccdsRes] = await Promise.all([
        api.get("/Renters"),
        api.get("/Users"),
        api.get("/DriverLicenses"),
        api.get("/Cccds"),
      ]);

      const rentersList = Array.isArray(rentersRes.data) ? rentersRes.data : rentersRes.data?.data || [];
      const usersList = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.data || [];
      const licensesList = Array.isArray(licensesRes.data) ? licensesRes.data : licensesRes.data?.data || [];
      const cccdsList = Array.isArray(cccdsRes.data) ? cccdsRes.data : cccdsRes.data?.data || [];

      const mergedRenters = rentersList.map(renter => {
        const renterId = renter.renter_id || renter.renterId || renter.id;
        const userId = renter.user_id || renter.userId;

        const user = usersList.find(u =>
          (u.user_id || u.userId || u.id) === userId
        );
        const license = licensesList.find(lic =>
          (lic.renter_Id || lic.renterId) === renterId
        );
        const cccd = cccdsList.find(c =>
          (c.renter_Id || c.renterId) === renterId
        );

        return {
          id: renterId,
          userId,
          fullName: user?.full_name || user?.fullName || "N/A",
          email: user?.email || "N/A",
          phone: user?.phone_number || user?.phone || "",
          isVerified: renter.is_verified || renter.isVerified || false,
          currentAddress: renter.current_address || renter.currentAddress || "",
          registrationDate: renter.registration_date || renter.registrationDate || "",
          // License
          driverLicenseFrontUrl: license?.url_Driver_License_front || "",
          driverLicenseBackUrl: license?.url_Driver_License_back || "",
          driverLicenseNumber: license?.driverLicenseNumber || "",
          // CCCD
          cccdFrontUrl: cccd?.url_Cccd_Cmnd_front || "",
          cccdBackUrl: cccd?.url_Cccd_Cmnd_back || "",
          cccdNumber: cccd?.id_Card_Number || "",
        };
      });

      setRenters(mergedRenters);
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu:", err);
      message.error("Không thể tải danh sách người thuê: " + (err.message || ""));
    } finally {
      setFetchingRenters(false);
    }
  };

  useEffect(() => {
    fetchRenters();
  }, []);

  // ======================== VERIFY =========================
  const handleVerify = async (id) => {
    try {
      const result = await verifyRenter(id);
      const renterToVerify = renters.find(r => r.id === id);
      const email = renterToVerify?.email;

      setRenters((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isVerified: true } : r))
      );

      if (email) {
        try {
          await api.post("/Notifications/SendEmail", {
            to: email,
            subject: "✅ Xác thực tài khoản thành công",
            body: `Chúc mừng! Tài khoản của bạn đã được xác thực thành công. Bạn có thể bắt đầu thuê xe ngay bây giờ.`,
            type: "VERIFICATION_APPROVED",
          });
          console.log("📧 Email sent to:", email);
        } catch (emailErr) {
          console.warn("⚠️ Không gửi được email thông báo:", emailErr);
        }
      }

      try {
        const currentUserRaw = localStorage.getItem("currentUser");
        if (currentUserRaw) {
          const currentUser = JSON.parse(currentUserRaw);
          const renterId = currentUser.renterId || currentUser.renter_id;
          const userId = currentUser.userId || currentUser.user_id;
          if (String(renterId) === String(id) || String(userId) === String(id)) {
            const updatedUser = { ...currentUser, isVerified: true };
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            localStorage.setItem("isVerified", "true");
          }
        }
      } catch (e) {
        console.warn("Không thể cập nhật localStorage:", e);
      }

      await fetchRenters();
      message.success("✅ Xác thực thành công - Email đã được gửi");
    } catch (err) {
      console.error("Lỗi khi xác thực renter:", err);
      message.error("Xác thực thất bại: " + (err.message || ""));
    }
  };

  // ======================== REJECT =========================
  const handleReject = async (id, reason) => {
    try {
      const renterToReject = renters.find(r => r.id === id);
      const email = renterToReject?.email;

      await api.put(`/Renters/${id}`, {
        is_verified: 0,
        rejection_reason: reason,
        rejected_at: new Date().toISOString(),
      });

      setRenters((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isVerified: false } : r))
      );

      if (email) {
        try {
          await api.post("/Notifications/SendEmail", {
            to: email,
            subject: "❌ Yêu cầu xác thực bị từ chối",
            body: `Yêu cầu xác thực tài khoản của bạn đã bị từ chối.\n\nLý do: ${reason}\n\nVui lòng kiểm tra và tải lên lại giấy tờ.`,
            type: "VERIFICATION_REJECTED",
            metadata: { rejection_reason: reason },
          });
        } catch (emailErr) {
          console.warn("⚠️ Không gửi được email từ chối:", emailErr);
        }
      }

      message.success("✅ Đã từ chối - Email đã được gửi");
      await fetchRenters();
    } catch (err) {
      console.error("Lỗi khi từ chối renter:", err);
      message.error("Từ chối thất bại: " + (err.message || ""));
    }
  };

  return (
    <RenterListTable
      renters={renters}
      loading={fetchingRenters || loading}
      error={error}
      onVerify={handleVerify}
      onReject={handleReject}
    />
  );
};

export default VerifyRenterPage;
