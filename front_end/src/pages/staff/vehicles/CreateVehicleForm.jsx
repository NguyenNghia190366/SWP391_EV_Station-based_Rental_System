import React, { useState, useEffect } from "react";
import { Form, Input, Select, InputNumber, Button, Checkbox, message, Spin } from "antd";
import { useVehicleAPI } from "@/hooks/useVehicles";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";

const CreateVehicleForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { createVehicle, getAllModels } = useVehicleAPI();
  const api = useAxiosInstance();
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [stations, setStations] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  // Fetch vehicle models and stations on mount
  useEffect(() => {
    const fetchData = async () => {
      setModelsLoading(true);
      try {
        // Fetch models
        const modelsData = await getAllModels();
        const modelsList = Array.isArray(modelsData) ? modelsData : modelsData?.data || [];
        setModels(modelsList);

        // Fetch stations
        const stationsRes = await api.get("/Stations");
        const stationsList = Array.isArray(stationsRes.data) ? stationsRes.data : stationsRes.data?.data || [];
        setStations(stationsList);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Không thể tải dữ liệu mô hình xe hoặc trạm");
      } finally {
        setModelsLoading(false);
      }
    };

    fetchData();
  }, [getAllModels, api]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Build payload object explicitly (preview & send)
      const selectedModel = models.find(m => (m.vehicleModelId || m.id) === values.vehicleModelId);
      const modelName = selectedModel ? `${selectedModel.brandName || selectedModel.brand || ""} ${selectedModel.model || selectedModel.model_name || ""}`.trim() : "";

      const payload = {
        model: modelName || values.model || "",
        licensePlate: values.licensePlate,
        vehicleModelId: values.vehicleModelId,
        releaseYear: values.releaseYear || new Date().getFullYear(),
        batteryCapacity: values.batteryCapacity || 50,
        currentMileage: values.currentMileage || 0,
        imgCarUrl: values.imgCarUrl || "",
        condition: values.condition || "GOOD",
        isAvailable: values.isAvailable !== false,
        stationId: values.stationId || null,
        createdAt: new Date().toISOString(),
      };

      // Log the object locally (saved as JS object) before sending
      console.log("Creating vehicle payload:", payload);

      const result = await createVehicle(payload);
      message.success("Xe được tạo thành công!");
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      // Log detailed axios response if available
      console.error("Error creating vehicle:", error);
      if (error?.response) {
        console.error("Create vehicle response data:", error.response.data);
        message.error(error.response.data?.message || JSON.stringify(error.response.data) || "Không thể tạo xe. Vui lòng thử lại.");
      } else {
        message.error(error.message || "Không thể tạo xe. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const conditionOptions = [
    { label: "Tốt (Good)", value: "GOOD" },
    { label: "Trung bình (Fair)", value: "FAIR" },
    { label: "Kém (Poor)", value: "POOR" },
  ];

  return (
    <Spin spinning={modelsLoading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="pt-4"
      >
        {/* License Plate */}
        <Form.Item
          name="licensePlate"
          label="Biển số xe"
          rules={[
            { required: true, message: "Vui lòng nhập biển số xe" },
            { min: 3, message: "Biển số xe phải có ít nhất 3 ký tự" },
          ]}
        >
          <Input 
            placeholder="VD: 51K-123456" 
            size="large"
            disabled={loading}
          />
        </Form.Item>

        {/* Vehicle Model */}
        <Form.Item
          name="vehicleModelId"
          label="Mô hình xe"
          rules={[{ required: true, message: "Vui lòng chọn mô hình xe" }]}
        >
          <Select 
            placeholder="Chọn mô hình xe"
            size="large"
            disabled={loading || modelsLoading}
          >
            {models.map((model) => (
              <Select.Option key={model.vehicleModelId || model.id} value={model.vehicleModelId || model.id}>
                {model.brandName} {model.model}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Station */}
        <Form.Item
          name="stationId"
          label="Trạm"
        >
          <Select 
            placeholder="Chọn trạm (tùy chọn)"
            size="large"
            disabled={loading}
            allowClear
          >
            {stations.map((station) => (
              <Select.Option key={station.stationId || station.id} value={station.stationId || station.id}>
                {station.stationName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Release Year */}
        <Form.Item
          name="releaseYear"
          label="Năm sản xuất"
        >
          <InputNumber 
            min={1900}
            max={new Date().getFullYear() + 1}
            placeholder={new Date().getFullYear()}
            size="large"
            disabled={loading}
            className="w-full"
          />
        </Form.Item>

        {/* Battery Capacity */}
        <Form.Item
          name="batteryCapacity"
          label="Dung lượng pin (kWh)"
        >
          <InputNumber 
            min={0}
            max={200}
            placeholder="50"
            size="large"
            disabled={loading}
            className="w-full"
          />
        </Form.Item>

        {/* Current Mileage */}
        <Form.Item
          name="currentMileage"
          label="Quãng đường hiện tại (km)"
        >
          <InputNumber 
            min={0}
            placeholder="0"
            size="large"
            disabled={loading}
            className="w-full"
          />
        </Form.Item>

        {/* Image URL */}
        <Form.Item
          name="imgCarUrl"
          label="URL ảnh xe"
        >
          <Input 
            placeholder="https://example.com/image.jpg"
            size="large"
            disabled={loading}
          />
        </Form.Item>

        {/* Condition */}
        <Form.Item
          name="condition"
          label="Tình trạng"
          initialValue="GOOD"
        >
          <Select 
            options={conditionOptions}
            size="large"
            disabled={loading}
          />
        </Form.Item>

        {/* Is Available */}
        <Form.Item
          name="isAvailable"
          valuePropName="checked"
          initialValue={true}
        >
          <Checkbox disabled={loading}>Xe có sẵn cho thuê</Checkbox>
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            size="large"
            loading={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? "Đang tạo..." : "Tạo xe"}
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default CreateVehicleForm;
