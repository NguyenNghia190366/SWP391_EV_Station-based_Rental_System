import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { message } from 'antd';
import CheckInView from '../Components/Common/View/CheckInView';
import { checkInAPI } from '../api/useEV';

const CheckInContainer = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const data = await checkInAPI.getCheckInDetails(bookingId);
      setBooking(data);
    } catch (error) {
      console.error('Error loading booking:', error);
      message.error('Không thể tải thông tin đặt xe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load booking details if bookingId exists
    if (bookingId) {
      loadBookingDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const handleCheckIn = async (checkInData) => {
    try {
      setLoading(true);
      message.loading({ content: 'Đang xử lý nhận xe...', key: 'checkin' });

      // Upload photos if any
      if (checkInData.vehicleCondition.photos.length > 0) {
        const formData = new FormData();
        checkInData.vehicleCondition.photos.forEach((photo, index) => {
          formData.append(`photos[${index}]`, photo);
        });
        
        await checkInAPI.uploadConditionPhotos(
          checkInData.bookingId,
          formData
        );
      }

      // Perform check-in
      const result = await checkInAPI.selfCheckIn(
        checkInData.bookingId,
        {
          checkInTime: checkInData.checkInTime,
          vehicleCondition: {
            exteriorCondition: checkInData.vehicleCondition.exteriorCondition,
            interiorCondition: checkInData.vehicleCondition.interiorCondition,
            batteryLevel: checkInData.vehicleCondition.batteryLevel,
            mileage: checkInData.vehicleCondition.mileage,
            notes: checkInData.vehicleCondition.notes,
          },
          checkInMethod: checkInData.checkInMethod,
        }
      );

      message.success({
        content: 'Nhận xe thành công! Chúc bạn có chuyến đi an toàn!',
        key: 'checkin',
        duration: 3,
      });

      // Navigate to active rental page
      setTimeout(() => {
        navigate(`/rental/${result.rentalId}`);
      }, 1500);

    } catch (error) {
      console.error('Check-in error:', error);
      message.error({
        content: error.message || 'Không thể nhận xe. Vui lòng thử lại!',
        key: 'checkin',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !booking) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="loading-spinner">Đang tải...</div>
      </div>
    );
  }

  return (
    <CheckInView
      booking={booking}
      onCheckIn={handleCheckIn}
      onCancel={() => navigate(-1)}
    />
  );
};

export default CheckInContainer;
