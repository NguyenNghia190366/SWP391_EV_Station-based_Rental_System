import React, { useState } from "react";
import "./VehiclesView.css";

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
    { value: "all", label: "Tất cả" },
    { value: "scooter", label: "Xe máy điện" },
    { value: "bike", label: "Xe đạp điện" },
    { value: "car", label: "Ô tô điện" },
    { value: "motorcycle", label: "Mô tô điện" },
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
      <div className="vehicles-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải danh sách xe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicles-page">
      {/* Header Section */}
      <section className="vehicles-header">
        <div className="container">
          <h1> Danh sách xe điện</h1>
          <p className="subtitle">Chọn chiếc xe điện phù hợp với nhu cầu của bạn</p>
        </div>
      </section>

      {/* Filter & Search Section */}
      <section className="vehicles-controls">
        <div className="container">
          <div className="controls-wrapper">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm xe theo tên, model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                 Tìm kiếm
              </button>
            </form>

            {/* Type Filter */}
            <div className="type-filter">
              {vehicleTypes.map((type) => (
                <button
                  key={type.value}
                  className={`type-btn ${selectedType === type.value ? "active" : ""}`}
                  onClick={() => handleTypeChange(type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vehicles Grid Section */}
      <section className="vehicles-grid-section">
        <div className="container">
          <div className="results-header">
            <h2>
              {vehicles.length > 0
                ? `Tìm thấy ${vehicles.length} xe`
                : "Không tìm thấy xe nào"}
            </h2>
          </div>

          {vehicles.length === 0 ? (
            <div className="no-vehicles">
              <div className="empty-icon"></div>
              <h3>Không có xe điện nào</h3>
              <p>Vui lòng thử lại với bộ lọc khác hoặc quay lại sau.</p>
            </div>
          ) : (
            <div className="vehicles-grid">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="vehicle-card">
                  <div className="vehicle-image">
                    <img
                      src={vehicle.image || "/placeholder-vehicle.jpg"}
                      alt={vehicle.name}
                      onError={(e) => {
                        e.target.src = "/placeholder-vehicle.jpg";
                      }}
                    />
                    {vehicle.available || vehicle.isAvailable ? (
                      <span className="badge available">Có sẵn</span>
                    ) : (
                      <span className="badge unavailable">Hết xe</span>
                    )}
                  </div>

                  <div className="vehicle-content">
                    <h3 className="vehicle-name">{vehicle.name}</h3>
                    <p className="vehicle-type">{vehicle.type || "Xe điện"}</p>

                    <div className="vehicle-specs">
                      <div className="spec-item">
                        <span className="icon">🚗</span>
                        <span>{vehicle.range || 0} km</span>
                      </div>
                      <div className="spec-item">
                        <span className="icon">🔋</span>
                        <span>{vehicle.battery || 100}%</span>
                      </div>
                      <div className="spec-item">
                        <span className="icon">📅</span>
                        <span>{vehicle.releaseYear || 2023}</span>
                      </div>
                    </div>

                    <div className="vehicle-price">
                      <span className="price-label">Giá thuê:</span>
                      <span className="price-value">
                        ${vehicle.price || 0}/ngày
                      </span>
                    </div>

                    {vehicle.station && (
                      <div className="vehicle-location">
                         {vehicle.station.name || vehicle.station.station_name}
                      </div>
                    )}

                    <div className="vehicle-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => onViewDetails && onViewDetails(vehicle.id)}
                      >
                        Chi tiết
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => onBookVehicle && onBookVehicle(vehicle.id)}
                        disabled={!(vehicle.isAvailable === true || vehicle.available === true)}
                      >
                        {(vehicle.isAvailable === true || vehicle.available === true) ? "Đặt xe" : "Hết xe"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VehiclesView;
