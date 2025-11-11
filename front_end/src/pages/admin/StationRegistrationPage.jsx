import React, { useState } from "react";
import * as yup from "yup";
import {
  Form,
  Input,
  Button,
  InputNumber,
  message,
  Card,
  TimePicker,
  Modal,
} from "antd";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  ClockCircleOutlined,
  AimOutlined,
} from "@ant-design/icons";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { useStations } from "@/hooks/useStations";

// 🗺️ Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const { TextArea } = Input;

// 📍 Component để chọn vị trí trên bản đồ
const LocationMarker = ({ position, setPosition, form }) => {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      form.setFieldsValue({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
      message.success(
        `📍 Đã chọn vị trí: ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`
      );
    },
  });

  return position ? <Marker position={position} /> : null;
};

const StationRegistrationPage = () => {
  const [form] = Form.useForm();
  const [mapPosition, setMapPosition] = useState([10.7756, 106.7004]); // Saigon default
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { create } = useStations();

  // 🎯 Lấy vị trí hiện tại từ GPS
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      message.loading("🌍 Đang lấy vị trí hiện tại...", 0.5);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newPos = [lat, lng];
          setMapPosition(newPos);
          form.setFieldsValue({ latitude: lat, longitude: lng });
          message.success(`✅ Đã lấy vị trí: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        },
        (error) => {
          console.error("Geolocation error:", error);
          message.error("❌ Không thể lấy vị trí. Hãy kiểm tra quyền GPS.");
        }
      );
    } else {
      message.error("❌ Trình duyệt không hỗ trợ Geolocation.");
    }
  };

  // 🧭 Xử lý Submit form
  const handleSubmit = async (values) => {
    try {
      // Yup validation schema for station registration
      const stationSchema = yup.object({
        station_name: yup
          .string()
          .required("Vui lòng nhập tên trạm!")
          .min(5, "Tên trạm phải có ít nhất 5 ký tự!"),
        address: yup
          .string()
          .required("Vui lòng nhập địa chỉ!")
          .min(10, "Địa chỉ phải có ít nhất 10 ký tự!"),
        latitude: yup
          .number()
          .required("Vui lòng chọn vị trí!")
          .typeError("Vĩ độ phải là số!")
          .min(-90, "Vĩ độ phải từ -90 đến 90!")
          .max(90, "Vĩ độ phải từ -90 đến 90!"),
        longitude: yup
          .number()
          .required("Vui lòng chọn vị trí!")
          .typeError("Kinh độ phải là số!")
          .min(-180, "Kinh độ phải từ -180 đến 180!")
          .max(180, "Kinh độ phải từ -180 đến 180!"),
        capacity: yup
          .number()
          .required("Vui lòng nhập sức chứa!")
          .typeError("Sức chứa phải là số!")
          .min(1, "Sức chứa phải lớn hơn 0!")
          .max(1000, "Sức chứa không được vượt quá 1000!"),
        description: yup
          .string()
          .min(0, "Mô tả không hợp lệ"),
      });

      // Validate before submission
      try {
        await stationSchema.validate(values, { abortEarly: false });
      } catch (err) {
        if (err.name === "ValidationError") {
          const errorMessages = err.inner.map(e => e.message).join("; ");
          message.error(errorMessages);
          return;
        }
      }

      setLoading(true);
      console.log("📤 Submitting station data:", values);

      const openingTime = values.opening_time?.format("HH:mm") || "";
      const closingTime = values.closing_time?.format("HH:mm") || "";
      const operatingHours = `${openingTime} - ${closingTime}`;

      const stationData = {
        stationName: values.station_name,
        address: values.address,
        latitude: values.latitude,
        longitude: values.longitude,
        capacity: values.capacity,
        description: values.description || "",
        status: "Active",
      };

      console.log("📦 Formatted data:", stationData);

      const result = await create(stationData);
      console.log("✅ Station created:", result);

      Modal.success({
        title: "🎉 Đăng ký trạm thành công!",
        content: (
          <div>
            <p>
              Trạm <strong>{values.station_name}</strong> đã được thêm vào hệ thống.
            </p>
            <p className="text-gray-600 text-sm">
              Dữ liệu đã được gửi tới backend để xử lý.
            </p>
          </div>
        ),
        okText: "Quay về trang chủ",
        onOk: () => navigate("/"),
      });

      message.success(`✅ Đã tạo trạm: ${values.station_name}`);
      form.resetFields();
      setMapPosition([10.7756, 106.7004]);
    } catch (error) {
      console.error("❌ Error creating station:", error);
      let errorMessage = "Không thể tạo trạm. Vui lòng thử lại.";

      if (error.message?.includes("Network")) {
        errorMessage = "Lỗi kết nối mạng. Hãy kiểm tra Internet.";
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

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🏢 Đăng Ký Trạm Sạc Mới
          </h1>
          <p className="text-gray-600 text-lg">
            Vui lòng điền đầy đủ thông tin trạm sạc
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-2xl rounded-3xl border-2 border-purple-100">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ capacity: 10 }}
            className="space-y-4"
          >
            {/* Tên trạm */}
            <Form.Item
              label={
                <span className="text-base font-semibold">
                  <EnvironmentOutlined className="mr-2 text-purple-600" /> Tên Trạm Sạc
                </span>
              }
              name="station_name"
              rules={[
                { required: true, message: "Vui lòng nhập tên trạm!" },
                { min: 5, message: "Tên trạm phải có ít nhất 5 ký tự!" },
              ]}
            >
              <Input
                size="large"
                placeholder="VD: Trạm Sạc Quận 1 - Nguyễn Huệ"
                className="rounded-xl"
              />
            </Form.Item>

            {/* Địa chỉ */}
            <Form.Item
              label={
                <span className="text-base font-semibold">
                  <EnvironmentOutlined className="mr-2 text-blue-600" /> Địa Chỉ
                </span>
              }
              name="address"
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ!" },
                { min: 10, message: "Địa chỉ phải có ít nhất 10 ký tự!" },
              ]}
            >
              <Input
                size="large"
                placeholder="VD: 123 Nguyễn Huệ, Q1, TP.HCM"
                className="rounded-xl"
              />
            </Form.Item>

            {/* Map */}
            <Form.Item
              label={
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">
                    <AimOutlined className="mr-2 text-green-600" /> Chọn Vị Trí Trên Bản Đồ
                  </span>
                  <Button
                    type="primary"
                    icon={<AimOutlined />}
                    onClick={handleGetCurrentLocation}
                    size="small"
                    className="bg-gradient-to-r from-green-500 to-cyan-500"
                  >
                    Vị trí hiện tại
                  </Button>
                </div>
              }
            >
              <Card className="border-2 border-purple-200 rounded-2xl overflow-hidden">
                <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                  <p className="text-sm text-gray-700">
                    📍 Click vào bản đồ để chọn vị trí hoặc nhấn “Vị trí hiện tại”
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Tọa độ hiện tại:{" "}
                    <strong>{mapPosition[0].toFixed(6)}</strong>,{" "}
                    <strong>{mapPosition[1].toFixed(6)}</strong>
                  </p>
                </div>

                <MapContainer
                  center={mapPosition}
                  zoom={13}
                  style={{ height: "400px", width: "100%", borderRadius: "12px" }}
                  key={mapPosition.join(",")}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={mapPosition} setPosition={setMapPosition} form={form} />
                </MapContainer>
              </Card>
            </Form.Item>

            {/* Latitude & Longitude */}
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Vĩ Độ (Latitude)"
                name="latitude"
                rules={[{ required: true, message: "Vui lòng chọn vị trí!" }]}
              >
                <InputNumber
                  size="large"
                  placeholder="10.775600"
                  className="w-full rounded-xl"
                  disabled
                  step={0.000001}
                />
              </Form.Item>

              <Form.Item
                label="Kinh Độ (Longitude)"
                name="longitude"
                rules={[{ required: true, message: "Vui lòng chọn vị trí!" }]}
              >
                <InputNumber
                  size="large"
                  placeholder="106.700400"
                  className="w-full rounded-xl"
                  disabled
                  step={0.000001}
                />
              </Form.Item>
            </div>

            {/* Giờ mở/đóng */}
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Giờ Mở Cửa" name="opening_time">
                <TimePicker
                  size="large"
                  format="HH:mm"
                  placeholder="Chọn giờ mở cửa"
                  className="w-full rounded-xl"
                />
              </Form.Item>
              <Form.Item label="Giờ Đóng Cửa" name="closing_time">
                <TimePicker
                  size="large"
                  format="HH:mm"
                  placeholder="Chọn giờ đóng cửa"
                  className="w-full rounded-xl"
                />
              </Form.Item>
            </div>

            {/* Sức chứa */}
            <Form.Item
              label="🚗 Sức Chứa (Số xe)"
              name="capacity"
              rules={[
                { required: true, message: "Vui lòng nhập sức chứa!" },
                { type: "number", min: 1, message: "Phải lớn hơn 0!" },
              ]}
            >
              <InputNumber
                size="large"
                placeholder="10"
                className="w-full rounded-xl"
                min={1}
                max={1000}
              />
            </Form.Item>

            {/* Mô tả */}
            <Form.Item label="📝 Mô Tả (Tùy chọn)" name="description">
              <TextArea
                rows={4}
                placeholder="Mô tả chi tiết về trạm sạc, tiện ích, ghi chú..."
                className="rounded-xl"
              />
            </Form.Item>

            {/* Submit */}
            <Form.Item className="mb-0 mt-8">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
              >
                {loading ? "⏳ Đang xử lý..." : "🚀 Đăng Ký Trạm Sạc"}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default StationRegistrationPage;
