import { useOrderCommands, useOrderQueries } from "../model/OrderContext";
import { useMemo } from "react";
import { Order } from "../model/order.types";
import type { OrderItem } from "../model/order.types";
import {
  isSupplementalOrderItem,
  requiresKitchenPreparation,
} from "../model/orderItemDomain";
import { useState, useCallback, useEffect } from "react";
import {
  kitchenTicketPreferencesGateway,
  type KitchenTicketPreferencesGateway,
} from "../api/kitchenTicketPreferencesGateway";

const splitIntoKitchenTickets = (order: Order): Order[] => {
  if (!order.isSentToKitchen) return [];

  const supplementalItems = order.items.filter(isSupplementalOrderItem);
  const sentItems = order.items.filter(
    (item) => item.isSentToKitchen && requiresKitchenPreparation(item),
  );
  if (sentItems.length === 0) return [];

  const defaultSentAt = new Date(order.timestamp).getTime();
  const groups: Record<string, OrderItem[]> = {};

  sentItems.forEach((item) => {
    const timeKey = item.sentAt || defaultSentAt;
    const key = `${timeKey}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  // Convertir los grupos en órdenes virtuales
  return Object.entries(groups).map(([groupKey, items]) => {
    const sentAt = Number(groupKey.split("-")[0]);

    // El estado del ticket se determina por el kitchenStatus de sus ítems
    const allDelivered = items.every((i) => i.kitchenStatus === "delivered");
    const allReadyOrDelivered = items.every(
      (i) => i.kitchenStatus === "ready" || i.kitchenStatus === "delivered"
    );
    const anyPreparingOrReady = items.some(
      (i) => i.kitchenStatus === "preparing" || i.kitchenStatus === "ready"
    );

    let ticketStatus = order.status;
    if (order.status === "cancelled") ticketStatus = "cancelled";
    else if (allDelivered) ticketStatus = "delivered";
    else if (allReadyOrDelivered) ticketStatus = "ready";
    else if (anyPreparingOrReady) ticketStatus = "preparing";
    else ticketStatus = "pending";

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      ...order,
      // Sobrescribimos el status, items y timestamp para la vista de cocina
      status: ticketStatus,
      items: [...items, ...supplementalItems],
      total: subtotal,
      timestamp: new Date(sentAt), // Para que muestre la hora de envío real
    };
  });
};

export const useOrderManagement = (
  preferencesGateway: KitchenTicketPreferencesGateway = kitchenTicketPreferencesGateway
) => {
  const { orders } = useOrderQueries();
  const { updateOrderStatus, removeOrder } = useOrderCommands();

  const [hiddenTickets, setHiddenTickets] = useState<string[]>([]);

  // Fetch initial hidden tickets from backend
  useEffect(() => {
    let isMounted = true;
    preferencesGateway
      .getHiddenTicketIds()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setHiddenTickets(data);
        }
      })
      .catch((e) => console.error("Error fetching hidden kitchen tickets:", e));

    return () => {
      isMounted = false;
    };
  }, [preferencesGateway]);

  // Dividir todas las órdenes en tickets virtuales
  const allTickets = useMemo(() => {
    return orders.flatMap(splitIntoKitchenTickets);
  }, [orders]);

  const activeOrders = useMemo(
    () =>
      allTickets.filter(
        (t) =>
          t.status === "pending" ||
          t.status === "preparing" ||
          t.status === "ready"
      ),
    [allTickets]
  );

  const finishedOrders = useMemo(
    () =>
      allTickets.filter((t) => {
        const isFinished =
          t.status === "delivered" ||
          t.status === "paid" ||
          t.status === "cancelled";
        if (!isFinished) return false;
        const ticketId = `${t.id}-${t.timestamp.getTime()}`;
        return !hiddenTickets.includes(ticketId);
      }),
    [allTickets, hiddenTickets]
  );

  const clearKitchenHistory = useCallback(() => {
    const toHide = finishedOrders.map(
      (t) => `${t.id}-${t.timestamp.getTime()}`
    );
    if (toHide.length === 0) return;

    setHiddenTickets((prev) => {
      const next = Array.from(new Set([...prev, ...toHide]));
      return next;
    });

    preferencesGateway
      .hideTicketIds(toHide)
      .catch((e) => console.error("Error saving hidden kitchen tickets:", e));
  }, [finishedOrders, preferencesGateway]);

  return {
    activeOrders,
    finishedOrders,
    updateOrderStatus,
    removeOrder,
    clearHistory: clearKitchenHistory,
  };
};

