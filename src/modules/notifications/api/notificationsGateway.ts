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
    let stopped = false;
    let controller: AbortController | null = null;
    let reconnectTimer: number | undefined;

    const connect = async () => {
      controller = new AbortController();
      const token = accessTokenStore.get();
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/stream`, {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          throw new Error(`Notification stream failed (${response.status})`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (!stopped) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
          let boundary = buffer.indexOf("\n\n");
          while (boundary >= 0) {
            const block = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            const data = block
              .split("\n")
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trimStart())
              .join("\n");
            if (data) {
              try {
                onNotification(JSON.parse(data) as NotificationItem);
              } catch (error) {
                console.error("Error parsing notification stream", error);
              }
            }
            boundary = buffer.indexOf("\n\n");
          }
        }
      } catch (error) {
        if (!stopped && !(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Notification stream disconnected", error);
        }
      } finally {
        if (!stopped) {
          reconnectTimer = window.setTimeout(() => void connect(), 3_000);
        }
      }
    };

    void connect();
    return () => {
      stopped = true;
      controller?.abort();
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
    };
  },
};
