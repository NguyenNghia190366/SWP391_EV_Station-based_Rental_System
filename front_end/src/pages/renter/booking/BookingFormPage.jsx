import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, DatePicker, message, Spin, Select } from "antd";
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
        setVehicle(vehicleData);

        if (vehicleData.vehicleModelId) {
          const modelData = await getModelById(vehicleData.vehicleModelId);
          setPrice(modelData.price_per_hour);
        } else {
          setPrice("N/A");
        }
      } catch (err) {
        console.error("❌ Lỗi khi lấy dữ liệu xe:", err);
        message.error("Không thể tải thông tin xe!");
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
        console.error("❌ Lỗi khi lấy danh sách trạm:", err);
        message.warning("Không thể tải danh sách trạm");
      }
    };
    fetchStations();
  }, []);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Validation
      if (!values.startDate || !values.endDate) {
        toast.error("❌ Vui lòng chọn ngày bắt đầu và kết thúc!", {
          position: "top-right",
          autoClose: 3000,
        });
        setLoading(false);
        return;
      }

      if (!values.pickupStation || !values.returnStation) {
        toast.error("❌ Vui lòng chọn trạm đặt và trạm trả xe!", {
          position: "top-right",
          autoClose: 3000,
        });
        setLoading(false);
        return;
      }

      const renterId =
        localStorage.getItem("renter_Id") ||
        localStorage.getItem("renter_id") ||
        localStorage.getItem("renterId");

      if (!renterId) {
        toast.error("❌ Không tìm thấy thông tin người thuê!", {
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
      
      toast.success("✅ Đã gửi yêu cầu đặt xe thành công!", {
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
      toast.error("❌ Không thể tạo đơn thuê. Vui lòng thử lại!", {
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
        <Spin size="large" tip="Đang tải dữ liệu..." />
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
            Đặt xe điện nhanh chóng ⚡
          </h1>
          <p className="text-gray-600 text-lg">
            Điền thông tin chi tiết để hoàn tất yêu cầu thuê xe
          </p>
        </div>

        {/* ✅ Vehicle Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-5">Thông tin xe</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Tên xe</p>
              <p className="font-bold text-gray-900 text-lg">
                {vehicle.vehicleName || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Biển số</p>
              <p className="font-bold text-gray-900 text-lg">
                {vehicle.licensePlate || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Hãng</p>
              <p className="font-bold text-gray-900 text-lg">
                {vehicle.brand || vehicle.brandName || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Giá thuê / giờ</p>
              <p className="font-bold text-green-600 text-lg">
                {price ? `${price.toLocaleString("vi-VN")}₫` : "Đang tải..."}
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
            label={<span className="font-medium text-gray-700 text-base">Ngày bắt đầu</span>}
            name="startDate"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker
              className="w-full text-lg"
              size="large"
              disabledDate={(current) => current && current < dayjs().startOf("day")}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700 text-base">Ngày kết thúc</span>}
            name="endDate"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
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
            label={<span className="font-medium text-gray-700 text-base">Trạm đặt xe</span>}
            name="pickupStation"
            rules={[{ required: true, message: "Vui lòng chọn trạm đặt xe" }]}
          >
            <Select
              placeholder="Chọn trạm đặt xe"
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
            label={<span className="font-medium text-gray-700 text-base">Trạm trả xe</span>}
            name="returnStation"
            rules={[{ required: true, message: "Vui lòng chọn trạm trả xe" }]}
          >
            <Select
              placeholder="Chọn trạm trả xe"
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
            label={<span className="font-medium text-gray-700 text-base">Yêu cầu đặc biệt</span>}
            name="specialRequests"
            className="md:col-span-2"
          >
            <Input.TextArea
              placeholder="Nhập yêu cầu đặc biệt (nếu có)"
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
              Gửi yêu cầu đặt xe
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
            Quay lại danh sách xe
          </Button>
        </div>
      </Card>
    </div>
  );
}
