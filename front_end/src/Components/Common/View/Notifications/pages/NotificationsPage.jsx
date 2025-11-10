import React, { useEffect, useState } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('userNotifications') || '[]');
      setNotifications(Array.isArray(stored) ? stored : []);
    } catch (e) {
      console.error('Failed to load notifications from localStorage', e);
      setNotifications([]);
    }
  }, []);

  if (!notifications.length) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
        <div className="text-gray-600">No notifications</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
      <ul className="space-y-3">
        {notifications.map((n, idx) => (
          <li key={idx} className="border rounded p-3 bg-white">
            <div className="font-medium">{n.title || n.subject || 'Notification'}</div>
            <div className="text-sm text-gray-600">{n.body || n.message || JSON.stringify(n)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
