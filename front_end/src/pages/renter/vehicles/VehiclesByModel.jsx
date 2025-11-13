import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Button, Tag, Empty } from "antd";

/**
 * VehiclesByModel
 * Groups vehicles by vehicleModelId and shows availability counts
 * Displays model card with total available, rented, and unavailable counts
 */
const VehiclesByModel = ({ vehicles = [], onSelectModel, onBookVehicle }) => {
  const navigate = useNavigate();
  // Group vehicles by vehicleModelId
  const groupedByModel = useMemo(() => {
    const groups = {};
    
    vehicles.forEach((vehicle) => {
      const modelId = vehicle.vehicleModelId ?? vehicle.vehicle_model_id ?? vehicle.modelId ?? vehicle.model_id;
      const modelName = vehicle.brandName && vehicle.model 
        ? `${vehicle.brandName} ${vehicle.model}` 
        : vehicle.name || `Model #${modelId}`;
      
      if (!groups[modelId]) {
        groups[modelId] = {
          modelId,
          modelName,
          pricePerHour: vehicle.pricePerHour || 0,
          vehicles: [],
          totalCount: 0,
          availableCount: 0,
          rentedCount: 0,
          unavailableCount: 0,
        };
      }
      
      groups[modelId].vehicles.push(vehicle);
      groups[modelId].totalCount += 1;
      
      // Check if rented (has APPROVED or IN_USE order)
      const isRented = vehicle.rentalOrders?.some(order => 
        order?.status === 'APPROVED' || order?.status === 'IN_USE'
      ) || false;
      
      // Check availability - a vehicle is available if it's NOT rented and isAvailable is true
      const isAvailable = !isRented && (vehicle.isAvailable === true || vehicle.available === true);
      
      if (isRented) {
        groups[modelId].rentedCount += 1;
      } else if (isAvailable) {
        groups[modelId].availableCount += 1;
      } else {
        groups[modelId].unavailableCount += 1;
      }
    });
    
    return Object.values(groups);
  }, [vehicles]);

  if (vehicles.length === 0) {
    return <Empty description="Không có xe nào" style={{ paddingTop: 40 }} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {groupedByModel.map((modelGroup) => (
        <Card
          key={modelGroup.modelId}
          className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          hoverable
        >
          {/* Model Name and Badge */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-1">
                {modelGroup.modelName}
              </h4>
              <p className="text-sm text-gray-500">
                Giá: {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(modelGroup.pricePerHour)}/giờ
              </p>
            </div>
            <Badge
              count={modelGroup.totalCount}
              style={{
                backgroundColor: "#1890ff",
                color: "#fff",
                fontSize: "16px",
                padding: "4px 8px",
              }}
            />
          </div>

          {/* Counts */}
          <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">
                <span className="font-semibold text-green-600">{modelGroup.availableCount}</span> có sẵn
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">
                <span className="font-semibold text-amber-600">{modelGroup.rentedCount}</span> đang cho thuê
              </span>
            </div>
            {modelGroup.unavailableCount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  <span className="font-semibold text-red-600">{modelGroup.unavailableCount}</span> hết xe
                </span>
              </div>
            )}
          </div>

          {/* Status Tags */}
          <div className="mb-4 flex flex-wrap gap-2">
            {modelGroup.availableCount > 0 && (
              <Tag color="green">Còn {modelGroup.availableCount}</Tag>
            )}
            {modelGroup.rentedCount > 0 && (
              <Tag color="orange">Cho thuê {modelGroup.rentedCount}</Tag>
            )}
            {modelGroup.unavailableCount > 0 && (
              <Tag color="red">Hết {modelGroup.unavailableCount}</Tag>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {modelGroup.availableCount > 0 && (
              <Button
                type="primary"
                block
                onClick={() => navigate(`/booking-request/${modelGroup.vehicles[0]?.id || modelGroup.modelId}`)}
              >
                Đặt xe
              </Button>
            )}
            {modelGroup.availableCount === 0 && (
              <Button disabled block>
                {modelGroup.rentedCount > 0 ? "Đang cho thuê" : "Hết xe"}
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default VehiclesByModel;
