import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import BookingView from '../components/BookingView';
import { useVehicleAPI } from '../../../../../hooks/useVehicles';

const BookingContainer = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const [user, setUser] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { getById, createBooking } = useVehicleAPI();
  
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

  // Fetch vehicle details and pre-fill booking request data
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) {
        navigate('/vehicles');
        return;
      }

      try {
        setLoading(true);
        const data = await getById(vehicleId);
        setVehicle(data);
        
        // Pre-fill pickup location
        if (data.station?.name) {
          setBookingData(prev => ({ 
            ...prev, 
            pickupLocation: data.station.name 
          }));
        }

        // Pre-fill booking request data from localStorage if available
        const bookingRequest = localStorage.getItem('bookingRequest');
        if (bookingRequest) {
          try {
            const requestData = JSON.parse(bookingRequest);
            setBookingData(prev => ({
              ...prev,
              startDate: requestData.startDate,
              endDate: requestData.endDate
            }));
            // Clear the booking request from localStorage after use
            localStorage.removeItem('bookingRequest');
          } catch (err) {
            console.warn('Could not parse bookingRequest from localStorage:', err);
          }
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

  const handleProceedToContract = async () => {
    // Validate booking data
    if (!bookingData.startDate || !bookingData.endDate) {
      alert('Vui lòng chọn ngày bắt đầu và kết thúc!');
      return;
    }

    if (!bookingData.phone) {
      alert('Vui lòng nhập số điện thoại!');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare booking payload for API
      const bookingPayload = {
        vehicleId: parseInt(vehicleId),
        renterId: user.id || user.userId, // adjust based on your backend
        startDate: new Date(bookingData.startDate).toISOString(),
        endDate: new Date(bookingData.endDate).toISOString(),
        pickupLocation: bookingData.pickupLocation,
        phoneNumber: bookingData.phone,
        notes: bookingData.notes,
        status: 'pending' // Initial status
      };

      // Call API to create booking
      const createdBooking = await createBooking(bookingPayload);
      
      console.log('✅ Booking created:', createdBooking);

      // Save booking to localStorage for contract page
      localStorage.setItem('pendingBooking', JSON.stringify({
        vehicle,
        bookingData,
        user,
        bookingId: createdBooking.id || createdBooking.bookingId
      }));

      // Navigate to contract page
      navigate(`/contract/${vehicleId}`);
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      alert(`Tạo booking thất bại: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
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
      isSubmitting={submitting}
    />
  );
};

export default BookingContainer;
