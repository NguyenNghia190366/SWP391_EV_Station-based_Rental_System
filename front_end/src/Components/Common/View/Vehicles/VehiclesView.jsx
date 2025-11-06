import React, { useState } from "react";
import VehicleCard from "../Vehicles/VehicleCard";

const VehiclesView = ({
  vehicles = [],
  loading = false,
  onSearch,
  onFilterByType,
  onViewDetails,
  onBookVehicle,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const vehicleTypes = [
    { value: "all", label: "Tất cả"},
    { value: "scooter", label: "Xe máy điện"},
    { value: "bike", label: "Xe đạp điện"},
    { value: "car", label: "Ô tô điện"},
    { value: "motorcycle", label: "Mô tô điện"},
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    if (onFilterByType) {
      onFilterByType(type === "all" ? null : type);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-lg text-gray-700 font-semibold">Đang tải danh sách xe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fadeInUp">
            Danh sách xe điện
          </h1>
          <p className="text-lg md:text-xl text-white/90 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Chọn chiếc xe điện phù hợp với nhu cầu của bạn
          </p>
        </div>
      </section>

      {/* Filter & Search Section */}
      <section className="sticky top-16 z-40 bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder=" Tìm kiếm xe theo tên, model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-gray-800 text-lg placeholder-gray-400"
              />
              <button 
                type="submit" 
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Tìm kiếm
              </button>
            </div>
          </form>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-3 justify-center">
            {vehicleTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleTypeChange(type.value)}
                className={`
                  px-6 py-3 rounded-xl font-semibold transition-all duration-300 
                  flex items-center gap-2 text-sm md:text-base
                  ${selectedType === type.value
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md'
                  }
                `}
              >
                <span className="text-xl">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicles Grid Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {vehicles.length > 0
                ? ` Tìm thấy ${vehicles.length} xe phù hợp`
                : " Không tìm thấy xe nào"}
            </h2>
          </div>

          {vehicles.length === 0 ? (
            <div className="text-center py-20">
              {/* <div className="text-9xl mb-6">🚫</div> */}
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Không có xe điện nào</h3>
              <p className="text-gray-600 text-lg">Vui lòng thử lại với bộ lọc khác hoặc quay lại sau.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onViewDetails={onViewDetails}
                  onBookVehicle={onBookVehicle}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VehiclesView;
