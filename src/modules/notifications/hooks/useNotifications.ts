import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from "../../auth";
import {
  notificationsGateway,
  type NotificationItem,
  type NotificationsGateway,
} from '../api/notificationsGateway';

export type { NotificationItem } from '../api/notificationsGateway';

export function useNotifications(
  gateway: NotificationsGateway = notificationsGateway,
) {
  const { role } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const fetchUnread = useCallback(async () => {
    if (
      role !== 'admin' &&
      role !== 'cajero' &&
      role !== 'cajero_principal' &&
      role !== 'despachador' &&
      role !== 'mesero' &&
      role !== 'motorizado'
    )
      return;
    try {
      const data = await gateway.list();
      if (Array.isArray(data)) {
        const deduplicated = Array.from(
          new Map(data.map((item) => [item.id, item])).values(),
        );
        setNotifications(deduplicated);
      }
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  }, [gateway, role]);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  useEffect(() => {
    if (
      role !== 'admin' &&
      role !== 'cajero' &&
      role !== 'cajero_principal' &&
      role !== 'despachador' &&
      role !== 'mesero' &&
      role !== 'motorizado'
    )
      return;

    return gateway.subscribe((notification) => {
      setNotifications((prev) => {
        if (prev.some((item) => item.id === notification.id)) {
          return prev.map((item) =>
            item.id === notification.id ? notification : item,
          );
        }
        return [notification, ...prev];
      });
    });
  }, [gateway, role]);
  const removeNotification = async (id: string) => {
    try {
      await gateway.remove(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error('Error removing notification', e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await gateway.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error('Error marking notification as read', e);
    }
  };

  return { notifications, unreadCount, removeNotification, markAsRead };
}
