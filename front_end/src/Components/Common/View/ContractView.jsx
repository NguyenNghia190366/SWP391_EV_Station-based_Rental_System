import React, { useState } from 'react';
import './ContractView.css';

const ContractView = ({ 
  contractData, 
  onAccept, 
  onDecline,
  onSignatureChange 
}) => {
  const { vehicle, bookingData, user, totalPrice, deposit } = contractData;
  
  // State for signature method selection
  const [signatureMethod, setSignatureMethod] = useState('electronic'); // 'electronic' or 'paper'
  const [isAgreed, setIsAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  
  const handleSignatureMethodChange = (method) => {
    setSignatureMethod(method);
    setIsAgreed(false);
    setSignature('');
  };
  
  const handleAgreementChange = (checked) => {
    setIsAgreed(checked);
    if (signatureMethod === 'electronic' && checked) {
      setSignature(user.fullName);
      onSignatureChange(user.fullName);
    } else {
      setSignature('');
      onSignatureChange('');
    }
  };
  
  const handleSignatureInput = (value) => {
    setSignature(value);
    onSignatureChange(value);
  };

  const calculateDays = () => {
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="contract-view">
      <div className="contract-container">
        <div className="contract-header">
          <h1> HỢP ĐỒNG THUÊ XE ĐIỆN</h1>
          <p className="contract-number">Số hợp đồng: EVR-{Date.now()}</p>
        </div>

        <div className="contract-content">
          {/* Parties Section */}
          <section className="contract-section">
            <h2>I. CÁC BÊN THAM GIA HỢP ĐỒNG</h2>
            
            <div className="party">
              <h3>BÊN CHO THUÊ (Bên A):</h3>
              <p><strong>Công ty:</strong> EV Rental System Co., Ltd</p>
              <p><strong>Địa chỉ:</strong> 123 Nguyễn Huệ, Quận 1, TP.HCM</p>
              <p><strong>Điện thoại:</strong> 1900-xxxx</p>
              <p><strong>Mã số thuế:</strong> 0123456789</p>
            </div>

            <div className="party">
              <h3>BÊN THUÊ (Bên B):</h3>
              <p><strong>Họ tên:</strong> {user.fullName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Số điện thoại:</strong> {bookingData.phone}</p>
              <p><strong>Mã khách hàng:</strong> {user.userId}</p>
            </div>
          </section>

          {/* Vehicle Details */}
          <section className="contract-section">
            <h2>II. THÔNG TIN XE THUÊ</h2>
            <div className="vehicle-info">
              <img src={vehicle.image} alt={vehicle.name} />
              <div className="vehicle-specs">
                <p><strong>Tên xe:</strong> {vehicle.name}</p>
                <p><strong>Loại xe:</strong> {vehicle.type === 'car' ? 'Ô tô' : vehicle.type === 'scooter' ? 'Xe máy' : 'Xe đạp'} điện</p>
                <p><strong>Trạm nhận xe:</strong> {bookingData.pickupLocation}</p>
                <p><strong>Dung lượng pin:</strong> {vehicle.battery}%</p>
                <p><strong>Quãng đường:</strong> ~{vehicle.range} km</p>
              </div>
            </div>
          </section>

          {/* Rental Period */}
          <section className="contract-section">
            <h2>III. THỜI GIAN THUÊ</h2>
            <p><strong>Ngày bắt đầu:</strong> {new Date(bookingData.startDate).toLocaleString('vi-VN')}</p>
            <p><strong>Ngày kết thúc:</strong> {new Date(bookingData.endDate).toLocaleString('vi-VN')}</p>
            <p><strong>Tổng số ngày:</strong> {calculateDays()} ngày</p>
          </section>

          {/* Financial Terms */}
          <section className="contract-section">
            <h2>IV. ĐIỀU KHOẢN TÀI CHÍNH</h2>
            <div className="financial-table">
              <div className="financial-row">
                <span>Giá thuê:</span>
                <span>{vehicle.price}k VNĐ/ngày</span>
              </div>
              <div className="financial-row">
                <span>Số ngày thuê:</span>
                <span>{calculateDays()} ngày</span>
              </div>
              <div className="financial-row subtotal">
                <span>Tổng giá thuê:</span>
                <span>{totalPrice.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="financial-row deposit">
                <span>Đặt cọc (30%):</span>
                <span>{deposit.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="financial-row total">
                <span>TỔNG THANH TOÁN:</span>
                <span>{totalPrice.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>
          </section>

          {/* Terms & Conditions */}
          <section className="contract-section terms">
            <h2>V. ĐIỀU KHOẢN & ĐIỀU KIỆN</h2>
            <ol>
              <li>Bên B cam kết sử dụng xe đúng mục đích và tuân thủ luật giao thông.</li>
              <li>Bên B chịu trách nhiệm về mọi vi phạm luật giao thông trong thời gian thuê.</li>
              <li>Bên B phải trả xe đúng thời hạn và ở tình trạng như khi nhận.</li>
              <li>Mọi hư hỏng do Bên B gây ra sẽ được Bên A khấu trừ từ tiền đặt cọc.</li>
              <li>Bên B phải có Giấy phép lái xe hợp lệ (đã được xác thực).</li>
              <li>Bên A có quyền từ chối cho thuê nếu phát hiện vi phạm điều khoản.</li>
              <li>Trả xe trễ sẽ bị tính phí: 50.000 VNĐ/giờ.</li>
              <li>Hợp đồng có hiệu lực kể từ khi cả hai bên ký xác nhận.</li>
            </ol>
          </section>

          {/* Signatures */}
          <section className="contract-section signatures">
            <h2>VI. PHƯƠNG THỨC KÝ HỢP ĐỒNG</h2>
            
            {/* Signature Method Selection */}
            <div className="signature-method-selection">
              <div className="method-options">
                <label 
                  className={`method-card ${signatureMethod === 'electronic' ? 'active' : ''}`}
                  onClick={() => handleSignatureMethodChange('electronic')}
                >
                  <input 
                    type="radio" 
                    name="signatureMethod" 
                    value="electronic"
                    checked={signatureMethod === 'electronic'}
                    onChange={() => handleSignatureMethodChange('electronic')}
                  />
                  <div className="method-content">
                    <span className="method-icon">📱</span>
                    <h3>Ký điện tử</h3>
                    <p>Ký ngay trực tuyến, nhanh chóng và tiện lợi</p>
                  </div>
                </label>
                
                <label 
                  className={`method-card ${signatureMethod === 'paper' ? 'active' : ''}`}
                  onClick={() => handleSignatureMethodChange('paper')}
                >
                  <input 
                    type="radio" 
                    name="signatureMethod" 
                    value="paper"
                    checked={signatureMethod === 'paper'}
                    onChange={() => handleSignatureMethodChange('paper')}
                  />
                  <div className="method-content">
                    <span className="method-icon">📄</span>
                    <h3>Ký trực tiếp</h3>
                    <p>Ký tại trạm với nhân viên, có giấy tờ xác thực</p>
                  </div>
                </label>
              </div>
            </div>

            <h2 className="signature-title">VII. CHỮ KÝ XÁC NHẬN</h2>
            
            <div className="signature-area">
              <div className="signature-box">
                <h4>🏢 BÊN CHO THUÊ</h4>
                <div className="signature-placeholder">
                  <img 
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='80'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23667eea' font-size='24' font-family='Brush Script MT, cursive'%3EEV Rental%3C/text%3E%3C/svg%3E" 
                    alt="Company signature" 
                  />
                </div>
                <p className="signature-date">Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
              </div>

              {signatureMethod === 'electronic' ? (
                // Electronic Signature
                <div className="signature-box customer">
                  <h4>👤 BÊN THUÊ</h4>
                  {signature ? (
                    <div className="signature-display">
                      <p className="signature-text">{signature}</p>
                      <button 
                        className="btn-clear-signature"
                        onClick={() => {
                          setSignature('');
                          setIsAgreed(false);
                          onSignatureChange('');
                        }}
                      >
                        ✕ Xóa chữ ký
                      </button>
                    </div>
                  ) : (
                    <div className="signature-input-area">
                      <input 
                        type="text" 
                        placeholder="Nhập họ tên để xác nhận"
                        className="signature-input"
                        value={signature}
                        onChange={(e) => handleSignatureInput(e.target.value)}
                      />
                      <p className="signature-note">
                        ✍️ Gõ tên của bạn để ký điện tử
                      </p>
                    </div>
                  )}
                  <p className="signature-date">Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
                </div>
              ) : (
                // Paper Signature Info
                <div className="signature-box paper-signature">
                  <h4>👤 BÊN THUÊ</h4>
                  <div className="paper-signature-info">
                    <p className="paper-note">
                      <span className="icon">📝</span>
                      <strong>Hợp đồng sẽ được ký trực tiếp tại trạm</strong>
                    </p>
                    <div className="paper-steps">
                      <p><span className="step">1.</span> Mang theo CCCD/CMND gốc</p>
                      <p><span className="step">2.</span> Mang theo Giấy phép lái xe gốc</p>
                      <p><span className="step">3.</span> Đến trạm: <strong>{bookingData.pickupLocation}</strong></p>
                      <p><span className="step">4.</span> Nhân viên sẽ in hợp đồng để bạn ký</p>
                      <p><span className="step">5.</span> Ký xác nhận và nhận xe</p>
                    </div>
                  </div>
                  <p className="signature-date">Ngày hẹn: {new Date(bookingData.startDate).toLocaleDateString('vi-VN')}</p>
                </div>
              )}
            </div>
          </section>

          {/* Agreement Checkbox */}
          <div className="agreement-section">
            <label className="agreement-checkbox">
              <input 
                type="checkbox" 
                checked={isAgreed}
                onChange={(e) => handleAgreementChange(e.target.checked)}
              />
              <span className="agreement-text">
                {signatureMethod === 'electronic' ? (
                  <>
                    Tôi đã đọc và đồng ý với tất cả các điều khoản trong hợp đồng này. 
                    Tôi cam kết chịu trách nhiệm về mọi thiệt hại phát sinh trong thời gian thuê xe.
                  </>
                ) : (
                  <>
                    Tôi xác nhận sẽ đến trạm <strong>{bookingData.pickupLocation}</strong> vào ngày{' '}
                    <strong>{new Date(bookingData.startDate).toLocaleDateString('vi-VN')}</strong> để ký hợp đồng 
                    và nhận xe. Tôi sẽ mang theo đầy đủ giấy tờ cần thiết.
                  </>
                )}
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="contract-actions">
            <button className="btn-decline" onClick={onDecline}>
              ✕ Từ chối
            </button>
            <button 
              className="btn-accept" 
              onClick={onAccept}
              disabled={!isAgreed || (signatureMethod === 'electronic' && !signature)}
            >
              {signatureMethod === 'electronic' ? (
                <>✓ Đồng ý & Thanh toán</>
              ) : (
                <>📅 Xác nhận đặt lịch</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractView;
