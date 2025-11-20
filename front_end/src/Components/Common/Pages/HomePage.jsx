import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStations } from "@/hooks/useStations";
import { findNearestStation } from "@/utils/geo";
import { clearUserData } from "@/utils/auth";
import BookingVerificationModal from "@/pages/renter/booking/BookingVerificationModal";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import MapLeaflet from "@/Components/Common/Map/MapLeaflet";
import NearbyStationsSuggestions from "@/Components/Common/Map/NearbyStationsSuggestions";
import VehiclesByStation from "@/pages/renter/vehicles/VehiclesByStation";

const HomePage = () => {
  const navigate = useNavigate();
  const api = useAxiosInstance();
  const { getAll, getNearest } = useStations();

  // ==== State ====
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [nearestStation, setNearestStation] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
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
        const stations = await getAll();
        if (mounted) {
          if (stations.length > 0) {
            console.log("✅ Loaded stations from API:", stations.length);
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
  }, [getAll]);

  // ==== Logout ====
  const handleLogout = useCallback(() => {
    clearUserData();
    setUser(null);
    navigate("/login");
  }, [navigate]);

  // ==== Find nearest station - MEMOIZED (avoid recreating when stations change) ====
  const findNearestStationForUser = useCallback(async (opts = {}) => {
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
        const apiResult = await getNearest(lat, lng);
        const station = apiResult?.station || apiResult;
        const distanceKm = apiResult?.distanceKm ?? apiResult?.distance ?? null;
        const payload = { station, distanceKm };
        setNearestStation(payload);
        return payload;
      } catch (apiErr) {
        // Use current stations from closure (captured at function creation)
        // or fetch fresh to avoid stale closure
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
  }, [getNearest, stations]);

  // ==== Booking flow with renter verification - MEMOIZED ====
  const handleBookVehicle = useCallback(async (vehicleId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const userRole = (user.role || "").toLowerCase();
    if (userRole !== "renter") {
      alert("Only customers can book vehicles!");
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
        alert("Renter information not found. Please contact the admin.");
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
      alert("There was an error while checking verification. Please try again.");
    }
  }, [user, api, navigate]);

  const handleNavigateToVerification = useCallback(() => {
    setShowVerificationModal(false);
    navigate("/profile");
  }, [navigate]);

  // ==== Search handler - MEMOIZED ====
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/vehicles?search=${searchQuery}`);
  }, [searchQuery, navigate]);

  // ==== Station selection from suggestions - MEMOIZED ====
  const handleSelectStation = useCallback((station) => {
    const stationLat = station.latitude ?? station.lat;
    const stationLng = station.longitude ?? station.lng;
    setSelectedStation(station);
    // navigate to vehicles page with station query so VehiclesPage can filter by station
    const stationId = station.stationId ?? station.id ?? station.station_id;
    if (stationId) {
      navigate(`/vehicles?station=${stationId}`);
    } else {
      findNearestStationForUser({ lat: stationLat, lng: stationLng });
    }
  }, [findNearestStationForUser]);

  // ==== MEMOIZE highlighted station for MapLeaflet ====
  const highlightedStation = useMemo(() => {
    return nearestStation?.station || null;
  }, [nearestStation?.station]);

  // ==== MEMOIZE user location for NearbyStationsSuggestions ====
  const userLocation = useMemo(() => {
    if (!nearestStation?.station) return null;
    return {
      lat: nearestStation.station?.latitude ?? nearestStation.station?.lat,
      lng: nearestStation.station?.longitude ?? nearestStation.station?.lng,
    };
  }, [nearestStation?.station]);

  // ==== MEMOIZE stations reference to prevent child re-renders when IDs haven't changed ====
  const memoizedStations = useMemo(() => {
    return stations;
  }, [stations]);

  // ==== Loading state ====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-transparent"></div>
          <p className="mt-4 text-lg text-gray-700 font-semibold">Loading...</p>
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
              Rental EV
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 mb-10">
              Experience the future of mobility with premium electric vehicles
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search EVs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-6 py-4 rounded-lg text-gray-800 text-lg border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all duration-150"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate("/vehicles")}
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-150"
              >
                Explore now
              </button>
              <button
                onClick={() => findNearestStationForUser()}
                disabled={nearestSearching}
                className="px-8 py-4 bg-white text-gray-700 border border-gray-200 font-bold rounded-lg hover:bg-gray-50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {nearestSearching ? "Searching..." : "Find nearest station"}
              </button>
            </div>
          </div>
        </section>

        {/* MAP SECTION */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 text-center">
              Rent stations near you
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-xl">
                <MapLeaflet
                  stations={memoizedStations}
                  highlightedStation={highlightedStation}
                  height="420px"
                  zoom={13}
                  onFindNearest={findNearestStationForUser}
                />
              </div>
              <div className="lg:col-span-1">
                <NearbyStationsSuggestions
                  userLocation={userLocation}
                  stations={memoizedStations}
                  onSelectStation={handleSelectStation}
                  limit={5}
                />
              </div>
            </div>
          </div>
        </section>

        {/* VEHICLES BY STATION SECTION */}
        {selectedStation && (
          <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <VehiclesByStation station={selectedStation} />
            </div>
          </section>
        )}
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