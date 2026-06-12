import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../config/apiClient';
import { sessionStore } from '../services/storage/storage';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function useNotifications() {
  const { role } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (role !== 'admin' && role !== 'cajero') return;
    try {
      const data = await apiClient("/notifications", { method: 'GET' });
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.length);
      }
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  }, [role]);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  useEffect(() => {
    if (role !== 'admin' && role !== 'cajero') return;

    const token = sessionStore.getItem("access_token");
    if (!token) return;

    const eventSource = new EventSource(`${API_BASE_URL}/notifications/stream?token=${token}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
      } catch (e) {
        console.error('Error parsing SSE', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [role]);

  const removeNotification = async (id: string) => {
    try {
      await apiClient(`/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Error removing notification', e);
    }
  };

  return { notifications, unreadCount, removeNotification };
}
