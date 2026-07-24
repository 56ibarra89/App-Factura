import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { Order } from "../../types/order.types";

export type OrderStateUpdater = (current: Order[]) => Order[];

export interface OrderStore {
  orders: Order[];
  ordersRef: MutableRefObject<Order[]>;
  updateOrders: (updater: OrderStateUpdater) => void;
}

export function useOrderStore(): OrderStore {
  const [orders, setOrders] = useState<Order[]>([]);
  const ordersRef = useRef<Order[]>(orders);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  const updateOrders = useCallback((updater: OrderStateUpdater) => {
    const nextOrders = updater(ordersRef.current);
    ordersRef.current = nextOrders;
    setOrders(nextOrders);
  }, []);

  return { orders, ordersRef, updateOrders };
}
