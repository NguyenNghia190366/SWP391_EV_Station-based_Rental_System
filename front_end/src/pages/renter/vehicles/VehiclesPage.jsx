import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useVehicleAPI } from "@/hooks/useVehicles";
import { normalizeVehicleData } from "@/utils/normalizeData";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import BookingVerificationModal from "@/pages/renter/booking/BookingVerificationModal";
import VehicleCard from "@/pages/renter/vehicles/VehicleCard";

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

  // ===== Fetch vehicles once =====
  useEffect(() => {
    const fetchVehicles = async () => {
      if (hasLoadedVehicles) return;

      setLoading(true);
      try {
          const data = await getAll();
          const vehiclesList = Array.isArray(data) ? data : data?.data || [];

          // Fetch vehicle models to get brandName so we can build display name (brand + model)
          let models = [];
          try {
            const modelsRes = await api.get("/VehicleModels");
            models = Array.isArray(modelsRes.data) ? modelsRes.data : modelsRes.data?.data || [];
          } catch (err) {
            console.warn("Không tải được VehicleModels, sẽ dùng dữ liệu model từ Vehicles:", err);
            models = [];
          }

          // Build model map for quick lookup
          const modelMap = new Map();
          models.forEach((m) => {
            const id = m.vehicleModelId ?? m.modelId ?? m.id;
            if (id !== undefined && id !== null) modelMap.set(Number(id), m);
          });

          // Attach brandName from model to each vehicle when available
          const vehiclesWithBrand = vehiclesList.map((v) => {
            const modelKey = v.vehicleModelId ?? v.modelId ?? v.vehicle_model_id ?? v.model_id;
            const modelRec = modelMap.get(Number(modelKey));
            return {
              ...v,
              brandName: modelRec?.brandName ?? modelRec?.brand ?? undefined,
            };
          });

          const normalizedVehicles = vehiclesWithBrand.map((v) => normalizeVehicleData(v));

        console.log("✅ Normalized vehicles:", normalizedVehicles);
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
            station: { name: "Trạm Quận 1" },
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
            station: { name: "Trạm Quận 3" },
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
        setFilteredVehicles(vehicles);
        return;
      }
      const lowerQuery = query.toLowerCase();
      setFilteredVehicles(
        vehicles.filter((v) =>
          [v.name, v.type, v.licensePlate]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(lowerQuery))
        )
      );
    },
    [vehicles]
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  // ===== Handle URL ?search= =====
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) handleSearch(searchQuery);
  }, [searchParams, handleSearch]);

  // ===== Filter by type =====
  const handleFilterByType = (type) => {
    setSelectedType(type);
    if (type === "all") {
      setFilteredVehicles(vehicles);
    } else {
      setFilteredVehicles(vehicles.filter((v) => v.type === type));
    }
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
      alert("Chỉ khách hàng mới có thể đặt xe!");
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

      navigate(`/booking/${vehicleId}`);
    } catch (error) {
      console.error("❌ Error checking renter verification:", error);
      alert("Có lỗi khi kiểm tra xác thực. Vui lòng thử lại.");
    }
  };

  const handleNavigateToVerification = () => {
    setShowVerificationModal(false);
    navigate("/profile");
  };

  // ===== VEHICLE TYPES =====
  const vehicleTypes = [
    { value: "all", label: "Tất cả" },
    { value: "scooter", label: "Xe máy điện" },
    { value: "bike", label: "Xe đạp điện" },
    { value: "car", label: "Ô tô điện" },
    { value: "motorcycle", label: "Mô tô điện" },
  ];

  // ===== RENDER =====
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-transparent"></div>
          <p className="mt-4 text-lg text-gray-700 font-semibold">
            Đang tải danh sách xe...
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
            Danh sách xe điện
          </h1>
          <p className="text-lg md:text-xl text-gray-700">
            Chọn chiếc xe điện phù hợp với nhu cầu của bạn
          </p>
        </div>
      </section>

      {/* Filter & Search */}
      <section className="sticky top-16 z-40 bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Tìm kiếm xe theo tên, model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-gray-800 text-lg placeholder-gray-400"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-xl transition-all duration-200"
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
                onClick={() => handleFilterByType(type.value)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 
                  ${selectedType === type.value
                    ? "bg-indigo-600 text-white shadow-lg scale-105"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md"
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {filteredVehicles.length > 0
                ? `Tìm thấy ${filteredVehicles.length} xe phù hợp`
                : "Không tìm thấy xe nào"}
            </h2>
          </div>

          {filteredVehicles.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Không có xe điện nào
              </h3>
              <p className="text-gray-600 text-lg">
                Vui lòng thử lại với bộ lọc khác hoặc quay lại sau.
              </p>
            </div>
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
