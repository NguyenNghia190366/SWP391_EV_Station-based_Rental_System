import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useVehicleAPI } from "@/hooks/useVehicles";
import { normalizeVehicleData } from "@/utils/normalizeData";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import BookingVerificationModal from "@/pages/renter/booking/BookingVerificationModal";
import VehicleCard from "@/pages/renter/vehicles/VehicleCard";
import VehiclesByModel from "@/pages/renter/vehicles/VehiclesByModel";

const VehiclesPage = () => {
  const navigate = useNavigate();
  const api = useAxiosInstance();
  const { getAll } = useVehicleAPI();
  const [searchParams] = useSearchParams();

  // ===== STATE =====
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState("license");
  const [hasLoadedVehicles, setHasLoadedVehicles] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState("all");
  const [viewMode, setViewMode] = useState("grouped"); // "grouped" or "list"

  // ===== Load user info =====
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (storedUser && isLoggedIn === "true") {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Error reading user from localStorage", e);
    }
  }, []);

  // ===== Fetch stations =====
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await api.get("/Stations");
        const stationsList = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setStations(stationsList);
      } catch (err) {
        console.warn("Failed to fetch stations:", err);
        setStations([]);
      }
    };
    fetchStations();
  }, [api]);

  // ===== Fetch vehicles once =====
  useEffect(() => {
    const fetchVehicles = async () => {
      if (hasLoadedVehicles) return;

      setLoading(true);
      try {
          const data = await getAll();
          const vehiclesList = Array.isArray(data) ? data : data?.data || [];

          // Log raw vehicle to see actual structure from backend
          if (vehiclesList.length > 0) {
            console.log("Raw vehicle from API:", vehiclesList[0]);
          }

          // Fetch vehicle models to get brandName so we can build display name (brand + model)
          let models = [];
          try {
            const modelsRes = await api.get("/VehicleModels");
            models = Array.isArray(modelsRes.data) ? modelsRes.data : modelsRes.data?.data || [];
          } catch (err) {
            console.warn("Cannot load VehicleModels, will use model data from Vehicles:", err);
            models = [];
          }

          // Fetch rental orders to check which vehicles are currently rented
          let allRentalOrders = [];
          try {
            const ordersRes = await api.get("/RentalOrders");
            allRentalOrders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.data || [];
          } catch (err) {
            console.warn("Cannot load RentalOrders:", err);
            allRentalOrders = [];
          }

          // Build model map for quick lookup
          const modelMap = new Map();
          models.forEach((m) => {
            const id = m.vehicleModelId ?? m.modelId ?? m.id;
            if (id !== undefined && id !== null) modelMap.set(Number(id), m);
          });

          // Build rental orders map by vehicleId
          const ordersMapByVehicle = new Map();
          allRentalOrders.forEach((order) => {
            const vId = order.vehicleId;
            if (vId !== undefined && vId !== null) {
              if (!ordersMapByVehicle.has(vId)) {
                ordersMapByVehicle.set(vId, []);
              }
              ordersMapByVehicle.get(vId).push(order);
            }
          });

          // Attach brandName from model to each vehicle when available, and attach rental orders
          const vehiclesWithBrand = vehiclesList.map((v) => {
            const modelKey = v.vehicleModelId ?? v.modelId ?? v.vehicle_model_id ?? v.model_id;
            const modelRec = modelMap.get(Number(modelKey));
            const vId = v.vehicleId ?? v.id;
            return {
              ...v,
              brandName: modelRec?.brandName ?? modelRec?.brand ?? undefined,
              rentalOrders: ordersMapByVehicle.get(vId) || [],
            };
          });

          const normalizedVehicles = vehiclesWithBrand.map((v) => normalizeVehicleData(v));

        setVehicles(normalizedVehicles);
        setFilteredVehicles(normalizedVehicles);
        setHasLoadedVehicles(true);
      } catch (err) {
        console.warn("⚠️ API failed, using dummy data:", err);
        const dummyVehicles = [
          {
            id: "1",
            name: "Tesla Model 3",
            type: "car",
            image:
              "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500",
            price: 50,
            range: 450,
            battery: 95,
            rating: 4.8,
            available: true,
            station: { name: "District 1 Station" },
          },
          {
            id: "2",
            name: "VinFast Klara S",
            type: "scooter",
            image:
              "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
            price: 15,
            range: 80,
            battery: 100,
            rating: 4.5,
            available: true,
            station: { name: "District 3 Station" },
          },
        ];
        setVehicles(dummyVehicles);
        setFilteredVehicles(dummyVehicles);
        setHasLoadedVehicles(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [getAll, hasLoadedVehicles]);

  // ===== Handle search =====
  const handleSearch = useCallback(
    (query) => {
      if (!query?.trim()) {
        applyFilters(vehicles, selectedType, selectedStation);
        return;
      }
      const lowerQuery = query.toLowerCase();
      const searched = vehicles.filter((v) =>
        [v.name, v.type, v.licensePlate]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(lowerQuery))
      );
      applyFilters(searched, selectedType, selectedStation);
    },
    [vehicles, selectedType, selectedStation]
  );

  // ===== Apply all filters (type, station, search) =====
  const applyFilters = useCallback((baseVehicles, type, station) => {
    let result = baseVehicles;

    // Filter by type
    if (type !== "all") {
      result = result.filter((v) => v.type === type);
    }

    // Filter by station
    if (station !== "all") {
      const stationId = Number(station);
      result = result.filter((v) => {
        // Check multiple possible field names for stationId
        const vStationId = 
          v.stationId || 
          v.station_id || 
          v.station?.stationId || 
          v.station?.id ||
          v._original?.stationId ||
          v._original?.station_id;
        
        return Number(vStationId) === stationId;
      });
    }

    setFilteredVehicles(result);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  // ===== Handle URL ?search= and ?station= =====
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    const stationParam = searchParams.get("station");
    
    if (stationParam) {
      setSelectedStation(stationParam);
      applyFilters(vehicles, selectedType, stationParam);
    }
    
    if (searchQuery) handleSearch(searchQuery);
  }, [searchParams, handleSearch, vehicles, selectedType, applyFilters]);

  // ===== Filter by type =====
  const handleFilterByType = (type) => {
    setSelectedType(type);
    applyFilters(vehicles, type, selectedStation);
  };

  // ===== Filter by station =====
  const handleFilterByStation = (stationId) => {
    setSelectedStation(stationId);
    applyFilters(vehicles, selectedType, stationId);
  };

  // ===== View details =====
  const handleViewDetails = (vehicleId) => navigate(`/vehicle/${vehicleId}`);

  // ===== Booking flow =====
  const handleBookVehicle = async (vehicleId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const userRole = (user.role || "").toLowerCase();
    if (userRole !== "renter") {
      alert("Only renters can book vehicles!");
      return;
    }

    try {
      const response = await api.get(`/Renters`);
      const rentersList = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      const currentRenter = rentersList.find(
        (r) =>
          String(r.renterId) === String(user.renterId || user.renter_id) ||
          String(r.userId) === String(user.userId || user.user_id)
      );

      if (!currentRenter) {
        alert("Renter information not found. Please contact admin.");
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

      navigate(`/booking/${vehicleId}`);
    } catch (error) {
      console.error("❌ Error checking renter verification:", error);
      alert("There was an error checking verification. Please try again.");
    }
  };

  const handleNavigateToVerification = () => {
    setShowVerificationModal(false);
    navigate("/profile");
  };

  // ===== VEHICLE TYPES =====
  const vehicleTypes = [
    { value: "all", label: "All" },

  ];

  // ===== RENDER =====
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-transparent"></div>
          <p className="mt-4 text-lg text-gray-700 font-semibold">
            Loading vehicle list...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white text-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
            Electric vehicle list
          </h1>
          <p className="text-lg md:text-xl text-gray-700">
            Choose an electric vehicle that fits your needs
          </p>
        </div>
      </section>

      {/* Filter & Search (compact) */}
      <section className="sticky top-16 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            {/* Search Bar (compact) */}
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search vehicles by name, model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none transition-all text-gray-800 text-base placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Station Filter inline (compact) */}
            {stations.length > 0 && (
              <select
                value={selectedStation}
                onChange={(e) => handleFilterByStation(e.target.value)}
                className="ml-2 px-3 py-2 rounded-lg border-2 border-gray-200 bg-white text-sm text-gray-700 font-medium outline-none"
              >
                <option value="all">All stations</option>
                {stations.map((station) => (
                  <option key={station.stationId || station.id} value={String(station.stationId || station.id)}>
                    {station.stationName || `Station ${station.stationId || station.id}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Type Filter (compact chips, horizontally scrollable on small screens) */}
          <div className="mt-3 overflow-x-auto">
            <div className="flex gap-2 items-center">
              {vehicleTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleFilterByType(type.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap
                    ${selectedType === type.value
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {viewMode === "grouped"
                ? "Vehicles by model"
                : filteredVehicles.length > 0
                ? `Found ${filteredVehicles.length} vehicles`
                : "No vehicles found"}
            </h2>
            <button
              onClick={() => setViewMode(viewMode === "grouped" ? "list" : "grouped")}
              className="px-4 py-2 rounded-lg border-2 border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
            >
              {viewMode === "grouped" ? "View list" : "View by model"}
            </button>
          </div>

          {filteredVehicles.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                No vehicles found
              </h3>
              <p className="text-gray-600 text-lg">
                Please try again with different filters or check back later.
              </p>
            </div>
          ) : viewMode === "grouped" ? (
            <VehiclesByModel 
              vehicles={filteredVehicles}
              onSelectModel={(modelId, modelName) => {
                // Optional: filter by model
                console.log("Selected model:", modelId, modelName);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onViewDetails={handleViewDetails}
                  onBookVehicle={handleBookVehicle}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <BookingVerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onNavigateToVerification={handleNavigateToVerification}
        verificationType={verificationType}
      />
    </div>
  );
};

export default VehiclesPage;
