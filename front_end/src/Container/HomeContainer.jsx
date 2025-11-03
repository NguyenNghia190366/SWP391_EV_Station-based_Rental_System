import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeView from "../Components/Common/View/HomeView";
import { stationAPI, driverLicenseAPI, cccdVerificationAPI } from "../api/api";
import { findNearestStation } from "../utils/geo";
import { clearUserData } from "../utils/auth";
import BookingVerificationModal from "../Components/Common/Modal/BookingVerificationModal";

const HomeContainer = () => {
  const navigate = useNavigate();
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
        const data = await stationAPI.getAll();
        const list = Array.isArray(data) ? data : data?.data || [];
        
        if (mounted) {
          if (list.length > 0) {
            console.log(' Loaded stations from API:', list.length);
            setStations(list);
          } else {
            // Fallback to dummy data if API returns empty
            console.warn(' API returned no stations, using dummy data');
            const dummyStations = [
              {
                id: 1,
                station_id: 1,
                station_name: "Trạm Quận 1",
                name: "Trạm Quận 1",
                address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
                latitude: 10.7769,
                longitude: 106.7009,
                lat: 10.7769,
                lng: 106.7009,
              },
              {
                id: 2,
                station_id: 2,
                station_name: "Trạm Quận 3",
                name: "Trạm Quận 3",
                address: "45 Võ Văn Tần, Quận 3, TP.HCM",
                latitude: 10.7826,
                longitude: 106.6920,
                lat: 10.7826,
                lng: 106.6920,
              },
              {
                id: 3,
                station_id: 3,
                station_name: "Trạm Bình Thạnh",
                name: "Trạm Bình Thạnh",
                address: "789 Điện Biên Phủ, Bình Thạnh, TP.HCM",
                latitude: 10.8054,
                longitude: 106.7141,
                lat: 10.8054,
                lng: 106.7141,
              },
              {
                id: 4,
                station_id: 4,
                station_name: "Trạm Quận 7",
                name: "Trạm Quận 7",
                address: "100 Nguyễn Văn Linh, Quận 7, TP.HCM",
                latitude: 10.7336,
                longitude: 106.7219,
                lat: 10.7336,
                lng: 106.7219,
              },
              {
                id: 5,
                station_id: 5,
                station_name: "Trạm Phú Nhuận",
                name: "Trạm Phú Nhuận",
                address: "56 Phan Đăng Lưu, Phú Nhuận, TP.HCM",
                latitude: 10.7971,
                longitude: 106.6822,
                lat: 10.7971,
                lng: 106.6822,
              },
            ];
            setStations(dummyStations);
          }
        }
      } catch (err) {
        console.error(' Error loading stations:', err);
        if (mounted) {
          // Fallback to dummy data on error
          const dummyStations = [
            {
              id: 1,
              station_id: 1,
              station_name: "Trạm Quận 1",
              name: "Trạm Quận 1",
              address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
              latitude: 10.7769,
              longitude: 106.7009,
              lat: 10.7769,
              lng: 106.7009,
            },
            {
              id: 2,
              station_id: 2,
              station_name: "Trạm Quận 3",
              name: "Trạm Quận 3",
              address: "45 Võ Văn Tần, Quận 3, TP.HCM",
              latitude: 10.7826,
              longitude: 106.6920,
              lat: 10.7826,
              lng: 106.6920,
            },
            {
              id: 3,
              station_id: 3,
              station_name: "Trạm Bình Thạnh",
              name: "Trạm Bình Thạnh",
              address: "789 Điện Biên Phủ, Bình Thạnh, TP.HCM",
              latitude: 10.8054,
              longitude: 106.7141,
              lat: 10.8054,
              lng: 106.7141,
            },
            {
              id: 4,
              station_id: 4,
              station_name: "Trạm Quận 7",
              name: "Trạm Quận 7",
              address: "100 Nguyễn Văn Linh, Quận 7, TP.HCM",
              latitude: 10.7336,
              longitude: 106.7219,
              lat: 10.7336,
              lng: 106.7219,
            },
            {
              id: 5,
              station_id: 5,
              station_name: "Trạm Phú Nhuận",
              name: "Trạm Phú Nhuận",
              address: "56 Phan Đăng Lưu, Phú Nhuận, TP.HCM",
              latitude: 10.7971,
              longitude: 106.6822,
              lat: 10.7971,
              lng: 106.6822,
            },
          ];
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

    // 🔄 HYBRID VERIFICATION LOGIC - Supports both Mock BE and Real BE
    // Mock BE Pattern: EXACT match - admin001, staff001, renter001, renter002 (3 digits)
    // Real BE Pattern: Any other userId format (GUIDs, numbers, etc.)
    const userId = String(user.userId || '');
    const isMockAccount = /^(admin|staff|renter)\d{3}$/i.test(userId);

    if (isMockAccount) {
      console.log('✅ Mock BE account detected:', userId, '- Skipping API verification check');
      navigate(`/booking/${vehicleId}`);
      return;
    }

    // 🔍 Real BE account - Check verification via API
    console.log('🔍 Real BE account detected:', userId, '- Checking verification via API');

    // Check verification status
    try {
      let licenseVerified = false;
      let cccdVerified = false;

      try {
        const licenseData = await driverLicenseAPI.getByRenter(user.userId || user.user_id);
        licenseVerified = licenseData?.is_verified === true;
      } catch (err) {
        console.warn('Could not check license verification:', err);
      }

      try {
        const cccdData = await cccdVerificationAPI.getByRenter(user.userId || user.user_id);
        cccdVerified = cccdData?.is_verified === true;
      } catch (err) {
        console.warn('Could not check CCCD verification:', err);
      }

      // Determine what needs verification
      if (!licenseVerified && !cccdVerified) {
        setVerificationType('both');
        setShowVerificationModal(true);
        return;
      } else if (!licenseVerified) {
        setVerificationType('license');
        setShowVerificationModal(true);
        return;
      } else if (!cccdVerified) {
        setVerificationType('cccd');
        setShowVerificationModal(true);
        return;
      }

      // All verified, proceed to booking
      navigate(`/booking/${vehicleId}`);
    } catch (error) {
      console.error('Error checking verification:', error);
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
