import { useCallback, useEffect, useRef, useState } from "react";
import { ordersRealtimeGateway, type Order } from "../../orders";
import { deliveryGateway } from "../api/deliveryGateway";

function updatedAt(order: Order) {
  return order.updatedAt?.getTime() ?? 0;
}

export function useDeliveryOrders(
  ownOnly: boolean,
  username: string,
  businessDate: string,
) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reloadRef = useRef<() => Promise<void>>(async () => {});
  const reload = useCallback(() => reloadRef.current(), []);

  useEffect(() => {
    let active = true;
    let poll: number | undefined;
    let pending: Promise<void> | undefined;
    let reloadRequested = false;
    const eventsDuringRequest = new Map<string, Order>();

    setOrders([]);
    setError(null);
    setLoading(true);

    const visible = (order: Order) =>
      order.orderType === "delivery" && order.status !== "cancelled" &&
      (!ownOnly || Boolean(order.driverId));

    const load = (followUp = false): Promise<void> => {
      if (!active) return Promise.resolve();
      if (pending) {
        reloadRequested ||= followUp;
        return pending;
      }
      pending = (async () => {
        do {
          reloadRequested = false;
          eventsDuringRequest.clear();
          try {
            const snapshot = await (ownOnly
              ? deliveryGateway.getMyDeliveries()
              : deliveryGateway.listDeliveries());
            if (!active) return;
            const rows = new Map(snapshot.map((order) => [order.id, order]));
            for (const [id, event] of eventsDuringRequest) {
              const current = rows.get(id);
              if (current && updatedAt(current) > updatedAt(event)) continue;
              if (visible(event)) rows.set(id, event);
              else rows.delete(id);
            }
            const snapshotRows = Array.from(rows.values()).filter(visible);
            setOrders((current) => {
              const currentById = new Map(current.map((order) => [order.id, order]));
              return snapshotRows.map((order) => {
                const previous = currentById.get(order.id);
                return previous && updatedAt(previous) > updatedAt(order)
                  ? previous
                  : order;
              });
            });
            setError(null);
          } catch {
            if (active) setError("No se pudieron actualizar las entregas. Se conservan los últimos datos disponibles.");
          } finally {
            if (active) setLoading(false);
          }
        } while (active && reloadRequested);
      })().finally(() => {
        pending = undefined;
      });
      return pending;
    };

    const stopPolling = () => {
      if (poll === undefined) return;
      window.clearInterval(poll);
      poll = undefined;
    };
    const startPolling = () => {
      if (!active || poll !== undefined) return;
      poll = window.setInterval(() => void load(), 12000);
    };

    reloadRef.current = () => load(true);
    startPolling();
    const unsubscribe = ordersRealtimeGateway.subscribe({
      onConnect() {
        stopPolling();
        void load(true);
      },
      onDisconnect: startPolling,
      onError: startPolling,
      onOrderChanged({ order }) {
        if (!active || (order.orderType !== "delivery" && !ownOnly)) return;
        if (pending) {
          const previous = eventsDuringRequest.get(order.id);
          if (!previous || updatedAt(order) >= updatedAt(previous)) {
            eventsDuringRequest.set(order.id, order);
          }
        }
        setOrders((current) => {
          const previous = current.find((row) => row.id === order.id);
          if (previous && updatedAt(previous) > updatedAt(order)) return current;
          if (!visible(order)) return current.filter((row) => row.id !== order.id);
          if (!previous) return [order, ...current];
          return current.map((row) => row.id === order.id ? order : row);
        });
      },
    });
    void load();

    return () => {
      active = false;
      stopPolling();
      unsubscribe();
    };
  }, [ownOnly, username, businessDate]);

  return { orders, loading, error, reload };
}
