import React, { useState } from 'react';
import './PaymentView.css';

const PaymentView = ({ 
  contractData, 
  onPaymentComplete,
  onBack 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      onPaymentComplete({
        method: paymentMethod,
        transactionId: `TXN-${Date.now()}`,
        paidAt: new Date().toISOString(),
        amount: contractData.totalPrice
      });
    }, 2000);
  };

  return (
    <div className="payment-view">
      <div className="payment-container">
        <div className="payment-header">
          <h1> THANH TOÁN</h1>
          <p>Hoàn tất thanh toán để xác nhận đặt xe</p>
        </div>

        <div className="payment-content">
          {/* Order Summary */}
          <div className="order-summary">
            <h2> Thông tin đơn hàng</h2>
            <div className="order-details">
              <div className="order-item">
                <img src={contractData.vehicle.image} alt={contractData.vehicle.name} />
                <div className="item-info">
                  <h3>{contractData.vehicle.name}</h3>
                  <p>{contractData.days} ngày × {contractData.vehicle.price}k VNĐ</p>
                </div>
              </div>

              <div className="order-breakdown">
                <div className="breakdown-row">
                  <span>Tổng giá thuê:</span>
                  <span>{contractData.totalPrice.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="breakdown-row deposit">
                  <span>Đặt cọc (30%):</span>
                  <span>{contractData.deposit.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="breakdown-row total">
                  <span>TỔNG THANH TOÁN:</span>
                  <span>{contractData.totalPrice.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>

              <div className="rental-period">
                <p><strong> Thời gian:</strong></p>
                <p>{new Date(contractData.bookingData.startDate).toLocaleString('vi-VN')}</p>
                <p>đến</p>
                <p>{new Date(contractData.bookingData.endDate).toLocaleString('vi-VN')}</p>
              </div>

              <div className="pickup-location">
                <p><strong> Nhận xe tại:</strong> {contractData.bookingData.pickupLocation}</p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods">
            <h2> Phương thức thanh toán</h2>
            
            <div className="method-list">
              <label className={`payment-method ${paymentMethod === 'momo' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="momo"
                  checked={paymentMethod === 'momo'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <img src="https://developers.momo.vn/v3/img/logo.svg" alt="MoMo" />
                  <span>Ví MoMo</span>
                </div>
              </label>

              <label className={`payment-method ${paymentMethod === 'vnpay' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="vnpay"
                  checked={paymentMethod === 'vnpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png" alt="VNPay" />
                  <span>VNPay</span>
                </div>
              </label>

              <label className={`payment-method ${paymentMethod === 'zalopay' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="zalopay"
                  checked={paymentMethod === 'zalopay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" alt="ZaloPay" />
                  <span>ZaloPay</span>
                </div>
              </label>

              <label className={`payment-method ${paymentMethod === 'banking' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="banking"
                  checked={paymentMethod === 'banking'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <span className="icon"></span>
                  <span>Chuyển khoản ngân hàng</span>
                </div>
              </label>

              <label className={`payment-method ${paymentMethod === 'cash' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <span className="icon"></span>
                  <span>Thanh toán khi nhận xe</span>
                </div>
              </label>
            </div>

            <div className="payment-note">
              <p> Thông tin thanh toán được mã hóa và bảo mật tuyệt đối</p>
              <p> Bạn có thể hủy đơn miễn phí trước 24h</p>
            </div>
          </div>

          {/* Payment Actions */}
          <div className="payment-actions">
            <button className="btn-back" onClick={onBack}>
              ← Quay lại
            </button>
            <button 
              className="btn-pay" 
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <span className="processing">
                  <span className="spinner"></span>
                  Đang xử lý...
                </span>
              ) : (
                `Thanh toán ${contractData.totalPrice.toLocaleString('vi-VN')} VNĐ`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentView;
