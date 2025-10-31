import React, { useState, useEffect, useRef } from "react";
import { Badge, Dropdown, Button, List, Empty, Spin, notification as antNotification } from "antd";
import { BellOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { notificationsAPI } from "../../../api/api";

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const previousCountRef = useRef(0);

  // Get user from localStorage (support both "user" and "currentUser" keys)
  const user = JSON.parse(localStorage.getItem("user") || localStorage.getItem("currentUser") || "{}");
  const userId = user.userId || user.id || user.user_id || user.email;

  // Show toast notification for new notifications
  const showToastNotification = (notif) => {
    const icon = notif.type === "success" ? "✅" : 
                 notif.type === "error" ? "❌" : 
                 notif.type === "warning" ? "⚠️" : "ℹ️";
    
    antNotification.open({
      message: `${icon} ${notif.title}`,
      description: notif.message,
      duration: 6,
      placement: "topRight",
      style: {
        borderLeft: `4px solid ${
          notif.type === "success" ? "#52c41a" :
          notif.type === "error" ? "#ff4d4f" :
          notif.type === "warning" ? "#faad14" : "#1890ff"
        }`
      },
      onClick: () => {
        markAsRead(notif.id);
      }
    });
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      const response = await notificationsAPI.getNotifications(userId, false);
      console.log("📬 Notifications:", response);
      
      if (response.data) {
        const newNotifications = response.data;
        const newUnreadCount = response.unreadCount || 0;
        
        // Check if there are NEW unread notifications
        if (newUnreadCount > previousCountRef.current) {
          // Find the newest unread notifications
          const unreadNotifs = newNotifications
            .filter(n => !n.isRead)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          // Show toast for the newest unread notification
          if (unreadNotifs.length > 0) {
            showToastNotification(unreadNotifs[0]);
          }
        }
        
        previousCountRef.current = newUnreadCount;
        setNotifications(newNotifications);
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Mark as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
      previousCountRef.current = Math.max(0, unreadCount - 1);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Handle click on notification
  const handleNotificationClick = (notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Close dropdown
    setDropdownVisible(false);
    
    // Navigate based on notification type
    if (notification.relatedId && user.role === "STAFF") {
      // Staff notifications - navigate to verification dashboard
      navigate("/staff/dashboard");
    } else if (notification.relatedId && user.role === "RENTER") {
      // Renter notifications - navigate to profile to see verification status
      navigate("/profile");
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead(userId);
      
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      previousCountRef.current = 0;
      
      antNotification.success({
        message: "Đã đánh dấu tất cả là đã đọc",
        duration: 2
      });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Delete notification
  const handleDelete = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      
      const deletedNotif = notifications.find(n => n.id === notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      
      if (!deletedNotif.isRead) {
        const newCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newCount);
        previousCountRef.current = newCount;
      }
      
      antNotification.success({
        message: "Đã xóa thông báo",
        duration: 2
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Fetch notifications on mount and set interval
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      
      // Poll every 10 seconds (more frequent for better UX)
      const interval = setInterval(fetchNotifications, 10000);
      
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Get notification icon color
  const getNotifColor = (type) => {
    switch (type) {
      case "success": return "text-green-600";
      case "error": return "text-red-600";
      case "warning": return "text-yellow-600";
      default: return "text-blue-600";
    }
  };

  // Notification list dropdown content
  const notificationMenu = (
    <div className="w-96 max-h-[500px] bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Thông báo</h3>
        {unreadCount > 0 && (
          <Button 
            type="link" 
            size="small" 
            onClick={handleMarkAllAsRead}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>
      
      <div className="overflow-y-auto max-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty 
            description="Không có thông báo" 
            className="py-8"
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <div 
                className={`p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                  !item.isRead ? "bg-blue-50" : ""
                }`}
                onClick={() => handleNotificationClick(item)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className={`font-semibold mb-1 ${getNotifColor(item.type)}`}>
                      {item.title}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.message}
                    </p>
                    <div className="text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                  
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {!item.isRead && (
                      <Button
                        type="text"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={() => markAsRead(item.id)}
                        title="Đánh dấu đã đọc"
                      />
                    )}
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(item.id)}
                      title="Xóa"
                    />
                  </div>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );

  if (!userId) return null;

  return (
    <Dropdown
      dropdownRender={() => notificationMenu}
      trigger={["click"]}
      open={dropdownVisible}
      onOpenChange={setDropdownVisible}
      placement="bottomRight"
    >
      <div className="cursor-pointer relative">
        <Badge count={unreadCount} offset={[-5, 5]}>
          <BellOutlined 
            className="text-white text-2xl hover:text-gray-200 transition-colors" 
          />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default NotificationBell;
