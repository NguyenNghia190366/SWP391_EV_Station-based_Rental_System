import React, { useEffect, useState } from "react";
import { Card, Table, Tag, Spin, Empty, message, Badge, Select } from "antd";
import dayjs from "dayjs";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import { CarOutlined } from "@ant-design/icons";

export default function VehicleStatus() {
  const instance = useAxiosInstance();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, stationsRes, modelsRes] = await Promise.all([
        instance.get("/Vehicles"),
        instance.get("/Stations"),
        instance.get("/VehicleModels"),
      ]);

      const vehicles = Array.isArray(vehiclesRes.data)
        ? vehiclesRes.data
        : vehiclesRes.data?.data || [];

      const stations = Array.isArray(stationsRes.data)
        ? stationsRes.data
        : stationsRes.data?.data || [];

      const models = Array.isArray(modelsRes.data)
        ? modelsRes.data
        : modelsRes.data?.data || [];

      // Build a map for fast model lookups and create vehicleName = brandName + model
      const modelMap = new Map();
      models.forEach((m) => {
        const id = m.vehicleModelId ?? m.modelId ?? m.id;
        if (id !== undefined && id !== null) modelMap.set(Number(id), m);
      });

      const merged = vehicles.map((vehicle) => {
        // modelKey links to VehicleModel table
        const modelKey =
          vehicle.vehicleModelId ?? vehicle.modelId ?? vehicle.vehicle_model_id ?? vehicle.model_id;
        const modelRecord = modelMap.get(Number(modelKey));

        // The actual 'model' display string comes from the Vehicles table per your DB
        const modelTextFromVehicle = vehicle.model ?? vehicle.modelName ?? vehicle.model_name ?? "";

        const brandName = modelRecord?.brandName ?? modelRecord?.brand ?? "";

        // Build display name: prefer brandName from VehicleModel + model text from Vehicles
        const vehicleName =
          vehicle.vehicleName || (brandName || modelTextFromVehicle
            ? `${brandName} ${modelTextFromVehicle}`.trim()
            : `#${modelKey ?? vehicle.vehicleId ?? vehicle.vehicle_id}`);

        return {
          ...vehicle,
          vehicleName,
          stationName: stations.find((s) => s.stationId === vehicle.stationId)?.stationName || `#${vehicle.stationId}`,
        };
      });

      setVehicles(merged);
    } catch (err) {
      console.error("❌ Error loading vehicle list:", err);
      message.error("Cannot load the vehicle list!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Filter vehicles by status
  const filteredVehicles =
    statusFilter === "all"
      ? vehicles
      : vehicles.filter((v) => v.status === statusFilter);

  const statusMap = {
    AVAILABLE: { color: "green", text: "Available", icon: "✅" },
    IN_USE: { color: "orange", text: "In Use", icon: "🚗" },
    MAINTENANCE: { color: "red", text: "Maintenance", icon: "🔧" },
    RESERVED: { color: "blue", text: "Reserved", icon: "📌" },
  };

  const columns = [
    {
      title: "Vehicle ID",
      dataIndex: "vehicleId",
      key: "vehicleId",
      render: (id) => <span className="font-semibold text-blue-600">#{id}</span>,
      width: 100,
    },
    {
      title: "Vehicle name",
      dataIndex: "vehicleName",
      key: "vehicleName",
      width: 150,
    },
    {
      title: "License plate",
      dataIndex: "licensePlate",
      key: "licensePlate",
      width: 120,
      render: (text) => <span className="font-mono">{text}</span>,
    },
    {
      title: "Current station",
      dataIndex: "stationName",
      key: "stationName",
      width: 150,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const info = statusMap[status] || { color: "default", text: status, icon: "❓" };
        return (
          <Tag color={info.color}>
            {info.icon} {info.text}
          </Tag>
        );
      },
      width: 140,
    },
    {
      title: "Battery (%)",
      dataIndex: "batteryPercentage",
      key: "batteryPercentage",
      render: (battery) => (
        <div className="flex items-center gap-2">
          <Badge
            status={battery > 50 ? "success" : battery > 20 ? "warning" : "error"}
            text={`${battery || 0}%`}
          />
          <div className="w-24 h-2 bg-gray-300 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                battery > 50 ? "bg-green-500" : battery > 20 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${battery || 0}%` }}
            />
          </div>
        </div>
      ),
      width: 140,
    },
    {
      title: "Mileage (km)",
      dataIndex: "mileage",
      key: "mileage",
      width: 110,
      render: (text) => text ? `${text.toLocaleString()}` : "N/A",
    },
    {
      title: "Last updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      width: 160,
    },
  ];

  return (
    <Card className="shadow-md rounded-xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CarOutlined /> Vehicle status in the system
        </h2>
        <p className="text-gray-500 mb-4">
          View current vehicle status at stations and while in use
        </p>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(statusMap).map(([key, value]) => {
            const count = vehicles.filter((v) => v.status === key).length;
            return (
              <Card key={key} className="shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{value.icon}</span>
                  <div>
                    <p className="text-sm text-gray-600">{value.text}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <label className="font-semibold text-gray-700">Filter by status:</label>
          <Select
            style={{ width: 200 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "All", value: "all" },
              { label: "Available", value: "AVAILABLE" },
              { label: "In Use", value: "IN_USE" },
              { label: "Maintenance", value: "MAINTENANCE" },
              { label: "Reserved", value: "RESERVED" },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" tip="Loading data..." />
        </div>
      ) : filteredVehicles.length === 0 ? (
        <Empty description="No vehicles" />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredVehicles}
          rowKey="vehicleId"
            pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} vehicles`,
          }}
          scroll={{ x: 1200 }}
          className="shadow-md rounded-lg"
        />
      )}
    </Card>
  );
}
