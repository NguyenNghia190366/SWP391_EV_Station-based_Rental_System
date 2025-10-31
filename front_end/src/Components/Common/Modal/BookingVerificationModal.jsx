import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined, SafetyOutlined, IdcardOutlined } from '@ant-design/icons';

const BookingVerificationModal = ({ 
  visible, 
  onClose, 
  onNavigateToVerification,
  verificationType = 'license' // 'license' or 'cccd' or 'both'
}) => {
  
  const getVerificationMessage = () => {
    if (verificationType === 'both') {
      return {
        title: '📋 Chưa xác thực giấy tờ',
        message: 'Bạn chưa xác thực giấy phép lái xe và CCCD/CMND. Vui lòng xác thực để có thể đặt xe.',
        icon: <ExclamationCircleOutlined className="text-5xl text-yellow-500" />
      };
    } else if (verificationType === 'license') {
      return {
        title: '🚗 Chưa xác thực giấy phép lái xe',
        message: 'Bạn chưa xác thực giấy phép lái xe. Vui lòng xác thực để có thể đặt xe điện.',
        icon: <SafetyOutlined className="text-5xl text-yellow-500" />
      };
    } else {
      return {
        title: '🆔 Chưa xác thực CCCD/CMND',
        message: 'Bạn chưa xác thực CCCD/CMND. Vui lòng xác thực để có thể đặt xe.',
        icon: <IdcardOutlined className="text-5xl text-yellow-500" />
      };
    }
  };

  const verificationInfo = getVerificationMessage();

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
    >
      <div className="flex flex-col items-center text-center p-6">
        <div className="mb-6">
          {verificationInfo.icon}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{verificationInfo.title}</h2>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {verificationInfo.message}
        </p>

        <div className="w-full bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-4 text-left">
          <h3 className="text-base font-semibold text-gray-800 mb-3">📑 Giấy tờ cần xác thực:</h3>
          <ul className="space-y-2">
            {(verificationType === 'license' || verificationType === 'both') && (
              <li className="flex items-center gap-2 text-gray-700">
                <SafetyOutlined className="text-indigo-500" /> Giấy phép lái xe (còn hiệu lực)
              </li>
            )}
            {(verificationType === 'cccd' || verificationType === 'both') && (
              <li className="flex items-center gap-2 text-gray-700">
                <IdcardOutlined className="text-indigo-500" /> CCCD/CMND (còn hiệu lực)
              </li>
            )}
          </ul>
        </div>

        <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-400 rounded-lg p-4 mb-6 text-left">
          <h3 className="text-base font-semibold text-gray-800 mb-3">✨ Lợi ích khi xác thực:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>⚡ Đặt xe trực tuyến nhanh chóng</li>
            <li>🚀 Nhận xe ngay tại trạm</li>
            <li>🎁 Ưu đãi dành riêng cho khách hàng xác thực</li>
            <li>🔒 Bảo mật thông tin tuyệt đối</li>
          </ul>
        </div>

        <div className="flex gap-3 w-full">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition-all duration-300"
          >
            Để sau
          </button>
          <button 
            onClick={onNavigateToVerification}
            className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <SafetyOutlined /> Xác thực ngay
          </button>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg w-full">
          <small className="text-gray-600 text-xs">
            ⚠️ <strong>Lưu ý:</strong> Quá trình xác thực thường mất 5-10 phút. 
            Bạn sẽ nhận được thông báo khi xác thực thành công.
          </small>
        </div>
      </div>
    </Modal>
  );
};

export default BookingVerificationModal;
