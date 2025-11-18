import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, DatePicker, message, Spin, Select } from "antd";
import * as yup from 'yup';
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useVehicleAPI } from "@/hooks/useVehicles";
import { useRentalOrders } from "@/hooks/useRentalOrders";
import { useStations } from "@/hooks/useStations";

export default function BookingFormPage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [price, setPrice] = useState(null);
  const [stations, setStations] = useState([]); 
  const { createRentalOrder } = useRentalOrders();
  const { getById, getModelById } = useVehicleAPI();
  const { getAll: getAllStations } = useStations();

  // 🔹 Fetch vehicle + model price
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setLoading(true);
        const vehicleData = await getById(vehicleId);
        // Attach the raw vehicle data first
        setVehicle(vehicleData);

        // If the vehicle references a vehicle model, fetch it to obtain brand and price
        if (vehicleData.vehicleModelId) {
          const modelData = await getModelById(vehicleData.vehicleModelId);
          setPrice(modelData.price_per_hour);

          // Prefer brand name from the vehicle model, and build a display name using brand + vehicle.model
          const brandName = modelData?.brandName || vehicleData?.brand || "";
          const modelText = vehicleData?.model || "";
          const composedName = `${brandName} ${modelText}`.trim();

          // Update the vehicle object so the UI can use vehicle.vehicleName and vehicle.brandName
          setVehicle((prev) => ({
            ...prev,
            brandName: brandName || prev?.brandName || prev?.brand,
            vehicleName: composedName || prev?.vehicleName || prev?.licensePlate || "",
          }));
        } else {
          setPrice("N/A");
        }
      } catch (err) {
        console.error("❌ Error fetching vehicle data:", err);
        message.error("Unable to load vehicle information!");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicleData();
  }, [vehicleId, getById, getModelById]);

  // 🔹 Fetch stations list
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const stationsData = await getAllStations();
        const stationsList = Array.isArray(stationsData) 
          ? stationsData 
          : stationsData?.data || [];
        
        console.log("📍 Stations fetched:", stationsList);
        setStations(stationsList);
      } catch (err) {
        console.error("❌ Error fetching station list:", err);
        message.warning("Unable to load station list");
      }
    };
    fetchStations();
  }, []);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Yup validation schema
      const schema = yup.object({
        startDate: yup.mixed().required('Please select start date').test('is-date', 'Invalid start date', value => !!value && (value.isValid ? value.isValid() : !isNaN(new Date(value).getTime()))),
        endDate: yup.mixed().required('Please select end date').test('is-date', 'Invalid end date', value => !!value && (value.isValid ? value.isValid() : !isNaN(new Date(value).getTime()))),
        pickupStation: yup.string().required('Please select pickup station'),
        returnStation: yup.string().required('Please select return station').notOneOf([yup.ref('pickupStation')], 'Return station must be different from pickup station'),
      }).test('date-order', 'End date must be after start date', function(value) {
        const { startDate, endDate } = value || {};
        if (!startDate || !endDate) return true; // handled by required
        const s = startDate.isValid ? startDate : dayjs(startDate);
        const e = endDate.isValid ? endDate : dayjs(endDate);
        return e.isAfter(s);
      });

      try {
        await schema.validate(values, { abortEarly: false });
      } catch (validationErr) {
        if (validationErr.name === 'ValidationError') {
          const fields = validationErr.inner.map(e => ({ name: e.path, errors: [e.message] }));
          form.setFields(fields);
          setLoading(false);
          return;
        }
      }

      const renterId =
        localStorage.getItem("renter_Id") ||
        localStorage.getItem("renter_id") ||
        localStorage.getItem("renterId");

      if (!renterId) {
        toast.error("❌ Renter information not found!", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/login");
        return;
      }

      const orderData = {
        renterId: parseInt(renterId, 10),
        vehicleId: parseInt(vehicleId, 10),
        pickupStationId: parseInt(values.pickupStation, 10),
        returnStationId: parseInt(values.returnStation, 10),
        startTime: values.startDate.toISOString(),
        endTime: values.endDate.toISOString(),
      };

      console.log("📦 Sending orderData:", JSON.stringify(orderData, null, 2));
      const res = await createRentalOrder(orderData);
      
      toast.success("✅ Booking request submitted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      console.log("📥 Response:", res);

      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (error) {
      console.error("❌ Booking error:", error);
      toast.error("❌ Unable to create rental order. Please try again!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spin size="large" tip="Loading data..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Card
        className="w-full max-w-6xl shadow-2xl rounded-2xl bg-white border border-gray-100"
        bodyStyle={{ padding: "48px" }}
      >
        <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Quick EV Booking ⚡
          </h1>
          <p className="text-gray-600 text-lg">
            Fill in the details to complete your booking request
          </p>
        </div>

        {/* ✅ Vehicle Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-5">Vehicle information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Vehicle name</p>
              <p className="font-bold text-gray-900 text-lg">
                {vehicle.vehicleName || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">License plate</p>
              <p className="font-bold text-gray-900 text-lg">
                {vehicle.licensePlate || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Brand</p>
              <p className="font-bold text-gray-900 text-lg">
                {vehicle.brand || vehicle.brandName || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rental price / hr</p>
              <p className="font-bold text-green-600 text-lg">
                {price ? `${price.toLocaleString("vi-VN")}₫` : "Loading..."}
              </p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <Form.Item
            label={<span className="font-medium text-gray-700 text-base">Start Date</span>}
            name="startDate"
            rules={[{ required: true, message: "Please select a start date" }]}
          >
            <DatePicker
              className="w-full text-lg"
              size="large"
              disabledDate={(current) => current && current < dayjs().startOf("day")}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700 text-base">End Date</span>}
            name="endDate"
            rules={[{ required: true, message: "Please select an end date" }]}
          >
            <DatePicker
              className="w-full text-lg"
              size="large"
              disabledDate={(current) => {
                const startDate = form.getFieldValue("startDate");
                return current && (!startDate || current <= startDate);
              }}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700 text-base">Pickup Station</span>}
            name="pickupStation"
            rules={[{ required: true, message: "Please select a pickup station" }]}
          >
            <Select
                placeholder="Select pickup station"
              size="large"
              options={stations.map((station) => {
                const stationId = station.id || station.station_id || station.stationId;
                const stationName = station.name || station.station_name || station.stationName;
                const stationAddress = station.address || station.street || "";
                return {
                  value: String(stationId),
                  label: `${stationName} - ${stationAddress}`,
                };
              })}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700 text-base">Return Station</span>}
            name="returnStation"
            rules={[{ required: true, message: "Please select a return station" }]}
          >
            <Select
                placeholder="Select return station"
              size="large"
              options={stations.map((station) => {
                const stationId = station.id || station.station_id || station.stationId;
                const stationName = station.name || station.station_name || station.stationName;
                const stationAddress = station.address || station.street || "";
                return {
                  value: String(stationId),
                  label: `${stationName} - ${stationAddress}`,
                };
              })}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700 text-base">Special requests</span>}
            name="specialRequests"
            className="md:col-span-2"
          >
            <Input.TextArea
              placeholder="Enter special requests (optional)"
              rows={4}
              className="text-lg"
            />
          </Form.Item>

          <Form.Item className="md:col-span-2">
              <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md"
            >
              Submit booking request
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-4">
          <Button
            type="default"
            size="large"
            className="w-full h-14 rounded-xl text-base font-medium border-gray-300 hover:bg-gray-100"
            onClick={() => navigate("/vehicles")}
            disabled={loading}
          >
            Back to vehicle list
          </Button>
        </div>
      </Card>
    </div>
  );
}
