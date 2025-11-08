import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeView from "../../../Components/Common/View/Home/HomeView";
import { stationAPI, driverLicenseAPI, cccdVerificationAPI } from "../../../api/api";
import { findNearestStation } from "../../../utils/geo";
import { clearUserData } from "../../../utils/auth";
import BookingVerificationModal from "../../../Components/Common/View/Modal/BookingVerificationModal";
import { useAxiosInstance } from "../../../hooks/useAxiosInstance";

const HomeContainer = () => {
  const navigate = useNavigate();
  const api = useAxiosInstance();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [statistics, setStatistics] = useState({ totalVehicles: 0, totalBookings: 0, happyCustomers: 0 });
  const [testimonials, setTestimonials] = useState([]);
  const [stations, setStations] = useState([]);
  const [nearestStation, setNearestStation] = useState(null);
  const [nearestSearching, setNearestSearching] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState('license');

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

  useEffect(() => {
    const dummy = [
      { id: "1", name: "Tesla Model 3" },
      { id: "2", name: "Nissan Leaf" },
      { id: "3", name: "Chevrolet Bolt" },
    ];
    setVehicles(dummy);
    setFeaturedVehicles(dummy.slice(0, 3));
  }, []);

  useEffect(() => setStatistics({ totalVehicles: 500, totalBookings: 15000, happyCustomers: 10000 }), []);

  useEffect(() => {
    setTestimonials([
      { id: "1", name: "John Doe", rating: 5, comment: "Excellent service!" },
      { id: "2", name: "Jane Smith", rating: 5, comment: "Very easy booking process." },
    ]);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchStations = async () => {
      try {
        const stations = await stationAPI.getAll();
        
        if (mounted) {
          if (stations.length > 0) {
            console.log('Loaded stations from API:', stations.length);
            console.log('Sample station:', stations[0]);
            setStations(stations);
          } else {
            // Fallback to dummy data if API returns empty
            console.warn('⚠️ API returned no stations, using dummy data');
            
            setStations(dummyStations);
          }
        }
      } catch (err) {
        console.error('❌ Error loading stations:', err);
        if (mounted) {
          
          setStations(dummyStations);
        }
      }
    };
    fetchStations();
    return () => { mounted = false };
  }, []);

  const handleLogout = () => {
    // Sử dụng helper function để xóa toàn bộ user data
    clearUserData();
    
    // Reset state
    setUser(null);
    
    // Redirect về trang login
    navigate('/login');
  };

  const findNearestStationForUser = async (opts = {}) => {
    setNearestSearching(true);
    try {
      let lat = opts.lat; let lng = opts.lng;
      if (lat == null || lng == null) {
        if (!navigator.geolocation) throw new Error('Geolocation not available');
        const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 }));
        lat = pos.coords.latitude; lng = pos.coords.longitude;
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
        if (best) { setNearestStation(best); return best }
        throw apiErr;
      }
    } catch (err) {
      console.error('Nearest station lookup failed', err);
      setNearestStation(null);
      return null;
    } finally {
      setNearestSearching(false);
    }
  };

  const handleBookVehicle = async (vehicleId) => {
    // Check if user is logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Check if user is renter (case-insensitive)
    const userRole = (user.role || '').toLowerCase();
    if (userRole !== 'renter') {
      alert('Chỉ khách hàng mới có thể đặt xe!');
      return;
    }

    // ✅ Fetch isVerified từ bảng Renters (không dùng user object)
    try {
      console.log('🔍 Fetching renter verification status from /Renters...');
      console.log('📊 User info:', { userId: user.userId, renterId: user.renterId });

      // Gọi API lấy thông tin renter từ DB
      const response = await api.get(`/Renters`);
      const rentersList = Array.isArray(response.data) ? response.data : response.data?.data || [];
      
      console.log('📦 Renters from API:', rentersList);

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
    navigate('/profile');
  };

  return (
    <>
      <HomeView
        user={user}
        loading={loading}
        vehicles={vehicles}
        featuredVehicles={featuredVehicles}
        statistics={statistics}
        testimonials={testimonials}
        stations={stations}
        onFindNearest={findNearestStationForUser}
        nearestStation={nearestStation}
        nearestSearching={nearestSearching}
        onLogout={handleLogout}
        onNavigate={(p) => navigate(p)}
        onBookVehicle={handleBookVehicle}
        onViewVehicle={(id) => navigate(`/vehicle/${id}`)}
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

export default HomeContainer;
