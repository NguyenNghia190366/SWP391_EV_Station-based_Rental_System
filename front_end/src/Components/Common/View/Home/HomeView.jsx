import React, { useState } from "react";
import MapLeaflet from "../../Map/MapLeaflet";
import NearbyStationsSuggestions from "../../Map/NearbyStationsSuggestions";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-lg text-gray-700 font-semibold">Đang tải...</p>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-20 md:py-32 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 animate-fadeInUp">
            Thuê xe điện dễ dàng
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-10 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Trải nghiệm tương lai của việc di chuyển với xe điện cao cấp
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Tìm kiếm xe điện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-6 py-4 rounded-xl text-gray-800 text-lg border-2 border-white/30 focus:border-yellow-300 focus:ring-4 focus:ring-yellow-200 outline-none transition-all placeholder-gray-400"
              />
              <button 
                type="submit" 
                className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Tìm kiếm
              </button>
            </div>
          </form>
          
          <div className="flex flex-wrap gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <button 
              onClick={() => onNavigate("/vehicles")}
              className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-yellow-300 hover:text-gray-900 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              Khám phá ngay
            </button>
            {typeof onFindNearest === 'function' && (
              <button
                onClick={() => onFindNearest()}
                disabled={nearestSearching}
                className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {nearestSearching ? 'Đang tìm...' : 'Tìm trạm thuê gần nhất'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* STATIONS MAP */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 text-center">
            Trạm thuê xe gần bạn
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-xl">
              <MapLeaflet stations={stations} highlightedStation={nearestStation?.station} height="420px" zoom={13} />
            </div>
            {/* Nearby Stations Suggestions */}
            <div className="lg:col-span-1">
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
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 text-center">
            Xe nổi bật
          </h2>
          
          {featuredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚗</div>
              <p className="text-gray-600 text-lg">Chưa có xe nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
                    <img 
                      src={vehicle.image} 
                      alt={vehicle.name} 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{vehicle.name}</h3>
                    <p className="text-indigo-600 font-semibold text-sm mb-4 uppercase">{vehicle.type}</p>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">${vehicle.price}/ngày</span>
                      <span className="flex items-center gap-1">{vehicle.range} km</span>
                      <span className="flex items-center gap-1">{vehicle.rating}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onViewVehicle(vehicle.id)}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all"
                      >
                        Chi tiết
                      </button>
                      <button 
                        onClick={() => onBookVehicle(vehicle.id)}
                        disabled={!vehicle.available}
                        className={`flex-1 px-4 py-2.5 font-semibold rounded-lg transition-all ${
                          vehicle.available 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:-translate-y-0.5' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {vehicle.available ? "Đặt xe" : "Hết xe"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* STATISTICS */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-5xl md:text-6xl font-extrabold mb-2">{statistics.totalVehicles}+</h3>
              <p className="text-xl text-white/90">Xe điện</p>
            </div>
            <div className="text-center">
              <h3 className="text-5xl md:text-6xl font-extrabold mb-2">{statistics.totalBookings}+</h3>
              <p className="text-xl text-white/90">Lượt thuê</p>
            </div>
            <div className="text-center">
              <h3 className="text-5xl md:text-6xl font-extrabold mb-2">{statistics.happyCustomers}+</h3>
              <p className="text-xl text-white/90">Khách hàng hài lòng</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-12 text-center">
              Đánh giá từ khách hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <div className="text-yellow-400 text-lg">
                        {"⭐".repeat(testimonial.rating)}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">{testimonial.comment}</p>
                  <span className="text-sm text-gray-500">{testimonial.date}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomeView;