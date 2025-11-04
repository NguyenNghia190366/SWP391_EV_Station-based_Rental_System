import React, { useState } from "react";
import { message, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import StationRegistrationForm from "../components/StationRegistrationForm";
import { stationAPI } from "../../../api/api";

const StationRegistrationContainer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      console.log("📤 Submitting station data:", values);

      // Format time từ TimePicker (dayjs object) thành string
      const openingTime = values.opening_time?.format("HH:mm") || "";
      const closingTime = values.closing_time?.format("HH:mm") || "";
      const operatingHours = `${openingTime} - ${closingTime}`;

      // Chuẩn hóa dữ liệu theo format Backend
      const stationData = {
        stationName: values.station_name,
        address: values.address,
        latitude: values.latitude,
        longitude: values.longitude,
        // phone_number: values.phone_number,
        // manager_name: values.manager_name,
        // operating_hours: operatingHours,
        capacity: values.capacity,
        description: values.description || "",
        status: "Active"
        // Thêm các field khác nếu Backend yêu cầu:
        // is_active: true,
        // created_at: new Date().toISOString(),
      };

      console.log("📦 Formatted data:", stationData);

      // Gọi API
      const result = await stationAPI.create(stationData);

      console.log("✅ Station created:", result);

      // Hiển thị modal thành công
      Modal.success({
        title: "🎉 Đăng ký trạm thành công!",
        content: (
          <div className="space-y-2">
            <p>
              Trạm <strong>{values.station_name}</strong> đã được thêm vào hệ
              thống.
            </p>
            <p className="text-gray-600 text-sm">
              Data đã gửi về Backend team để xử lý.
            </p>
          </div>
        ),
        okText: "Quay về trang chủ",
        onOk: () => {
          navigate("/");
        },
      });

      // Toast thông báo
      message.success({
        content: `✅ Đã tạo trạm: ${values.station_name}`,
        duration: 4,
      });
    } catch (error) {
      console.error("❌ Error creating station:", error);

      // Xử lý lỗi chi tiết
      let errorMessage = "Không thể tạo trạm. Vui lòng thử lại.";

      if (error.message?.includes("Network")) {
        errorMessage =
          "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.";
      } else if (error.message?.includes("duplicate")) {
        errorMessage = "Trạm này đã tồn tại trong hệ thống.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Modal.error({
        title: "Đăng ký thất bại",
        content: errorMessage,
        okText: "Thử lại",
      });

      message.error({
        content: errorMessage,
        duration: 5,
      });

      // Re-throw để form component xử lý
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return <StationRegistrationForm onSubmit={handleSubmit} loading={loading} />;
};

export default StationRegistrationContainer;
