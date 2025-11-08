import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import VehiclesView from "../pages/VehiclesView";
import { useVehicleAPI } from "../../../../../hooks/useVehicles";
import BookingVerificationModal from "../../Modal/BookingVerificationModal";
import { normalizeVehicleData } from "../../../../../utils/normalizeData";
import { useAxiosInstance } from "../../../../../hooks/useAxiosInstance";

const VehiclesContainer = () => {
  const navigate = useNavigate();
  const api = useAxiosInstance();
  const { getAll } = useVehicleAPI();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState("license");
  const [hasLoadedVehicles, setHasLoadedVehicles] = useState(false);

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
  }, [getAll]); 

  useEffect(() => {
    const fetchVehicles = async () => {
      // Prevent multiple fetches
      if (hasLoadedVehicles) return;
      
      setLoading(true);
      try {
        // Try to fetch from API
        const data = await getAll();
        const vehiclesList = Array.isArray(data) ? data : data?.data || [];

        // Normalize vehicle data to match frontend expectations
        const normalizedVehicles = vehiclesList.map((vehicle) =>
          normalizeVehicleData(vehicle)
        );

        console.log(" Raw vehicles from API:", vehiclesList);
        console.log(" Normalized vehicles:", normalizedVehicles);

        // Show ALL vehicles (available + unavailable)
        setVehicles(normalizedVehicles);
        setFilteredVehicles(normalizedVehicles);
        setHasLoadedVehicles(true);
      } catch (err) {
        console.warn("Could not load vehicles from API, using dummy data", err);
        // Fallback to dummy data
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
          {
            id: "3",
            name: "Xiaomi Electric Scooter",
            type: "scooter",
            image:
              "https://images.unsplash.com/photo-1613214149754-8f95e9837336?w=500",
            price: 12,
            range: 45,
            battery: 85,
            rating: 4.3,
            available: true,
            station: { name: "Trạm Quận 5" },
          },
          {
            id: "4",
            name: "Giant Electric Bike",
            type: "bike",
            image:
              "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=500",
            price: 8,
            range: 60,
            battery: 90,
            rating: 4.6,
            available: true,
            station: { name: "Trạm Quận 7" },
          },
          {
            id: "5",
            name: "Nissan Leaf",
            type: "car",
            image:
              "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=500",
            price: 45,
            range: 350,
            battery: 88,
            rating: 4.7,
            available: false,
            station: { name: "Trạm Bình Thạnh" },
          },
          {
            id: "6",
            name: "Honda PCX Electric",
            type: "motorcycle",
            image:
              "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=500",
            price: 20,
            range: 120,
            battery: 92,
            rating: 4.9,
            available: true,
            station: { name: "Trạm Quận 10" },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Handle search with useCallback to prevent dependency issues
  const handleSearch = useCallback(
    (query) => {
      if (!query || !query.trim()) {
        setFilteredVehicles(vehicles);
        return;
      }

      const lowerQuery = query.toLowerCase();
      const filtered = vehicles.filter((v) => {
        const name = (v.name || "").toLowerCase();
        const type = (v.type || "").toLowerCase();
        const licensePlate = (v.licensePlate || "").toLowerCase();
        return (
          name.includes(lowerQuery) ||
          type.includes(lowerQuery) ||
          licensePlate.includes(lowerQuery)
        );
      });
      setFilteredVehicles(filtered);
    },
    [vehicles]
  );

  // Handle search from URL params
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [searchParams, handleSearch]);

  const handleFilterByType = (type) => {
    if (!type) {
      setFilteredVehicles(vehicles);
      return;
    }

    const filtered = vehicles.filter((v) => v.type === type);
    setFilteredVehicles(filtered);
  };

  const handleViewDetails = (vehicleId) => {
    navigate(`/vehicle/${vehicleId}`);
  };

  const handleBookVehicle = async (vehicleId) => {
    // Check if user is logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Check if user is renter (case-insensitive)
    const userRole = (user.role || "").toLowerCase();
    if (userRole !== "renter") {
      alert("Chỉ khách hàng mới có thể đặt xe!");
      return;
    }

    // ✅ Fetch isVerified từ bảng Renters (không dùng user object)
    try {
      console.log('🔍 Fetching renter verification status from /Renters...');
      console.log('📊 User info:', { userId: user.userId, renterId: user.renterId });

      // Gọi API lấy thông tin renter từ DB
      const response = await api.get(`/Renters`);
      const rentersList = Array.isArray(response.data) ? response.data : response.data?.data || [];
      
      console.log('� Renters from API:', rentersList);

      // Tìm renter hiện tại (match bằng userId hoặc renterId)
      const currentRenter = rentersList.find(r => 
        (r.renterId && String(r.renterId) === String(user.renterId || user.renter_id)) ||
        (r.userId && String(r.userId) === String(user.userId || user.user_id)) ||
        (r.user_id && String(r.user_id) === String(user.userId || user.user_id))
      );

      console.log('📊 Found current renter:', currentRenter);

      if (!currentRenter) {
        console.error('❌ Không tìm thấy renter trong DB');
        alert('Không tìm thấy thông tin người thuê. Vui lòng liên hệ admin.');
        return;
      }

      // Kiểm tra isVerified từ Renters table
      const isVerified = currentRenter.isVerified === true || 
                        currentRenter.isVerified === 1 || 
                        currentRenter.isVerified === '1';

      console.log('📊 Renter isVerified:', currentRenter.isVerified, 'Type:', typeof currentRenter.isVerified);
      console.log('✅ Final verification status:', isVerified);

      if (!isVerified) {
        console.warn('❌ Renter chưa được xác thực (isVerified = false/0)');
        // Hiển thị modal thông báo cần xác thực
        setVerificationType('both');
        setShowVerificationModal(true);
        return;
      }

      // ✅ Renter đã verified, cho phép thuê xe
      console.log('✅ Renter đã verified, proceeding to booking...');
      navigate(`/booking-request/${vehicleId}`);

    } catch (error) {
      console.error('❌ Error checking renter verification:', error);
      alert('Có lỗi khi kiểm tra xác thực. Vui lòng thử lại.');
    }
  };

  const handleNavigateToVerification = () => {
    setShowVerificationModal(false);
    navigate("/profile"); // Navigate to profile page where user can upload documents
  };

  return (
    <>
      <VehiclesView
        vehicles={filteredVehicles}
        loading={loading}
        onSearch={handleSearch}
        onFilterByType={handleFilterByType}
        onViewDetails={handleViewDetails}
        onBookVehicle={handleBookVehicle}
        user={user}
      />

      <BookingVerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onNavigateToVerification={handleNavigateToVerification}
        verificationType={verificationType}
      />
    </>
  );
};

export default VehiclesContainer;
