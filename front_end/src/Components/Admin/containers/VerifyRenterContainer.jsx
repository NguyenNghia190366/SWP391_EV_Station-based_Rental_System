import React, { useEffect, useState } from "react";
import { useAdmin } from "../../../hooks/useAdmin";
import { useAxiosInstance } from "../../../hooks/useAxiosInstance";
import RenterListTable from "../components/RenterListTable";
import { message } from "antd";

const VerifyRenterContainer = () => {
  const api = useAxiosInstance(); // Dùng axios instance với baseURL
  const { verifyRenter, loading, error } = useAdmin();
  const [renters, setRenters] = useState([]);
  const [fetchingRenters, setFetchingRenters] = useState(false);

  const fetchRenters = async () => {
    setFetchingRenters(true);
    try {
      // Fetch tất cả 4 endpoints song song
      const [rentersRes, usersRes, licensesRes, cccdsRes] = await Promise.all([
        api.get("/Renters"),
        api.get("/Users"),
        api.get("/DriverLicenses"),
        api.get("/Cccds"),
      ]);

      console.log("📦 Raw data:");
      console.log("  - Renters:", rentersRes.data);
      console.log("  - Users:", usersRes.data);
      console.log("  - Licenses:", licensesRes.data);
      console.log("  - CCCDs:", cccdsRes.data);

      // Lấy arrays
      const rentersList = Array.isArray(rentersRes.data) ? rentersRes.data : rentersRes.data?.data || [];
      const usersList = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.data || [];
      const licensesList = Array.isArray(licensesRes.data) ? licensesRes.data : licensesRes.data?.data || [];
      const cccdsList = Array.isArray(cccdsRes.data) ? cccdsRes.data : cccdsRes.data?.data || [];

      // Merge dữ liệu: JOIN renters với users, licenses và cccds
      const mergedRenters = rentersList.map(renter => {
        const renterId = renter.renter_id || renter.renterId || renter.id;
        const userId = renter.user_id || renter.userId;
        
        // Tìm user tương ứng (lấy fullName và email từ Users)
        const user = usersList.find(u => 
          (u.user_id || u.userId || u.id) === userId
        );
        
        // Tìm license tương ứng
        const license = licensesList.find(lic => 
          (lic.renter_Id || lic.renterId) === renterId
        );
        
        // Tìm cccd tương ứng
        const cccd = cccdsList.find(c => 
          (c.renter_Id || c.renterId) === renterId
        );

        return {
          id: renterId,
          userId: userId,
          fullName: user?.full_name || user?.fullName || "N/A",
          email: user?.email || "N/A",
          phone: user?.phone_number || user?.phone || "",
          isVerified: renter.is_verified || renter.isVerified || false,
          currentAddress: renter.current_address || renter.currentAddress || "",
          registrationDate: renter.registration_date || renter.registrationDate || "",
          // Driver License
          driverLicenseFrontUrl: license?.url_Driver_License_front || "",
          driverLicenseBackUrl: license?.url_Driver_License_back || "",
          driverLicenseNumber: license?.driverLicenseNumber || "",
          // CCCD
          cccdFrontUrl: cccd?.url_Cccd_Cmnd_front || "",
          cccdBackUrl: cccd?.url_Cccd_Cmnd_back || "",
          cccdNumber: cccd?.id_Card_Number || "",
        };
      });

      console.log("✅ Merged renters:", mergedRenters.length, "records");
      console.log("📊 Sample renter object:", mergedRenters[0]);
      console.log("🔍 Full renter data from API:", rentersList[0]);
      console.log("🔍 Full user data from API:", usersList[0]);
      console.log("🔍 Sample license:", licensesList[0]);
      console.log("🔍 Sample cccd:", cccdsList[0]);
      
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

  const handleVerify = async (id) => {
    try {
      const result = await verifyRenter(id);
      
      // Tìm renter để lấy email
      const renterToVerify = renters.find(r => r.id === id);
      const email = renterToVerify?.email;

      // Cập nhật state local sau khi verify thành công
      setRenters((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, isVerified: true } : r
        )
      );

      // Gửi notification email tới renter
      if (email) {
        try {
          await api.post("/Notifications/SendEmail", {
            to: email,
            subject: "✅ Xác thực tài khoản thành công",
            body: `Chúc mừng! Tài khoản của bạn đã được xác thực thành công. Bạn có thể bắt đầu thuê xe ngay bây giờ.`,
            type: "VERIFICATION_APPROVED"
          });
          console.log("📧 Notification email sent to:", email);
        } catch (emailErr) {
          console.warn("⚠️ Could not send notification email:", emailErr);
        }
      }

      // Nếu người được verify là người đang đăng nhập, cập nhật localStorage để client nhận biết
      try {
        const currentUserRaw = localStorage.getItem("currentUser");
        if (currentUserRaw) {
          const currentUser = JSON.parse(currentUserRaw);
          // So sánh bằng renterId hoặc userId
          const renterId = currentUser.renterId || currentUser.renter_id || currentUser.renterId;
          const userId = currentUser.userId || currentUser.user_id || currentUser.userId;
          if (String(renterId) === String(id) || String(userId) === String(id)) {
            const updatedUser = { ...currentUser, isVerified: true };
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            // Also set flat flags used elsewhere
            localStorage.setItem("isVerified", "true");
          }
        }
      } catch (e) {
        console.warn("Could not update localStorage after verify:", e);
      }

      // Refresh list from server to ensure authoritative state (in case other fields changed)
      try {
        await fetchRenters();
      } catch (e) {
        // ignore
      }
      message.success("✅ Xác thực người thuê thành công - Email đã được gửi");
    } catch (err) {
      console.error("Lỗi khi xác thực renter:", err);
      message.error("Xác thực thất bại: " + (err.message || "Có lỗi xảy ra"));
    }
  };

  const handleReject = async (id, reason) => {
    try {
      // Tìm renter để lấy email
      const renterToReject = renters.find(r => r.id === id);
      const email = renterToReject?.email;

      // Gọi API để cập nhật is_verified = 0 với lý do từ chối
      await api.put(`/Renters/${id}`, {
        is_verified: 0,
        rejection_reason: reason,
        rejected_at: new Date().toISOString(),
      });

      // Cập nhật state local sau khi từ chối thành công
      setRenters((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, isVerified: false } : r
        )
      );

      // Gửi notification email tới renter
      if (email) {
        try {
          await api.post("/Notifications/SendEmail", {
            to: email,
            subject: "❌ Yêu cầu xác thực bị từ chối",
            body: `Yêu cầu xác thực tài khoản của bạn đã bị từ chối.\n\nLý do: ${reason}\n\nVui lòng kiểm tra và tải lên lại giấy tờ.`,
            type: "VERIFICATION_REJECTED",
            metadata: {
              rejection_reason: reason
            }
          });
          console.log("📧 Rejection notification email sent to:", email);
        } catch (emailErr) {
          console.warn("⚠️ Could not send rejection notification email:", emailErr);
        }
      }

      message.success("✅ Đã từ chối - Email thông báo đã được gửi");
      
      // Refresh list
      await fetchRenters();
    } catch (err) {
      console.error("Lỗi khi từ chối renter:", err);
      message.error("Từ chối thất bại: " + (err.message || "Có lỗi xảy ra"));
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

export default VerifyRenterContainer;
