import { useEffect } from "react";
import type { MutableRefObject } from "react";
import type { Order } from "../model/order.types";
import type { CurrentOrdersGateway } from "../api/ordersGateway";
import type { OrderPreferencesGateway } from "../api/orderPreferencesGateway";
import type { OrderStateUpdater } from "./useOrderStore";
import type {
  OrderRealtimeEvent,
  OrdersRealtimeGateway,
} from "../api/ordersRealtimeGateway";

const RECENT_LOCAL_ORDER_WINDOW_MS = 15_000;

function sanitizeLinkedTables(order: Order): Order {
  if (!order.tableId || !order.linkedTables?.includes(order.tableId)) {
    return order;
  }

  return {
    ...order,
    linkedTables: order.linkedTables.filter(
      (tableId) => tableId !== order.tableId,
    ),
  };
}

export function reconcileOrders(
  currentOrders: readonly Order[],
  backendOrders: readonly Order[],
  hiddenOrderIds: readonly string[],
  now = Date.now(),
): Order[] {
  const sanitizedBackendOrders = backendOrders.map(sanitizeLinkedTables);
  const mergedOrders = sanitizedBackendOrders.map((backendOrder) => {
    const localOrder = currentOrders.find(
      (order) => order.id === backendOrder.id,
    );
    if (!localOrder) return backendOrder;

    const backendHasLinkedTables =
      (backendOrder.linkedTables?.length ?? 0) > 0;
    const localHasLinkedTables = (localOrder.linkedTables?.length ?? 0) > 0;

    if (!backendHasLinkedTables && localHasLinkedTables) {
      return {
        ...backendOrder,
        tableId: localOrder.tableId,
        linkedTables: localOrder.linkedTables,
      };
    }
    return backendOrder;
  });

  const backendOrderIds = new Set(backendOrders.map((order) => order.id));
  const recentLocalOrders = currentOrders.filter(
    (order) =>
      !backendOrderIds.has(order.id) &&
      now - new Date(order.timestamp).getTime() <
        RECENT_LOCAL_ORDER_WINDOW_MS,
  );
  const hiddenIds = new Set(hiddenOrderIds);

  return [...mergedOrders, ...recentLocalOrders].filter(
    (order) => !hiddenIds.has(order.id),
  );
}

export function reconcileRealtimeOrder(
  currentOrders: readonly Order[],
  realtimeOrder: Order,
  hiddenOrderIds: readonly string[],
): Order[] {
  const hiddenIds = new Set(hiddenOrderIds);
  if (hiddenIds.has(realtimeOrder.id)) {
    return currentOrders.filter((order) => order.id !== realtimeOrder.id);
  }

  const sanitizedOrder = sanitizeLinkedTables(realtimeOrder);
  const localOrder = currentOrders.find(
    (order) => order.id === sanitizedOrder.id,
  );
  const shouldPreserveLinkedTables =
    localOrder &&
    (sanitizedOrder.linkedTables?.length ?? 0) === 0 &&
    (localOrder.linkedTables?.length ?? 0) > 0;
  const mergedOrder = shouldPreserveLinkedTables
    ? {
        ...sanitizedOrder,
        tableId: localOrder.tableId,
        linkedTables: localOrder.linkedTables,
      }
    : sanitizedOrder;

  if (!localOrder) {
    return [mergedOrder, ...currentOrders];
  }

  return currentOrders.map((order) =>
    order.id === mergedOrder.id ? mergedOrder : order,
  );
}

interface UseOrderSynchronizationOptions {
  isLoggedIn: boolean;
  ordersRef: MutableRefObject<Order[]>;
  updateOrders: (updater: OrderStateUpdater) => void;
  gateway: CurrentOrdersGateway;
  preferencesGateway: OrderPreferencesGateway;
  realtimeGateway: OrdersRealtimeGateway;
  pollIntervalMs?: number;
}

export function useOrderSynchronization({
  isLoggedIn,
  ordersRef,
  updateOrders,
  gateway,
  preferencesGateway,
  realtimeGateway,
  pollIntervalMs = 10_000,
}: UseOrderSynchronizationOptions): void {
  useEffect(() => {
    if (!isLoggedIn) {
      updateOrders(() => []);
      return;
    }

    let active = true;
    let loading = false;
    let preferencesWarningShown = false;
    let realtimeWarningShown = false;
    let hiddenOrderIds: string[] = [];
    let fallbackIntervalId: number | undefined;

    const loadOrders = async () => {
      if (loading) return;
      loading = true;

      try {
        const hiddenOrderIdsPromise = preferencesGateway
          .getHiddenOrderIds()
          .catch(() => {
            if (!preferencesWarningShown) {
              console.warn(
                "Preferencias de órdenes ocultas no disponibles.",
              );
              preferencesWarningShown = true;
            }
            return [];
          });
        const [backendOrders, loadedHiddenOrderIds] = await Promise.all([
          gateway.listCurrent(),
          hiddenOrderIdsPromise,
        ]);

        if (!active) return;
        hiddenOrderIds = loadedHiddenOrderIds;
        const nextOrders = reconcileOrders(
          ordersRef.current,
          backendOrders,
          loadedHiddenOrderIds,
        );
        updateOrders(() => nextOrders);
      } catch (error: unknown) {
        console.error("Failed to load orders from backend", error);
      } finally {
        loading = false;
      }
    };

    const stopFallbackPolling = () => {
      if (fallbackIntervalId === undefined) return;
      window.clearInterval(fallbackIntervalId);
      fallbackIntervalId = undefined;
    };

    const startFallbackPolling = () => {
      if (!active || fallbackIntervalId !== undefined) return;
      void loadOrders();
      fallbackIntervalId = window.setInterval(
        () => void loadOrders(),
        pollIntervalMs,
      );
    };

    const handleRealtimeOrder = ({ order }: OrderRealtimeEvent) => {
      if (!active) return;
      updateOrders((current) =>
        reconcileRealtimeOrder(current, order, hiddenOrderIds),
      );
    };

    const unsubscribe = realtimeGateway.subscribe({
      onOrderChanged: handleRealtimeOrder,
      onConnect: () => {
        realtimeWarningShown = false;
        stopFallbackPolling();
        void loadOrders();
      },
      onDisconnect: startFallbackPolling,
      onError: (error) => {
        if (!realtimeWarningShown) {
          console.warn(
            "Conexion de ordenes en tiempo real no disponible; usando polling temporal.",
            error.message,
          );
          realtimeWarningShown = true;
        }
        startFallbackPolling();
      },
    });

    void loadOrders();

    return () => {
      active = false;
      stopFallbackPolling();
      unsubscribe();
    };
  }, [
    gateway,
    isLoggedIn,
    ordersRef,
    pollIntervalMs,
    preferencesGateway,
    realtimeGateway,
    updateOrders,
  ]);
}
