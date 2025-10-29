import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined, SafetyOutlined, IdcardOutlined } from '@ant-design/icons';
import './BookingVerificationModal.css';

const BookingVerificationModal = ({ 
  visible, 
  onClose, 
  onNavigateToVerification,
  verificationType = 'license' // 'license' or 'cccd' or 'both'
}) => {
  
  const getVerificationMessage = () => {
    if (verificationType === 'both') {
      return {
        title: ' Chưa xác thực giấy tờ',
        message: 'Bạn chưa xác thực giấy phép lái xe và CCCD/CMND. Vui lòng xác thực để có thể đặt xe.',
        icon: <ExclamationCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />
      };
    } else if (verificationType === 'license') {
      return {
        title: ' Chưa xác thực giấy phép lái xe',
        message: 'Bạn chưa xác thực giấy phép lái xe. Vui lòng xác thực để có thể đặt xe điện.',
        icon: <SafetyOutlined style={{ fontSize: 48, color: '#faad14' }} />
      };
    } else {
      return {
        title: ' Chưa xác thực CCCD/CMND',
        message: 'Bạn chưa xác thực CCCD/CMND. Vui lòng xác thực để có thể đặt xe.',
        icon: <IdcardOutlined style={{ fontSize: 48, color: '#faad14' }} />
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
      className="booking-verification-modal"
      width={480}
    >
      <div className="verification-modal-content">
        <div className="verification-icon">
          {verificationInfo.icon}
        </div>
        
        <h2 className="verification-title">{verificationInfo.title}</h2>
        
        <p className="verification-message">
          {verificationInfo.message}
        </p>

        <div className="verification-requirements">
          <h3> Giấy tờ cần xác thực:</h3>
          <ul>
            {(verificationType === 'license' || verificationType === 'both') && (
              <li>
                <SafetyOutlined /> Giấy phép lái xe (còn hiệu lực)
              </li>
            )}
            {(verificationType === 'cccd' || verificationType === 'both') && (
              <li>
                <IdcardOutlined /> CCCD/CMND (còn hiệu lực)
              </li>
            )}
          </ul>
        </div>

        <div className="verification-benefits">
          <h3> Lợi ích khi xác thực:</h3>
          <ul>
            <li> Đặt xe trực tuyến nhanh chóng</li>
            <li> Nhận xe ngay tại trạm</li>
            <li> Ưu đãi dành riêng cho khách hàng xác thực</li>
            <li> Bảo mật thông tin tuyệt đối</li>
          </ul>
        </div>

        <div className="verification-actions">
          <button className="btn-cancel" onClick={onClose}>
            Để sau
          </button>
          <button className="btn-verify" onClick={onNavigateToVerification}>
            <SafetyOutlined /> Xác thực ngay
          </button>
        </div>

        <div className="verification-note">
          <small>
             <strong>Lưu ý:</strong> Quá trình xác thực thường mất 5-10 phút. 
            Bạn sẽ nhận được thông báo khi xác thực thành công.
          </small>
        </div>
      </div>
    </Modal>
  );
};

export default BookingVerificationModal;
