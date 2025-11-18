import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { message } from 'antd';

const VehiclePreviewNotification = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [vehiclePreview, setVehiclePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadBookingAndPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const loadBookingAndPreview = async () => {
    try {
      setLoading(true);
      
      // In real app, fetch from API
      // For now, get from localStorage
      const storedBooking = localStorage.getItem('currentBooking');
      if (storedBooking) {
        const bookingData = JSON.parse(storedBooking);
        setBooking(bookingData);
      }

      // Check if vehicle preview exists
      const preview = localStorage.getItem(`vehiclePreview_${bookingId}`);
      if (preview) {
        setVehiclePreview(JSON.parse(preview));
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      message.error('Cannot load booking information');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmVehicle = async () => {
    try {
      setConfirming(true);
      message.loading({ content: 'Confirming...', key: 'confirm' });

      // In real app: Call API to update vehicle status to 'booked'
      // await vehicleAPI.updateStatus(booking.vehicle.id, 'booked');
      // await bookingAPI.confirmVehiclePreview(bookingId);

      // Update booking status
      const updatedBooking = {
        ...booking,
        status: 'confirmed_vehicle',
        vehicleStatus: 'booked',
        confirmedAt: new Date().toISOString()
      };

      localStorage.setItem('currentBooking', JSON.stringify(updatedBooking));

      // Update in allBookings
      const allBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
      const updatedAllBookings = allBookings.map(b =>
        b.bookingId === bookingId ? updatedBooking : b
      );
      localStorage.setItem('allBookings', JSON.stringify(updatedAllBookings));

      // Add booking to rental history (my bookings)
      const myBookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
      const existingIndex = myBookings.findIndex(b => b.bookingId === bookingId);
      if (existingIndex >= 0) {
        myBookings[existingIndex] = updatedBooking;
      } else {
        myBookings.unshift(updatedBooking);
      }
      localStorage.setItem('myBookings', JSON.stringify(myBookings));

      message.success({
        content: 'Vehicle confirmed! Please go to the station to pick up the vehicle.',
        key: 'confirm',
        duration: 3
      });

      // Navigate to check-in preparation page
      setTimeout(() => {
        navigate(`/checkin-prepare/${bookingId}`);
      }, 1500);

    } catch (error) {
      console.error('Error confirming vehicle:', error);
      message.error({
        content: 'Cannot confirm. Please try again!',
        key: 'confirm'
      });
    } finally {
      setConfirming(false);
    }
  };

  const handleRequestChange = () => {
    // Request to change vehicle or reject
    message.info('Please contact staff to request a different vehicle');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Loading information...</p>
        </div>
      </div>
    );
  }

  if (!vehiclePreview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center transform hover:scale-105 transition-transform duration-300">
          <div className="text-8xl mb-6 animate-pulse">⏳</div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Waiting for staff to prepare the vehicle
          </h2>
          <p className="text-gray-600 text-lg mb-3">
            Staff is checking and taking photos of the vehicle for you.
          </p>
          <p className="text-gray-600 text-lg mb-8">
            Please wait a moment...
          </p>
          <div className="flex justify-center gap-3 mb-8">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <button 
            className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            onClick={() => navigate('/my-bookings')}
          >
            Back to bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-6 text-white text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">🚗 Your Vehicle Info</h1>
          <p className="text-blue-100 text-lg">Please review carefully before confirming</p>
        </div>

        <div className="space-y-6">
          {/* Booking Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-3 border-b-2 border-blue-200">
              Booking information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Booking ID:</span>
                <strong className="text-blue-600 text-lg">{booking?.bookingId || bookingId}</strong>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Vehicle name:</span>
                <strong className="text-gray-800 text-lg">{booking?.vehicle?.name}</strong>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Pickup station:</span>
                <strong className="text-gray-800 text-lg">{booking?.bookingData?.pickupLocation}</strong>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Pickup time:</span>
                <strong className="text-gray-800 text-lg">
                  {new Date(booking?.bookingData?.startDate).toLocaleString('vi-VN')}
                </strong>
              </div>
            </div>
          </div>

          {/* Vehicle Photos */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">📸 Current vehicle photos</h3>
              <p className="text-gray-600 mb-6 text-lg">
                Staff has taken <strong className="text-blue-600">{vehiclePreview.photos?.length || 0}</strong> photos of the vehicle for you
              </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {vehiclePreview.photos?.map((photo, index) => (
                <div 
                  key={index} 
                  className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                >
                  <img 
                    src={photo.url || photo} 
                    alt={`Vehicle - Angle ${index + 1}`}
                    onClick={() => window.open(photo.url || photo, '_blank')}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-sm font-medium">
                      {photo.caption || `View ${index + 1}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Condition Report */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-3 border-b-2 border-blue-200">
              📋 Vehicle condition report
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <span className="text-gray-700 font-semibold">Exterior:</span>
                <span className={`font-bold text-lg ${
                  vehiclePreview.exteriorCondition === 'good' ? 'text-green-600' : 
                  vehiclePreview.exteriorCondition === 'fair' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {vehiclePreview.exteriorCondition === 'good' ? '✓ Good' : 
                   vehiclePreview.exteriorCondition === 'fair' ? '⚠ Fair' : '✗ Issue'}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <span className="text-gray-700 font-semibold">Interior:</span>
                <span className={`font-bold text-lg ${
                  vehiclePreview.interiorCondition === 'good' ? 'text-green-600' : 
                  vehiclePreview.interiorCondition === 'fair' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {vehiclePreview.interiorCondition === 'good' ? '✓ Good' : 
                   vehiclePreview.interiorCondition === 'fair' ? '⚠ Fair' : '✗ Issue'}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                <span className="text-gray-700 font-semibold">Battery level:</span>
                <span className="text-yellow-600 font-bold text-lg">
                  🔋 {vehiclePreview.batteryLevel || 100}%
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <span className="text-gray-700 font-semibold">Range:</span>
                <span className="text-purple-600 font-bold text-lg">
                  📊 {vehiclePreview.range || booking?.vehicle?.range || 'N/A'} km
                </span>
              </div>
            </div>

            {vehiclePreview.notes && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border-l-4 border-blue-500">
                <h4 className="text-lg font-bold text-gray-800 mb-2">💬 Note from staff:</h4>
                <p className="text-gray-700 leading-relaxed">{vehiclePreview.notes}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleRequestChange}
              disabled={confirming}
            >
              ❌ Request change
            </button>
            <button 
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleConfirmVehicle}
              disabled={confirming}
            >
              {confirming ? 'Confirming...' : '✅ Confirm this vehicle'}
            </button>
          </div>

          {/* Notice */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg p-6 shadow-md">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-amber-700 font-bold">Note:</strong> After you confirm, the vehicle will be held for you and you must arrive at the station on time to pick up the vehicle. 
              arrive on time to pick up the vehicle. If you're not satisfied with the condition of the vehicle, please request a replacement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiclePreviewNotification;
