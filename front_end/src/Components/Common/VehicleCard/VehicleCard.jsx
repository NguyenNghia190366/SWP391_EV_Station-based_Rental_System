import React from 'react';

const VehicleCard = ({ 
  vehicle, 
  onViewDetails, 
  onBookVehicle,
  compact = false 
}) => {
  const isAvailable = vehicle.isAvailable === true || vehicle.available === true;

  return (
    <div className={`
      bg-white rounded-2xl overflow-hidden shadow-lg 
      hover:shadow-2xl hover:-translate-y-2
      transition-all duration-300 ease-in-out
      flex flex-col h-full
      ${compact ? 'max-w-[350px]' : 'max-w-[500px] md:max-w-none'}
      mx-auto
    `}>
      {/* Image Section */}
      <div className={`
        relative w-full overflow-hidden
        bg-gradient-to-br from-indigo-500 to-purple-600
        ${compact ? 'h-[200px]' : 'h-[240px] md:h-[200px]'}
      `}>
        <img
          src={vehicle.image || '/placeholder-vehicle.jpg'}
          alt={vehicle.name}
          onError={(e) => {
            e.target.src = '/placeholder-vehicle.jpg';
          }}
          className="w-full h-full object-cover transition-transform duration-400 hover:scale-110"
        />
        {/* Badge */}
        {isAvailable ? (
          <span className="
            absolute top-4 right-4 px-4 py-2 rounded-full
            bg-emerald-500/95 text-white
            text-sm font-bold uppercase tracking-wide
            backdrop-blur-md shadow-lg
          ">
            Có sẵn
          </span>
        ) : (
          <span className="
            absolute top-4 right-4 px-4 py-2 rounded-full
            bg-red-500/95 text-white
            text-sm font-bold uppercase tracking-wide
            backdrop-blur-md shadow-lg
          ">
            Hết xe
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className={`
        flex flex-col flex-1
        ${compact ? 'p-5' : 'p-6 md:p-5'}
      `}>
        {/* Title */}
        <h3 className={`
          font-extrabold text-gray-900 leading-tight mb-2
          ${compact ? 'text-xl' : 'text-2xl md:text-xl'}
        `}>
          {vehicle.name}
        </h3>
        
        {/* Type */}
        <p className="text-sdz-500 font-semibold uppercase tracking-wider text-sm mb-5">
          {vehicle.type || 'Xe điện'}
        </p>

        {/* Specs Grid */}
        <div className={`
          grid grid-cols-3 gap-3 p-4 rounded-xl mb-5
          bg-gradient-to-br from-gray-50 to-gray-100
          ${compact ? 'gap-2 p-3' : ''}
        `}>
          <div className="flex flex-col items-center gap-1.5 text-gray-700 font-bold">
            <span className={compact ? 'text-xl' : 'text-2xl'}>🚗</span>
            <span className={compact ? 'text-xs' : 'text-sm'}>
              {vehicle.range || 0} km
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-gray-700 font-bold">
            <span className={compact ? 'text-xl' : 'text-2xl'}>🔋</span>
            <span className={compact ? 'text-xs' : 'text-sm'}>
              {vehicle.battery || 100}%
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-gray-700 font-bold">
            <span className={compact ? 'text-xl' : 'text-2xl'}>📅</span>
            <span className={compact ? 'text-xs' : 'text-sm'}>
              {vehicle.releaseYear || 2023}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="
          flex justify-between items-center py-4 mb-4
          border-t-2 border-b-2 border-gray-200
        ">
          <span className="text-base text-gray-600 font-semibold">
            Giá thuê:
          </span>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            ${vehicle.price || 0}/ngày
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
        <div className={`
          grid gap-3 mt-auto
          ${compact ? 'grid-cols-1' : 'grid-cols-[1fr_1.5fr] md:grid-cols-1'}
        `}>
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
              bg-gradient-to-r from-indigo-500 to-purple-600 text-white
              shadow-lg shadow-indigo-500/30
              transition-all duration-300 ease-in-out
              text-sm md:text-base
              ${isAvailable 
                ? 'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/50 cursor-pointer' 
                : 'bg-gray-300 cursor-not-allowed shadow-none'
              }
            `}
          >
            {isAvailable ? 'Đặt xe' : 'Hết xe'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
