import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContractView from '@/Components/Common/View/Contract/ContractView';

const ContractContainer = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const [signature, setSignature] = useState('');
  const [contractData, setContractData] = useState(null);
  const [signingMethod, setSigningMethod] = useState(''); // 'electronic' or 'paper'

  useEffect(() => {
    // Get pending booking data
    const pendingBooking = localStorage.getItem('pendingBooking');
    
    if (!pendingBooking) {
      alert('Không tìm thấy thông tin đặt xe!');
      navigate('/vehicles');
      return;
    }

    const data = JSON.parse(pendingBooking);
    
    // Calculate prices
    const start = new Date(data.bookingData.startDate);
    const end = new Date(data.bookingData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = days * data.vehicle.price * 1000; // Convert to VND
    const deposit = totalPrice * 0.3;

    setContractData({
      ...data,
      totalPrice,
      deposit,
      days
    });
  }, [navigate]);

  const handleAccept = () => {
    if (!signingMethod) {
      alert('Vui lòng chọn phương thức ký hợp đồng!');
      return;
    }

    if (signingMethod === 'electronic' && (!signature || signature.trim() === '')) {
      alert('Vui lòng ký xác nhận hợp đồng điện tử!');
      return;
    }

    // Save contract with signature
    const contractWithSignature = {
      ...contractData,
      signature: signingMethod === 'electronic' ? signature : 'PAPER_SIGNING',
      signingMethod,
      contractNumber: `EVR-${Date.now()}`,
      signedAt: new Date().toISOString(),
      status: signingMethod === 'electronic' ? 'pending_payment' : 'pending_paper_signing'
    };

    localStorage.setItem('pendingContract', JSON.stringify(contractWithSignature));
    
    // Navigate to payment or paper signing confirmation
    if (signingMethod === 'electronic') {
      navigate(`/payment/${vehicleId}`);
    } else {
      // For paper signing, still go to payment but with different status
      navigate(`/payment/${vehicleId}`);
    }
  };

  const handleDecline = () => {
    if (window.confirm('Bạn có chắc muốn hủy hợp đồng này?')) {
      localStorage.removeItem('pendingBooking');
      navigate('/vehicles');
    }
  };

  const handleSignatureChange = (value) => {
    setSignature(value);
  };

  if (!contractData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Đang tải hợp đồng...</div>
      </div>
    );
  }

  return (
    <ContractView
      contractData={contractData}
      signingMethod={signingMethod}
      onSigningMethodChange={setSigningMethod}
      onAccept={handleAccept}
      onDecline={handleDecline}
      onSignatureChange={handleSignatureChange}
    />
  );
};

export default ContractContainer;
