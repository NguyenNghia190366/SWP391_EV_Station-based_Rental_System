import React, { useEffect, useState } from "react";
import { Card, Spin, Empty, Button, Badge, Tag } from "antd";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import { useNavigate } from "react-router-dom";

/**
 * VehiclesByStation
 * Displays vehicles grouped by model at a selected station
 * Shows count of available vehicles for each model
 */
const VehiclesByStation = ({ station }) => {
  const navigate = useNavigate();
  const axiosInstance = useAxiosInstance();
  const [loading, setLoading] = useState(false);
  const [vehiclesByModel, setVehiclesByModel] = useState({});
  const [error, setError] = useState(null);

  // Fetch vehicles when station changes
  useEffect(() => {
    if (!station?.stationId && !station?.id) {
      setVehiclesByModel({});
      return;
    }

    const fetchVehicles = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get all vehicles
        const vehiclesRes = await axiosInstance.get("/Vehicles");
        const vehicles = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [];

        // Get all vehicle models
        const modelsRes = await axiosInstance.get("/VehicleModels");
        const models = Array.isArray(modelsRes.data) ? modelsRes.data : [];

        // Create model map (id -> brandName + model)
        const modelMap = {};
        models.forEach((m) => {
          const id = m.vehicleModelId || m.id;
          modelMap[id] = {
            brandName: m.brandName || "Unknown",
            model: m.model || "Model",
            pricePerHour: m.price_per_hour || 0,
            id,
          };
        });

        // Filter vehicles by station
        const stationId = station.stationId || station.id;
        const vehiclesAtStation = vehicles.filter(
          (v) => (v.stationId || v.station_id) === stationId
        );

        // Group by model
        const grouped = {};
        vehiclesAtStation.forEach((vehicle) => {
          const modelId = vehicle.vehicleModelId || vehicle.vehicle_model_id;
          const modelInfo = modelMap[modelId] || { brandName: "Unknown", model: "Model", pricePerHour: 0 };
          const modelName = `${modelInfo.brandName} ${modelInfo.model}`;

          if (!grouped[modelName]) {
            grouped[modelName] = {
              modelInfo,
              vehicles: [],
              count: 0,
            };
          }
          grouped[modelName].vehicles.push(vehicle);
          grouped[modelName].count += 1;
        });

        setVehiclesByModel(grouped);
      } catch (err) {
        console.error("Error fetching vehicles for station:", err);
        setError("Cannot load vehicle list. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [station, axiosInstance]);

  if (!station) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Select a station to view vehicles</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spin tip="Loading vehicle list..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  const modelCount = Object.keys(vehiclesByModel).length;
  const totalVehicles = Object.values(vehiclesByModel).reduce((sum, m) => sum + m.count, 0);

  if (modelCount === 0) {
    return (
      <Empty
        description="No vehicles at this station"
        style={{ paddingTop: 40 }}
      />
    );
  }

  return (
    <div>
      {/* Station Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
            📍 {station.stationName || "Station"}
        </h3>
        <p className="text-gray-600 mb-3">{station.address || ""}</p>
        <div className="flex gap-4">
          <Tag color="blue" className="text-base px-3 py-2">
              🚗 {totalVehicles} vehicles
          </Tag>
          <Tag color="cyan" className="text-base px-3 py-2">
              📦 {modelCount} models
          </Tag>
        </div>
      </div>

      {/* Vehicles by Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(vehiclesByModel).map(([modelName, data]) => (
          <Card
            key={modelName}
            className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            hoverable
          >
            {/* Model Header with Count Badge */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-bold text-gray-800">{modelName}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Price: {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(data.modelInfo.pricePerHour)}/hr
                </p>
              </div>
              <Badge
                count={data.count}
                style={{
                  backgroundColor: "#52c41a",
                  color: "#fff",
                  fontSize: "16px",
                  padding: "4px 8px",
                }}
              />
            </div>

            {/* Vehicle Details */}
            <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <b>Remaining:</b> {data.count} vehicles
              </p>
              <p className="text-sm text-gray-700">
                <b>Station:</b> {station.stationName}
              </p>
            </div>

            {/* Action Button */}
            <Button
              type="primary"
              block
              onClick={() => navigate(`/vehicles?station=${station.stationId || station.id}&model=${modelName}`)}
            >
                View details & Book
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VehiclesByStation;
