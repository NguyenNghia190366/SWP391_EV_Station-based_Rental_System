import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { stationAPI } from "@/api/api";
import { findNearestStation } from "@/utils/geo";
import { clearUserData } from "@/utils/auth";
import BookingVerificationModal from "@/pages/renter/booking/BookingVerificationModal";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import MapLeaflet from "@/components/common/Map/MapLeaflet";
import NearbyStationsSuggestions from "@/components/common/Map/NearbyStationsSuggestions";

const HomePage = () => {
  const navigate = useNavigate();
  const api = useAxiosInstance();

  // ==== State ====
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [nearestStation, setNearestStation] = useState(null);
  const [nearestSearching, setNearestSearching] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState("license");
  const [searchQuery, setSearchQuery] = useState("");

  // ==== Load user from localStorage ====
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (storedUser && isLoggedIn === "true") setUser(JSON.parse(storedUser));
    } catch (e) {
      console.error("Error reading user from localStorage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==== Dummy vehicles for display ====
  useEffect(() => {
    const dummy = [
      { id: "1", name: "Tesla Model 3" },
      { id: "2", name: "Nissan Leaf" },
      { id: "3", name: "Chevrolet Bolt" },
    ];
    setVehicles(dummy);
    setFeaturedVehicles(dummy.slice(0, 3));
  }, []);

  // ==== Fetch stations ====
  useEffect(() => {
    let mounted = true;
    const fetchStations = async () => {
      try {
        const stations = await stationAPI.getAll();
        if (mounted) {
          if (stations.length > 0) {
            console.log("Loaded stations from API:", stations.length);
            setStations(stations);
          } else {
            console.warn("⚠️ API returned no stations, using dummy data");
            setStations([]);
          }
        }
      } catch (err) {
        console.error("❌ Error loading stations:", err);
        if (mounted) setStations([]);
      }
    };
    fetchStations();
    return () => {
      mounted = false;
    };
  }, []);

  // ==== Logout ====
  const handleLogout = () => {
    clearUserData();
    setUser(null);
    navigate("/login");
  };

  // ==== Find nearest station ====
  const findNearestStationForUser = async (opts = {}) => {
    setNearestSearching(true);
    try {
      let lat = opts.lat,
        lng = opts.lng;
      if (lat == null || lng == null) {
        if (!navigator.geolocation) throw new Error("Geolocation not available");
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, {
            enableHighAccuracy: true,
            timeout: 10000,
          })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }
      try {
        const apiResult = await stationAPI.getNearest(lat, lng);
        const station = apiResult?.station || apiResult;
        const distanceKm = apiResult?.distanceKm ?? apiResult?.distance ?? null;
        const payload = { station, distanceKm };
        setNearestStation(payload);
        return payload;
      } catch (apiErr) {
        const best = findNearestStation(stations, lat, lng);
        if (best) {
          setNearestStation(best);
          return best;
        }
        throw apiErr;
      }
    } catch (err) {
      console.error("Nearest station lookup failed", err);
      setNearestStation(null);
      return null;
    } finally {
      setNearestSearching(false);
    }
  };

  // ==== Booking flow with renter verification ====
  const handleBookVehicle = async (vehicleId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const userRole = (user.role || "").toLowerCase();
    if (userRole !== "renter") {
      alert("Chỉ khách hàng mới có thể đặt xe!");
      return;
    }

    try {
      console.log("🔍 Fetching renter verification status from /Renters...");
      const response = await api.get(`/Renters`);
      const rentersList = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      const currentRenter = rentersList.find(
        (r) =>
          (r.renterId &&
            String(r.renterId) === String(user.renterId || user.renter_id)) ||
          (r.userId &&
            String(r.userId) === String(user.userId || user.user_id)) ||
          (r.user_id &&
            String(r.user_id) === String(user.userId || user.user_id))
      );

      if (!currentRenter) {
        alert("Không tìm thấy thông tin người thuê. Vui lòng liên hệ admin.");
        return;
      }

      const isVerified =
        currentRenter.isVerified === true ||
        currentRenter.isVerified === 1 ||
        currentRenter.isVerified === "1";

      if (!isVerified) {
        setVerificationType("both");
        setShowVerificationModal(true);
        return;
      }

      navigate(`/booking-request/${vehicleId}`);
    } catch (error) {
      console.error("❌ Error checking renter verification:", error);
      alert("Có lỗi khi kiểm tra xác thực. Vui lòng thử lại.");
    }
  };

  const handleNavigateToVerification = () => {
    setShowVerificationModal(false);
    navigate("/profile");
  };

  // ==== Search handler ====
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/vehicles?search=${searchQuery}`);
  };

  // ==== Station selection from suggestions ====
  const handleSelectStation = (station) => {
    if (onFindNearest) {
      const stationLat = station.latitude ?? station.lat;
      const stationLng = station.longitude ?? station.lng;
      findNearestStationForUser({ lat: stationLat, lng: stationLng });
    }
  };

  // ==== Loading state ====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-transparent"></div>
          <p className="mt-4 text-lg text-gray-700 font-semibold">Đang tải...</p>
        </div>
      </div>
    );
  }

  // ==== RENDER HOME PAGE ====
  return (
    <>
      <div className="min-h-screen bg-red-50">
        {/* HERO SECTION */}
        <section className="relative bg-white text-gray-900 py-20 md:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
              Thuê xe điện dễ dàng
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 mb-10">
              Trải nghiệm tương lai của việc di chuyển với xe điện cao cấp
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Tìm kiếm xe điện..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-6 py-4 rounded-lg text-gray-800 text-lg border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all duration-150"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate("/vehicles")}
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-150"
              >
                Khám phá ngay
              </button>
              <button
                onClick={() => findNearestStationForUser()}
                disabled={nearestSearching}
                className="px-8 py-4 bg-white text-gray-700 border border-gray-200 font-bold rounded-lg hover:bg-gray-50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {nearestSearching ? "Đang tìm..." : "Tìm trạm thuê gần nhất"}
              </button>
            </div>
          </div>
        </section>

        {/* MAP SECTION */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 text-center">
              Trạm thuê xe gần bạn
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-xl">
                <MapLeaflet
                  stations={stations}
                  highlightedStation={nearestStation?.station}
                  height="420px"
                  zoom={13}
                />
              </div>
              <div className="lg:col-span-1">
                <NearbyStationsSuggestions
                  userLocation={
                    nearestStation
                      ? {
                          lat:
                            nearestStation.station?.latitude ??
                            nearestStation.station?.lat,
                          lng:
                            nearestStation.station?.longitude ??
                            nearestStation.station?.lng,
                        }
                      : null
                  }
                  stations={stations}
                  onSelectStation={handleSelectStation}
                  limit={5}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* VERIFICATION MODAL */}
      <BookingVerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onNavigateToVerification={handleNavigateToVerification}
        verificationType={verificationType}
      />
    </>
  );
};

export default HomePage;
