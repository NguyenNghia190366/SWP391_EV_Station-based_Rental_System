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
  AutoComplete,
  Spin,
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

// 📍 Map location selector component
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
        `📍 Location selected: ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`
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

  // 🎯 Get current position via GPS
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      message.loading("🌍 Getting current location...", 0.5);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newPos = [lat, lng];
          setMapPosition(newPos);
          form.setFieldsValue({ latitude: lat, longitude: lng });
          message.success(`✅ Location obtained: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        },
        (error) => {
          console.error("Geolocation error:", error);
          message.error("❌ Cannot get location. Check GPS permissions.");
        }
      );
    } else {
      message.error("❌ Browser does not support Geolocation.");
    }
  };

  // 🧭 Handle form submit
  const handleSubmit = async (values) => {
    try {
      // Yup validation schema for station registration
      const stationSchema = yup.object({
        station_name: yup
          .string()
          .required("Please enter station name!")
          .min(5, "Station name must be at least 5 characters!"),
        address: yup
          .string()
          .required("Please enter address!")
          .min(10, "Address must be at least 10 characters!"),
        latitude: yup
          .number()
          .required("Please select location!")
          .typeError("Latitude must be a number!")
          .min(-90, "Latitude must be between -90 and 90!")
          .max(90, "Latitude must be between -90 and 90!"),
        longitude: yup
          .number()
          .required("Please select location!")
          .typeError("Longitude must be a number!")
          .min(-180, "Longitude must be between -180 and 180!")
          .max(180, "Longitude must be between -180 and 180!"),
        capacity: yup
          .number()
          .required("Please enter capacity!")
          .typeError("Capacity must be a number!")
          .min(1, "Capacity must be greater than 0!")
          .max(1000, "Capacity must not exceed 1000!"),
        description: yup
          .string()
          .min(0, "Invalid description"),
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
        title: "🎉 Station registered successfully!",
        content: (
          <div>
            <p>
              Station <strong>{values.station_name}</strong> has been added to the system.
            </p>
            <p className="text-gray-600 text-sm">
              Data has been submitted to the backend for processing.
            </p>
          </div>
        ),
        okText: "Back to home",
        onOk: () => navigate("/"),
      });

      message.success(`✅ Station created: ${values.station_name}`);
      form.resetFields();
      setMapPosition([10.7756, 106.7004]);
    } catch (error) {
      console.error("❌ Error creating station:", error);
      let errorMessage = "Cannot create station. Please try again.";

      if (error.message?.includes("Network")) {
        errorMessage = "Network error. Please check your Internet connection.";
      } else if (error.message?.includes("duplicate")) {
        errorMessage = "This station already exists in the system.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Modal.error({
        title: "Registration failed",
        content: errorMessage,
        okText: "Retry",
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
            🏢 Register New Charging Station
          </h1>
          <p className="text-gray-600 text-lg">
            Please fill in the charging station information
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
            {/* Station name */}
            <Form.Item
              label={
                <span className="text-base font-semibold">
                  <EnvironmentOutlined className="mr-2 text-purple-600" /> Charging Station Name
                </span>
              }
              name="station_name"
              rules={[
                { required: true, message: "Please enter station name!" },
                { min: 5, message: "Station name must be at least 5 characters!" },
              ]}
            >
              <Input
                size="large"
                placeholder="e.g., District 1 Charging Station - Nguyen Hue"
                className="rounded-xl"
              />
            </Form.Item>

            {/* Address */}
            <Form.Item
              label={
                <span className="text-base font-semibold">
                  <EnvironmentOutlined className="mr-2 text-blue-600" /> Address
                </span>
              }
              name="address"
              rules={[
                { required: true, message: "Please enter address!" },
                { min: 10, message: "Address must be at least 10 characters!" },
              ]}
            >
              <Input
                size="large"
                placeholder="e.g., 123 Nguyen Hue, District 1, Ho Chi Minh City"
                className="rounded-xl"
              />
            </Form.Item>

            {/* Map */}
            <Form.Item
              label={
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">
                    <AimOutlined className="mr-2 text-green-600" /> Select Location on Map
                  </span>
                  <Button
                    type="primary"
                    icon={<AimOutlined />}
                    onClick={handleGetCurrentLocation}
                    size="small"
                    className="bg-gradient-to-r from-green-500 to-cyan-500"
                  >
                    Current location
                  </Button>
                </div>
              }
            >
              <Card className="border-2 border-purple-200 rounded-2xl overflow-hidden">
                <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                  <p className="text-sm text-gray-700">
                    📍 Click on the map to choose a location or press 'Current location'
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Current coordinates:{" "}
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
                label="Latitude"
                name="latitude"
                rules={[{ required: true, message: "Please select location!" }]}
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
                label="Longitude"
                name="longitude"
                rules={[{ required: true, message: "Please select location!" }]}
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

            {/* Opening/Closing time */}
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Opening Time" name="opening_time">
                <TimePicker
                  size="large"
                  format="HH:mm"
                  placeholder="Select opening time"
                  className="w-full rounded-xl"
                />
              </Form.Item>
              <Form.Item label="Closing Time" name="closing_time">
                <TimePicker
                  size="large"
                  format="HH:mm"
                  placeholder="Select closing time"
                  className="w-full rounded-xl"
                />
              </Form.Item>
            </div>

            {/* Capacity (number of vehicles) */}
            <Form.Item
              label="🚗 Capacity (Number of vehicles)"
              name="capacity"
              rules={[
                { required: true, message: "Please enter capacity!" },
                { type: "number", min: 1, message: "Must be greater than 0!" },
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

            {/* Description */}
            <Form.Item label="📝 Description (Optional)" name="description">
              <TextArea
                rows={4}
                placeholder="Detailed description of the charging station, amenities, notes..."
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
                {loading ? "⏳ Processing..." : "🚀 Register Charging Station"}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default StationRegistrationPage;
