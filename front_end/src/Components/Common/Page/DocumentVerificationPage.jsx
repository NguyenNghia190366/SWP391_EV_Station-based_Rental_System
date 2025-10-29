import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { driverLicenseAPI, cccdVerificationAPI } from '../../../api/useAuth';
import './DocumentVerificationPage.css';

const DocumentVerificationPage = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState({
    driverLicense: null,
    cccd: null,
  });
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const initVerification = async () => {
      try {
        // Get user info
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');

        // Get booking info
        const bookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
        const foundBooking = bookings.find(b => b.bookingId === bookingId);
        
        if (!foundBooking) {
          alert('Không tìm thấy thông tin đặt xe!');
          navigate('/home');
          return;
        }
        
        setBooking(foundBooking);

        // Check verification status
        await checkDocuments(userData.userId || userData.email);
      } catch (error) {
        console.error('Error initializing verification:', error);
        alert('Có lỗi xảy ra khi kiểm tra giấy tờ!');
      } finally {
        setLoading(false);
      }
    };

    initVerification();
  }, [bookingId, navigate]);

  const checkDocuments = async (userId) => {
    try {
      // Check Driver License
      const licenseResponse = await driverLicenseAPI.getByRenter(userId);
      const licenseVerified = licenseResponse?.is_verified === true;

      // Check CCCD
      const cccdResponse = await cccdVerificationAPI.getByRenter(userId);
      const cccdVerified = cccdResponse?.is_verified === true;

      setVerificationStatus({
        driverLicense: licenseVerified,
        cccd: cccdVerified,
      });
    } catch (error) {
      console.error('Error checking documents:', error);
      // Set as not verified if error
      setVerificationStatus({
        driverLicense: false,
        cccd: false,
      });
    }
  };

  const handleProceedToCheckIn = () => {
    // Both documents must be verified
    if (verificationStatus.driverLicense && verificationStatus.cccd) {
      // Save verification status to booking
      const bookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
      const updatedBookings = bookings.map(b => {
        if (b.bookingId === bookingId) {
          return {
            ...b,
            documentsVerified: true,
            verifiedAt: new Date().toISOString()
          };
        }
        return b;
      });
      localStorage.setItem('myBookings', JSON.stringify(updatedBookings));

      // Navigate to check-in page
      navigate(`/checkin/${bookingId}`);
    } else {
      alert('Vui lòng hoàn thành xác thực giấy tờ trước khi check-in!');
      navigate('/profile'); // Navigate to profile to upload documents
    }
  };

  const handleUploadDocuments = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="verification-loading">
        <div className="spinner"></div>
        <p>Đang kiểm tra giấy tờ...</p>
      </div>
    );
  }

  const allVerified = verificationStatus.driverLicense && verificationStatus.cccd;

  return (
    <div className="document-verification-page">
      <div className="verification-container">
        <div className="verification-header">
          <h1>🔐 Xác thực giấy tờ</h1>
          <p className="subtitle">
            Để đảm bảo an toàn, chúng tôi cần kiểm tra giấy tờ của bạn một lần nữa
          </p>
          <p className="booking-info">
            Mã đặt xe: <strong>{bookingId}</strong>
          </p>
        </div>

        <div className="verification-status">
          <h2>📋 Trạng thái giấy tờ</h2>
          
          <div className="status-grid">
            {/* Driver License Status */}
            <div className={`status-card ${verificationStatus.driverLicense ? 'verified' : 'not-verified'}`}>
              <div className="status-icon">
                {verificationStatus.driverLicense ? '✅' : '❌'}
              </div>
              <h3>Giấy phép lái xe (GPLX)</h3>
              <div className="status-badge">
                {verificationStatus.driverLicense ? (
                  <span className="badge success">Đã xác thực</span>
                ) : (
                  <span className="badge danger">Chưa xác thực</span>
                )}
              </div>
              {!verificationStatus.driverLicense && (
                <p className="status-note">
                  ⚠️ Vui lòng upload và chờ admin xác thực GPLX
                </p>
              )}
            </div>

            {/* CCCD Status */}
            <div className={`status-card ${verificationStatus.cccd ? 'verified' : 'not-verified'}`}>
              <div className="status-icon">
                {verificationStatus.cccd ? '✅' : '❌'}
              </div>
              <h3>Căn cước công dân (CCCD)</h3>
              <div className="status-badge">
                {verificationStatus.cccd ? (
                  <span className="badge success">Đã xác thực</span>
                ) : (
                  <span className="badge danger">Chưa xác thực</span>
                )}
              </div>
              {!verificationStatus.cccd && (
                <p className="status-note">
                  ⚠️ Vui lòng upload và chờ admin xác thực CCCD
                </p>
              )}
            </div>
          </div>
        </div>

        {allVerified ? (
          <div className="verification-success">
            <div className="success-icon">🎉</div>
            <h2>Giấy tờ đã được xác thực!</h2>
            <p>Bạn có thể tiến hành check-in ngay bây giờ</p>
            
            <div className="booking-details">
              <h3>Thông tin booking</h3>
              <div className="detail-row">
                <span>Xe:</span>
                <strong>{booking?.vehicle?.name}</strong>
              </div>
              <div className="detail-row">
                <span>Địa điểm:</span>
                <strong>{booking?.bookingData?.pickupLocation}</strong>
              </div>
              <div className="detail-row">
                <span>Thời gian nhận:</span>
                <strong>
                  {new Date(booking?.bookingData?.startDate).toLocaleString('vi-VN')}
                </strong>
              </div>
            </div>

            <button className="btn-proceed" onClick={handleProceedToCheckIn}>
              ✅ Tiến hành Check-in
            </button>
          </div>
        ) : (
          <div className="verification-pending">
            <div className="pending-icon">⏳</div>
            <h2>Giấy tờ chưa đầy đủ</h2>
            <p>Vui lòng upload và chờ xác thực giấy tờ trước khi check-in</p>
            
            <div className="pending-actions">
              <button className="btn-upload" onClick={handleUploadDocuments}>
                📤 Upload giấy tờ
              </button>
              <button className="btn-back" onClick={() => navigate(-1)}>
                ← Quay lại
              </button>
            </div>

            <div className="verification-guide">
              <h3>📝 Hướng dẫn xác thực</h3>
              <ol>
                <li>Upload ảnh GPLX và CCCD rõ ràng</li>
                <li>Chờ admin xác thực (thường trong 24h)</li>
                <li>Kiểm tra email để biết kết quả</li>
                <li>Quay lại trang này sau khi được xác thực</li>
              </ol>
            </div>
          </div>
        )}

        <div className="security-note">
          <h3>🔒 Bảo mật thông tin</h3>
          <p>
            Thông tin giấy tờ của bạn được mã hóa và bảo mật tuyệt đối. 
            Chúng tôi chỉ sử dụng để xác thực danh tính và tuân thủ quy định pháp luật.
          </p>
        </div>

        <div className="help-section">
          <p>💡 Cần hỗ trợ? Liên hệ: <strong>1900-xxxx</strong></p>
        </div>
      </div>
    </div>
  );
};

export default DocumentVerificationPage;
