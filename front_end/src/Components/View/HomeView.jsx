import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HomeContainer = () => {
  const navigate = useNavigate();
  
  // ===== STATE MANAGEMENT =====
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [statistics, setStatistics] = useState({
    totalVehicles: 0,
    totalBookings: 0,
    happyCustomers: 0,
  });
  const [testimonials, setTestimonials] = useState([]);

  // ===== LOGIC: Lấy user từ localStorage =====
  useEffect(() => {
    const fetchUserData = () => {
      try {
        const storedUser = localStorage.getItem("currentUser");
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        
        console.log("🔍 HomeContainer - Checking localStorage:", { 
          storedUser: storedUser ? "exists" : "null", 
          isLoggedIn 
        });
        
        if (storedUser && isLoggedIn === "true") {
          const userData = JSON.parse(storedUser);
          
          // 🔥 DEBUG: Log đầy đủ thông tin user
          console.log("✅ HomeContainer - Full user object:", userData);
          console.log("📝 HomeContainer - Available fields:", Object.keys(userData));
          console.log("👤 HomeContainer - User name:", userData.fullName || userData.name || userData.username);
          
          setUser(userData);
        } else {
          console.warn("⚠️ HomeContainer - No valid user found in localStorage");
          setUser(null);
        }
      } catch (error) {
        console.error("❌ HomeContainer - Error loading user data:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // ===== LOGIC: Fetch vehicles (sẽ dùng API sau) =====
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        // TODO: Thay bằng API call thực
        // const response = await fetch('YOUR_API/vehicles');
        // const data = await response.json();
        
        // Dummy data tạm thời
        const dummyVehicles = [
          {
            id: "1",
            name: "Tesla Model 3",
            type: "Sedan",
            price: 45,
            range: 358,
            image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400",
            available: true,
            rating: 4.8,
          },
          {
            id: "2",
            name: "Nissan Leaf",
            type: "Hatchback",
            price: 35,
            range: 226,
            image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400",
            available: true,
            rating: 4.5,
          },
          {
            id: "3",
            name: "Chevrolet Bolt",
            type: "Hatchback",
            price: 38,
            range: 259,
            image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400",
            available: false,
            rating: 4.6,
          },
        ];

        setVehicles(dummyVehicles);
        setFeaturedVehicles(dummyVehicles.slice(0, 3));
      } catch (error) {
        console.error("❌ Error fetching vehicles:", error);
      }
    };

    fetchVehicles();
  }, []);

  // ===== LOGIC: Fetch statistics =====
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // TODO: Thay bằng API call thực
        setStatistics({
          totalVehicles: 500,
          totalBookings: 15000,
          happyCustomers: 10000,
        });
      } catch (error) {
        console.error("❌ Error fetching statistics:", error);
      }
    };

    fetchStatistics();
  }, []);

  // ===== LOGIC: Fetch testimonials =====
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const dummyTestimonials = [
          {
            id: "1",
            name: "John Doe",
            avatar: "https://ui-avatars.com/api/?name=John+Doe",
            rating: 5,
            comment: "Excellent service! The Tesla Model 3 was in perfect condition.",
            date: "2025-09-15",
          },
          {
            id: "2",
            name: "Jane Smith",
            avatar: "https://ui-avatars.com/api/?name=Jane+Smith",
            rating: 5,
            comment: "Very easy booking process. Highly recommend!",
            date: "2025-09-20",
          },
        ];

        setTestimonials(dummyTestimonials);
      } catch (error) {
        console.error("❌ Error fetching testimonials:", error);
      }
    };

    fetchTestimonials();
  }, []);

  // ===== HANDLER: Logout =====
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      
      setUser(null);
      navigate("/login");
      console.log("✅ User logged out");
    }
  };

  // ===== HANDLER: Navigation =====
  const handleNavigation = (path) => {
    console.log(`🧭 Navigating to: ${path}`);
    
    // Đảm bảo user data được lưu trước khi navigate
    if (user && path === "/profile") {
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      console.log("💾 User data saved before navigation to profile");
    }
    
    navigate(path);
  };

  // ===== HANDLER: Book vehicle =====
  const handleBookVehicle = (vehicleId) => {
    if (!user) {
      // Redirect to login if not authenticated
      alert("Vui lòng đăng nhập để đặt xe");
      navigate("/login");
      return;
    }

    // Navigate to booking page with vehicle ID
    navigate(`/booking/${vehicleId}`);
    console.log(`📋 Booking vehicle ID: ${vehicleId}`);
  };

  // ===== HANDLER: View vehicle details =====
  const handleViewVehicle = (vehicleId) => {
    navigate(`/vehicle/${vehicleId}`);
    console.log(`👁️ Viewing vehicle ID: ${vehicleId}`);
  };

  // ===== HANDLER: Search vehicles =====
  const handleSearch = (searchQuery) => {
    console.log(`🔍 Searching for: ${searchQuery}`);
    navigate(`/vehicles?search=${searchQuery}`);
  };

  // ===== HANDLER: Filter by type =====
  const handleFilterByType = (type) => {
    console.log(`🔧 Filtering by type: ${type}`);
    navigate(`/vehicles?type=${type}`);
  };

  // ===== Helper: Get display name =====
  const getDisplayName = () => {
    if (!user) return "Khách";
    return user.fullName || user.name || user.username || user.email?.split('@')[0] || "Người dùng";
  };

  // Log user info whenever it changes
  useEffect(() => {
    if (user) {
      console.log("👤 Current user display name:", getDisplayName());
    }
  }, [user]);

  // ===== Truyền tất cả data và handlers xuống View =====
  return (
    <HomeView
      // User data
      user={user}
      loading={loading}
      displayName={getDisplayName()} // 🔥 THÊM displayName để View dùng
      
      // Vehicle data
      vehicles={vehicles}
      featuredVehicles={featuredVehicles}
      
      // Statistics
      statistics={statistics}
      
      // Testimonials
      testimonials={testimonials}
      
      // Handlers
      onLogout={handleLogout}
      onNavigate={handleNavigation}
      onBookVehicle={handleBookVehicle}
      onViewVehicle={handleViewVehicle}
      onSearch={handleSearch}
      onFilterByType={handleFilterByType}
    />
  );
};

export default HomeContainer;