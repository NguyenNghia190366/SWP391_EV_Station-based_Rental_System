import { BASE_URL, apiRequest, buildHeaders } from "./client";

/**
 * ============================================
 * 📬 NOTIFICATIONS API
 * ============================================
 * API endpoints for managing user notifications
 */

export const notificationsAPI = {
  /**
   * Get all notifications for a user
   * @param {string} userId - User ID
   * @param {boolean} unreadOnly - Get only unread notifications
   */
  getNotifications: async (userId, unreadOnly = false) => {
    const params = new URLSearchParams({
      user_id: userId,
      unread_only: unreadOnly.toString()
    });
    
    return apiRequest(
      `${BASE_URL}/Notifications?${params}`,
      {
        method: "GET",
        headers: buildHeaders(),
      }
    );
  },

  /**
   * Get unread notification count
   * @param {string} userId - User ID
   */
  getUnreadCount: async (userId) => {
    return apiRequest(
      `${BASE_URL}/Notifications/unread-count?user_id=${userId}`,
      {
        method: "GET",
        headers: buildHeaders(),
      }
    );
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   */
  markAsRead: async (notificationId) => {
    return apiRequest(
      `${BASE_URL}/Notifications/${notificationId}/read`,
      {
        method: "PUT",
        headers: buildHeaders(),
      }
    );
  },

  /**
   * Mark all notifications as read
   * @param {string} userId - User ID
   */
  markAllAsRead: async (userId) => {
    return apiRequest(
      `${BASE_URL}/Notifications/mark-all-read?user_id=${userId}`,
      {
        method: "PUT",
        headers: buildHeaders(),
      }
    );
  },

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   */
  deleteNotification: async (notificationId) => {
    return apiRequest(
      `${BASE_URL}/Notifications/${notificationId}`,
      {
        method: "DELETE",
        headers: buildHeaders(),
      }
    );
  },

  /**
   * Create a notification (usually called by backend)
   * @param {Object} data - Notification data
   */
  createNotification: async (data) => {
    return apiRequest(
      `${BASE_URL}/Notifications`,
      {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(data),
      }
    );
  }
};
