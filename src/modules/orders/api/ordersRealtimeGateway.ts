import { io, type Socket } from "socket.io-client";
import { accessTokenStore } from "../../../shared/api/accessTokenStore";
import type { Order } from "../model/order.types";
import {
  mapBackendOrderToFrontend,
  type BackendOrder,
} from "./backendSync";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const ORDERS_NAMESPACE = `${API_BASE_URL.replace(/\/$/, "")}/orders`;

export type OrderRealtimeMutation = "created" | "updated";

export interface OrderRealtimeEvent {
  mutation: OrderRealtimeMutation;
  order: Order;
}

export interface OrderRealtimeHandlers {
  onOrderChanged(event: OrderRealtimeEvent): void;
  onConnect(): void;
  onDisconnect(): void;
  onError(error: Error): void;
}

export interface OrdersRealtimeGateway {
  subscribe(handlers: OrderRealtimeHandlers): () => void;
}

interface BackendOrderRealtimeEvent {
  mutation: OrderRealtimeMutation;
  order: BackendOrder;
}

function isRealtimeEvent(
  event: BackendOrderRealtimeEvent,
): event is BackendOrderRealtimeEvent {
  return (
    (event?.mutation === "created" || event?.mutation === "updated") &&
    typeof event?.order?.id === "string" &&
    Array.isArray(event.order.items)
  );
}

export const ordersRealtimeGateway: OrdersRealtimeGateway = {
  subscribe(handlers) {
    let manualReconnectTimer: number | undefined;
    const socket: Socket = io(ORDERS_NAMESPACE, {
      auth: (callback) => {
        callback({ token: accessTokenStore.get() });
      },
      reconnection: true,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
    });

    const clearManualReconnect = () => {
      if (manualReconnectTimer === undefined) return;
      window.clearTimeout(manualReconnectTimer);
      manualReconnectTimer = undefined;
    };

    const handleConnect = () => {
      clearManualReconnect();
      handlers.onConnect();
    };

    const handleConnectError = (error: Error) => {
      handlers.onError(error);

      if (!accessTokenStore.get()) {
        clearManualReconnect();
        return;
      }

      if (!socket.active && manualReconnectTimer === undefined) {
        manualReconnectTimer = window.setTimeout(() => {
          manualReconnectTimer = undefined;
          if (accessTokenStore.get()) {
            socket.connect();
          }
        }, 3_000);
      }
    };

    const handleChanged = (event: BackendOrderRealtimeEvent) => {
      if (!isRealtimeEvent(event)) {
        console.warn("Evento de orden en tiempo real invalido.");
        return;
      }

      handlers.onOrderChanged({
        mutation: event.mutation,
        order: mapBackendOrderToFrontend(event.order),
      });
    };

    socket.on("orders:changed", handleChanged);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handlers.onDisconnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      clearManualReconnect();
      socket.off("orders:changed", handleChanged);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handlers.onDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  },
};
