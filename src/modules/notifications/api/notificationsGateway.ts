import { apiClient } from "../../../shared/api";
import { accessTokenStore } from "../../../shared/api/accessTokenStore";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsGateway {
  list(): Promise<NotificationItem[]>;
  remove(id: string): Promise<void>;
  markAsRead(id: string): Promise<void>;
  subscribe(onNotification: (notification: NotificationItem) => void): () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const notificationsGateway: NotificationsGateway = {
  list: () => apiClient("/notifications", { method: "GET" }),

  async remove(id) {
    await apiClient(`/notifications/${id}`, { method: "DELETE" });
  },

  async markAsRead(id) {
    await apiClient(`/notifications/${id}/read`, { method: "PATCH" });
  },

  subscribe(onNotification) {
    const token = accessTokenStore.get();
    const streamUrl = token
      ? `${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`
      : `${API_BASE_URL}/notifications/stream`;

    const eventSource = new EventSource(streamUrl);
    eventSource.onmessage = (event) => {
      try {
        onNotification(JSON.parse(event.data) as NotificationItem);
      } catch (error) {
        console.error("Error parsing notification stream", error);
      }
    };
    return () => eventSource.close();
  },
};
