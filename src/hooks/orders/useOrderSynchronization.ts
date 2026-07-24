import { useEffect } from "react";
import type { MutableRefObject } from "react";
import type { Order } from "../../types/order.types";
import type { CurrentOrdersGateway } from "../../services/order/ordersGateway";
import type { OrderPreferencesGateway } from "../../services/order/orderPreferencesGateway";
import type { OrderStateUpdater } from "./useOrderStore";

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

interface UseOrderSynchronizationOptions {
  isLoggedIn: boolean;
  ordersRef: MutableRefObject<Order[]>;
  updateOrders: (updater: OrderStateUpdater) => void;
  gateway: CurrentOrdersGateway;
  preferencesGateway: OrderPreferencesGateway;
  pollIntervalMs?: number;
}

export function useOrderSynchronization({
  isLoggedIn,
  ordersRef,
  updateOrders,
  gateway,
  preferencesGateway,
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
        const [backendOrders, hiddenOrderIds] = await Promise.all([
          gateway.listCurrent(),
          hiddenOrderIdsPromise,
        ]);

        if (!active) return;
        const nextOrders = reconcileOrders(
          ordersRef.current,
          backendOrders,
          hiddenOrderIds,
        );
        updateOrders(() => nextOrders);
      } catch (error: unknown) {
        console.error("Failed to load orders from backend", error);
      } finally {
        loading = false;
      }
    };

    void loadOrders();
    const intervalId = window.setInterval(
      () => void loadOrders(),
      pollIntervalMs,
    );

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [
    gateway,
    isLoggedIn,
    ordersRef,
    pollIntervalMs,
    preferencesGateway,
    updateOrders,
  ]);
}
