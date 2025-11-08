import React, { useEffect, useState, useMemo } from "react";
import { useVehicleAPI } from "@/hooks/useVehicles";

const VehicleCard = ({
  vehicle,
  onViewDetails,
  onBookVehicle,
  compact = false,
}) => {
  const isAvailable =
    vehicle.isAvailable === true || vehicle.available === true;
  const { getModelById } = useVehicleAPI();
  const { getById } = useVehicleAPI();

  const [pricePerHour, setPricePerHour] = useState(0);

  // Lấy thông tin model và giá tiền - chỉ chạy 1 lần khi vehicleModelId thay đổi
  useEffect(() => {
    if (!vehicle.vehicleModelId) {
      setPricePerHour(0);
      return;
    }

    let isMounted = true;

    const fetchModelPrice = async () => {
      try {
        // Nếu không có token (chưa login) thì API /VehicleModels trả 401 -> bỏ qua
        const token = localStorage.getItem("token");
        if (!token) {
          // Không có token, không gọi API model, giữ giá 0
          return;
        }

        const model = await getModelById(vehicle.vehicleModelId);
        if (isMounted) {
          setPricePerHour(model.price_per_hour || 0);
          
        }
      } catch (error) {
        console.error("❌ Lỗi lấy model:", error);
        if (isMounted) {
          setPricePerHour(0);
        }
      }
    };

    fetchModelPrice();

    // Cleanup: ngừng cập nhật nếu component unmounted
    return () => {
      isMounted = false;
    };
  }, [vehicle.vehicleModelId]);

  return (
    <div
      className={`
      bg-white rounded-2xl overflow-hidden shadow-lg 
      hover:shadow-2xl hover:-translate-y-2
      transition-all duration-300 ease-in-out
      flex flex-col h-full
      ${compact ? "max-w-[350px]" : "max-w-[500px] md:max-w-none"}
      mx-auto
    `}
    >
      {/* Image Section */}
      <div
        className={`
        relative w-full overflow-hidden
        bg-gradient-to-br from-green-400 to-green-400
        ${compact ? "h-[200px]" : "h-[240px] md:h-[200px]"}
      `}
      >
        <img
          src={vehicle.imgCarUrl || "/placeholder-vehicle.jpg"}
          alt={vehicle.name}
          onError={(e) => {
            e.target.src = "/placeholder-vehicle.jpg";
          }}
          className="w-full h-full object-cover transition-transform duration-400 hover:scale-110"
        />
        {/* Badge */}
        {isAvailable ? (
          <span
            className="
            absolute top-4 right-4 px-4 py-2 rounded-full
            bg-emerald-500/95 text-white
            text-sm font-bold uppercase tracking-wide
            backdrop-blur-md shadow-lg
          "
          >
            Có sẵn
          </span>
        ) : (
          <span
            className="
            absolute top-4 right-4 px-4 py-2 rounded-full
            bg-red-500/95 text-white
            text-sm font-bold uppercase tracking-wide
            backdrop-blur-md shadow-lg
          "
          >
            Hết xe
          </span>
        )}
      </div>

      {/* Content Section */}
      <div
        className={`
        flex flex-col flex-1
        ${compact ? "p-5" : "p-6 md:p-5"}
      `}
      >
        {/* Title */}
        <h3
          className={`
          font-extrabold text-gray-900 leading-tight mb-2
          ${compact ? "text-xl" : "text-2xl md:text-xl"}
        `}
        >
          {vehicle.name ||
            `${vehicle.brandName || ""} ${vehicle.model || ""}`.trim() ||
            "Xe điện"}
        </h3>

        {/* Type */}
        <p className="text-sdz-500 font-semibold uppercase tracking-wider text-sm mb-5">
          {vehicle.type || vehicle.vehicleColor || "Xe điện"}
        </p>

        {/* Specs Grid */}
        <div
          className={`
          grid grid-cols-3 gap-3 p-4 rounded-xl mb-5
          bg-gradient-to-br from-gray-50 to-gray-100
          ${compact ? "gap-2 p-3" : ""}
        `}
        >
          <div className="flex flex-col items-center gap-1.5 text-gray-700 font-bold">
            <span className={compact ? "text-xl" : "text-2xl"}>🚗</span>
            <span className={compact ? "text-xs" : "text-sm"}>
              {vehicle.range || 0} km
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-gray-700 font-bold">
            <span className={compact ? "text-xl" : "text-2xl"}>🔋</span>
            <span className={compact ? "text-xs" : "text-sm"}>
              {vehicle.battery || 100}%
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-gray-700 font-bold">
            <span className={compact ? "text-xl" : "text-2xl"}>📅</span>
            <span className={compact ? "text-xs" : "text-sm"}>
              {vehicle.releaseYear || 2023}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-gray-700 font-bold">
            <span className={compact ? "text-xl" : "text-2xl"}>�</span>
            <span className={compact ? "text-xs" : "text-sm"}>
              {vehicle.NumberOfSeats} chỗ
            </span>
          </div>
        </div>

        {/* Price */}
        <div
          className="
    flex justify-between items-baseline 
    py-3 px-2 mb-4
    border-t border-b border-gray-200
  "
        >
          <span className="text-gray-500 text-sm md:text-base font-medium tracking-wide">
            Giá thuê
          </span>
          <span className="text-green-600 text-xl md:text-2xl font-semibold">
            {pricePerHour > 0
              ? `${(pricePerHour / 1000).toLocaleString("vi-VN")}k`
              : "Đang cập nhật"}
            <span className="text-gray-500 text-sm ml-1">/giờ</span>
          </span>
        </div>

        {/* Location */}
        {vehicle.station && (
          <div className="flex items-center gap-2 text-gray-600 font-medium text-sm mb-5">
            <span className="text-lg">📍</span>
            <span>{vehicle.station.name || vehicle.station.station_name}</span>
          </div>
        )}

        {/* Actions */}
        <div
          className={`
          grid gap-3 mt-auto
          ${compact ? "grid-cols-1" : "grid-cols-[1fr_1.5fr] md:grid-cols-1"}
        `}
        >
          <button
            onClick={() => onViewDetails && onViewDetails(vehicle.id)}
            className="
              px-5 py-3.5 rounded-xl font-bold uppercase tracking-wide
              bg-white text-sdz-500 border-2 border-sdz-500
              hover:bg-sdz-500 hover:text-white
              hover:-translate-y-0.5 hover:shadow-lg
              transition-all duration-300 ease-in-out
              text-sm md:text-base
            "
          >
            Chi tiết
          </button>
          <button
            onClick={() => onBookVehicle && onBookVehicle(vehicle.id)}
            disabled={!isAvailable}
            className={`
              px-5 py-3.5 rounded-xl font-bold uppercase tracking-wide
              bg-gradient-to-r from-green-500 to-green-600 text-white
              shadow-lg shadow-green-500/30
              transition-all duration-300 ease-in-out
              text-sm md:text-base
              ${
                isAvailable
                  ? "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-500/50 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed shadow-none"
              }
            `}
          >
            {isAvailable ? "Đặt xe" : "Hết xe"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
