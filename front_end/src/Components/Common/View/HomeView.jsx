import React, { useState } from "react";
import "./HomeView.css";
import MapLeaflet from "../Map/MapLeaflet";
import NearbyStationsSuggestions from "../Map/NearbyStationsSuggestions";

const HomeView = ({
  user,
  loading,
  featuredVehicles = [], // Chỉ dùng featuredVehicles thôi
  statistics = {
    totalVehicles: 0,
    totalBookings: 0,
    happyCustomers: 0,
  },
  testimonials = [],
  stations = [],
  onFindNearest,
  nearestStation,
  nearestSearching,
  onNavigate,
  onBookVehicle,
  onViewVehicle,
  // onSearch và onFilterByType - KHÔNG CẦN DÙNG ở Home
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  console.log(" HomeView rendered", { user, loading, featuredVehicles: featuredVehicles.length });

  // Handler để chọn trạm từ gợi ý
  const handleSelectStation = (station) => {
    console.log("Selected station:", station);
    // Có thể thêm logic để highlight trạm hoặc navigate đến trạm
    if (onFindNearest) {
      const stationLat = station.latitude ?? station.lat;
      const stationLng = station.longitude ?? station.lng;
      onFindNearest({ lat: stationLat, lng: stationLng });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  // Handler tìm kiếm ngay tại HomeView
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/vehicles?search=${searchQuery}`);
    }
  };

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="container">
          <h2>Thuê xe điện dễ dàng</h2>
          <p>Trải nghiệm tương lai của việc di chuyển với xe điện cao cấp</p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="Tìm kiếm xe điện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-search">
               Tìm kiếm
            </button>
          </form>
          
          <button 
            className="btn-cta"
            onClick={() => onNavigate("/vehicles")}
          >
            Khám phá ngay
          </button>
          {typeof onFindNearest === 'function' && (
            <button
              className="btn-ghost"
              style={{ marginLeft: 12 }}
              onClick={() => onFindNearest()}
              disabled={nearestSearching}
            >
              {nearestSearching ? ' Đang tìm...' : ' Tìm trạm thuê gần nhất'}
            </button>
          )}
        </div>
      </section>

      {/* STATIONS MAP */}
      <section className="stations-map">
        <div className="container">
          <h2>️ Trạm thuê xe gần bạn</h2>
          <div style={{ marginTop: 12, display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* make the map allowed to shrink by setting minWidth:0 so it won't force overflow */}
            <div style={{ flex: '1 1 500px', minWidth: 0 }}>
              <MapLeaflet stations={stations} highlightedStation={nearestStation?.station} height="420px" zoom={13} />
            </div>
            {/* Nearby Stations Suggestions */}
            <div style={{ flex: '1 1 350px', minWidth: 300 }}>
              <NearbyStationsSuggestions 
                userLocation={nearestStation ? { lat: nearestStation.station?.latitude ?? nearestStation.station?.lat, lng: nearestStation.station?.longitude ?? nearestStation.station?.lng } : null}
                stations={stations}
                onSelectStation={handleSelectStation}
                limit={5}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      <section className="featured-vehicles">
        <div className="container">
          <h2>Xe nổi bật</h2>
          
          {featuredVehicles.length === 0 ? (
            <p className="no-vehicles">Chưa có xe nào</p>
          ) : (
            <div className="vehicle-grid">
              {featuredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="vehicle-card">
                  <img src={vehicle.image} alt={vehicle.name} />
                  <h3>{vehicle.name}</h3>
                  <p className="type">{vehicle.type}</p>
                  <div className="details">
                    <span> ${vehicle.price}/ngày</span>
                    <span> {vehicle.range} km</span>
                    <span> {vehicle.rating}</span>
                  </div>
                  <div className="actions">
                    <button 
                      onClick={() => onViewVehicle(vehicle.id)}
                      className="btn-secondary"
                    >
                      Chi tiết
                    </button>
                    <button 
                      onClick={() => onBookVehicle(vehicle.id)}
                      className="btn-primary"
                      disabled={!vehicle.available}
                    >
                      {vehicle.available ? "Đặt xe" : "Hết xe"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* STATISTICS */}
      <section className="statistics">
        <div className="container">
          <div className="stat-item">
            <h3>{statistics.totalVehicles}+</h3>
            <p>Xe điện</p>
          </div>
          <div className="stat-item">
            <h3>{statistics.totalBookings}+</h3>
            <p>Lượt thuê</p>
          </div>
          <div className="stat-item">
            <h3>{statistics.happyCustomers}+</h3>
            <p>Khách hàng hài lòng</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="testimonials">
          <div className="container">
            <h2>Đánh giá từ khách hàng</h2>
            <div className="testimonial-grid">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="testimonial-card">
                  <div className="testimonial-header">
                    <img src={testimonial.avatar} alt={testimonial.name} />
                    <div>
                      <h4>{testimonial.name}</h4>
                      <div className="rating">
                        {"".repeat(testimonial.rating)}
                      </div>
                    </div>
                  </div>
                  <p>{testimonial.comment}</p>
                  <span className="date">{testimonial.date}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <p>© 2025 EV Rental. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomeView;