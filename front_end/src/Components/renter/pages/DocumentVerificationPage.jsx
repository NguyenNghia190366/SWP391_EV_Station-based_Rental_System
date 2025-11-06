import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { driverLicenseAPI, cccdVerificationAPI } from '../../../api/api';

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Đang kiểm tra giấy tờ...</p>
      </div>
    );
  }

  const allVerified = verificationStatus.driverLicense && verificationStatus.cccd;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            🔐 Xác thực giấy tờ
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Để đảm bảo an toàn, chúng tôi cần kiểm tra giấy tờ của bạn một lần nữa
          </p>
          <p className="text-gray-700">
            Mã đặt xe: <strong className="text-indigo-600">{bookingId}</strong>
          </p>
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📋 Trạng thái giấy tờ
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Driver License Status */}
            <div className={`rounded-xl p-6 ${
              verificationStatus.driverLicense 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500' 
                : 'bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-500'
            }`}>
              <div className="text-5xl mb-4 text-center">
                {verificationStatus.driverLicense ? '✅' : '❌'}
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
                Giấy phép lái xe (GPLX)
              </h3>
              <div className="flex justify-center mb-3">
                {verificationStatus.driverLicense ? (
                  <span className="px-4 py-2 bg-green-500 text-white font-bold rounded-full">
                    Đã xác thực
                  </span>
                ) : (
                  <span className="px-4 py-2 bg-red-500 text-white font-bold rounded-full">
                    Chưa xác thực
                  </span>
                )}
              </div>
              {!verificationStatus.driverLicense && (
                <p className="text-center text-orange-600 text-sm">
                  ⚠️ Vui lòng upload và chờ admin xác thực GPLX
                </p>
              )}
            </div>

            {/* CCCD Status */}
            <div className={`rounded-xl p-6 ${
              verificationStatus.cccd 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500' 
                : 'bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-500'
            }`}>
              <div className="text-5xl mb-4 text-center">
                {verificationStatus.cccd ? '✅' : '❌'}
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
                Căn cước công dân (CCCD)
              </h3>
              <div className="flex justify-center mb-3">
                {verificationStatus.cccd ? (
                  <span className="px-4 py-2 bg-green-500 text-white font-bold rounded-full">
                    Đã xác thực
                  </span>
                ) : (
                  <span className="px-4 py-2 bg-red-500 text-white font-bold rounded-full">
                    Chưa xác thực
                  </span>
                )}
              </div>
              {!verificationStatus.cccd && (
                <p className="text-center text-orange-600 text-sm">
                  ⚠️ Vui lòng upload và chờ admin xác thực CCCD
                </p>
              )}
            </div>
          </div>
        </div>

        {allVerified ? (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              Giấy tờ đã được xác thực!
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Bạn có thể tiến hành check-in ngay bây giờ
            </p>
            
            <div className="bg-white rounded-xl p-6 mb-6 text-left">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Thông tin booking</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Xe:</span>
                  <strong className="text-gray-800">{booking?.vehicle?.name}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Địa điểm:</span>
                  <strong className="text-gray-800">{booking?.bookingData?.pickupLocation}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Thời gian nhận:</span>
                  <strong className="text-gray-800">
                    {new Date(booking?.bookingData?.startDate).toLocaleString('vi-VN')}
                  </strong>
                </div>
              </div>
            </div>

            <button 
              className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg shadow-lg transition-all text-lg"
              onClick={handleProceedToCheckIn}
            >
              ✅ Tiến hành Check-in
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-3xl font-bold text-orange-600 mb-4">
              Giấy tờ chưa đầy đủ
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Vui lòng upload và chờ xác thực giấy tờ trước khi check-in
            </p>
            
            <div className="flex gap-4 mb-8">
              <button 
                className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transition-all"
                onClick={handleUploadDocuments}
              >
                📤 Upload giấy tờ
              </button>
              <button 
                className="flex-1 px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
                onClick={() => navigate(-1)}
              >
                ← Quay lại
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 text-left">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📝 Hướng dẫn xác thực</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                  <span className="text-gray-700 pt-1">Upload ảnh GPLX và CCCD rõ ràng</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                  <span className="text-gray-700 pt-1">Chờ admin xác thực (thường trong 24h)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                  <span className="text-gray-700 pt-1">Kiểm tra email để biết kết quả</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
                  <span className="text-gray-700 pt-1">Quay lại trang này sau khi được xác thực</span>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Security Note */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            🔒 Bảo mật thông tin
          </h3>
          <p className="text-gray-600">
            Thông tin giấy tờ của bạn được mã hóa và bảo mật tuyệt đối. 
            Chúng tôi chỉ sử dụng để xác thực danh tính và tuân thủ quy định pháp luật.
          </p>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 mt-6 text-center">
          <p className="text-gray-700">
            💡 Cần hỗ trợ? Liên hệ: <strong className="text-indigo-600">1900-xxxx</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentVerificationPage;
