import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Empty, Tag } from 'antd';
import { BellOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    try {
      setLoading(true);
      
      // In real app: await notificationAPI.getMyNotifications();
      // For now, get from localStorage
      const userNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
      
      // Sort by created date, newest first
      const sortedNotifications = userNotifications.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      message.error('Không thể tải thông báo!');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notif =>
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    );
    
    setNotifications(updatedNotifications);
    localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, isRead: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
    message.success('Đã đánh dấu tất cả là đã đọc');
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    handleMarkAsRead(notification.id);

    // Navigate based on type
    if (notification.type === 'vehicle_preview') {
      navigate(`/vehicle-preview/${notification.bookingId}`);
    } else if (notification.type === 'booking_confirmed') {
      navigate(`/my-bookings`);
    } else if (notification.type === 'checkin_reminder') {
      navigate(`/checkin-prepare/${notification.bookingId}`);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'vehicle_preview': '📸',
      'booking_confirmed': '✅',
      'payment_success': '💰',
      'checkin_reminder': '⏰',
      'checkout_reminder': '🔔',
      'verification_approved': '✓',
      'verification_rejected': '✗',
    };
    return icons[type] || '📬';
  };

  const getNotificationColor = (type) => {
    const colors = {
      'vehicle_preview': '#3b82f6',
      'booking_confirmed': '#10b981',
      'payment_success': '#10b981',
      'checkin_reminder': '#f59e0b',
      'checkout_reminder': '#f59e0b',
      'verification_approved': '#10b981',
      'verification_rejected': '#ef4444',
    };
    return colors[type] || '#667eea';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Đang tải thông báo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <BellOutlined /> Thông báo
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-8 h-8 bg-red-500 text-white text-sm font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-2">Các thông báo và cập nhật từ hệ thống</p>
          </div>
          {unreadCount > 0 && (
            <button 
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg transition-all flex items-center gap-2"
              onClick={handleMarkAllAsRead}
            >
              <CheckCircleOutlined /> Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Empty
                description="Chưa có thông báo nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-2xl shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl relative ${
                  !notification.isRead ? 'border-l-4 border-indigo-500 bg-indigo-50/30' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-4">
                  <div 
                    className="flex-shrink-0 w-14 h-14 flex items-center justify-center text-2xl rounded-full"
                    style={{ background: getNotificationColor(notification.type) + '20', color: getNotificationColor(notification.type) }}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {notification.title}
                        {!notification.isRead && (
                          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-3">{notification.message}</p>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-sm text-gray-500">
                        🕐 {new Date(notification.createdAt).toLocaleString('vi-VN')}
                      </span>
                      {notification.bookingId && (
                        <Tag color="blue">Mã: {notification.bookingId}</Tag>
                      )}
                    </div>
                  </div>

                  {!notification.isRead && (
                    <button
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-600 rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                    >
                      <CheckCircleOutlined />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
