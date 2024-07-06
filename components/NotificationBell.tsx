'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 60000); // Fetch every minute

    return () => clearInterval(intervalId);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-1 rounded-full hover:bg-gray-200"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
          <div className="py-2">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500">No notifications</p>
            ) : (
              notifications.map(notification => (
                <div key={notification.id} className="px-4 py-2 hover:bg-gray-100">
                  <p className={`text-sm ${notification.read ? 'text-gray-600' : 'font-semibold'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
          <Link href="/notifications" className="block bg-gray-200 text-center py-2 text-sm text-gray-600 hover:bg-gray-300">
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}