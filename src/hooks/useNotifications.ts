import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  notificationsGateway,
  type NotificationItem,
  type NotificationsGateway,
} from '../services/notifications/notificationsGateway';

export type { NotificationItem } from '../services/notifications/notificationsGateway';

export function useNotifications(
  gateway: NotificationsGateway = notificationsGateway,
) {
  const { role } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (role !== 'admin' && role !== 'cajero' && role !== 'despachador' && role !== 'mesero') return;
    try {
      const data = await gateway.list();
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  }, [gateway, role]);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  useEffect(() => {
    if (role !== 'admin' && role !== 'cajero' && role !== 'despachador' && role !== 'mesero') return;

    return gateway.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
  }, [gateway, role]);

  const removeNotification = async (id: string) => {
    try {
      await gateway.remove(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Error removing notification', e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await gateway.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Error marking notification as read', e);
    }
  };

  return { notifications, unreadCount, removeNotification, markAsRead };
}
