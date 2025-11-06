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
      // Fetch tất cả 3 endpoints song song
      const [rentersRes, licensesRes, cccdsRes] = await Promise.all([ //chờ cả 3 api phản h
        api.get("/Renters"),
        api.get("/DriverLicenses"),
        api.get("/Cccds"),
      ]);

      console.log("📦 Raw data:");
      console.log("  - Renters:", rentersRes.data);
      console.log("  - Licenses:", licensesRes.data);
      console.log("  - CCCDs:", cccdsRes.data);

      // Lấy arrays
      const rentersList = Array.isArray(rentersRes.data) ? rentersRes.data : rentersRes.data?.data || [];
      const licensesList = Array.isArray(licensesRes.data) ? licensesRes.data : licensesRes.data?.data || [];
      const cccdsList = Array.isArray(cccdsRes.data) ? cccdsRes.data : cccdsRes.data?.data || [];

      // Merge dữ liệu: JOIN renters với licenses và cccds
      const mergedRenters = rentersList.map(renter => {
        const renterId = renter.renterId || renter.renter_Id || renter.id;
        
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
          fullName: renter.renter?.fullName || renter.fullName || "N/A",
          email: renter.renter?.email || renter.email || "N/A",
          phone: renter.renter?.phone || renter.phone || "",
          isVerified: renter.isVerified ?? false,
          currentAddress: renter.currentAddress || "",
          registrationDate: renter.registrationDate || "",
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
      console.log("📊 Sample:", mergedRenters[0]);
      
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
      // Cập nhật state local sau khi verify thành công
      setRenters((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, isVerified: true } : r
        )
      );

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
      message.success("Xác thực người thuê thành công");
    } catch (err) {
      console.error("Lỗi khi xác thực renter:", err);
      message.error("Xác thực thất bại: " + (err.message || "Có lỗi xảy ra"));
    }
  };

  return (
    <RenterListTable
      renters={renters}
      loading={fetchingRenters || loading}
      error={error}
      onVerify={handleVerify}
    />
  );
};

export default VerifyRenterContainer;
