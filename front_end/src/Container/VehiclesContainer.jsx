import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import VehiclesView from "../Components/Common/View/VehiclesView";
import { vehicleAPI } from "../api/vehicleAPI";
import { driverLicenseAPI, cccdVerificationAPI } from "../api/api";
import BookingVerificationModal from "../Components/Common/Modal/BookingVerificationModal";
import { normalizeVehicleData } from "../utils/normalizeData";

const VehiclesContainer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState("license");

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

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        // Try to fetch from API
        const data = await vehicleAPI.getAll();
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
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

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

    // Check verification status
    try {
      // HYBRID LOGIC: Support both Mock BE and Real BE
      // Strategy:
      // 1. Mock BE accounts have EXACT pattern: admin001, staff001, renter001, renter002, etc.
      // 2. Real BE accounts have different userId patterns (GUIDs, numbers, etc.)
      
      const userId = String(user.userId || "");
      const isMockAccount = /^(admin|staff|renter)\d{3}$/i.test(userId);

      if (isMockAccount) {
        console.log(
          "✅ Mock BE account detected:",
          userId,
          "- Skipping API verification check"
        );
        navigate(`/booking/${vehicleId}`);
        return;
      }

      console.log("🔍 Real BE account detected:", userId, "- Checking verification via API");


      // Real BE: Check driver license and CCCD verification via API
      let licenseVerified = false;
      let cccdVerified = false;

      try {
        const licenseData = await driverLicenseAPI.getByRenter(
          user.userId || user.user_id
        );
        console.log("🔍 RAW License data:", licenseData);
        console.log("🔍 License data type:", Array.isArray(licenseData) ? "Array" : typeof licenseData);
        
        // Support both Array and Object response
        const licenseItem = Array.isArray(licenseData) ? licenseData[0] : licenseData;
        console.log("🔍 License item:", licenseItem);
        
        licenseVerified = 
          licenseItem?.is_verified === true || 
          licenseItem?.isVerified === true ||
          licenseItem?.IsVerified === true;
        console.log("✅ License verified:", licenseVerified);
      } catch (err) {
        console.warn("❌ Could not check license verification:", err);
      }

      try {
        const cccdData = await cccdVerificationAPI.getByRenter(
          user.userId || user.user_id
        );
        console.log("🔍 RAW CCCD data:", cccdData);
        console.log("🔍 CCCD data type:", Array.isArray(cccdData) ? "Array" : typeof cccdData);
        
        // Support both Array and Object response
        const cccdItem = Array.isArray(cccdData) ? cccdData[0] : cccdData;
        console.log("🔍 CCCD item:", cccdItem);
        
        cccdVerified = 
          cccdItem?.is_verified === true || 
          cccdItem?.isVerified === true ||
          cccdItem?.IsVerified === true;
        console.log("✅ CCCD verified:", cccdVerified);
      } catch (err) {
        console.warn("❌ Could not check CCCD verification:", err);
      }

      console.log(" Final verification status:", {
        licenseVerified,
        cccdVerified,
      });

      // Determine what needs verification
      if (!licenseVerified && !cccdVerified) {
        console.log(" Showing modal: both");
        setVerificationType("both");
        setShowVerificationModal(true);
        return;
      } else if (!licenseVerified) {
        console.log(" Showing modal: license");
        setVerificationType("license");
        setShowVerificationModal(true);
        return;
      } else if (!cccdVerified) {
        console.log(" Showing modal: cccd");
        setVerificationType("cccd");
        setShowVerificationModal(true);
        return;
      }

      // All verified, proceed to booking
      console.log(" All verified! Navigating to booking...");
      navigate(`/booking/${vehicleId}`);
    } catch (error) {
      console.error("Error checking verification:", error);
      alert("Có lỗi khi kiểm tra xác thực. Vui lòng thử lại.");
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
