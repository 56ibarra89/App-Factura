import { useOrderCommands, useOrderQueries } from "../context/OrderContext";
import { useMemo } from "react";
import { Order } from "../types/order.types";
import { CartItemType } from "../types/cart";
import { useState, useCallback, useEffect } from "react";
import { apiClient } from "../config/apiClient";

// Helper para dividir una orden en múltiples "Tickets de Cocina" agrupados por sentAt
const splitIntoKitchenTickets = (order: Order): Order[] => {
  if (!order.isSentToKitchen) return [];

  // Solo considerar items enviados a la cocina
  const sentItems = order.items.filter(i => i.isSentToKitchen);
  if (sentItems.length === 0) return [];

  // Agrupar items por sentAt (si no tienen sentAt, agrupar bajo un timestamp por defecto)
  const defaultSentAt = new Date(order.timestamp).getTime();
  const groups: Record<number, CartItemType[]> = {};

  sentItems.forEach(item => {
    const key = item.sentAt || defaultSentAt;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  // Convertir los grupos en órdenes virtuales
  return Object.entries(groups).map(([sentAtStr, items]) => {
    const sentAt = Number(sentAtStr);
    
    // El estado del ticket se determina por el kitchenStatus de sus ítems
    const allDelivered = items.every(i => i.kitchenStatus === 'delivered');
    const anyPending = items.some(i => i.kitchenStatus === 'pending' || !i.kitchenStatus);
    const anyPreparing = items.some(i => i.kitchenStatus === 'preparing');
    const anyReady = items.some(i => i.kitchenStatus === 'ready');
    
    let ticketStatus = order.status;
    if (order.status === 'cancelled') ticketStatus = 'cancelled';
    else if (allDelivered) ticketStatus = 'delivered';
    else if (anyPending) ticketStatus = 'pending';
    else if (anyPreparing) ticketStatus = 'preparing';
    else if (anyReady) ticketStatus = 'ready';

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      ...order,
      // Sobrescribimos el status, items y timestamp para la vista de cocina
      status: ticketStatus,
      items: items,
      total: subtotal,
      timestamp: new Date(sentAt), // Para que muestre la hora de envío real
    };
  });
};

export const useOrderManagement = () => {
  const { orders } = useOrderQueries();
  const { updateOrderStatus, removeOrder } = useOrderCommands();

  const [hiddenTickets, setHiddenTickets] = useState<string[]>([]);

  // Fetch initial hidden tickets from backend
  useEffect(() => {
    let isMounted = true;
    apiClient('/orders/kitchen/hidden-tickets')
      .then((data: string[]) => {
        if (isMounted && Array.isArray(data)) {
          setHiddenTickets(data);
        }
      })
      .catch(e => console.error("Error fetching hidden kitchen tickets:", e));
    
    return () => { isMounted = false; };
  }, []);

  // Dividir todas las órdenes en tickets virtuales
  const allTickets = useMemo(() => {
    return orders.flatMap(splitIntoKitchenTickets);
  }, [orders]);

  const activeOrders = useMemo(() => 
    allTickets.filter(t => t.status === 'pending' || t.status === 'preparing' || t.status === 'ready'),
    [allTickets]
  );

  const finishedOrders = useMemo(() => 
    allTickets.filter(t => {
      const isFinished = t.status === 'delivered' || t.status === 'paid' || t.status === 'cancelled';
      if (!isFinished) return false;
      const ticketId = `${t.id}-${t.timestamp.getTime()}`;
      return !hiddenTickets.includes(ticketId);
    }),
    [allTickets, hiddenTickets]
  );

  const clearKitchenHistory = useCallback(() => {
    const toHide = finishedOrders.map(t => `${t.id}-${t.timestamp.getTime()}`);
    if (toHide.length === 0) return;

    setHiddenTickets(prev => {
      const next = Array.from(new Set([...prev, ...toHide]));
      return next;
    });

    apiClient('/orders/kitchen/hidden-tickets', {
      method: 'POST',
      body: JSON.stringify({ ticketIds: toHide })
    }).catch(e => console.error("Error saving hidden kitchen tickets:", e));
  }, [finishedOrders]);

  return {
    activeOrders,
    finishedOrders,
    updateOrderStatus,
    removeOrder,
    clearHistory: clearKitchenHistory
  };
};
