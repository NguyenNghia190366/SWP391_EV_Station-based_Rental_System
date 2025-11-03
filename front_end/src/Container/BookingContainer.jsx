import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BookingView from '../Components/Common/View/BookingView';
import { vehicleAPI } from '../api/useEV';

const BookingContainer = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const [user, setUser] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [bookingData, setBookingData] = useState({
    phone: '',
    startDate: '',
    endDate: '',
    pickupLocation: '',
    notes: ''
  });

  // Check authentication
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!storedUser || isLoggedIn !== 'true') {
      alert('Vui lòng đăng nhập để đặt xe!');
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(storedUser);
    setUser(userData);
    
    // Pre-fill phone if available
    if (userData.phone) {
      setBookingData(prev => ({ ...prev, phone: userData.phone }));
    }
  }, [navigate]);

  // Fetch vehicle details
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) {
        navigate('/vehicles');
        return;
      }

      try {
        setLoading(true);
        const data = await vehicleAPI.getById(vehicleId);
        setVehicle(data);
        
        // Pre-fill pickup location
        if (data.station?.name) {
          setBookingData(prev => ({ 
            ...prev, 
            pickupLocation: data.station.name 
          }));
        }
      } catch (err) {
        console.error('Error fetching vehicle:', err);
        
        // Fallback to dummy data
        const dummyVehicles = [
          {
            id: "1",
            name: "Tesla Model 3",
            type: "car",
            image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500",
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
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
            price: 15,
            range: 80,
            battery: 100,
            rating: 4.5,
            available: true,
            station: { name: "Trạm Quận 3" },
          },
        ];
        
        const foundVehicle = dummyVehicles.find(v => v.id === vehicleId);
        if (foundVehicle) {
          setVehicle(foundVehicle);
          setBookingData(prev => ({ 
            ...prev, 
            pickupLocation: foundVehicle.station.name 
          }));
        } else {
          alert('Không tìm thấy xe!');
          navigate('/vehicles');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId, navigate]);

  const handleProceedToContract = () => {
    // Validate booking data
    if (!bookingData.startDate || !bookingData.endDate) {
      alert('Vui lòng chọn ngày bắt đầu và kết thúc!');
      return;
    }

    if (!bookingData.phone) {
      alert('Vui lòng nhập số điện thoại!');
      return;
    }

    // Save booking data to localStorage
    localStorage.setItem('pendingBooking', JSON.stringify({
      vehicle,
      bookingData,
      user
    }));

    // Navigate to contract page
    navigate(`/contract/${vehicleId}`);
  };

  const handleCancel = () => {
    navigate('/vehicles');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Đang tải thông tin xe...</div>
      </div>
    );
  }

  if (!user || !vehicle) {
    return null;
  }

  return (
    <BookingView
      vehicle={vehicle}
      user={user}
      bookingData={bookingData}
      onBookingDataChange={setBookingData}
      onProceedToContract={handleProceedToContract}
      onCancel={handleCancel}
    />
  );
};

export default BookingContainer;
