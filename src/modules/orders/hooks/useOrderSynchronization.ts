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

function getOrderVersionTimestamp(order: Order): number | null {
  if (!order.updatedAt) return null;
  const time = new Date(order.updatedAt).getTime();
  return Number.isFinite(time) ? time : null;
}

function isLocalOrderNewer(localOrder: Order, incomingOrder: Order): boolean {
  const localVersion = getOrderVersionTimestamp(localOrder);
  const incomingVersion = getOrderVersionTimestamp(incomingOrder);
  if (localVersion !== null && incomingVersion !== null) {
    return localVersion > incomingVersion;
  }
  return false;
}

function resolveSynchronizedTableState(
  localOrder: Order | undefined,
  incomingOrder: Order,
): Order {
  const sanitizedIncoming = sanitizeLinkedTables(incomingOrder);
  if (!localOrder) {
    return sanitizedIncoming;
  }

  // Solo conservar mesas locales si el payload entrante omitió por completo
  // la información de mesas (tanto linkedTables como tableId ausentes).
  // Si linkedTables viene como [] o con elementos, el servidor ya confirmó la
  // asignación real (incluyendo desvinculación o movimiento a una sola mesa).
  const hasExplicitTableState =
    incomingOrder.linkedTables !== undefined ||
    incomingOrder.tableId !== undefined;

  if (hasExplicitTableState) {
    if (
      Array.isArray(incomingOrder.linkedTables) &&
      incomingOrder.linkedTables.length === 0 &&
      incomingOrder.tableId === undefined
    ) {
      return {
        ...sanitizedIncoming,
        tableId: undefined,
        linkedTables: [],
      };
    }
    return sanitizedIncoming;
  }

  return sanitizeLinkedTables({
    ...sanitizedIncoming,
    tableId: localOrder.tableId,
    linkedTables: localOrder.linkedTables,
  });
}

export function reconcileOrders(
  currentOrders: readonly Order[],
  backendOrders: readonly Order[],
  hiddenOrderIds: readonly string[],
  now = Date.now(),
): Order[] {
  const localOrderById = new Map(
    currentOrders.map((order) => [order.id, order] as const),
  );

  const mergedOrders = backendOrders.map((rawBackendOrder) => {
    const localOrder = localOrderById.get(rawBackendOrder.id);
    if (!localOrder) {
      return sanitizeLinkedTables(rawBackendOrder);
    }

    if (isLocalOrderNewer(localOrder, rawBackendOrder)) {
      return localOrder;
    }

    return resolveSynchronizedTableState(localOrder, rawBackendOrder);
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

  const localOrder = currentOrders.find(
    (order) => order.id === realtimeOrder.id,
  );

  if (localOrder && isLocalOrderNewer(localOrder, realtimeOrder)) {
    return [...currentOrders];
  }

  const mergedOrder = resolveSynchronizedTableState(localOrder, realtimeOrder);

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
    let reloadRequested = false;
    let preferencesWarningShown = false;
    let realtimeWarningShown = false;
    let hiddenOrderIds: string[] = [];
    let fallbackIntervalId: number | undefined;
    let realtimeMutationSeq = 0;
    const realtimeEntriesByOrderId = new Map<
      string,
      { seq: number; order: Order }
    >();

    const loadOrders = async () => {
      if (loading) {
        reloadRequested = true;
        return;
      }
      loading = true;
      reloadRequested = false;
      const requestStartSeq = realtimeMutationSeq;

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

        // Si llegaron eventos en tiempo real mientras la petición HTTP estaba en vuelo,
        // preservar la versión en tiempo real salvo que el snapshot HTTP tenga un updatedAt estrictamente posterior.
        const effectiveBackendOrders = backendOrders.map((backendOrder) => {
          const realtimeEntry = realtimeEntriesByOrderId.get(backendOrder.id);
          if (!realtimeEntry || realtimeEntry.seq <= requestStartSeq) {
            return backendOrder;
          }
          const realtimeVersion = getOrderVersionTimestamp(realtimeEntry.order);
          const backendVersion = getOrderVersionTimestamp(backendOrder);
          if (
            realtimeVersion !== null &&
            backendVersion !== null &&
            backendVersion > realtimeVersion
          ) {
            return backendOrder;
          }
          return realtimeEntry.order;
        });

        updateOrders((current) =>
          reconcileOrders(
            current,
            effectiveBackendOrders,
            loadedHiddenOrderIds,
          ),
        );
      } catch (error: unknown) {
        console.error("Failed to load orders from backend", error);
      } finally {
        loading = false;
        if (active && reloadRequested) {
          reloadRequested = false;
          void loadOrders();
        }
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
      realtimeMutationSeq += 1;
      realtimeEntriesByOrderId.set(order.id, {
        seq: realtimeMutationSeq,
        order,
      });
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
