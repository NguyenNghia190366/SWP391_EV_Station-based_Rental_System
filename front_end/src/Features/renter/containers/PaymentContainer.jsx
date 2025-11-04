import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentView from '../../../Components/Common/View/Payment/PaymentView';

const PaymentContainer = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const [contractData, setContractData] = useState(null);

  useEffect(() => {
    // Get pending contract
    const pendingContract = localStorage.getItem('pendingContract');
    
    if (!pendingContract) {
      alert('Không tìm thấy thông tin hợp đồng!');
      navigate('/vehicles');
      return;
    }

    setContractData(JSON.parse(pendingContract));
  }, [navigate]);

  const handlePaymentComplete = async (paymentInfo) => {
    // Create final booking record
    const finalBooking = {
      ...contractData,
      payment: paymentInfo,
      status: 'payment_completed', // Changed from 'confirmed' to 'payment_completed'
      bookingId: `BK-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage (in real app, save to API)
    const existingBookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
    existingBookings.push(finalBooking);
    localStorage.setItem('myBookings', JSON.stringify(existingBookings));
    
    // Save current booking for vehicle preview flow
    localStorage.setItem('currentBooking', JSON.stringify(finalBooking));

    // Save to all bookings (for staff view)
    const allBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
    allBookings.push(finalBooking);
    localStorage.setItem('allBookings', JSON.stringify(allBookings));

    // Clear temporary data
    localStorage.removeItem('pendingBooking');
    localStorage.removeItem('pendingContract');

    // Navigate to payment success bill page first
    navigate('/payment-success', { 
      state: { booking: finalBooking } 
    });
  };

  const handleBack = () => {
    navigate(`/contract/${vehicleId}`);
  };

  if (!contractData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Đang tải thông tin thanh toán...</div>
      </div>
    );
  }

  return (
    <PaymentView
      contractData={contractData}
      onPaymentComplete={handlePaymentComplete}
      onBack={handleBack}
    />
  );
};

export default PaymentContainer;
