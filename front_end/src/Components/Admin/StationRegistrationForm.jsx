import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  InputNumber,
  message,
  Card,
  TimePicker,
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

// 🗺️ Fix Leaflet default marker icon issue
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

// 📍 Component để handle click events trên map
const LocationMarker = ({ position, setPosition, form }) => {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      // Cập nhật form fields
      form.setFieldsValue({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
      message.success(
        `📍 Đã chọn vị trí: ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(
          6
        )}`
      );
    },
  });

  return position ? <Marker position={position} /> : null;
};

const StationRegistrationForm = ({ onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [mapPosition, setMapPosition] = useState([10.7756, 106.7004]); // Default: Saigon center

  // 🎯 Lấy vị trí hiện tại từ browser geolocation
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
          message.success(
            `✅ Đã lấy vị trí: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
          );
        },
        (error) => {
          console.error("Geolocation error:", error);
          message.error(
            "❌ Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập GPS."
          );
        }
      );
    } else {
      message.error("❌ Trình duyệt không hỗ trợ Geolocation.");
    }
  };

  const handleSubmit = async (values) => {
    try {
      await onSubmit(values);
      form.resetFields();
      setMapPosition([10.7756, 106.7004]); // Reset map
    } catch (error) {
      // Error đã được xử lý ở Container
      console.error("Form submit error:", error);
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
            initialValues={{
              capacity: 10,
            }}
            className="space-y-4"
          >
            {/* Tên trạm */}
            <Form.Item
              label={
                <span className="text-base font-semibold">
                  <EnvironmentOutlined className="mr-2 text-purple-600" />
                  Tên Trạm Sạc
                </span>
              }
              name="station_name"
              rules={[
                { required: true, message: "Vui lòng nhập tên trạm!" },
                {
                  min: 5,
                  message: "Tên trạm phải có ít nhất 5 ký tự!",
                },
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
                  <EnvironmentOutlined className="mr-2 text-blue-600" />
                  Địa Chỉ
                </span>
              }
              name="address"
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ!" },
                {
                  min: 10,
                  message: "Địa chỉ phải có ít nhất 10 ký tự!",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="VD: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM"
                className="rounded-xl"
              />
            </Form.Item>

            {/* Map với Chọn vị trí */}
            <Form.Item
              label={
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">
                    <AimOutlined className="mr-2 text-green-600" />
                    Chọn Vị Trí Trên Bản Đồ
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
                    📍 <strong>Cách sử dụng:</strong> Click vào bản đồ để chọn
                    vị trí trạm sạc, hoặc nhấn "Vị trí hiện tại"
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Tọa độ hiện tại: <strong>{mapPosition[0].toFixed(6)}</strong>,{" "}
                    <strong>{mapPosition[1].toFixed(6)}</strong>
                  </p>
                </div>

                <MapContainer
                  center={mapPosition}
                  zoom={13}
                  style={{ height: "400px", width: "100%", borderRadius: "12px" }}
                  key={mapPosition.join(",")} // Force re-render khi position thay đổi
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker
                    position={mapPosition}
                    setPosition={setMapPosition}
                    form={form}
                  />
                </MapContainer>
              </Card>
            </Form.Item>

            {/* Kinh độ & Vĩ độ (Disabled - auto-filled từ map) */}
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={
                  <span className="text-base font-semibold">Vĩ Độ (Latitude)</span>
                }
                name="latitude"
                rules={[
                  { required: true, message: "Vui lòng chọn vị trí trên bản đồ!" },
                ]}
              >
                <InputNumber
                  size="large"
                  placeholder="10.775600"
                  className="w-full rounded-xl"
                  disabled
                  step={0.000001}
                  precision={6}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-base font-semibold">
                    Kinh Độ (Longitude)
                  </span>
                }
                name="longitude"
                rules={[
                  { required: true, message: "Vui lòng chọn vị trí trên bản đồ!" },
                ]}
              >
                <InputNumber
                  size="large"
                  placeholder="106.700400"
                  className="w-full rounded-xl"
                  disabled
                  step={0.000001}
                  precision={6}
                />
              </Form.Item>
            </div>

            {/* Số điện thoại & Tên quản lý */}
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={
                  <span className="text-base font-semibold">
                    <PhoneOutlined className="mr-2 text-green-600" />
                    Số Điện Thoại
                  </span>
                }
                name="phone_number"
                rules={[
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại phải có 10-11 chữ số!",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="0901234567"
                  className="rounded-xl"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-base font-semibold">
                    <UserOutlined className="mr-2 text-orange-600" />
                    Tên Quản Lý
                  </span>
                }
                name="manager_name"
                rules={[
                  {
                    min: 3,
                    message: "Tên quản lý phải có ít nhất 3 ký tự!",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="VD: Nguyễn Văn A"
                  className="rounded-xl"
                />
              </Form.Item>
            </div>

            {/* Giờ mở cửa & đóng cửa */}
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={
                  <span className="text-base font-semibold">
                    <ClockCircleOutlined className="mr-2 text-blue-600" />
                    Giờ Mở Cửa
                  </span>
                }
                name="opening_time"
              >
                <TimePicker
                  size="large"
                  format="HH:mm"
                  placeholder="Chọn giờ mở cửa"
                  className="w-full rounded-xl"
                  suffixIcon={<ClockCircleOutlined />}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-base font-semibold">
                    <ClockCircleOutlined className="mr-2 text-red-600" />
                    Giờ Đóng Cửa
                  </span>
                }
                name="closing_time"
              >
                <TimePicker
                  size="large"
                  format="HH:mm"
                  placeholder="Chọn giờ đóng cửa"
                  className="w-full rounded-xl"
                  suffixIcon={<ClockCircleOutlined />}
                />
              </Form.Item>
            </div>

            {/* Sức chứa */}
            <Form.Item
              label={
                <span className="text-base font-semibold">
                  🚗 Sức Chứa (Số xe)
                </span>
              }
              name="capacity"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập sức chứa!",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Sức chứa phải lớn hơn 0!",
                },
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

            {/* Mô tả (Optional) */}
            <Form.Item
              label={
                <span className="text-base font-semibold">
                  📝 Mô Tả (Tùy chọn)
                </span>
              }
              name="description"
            >
              <TextArea
                rows={4}
                placeholder="Mô tả chi tiết về trạm sạc, tiện ích, ghi chú đặc biệt..."
                className="rounded-xl"
              />
            </Form.Item>

            {/* Submit Button */}
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

export default StationRegistrationForm;
