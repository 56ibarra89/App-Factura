import { apiClient } from "../../../shared/api";

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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const notificationsGateway: NotificationsGateway = {
  list: () => apiClient("/notifications", { method: "GET" }),

  async remove(id) {
    await apiClient(`/notifications/${id}`, { method: "DELETE" });
  },

  async markAsRead(id) {
    await apiClient(`/notifications/${id}/read`, { method: "PATCH" });
  },

  subscribe(onNotification) {
    const eventSource = new EventSource(`${API_BASE_URL}/notifications/stream`);
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
