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
    if (role !== 'admin' && role !== 'cajero' && role !== 'despachador' && role !== 'mesero') return;
    try {
      const data = await apiClient("/notifications", { method: 'GET' });
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  }, [role]);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  useEffect(() => {
    if (role !== 'admin' && role !== 'cajero' && role !== 'despachador' && role !== 'mesero') return;

    const eventSource = new EventSource(`${API_BASE_URL}/notifications/stream`);

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

  const markAsRead = async (id: string) => {
    try {
      await apiClient(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Error marking notification as read', e);
    }
  };

  return { notifications, unreadCount, removeNotification, markAsRead };
}
