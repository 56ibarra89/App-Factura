import { io, type Socket } from "socket.io-client";
import { accessTokenStore, getApiBaseUrl } from "../../../shared/api";
import type { Order } from "../model/order.types";
import {
  mapBackendOrderToFrontend,
  type BackendOrder,
} from "./backendSync";

function getOrdersNamespace(): string {
  return `${getApiBaseUrl().replace(/\/$/, "")}/orders`;
}

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

const AUTH_SESSION_CHANGED_EVENT = "appfactura:auth-session-changed";

export const ordersRealtimeGateway: OrdersRealtimeGateway = {
  subscribe(handlers) {
    let manualReconnectTimer: number | undefined;
    const socket: Socket = io(getOrdersNamespace(), {
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

    const scheduleReconnectIfAuthenticated = () => {
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

    const handleConnect = () => {
      clearManualReconnect();
      handlers.onConnect();
    };

    const handleDisconnect = (reason: Socket.DisconnectReason) => {
      handlers.onDisconnect();
      if (reason === "io server disconnect") {
        scheduleReconnectIfAuthenticated();
      }
    };

    const handleConnectError = (error: Error) => {
      handlers.onError(error);
      scheduleReconnectIfAuthenticated();
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

    const handleAuthSessionChanged = () => {
      const token = accessTokenStore.get();
      if (!token) {
        clearManualReconnect();
        socket.disconnect();
        return;
      }

      if (socket.connected) {
        socket.emit("auth:refresh", { token });
      } else {
        clearManualReconnect();
        socket.connect();
      }
    };

    socket.on("orders:changed", handleChanged);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    window.addEventListener(
      AUTH_SESSION_CHANGED_EVENT,
      handleAuthSessionChanged,
    );

    return () => {
      clearManualReconnect();
      socket.off("orders:changed", handleChanged);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      window.removeEventListener(
        AUTH_SESSION_CHANGED_EVENT,
        handleAuthSessionChanged,
      );
      socket.disconnect();
    };
  },
};
