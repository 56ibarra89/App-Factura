/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Order,
  OrderStatus,
  PaymentMethod,
  OrderType,
} from "../types/order.types";
import { CartItemType } from "../types/cart";
import { IOrderRepository } from "../types/repositories";
import { orderRepository as defaultOrderRepository } from "../repositories/OrderRepository";
import { useAuth } from "./AuthContext";
import {
  createOrder,
  hydrateOrdersFromStorage,
  orderMutations,
  orderSelectors,
} from "../services/order/orderDomain";
import { localStore } from "../services/storage/storage";

interface OrderContextProps {
  orders: Order[];
  addOrder: (
    items: CartItemType[],
    total: number,
    customerName?: string,
    orderType?: OrderType,
    customerAddress?: string,
    tableId?: string,
    paymentMethod?: string,
    splitAmounts?: { efectivo: number; tarjeta: number },
    subTotal?: number,
    taxAmount?: number,
  ) => void;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    sentAt?: number,
  ) => void;
  removeOrder: (orderId: string) => void;
  clearHistory: () => void;
  updateOrderItems: (
    orderId: string,
    items: CartItemType[],
    total: number,
    subTotal?: number,
    taxAmount?: number,
  ) => void;
  getOrderByTable: (tableId: string) => Order | undefined;
  finalizeOrder: (
    orderId: string,
    paymentMethod: PaymentMethod,
    splitAmounts?: { efectivo: number; tarjeta: number },
    customerName?: string,
    orderType?: OrderType,
    customerAddress?: string,
    finalTotal?: number,
    subTotal?: number,
    taxAmount?: number,
  ) => void;
  markAsSentToKitchen: (orderId: string) => void;
  markAsSentToKitchenByTable: (tableId: string) => void;
  moveOrder: (sourceTableId: string, destTableId: string) => void;
  unirMesas: (sourceTableId: string, destTableId: string) => void;
}

type OrderQueriesContextProps = Pick<OrderContextProps, "orders" | "getOrderByTable">;
type OrderCommandsContextProps = Omit<
  OrderContextProps,
  "orders" | "getOrderByTable"
>;

const OrderQueriesContext = createContext<OrderQueriesContextProps | undefined>(
  undefined,
);
const OrderCommandsContext = createContext<
  OrderCommandsContextProps | undefined
>(undefined);

const LOCAL_STORAGE_KEY = "app_factura_orders";

interface OrderProviderProps {
  children: React.ReactNode;
  /** DIP: permite inyectar un repositorio alternativo (e.g. mock para tests) */
  repository?: IOrderRepository;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({
  children,
  repository = defaultOrderRepository,
}) => {
  const { username } = useAuth();

  const persist = useCallback(
    (order: Order) => {
      void repository
        .save(order)
        .catch((err) =>
          console.error("[OrderContext] Error guardando orden:", err),
        );
    },
    [repository],
  );

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStore.getItem(LOCAL_STORAGE_KEY);
    try {
      return hydrateOrdersFromStorage(saved, new Date());
    } catch (e) {
      console.error("Error loading orders from localStorage", e);
      return [];
    }
  });

  useEffect(() => {
    localStore.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = useCallback<OrderCommandsContextProps["addOrder"]>(
    (
      items,
      total,
      customerName,
      orderType,
      customerAddress,
      tableId,
      paymentMethod,
      splitAmounts,
      subTotal,
      taxAmount,
    ) => {
      const nowMs = Date.now();
      const newOrder = createOrder({
        items,
        total,
        username,
        customerName,
        orderType,
        customerAddress,
        tableId,
        paymentMethod,
        splitAmounts,
        subTotal,
        taxAmount,
        nowMs,
      });

      setOrders((prev) => [newOrder, ...prev]);
      persist(newOrder);
    },
    [persist, username],
  );

  const updateOrderStatus = useCallback<OrderCommandsContextProps["updateOrderStatus"]>(
    (orderId, status, sentAt) => {
      setOrders((prev) => {
        const { orders: nextOrders, modified } =
          orderMutations.updateOrderStatus(prev, orderId, status, sentAt);
        if (modified) persist(modified);
        return nextOrders;
      });
    },
    [persist],
  );

  const removeOrder = useCallback<OrderCommandsContextProps["removeOrder"]>(
    (orderId) => {
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    },
    [],
  );

  const updateOrderItems = useCallback<OrderCommandsContextProps["updateOrderItems"]>(
    (orderId, items, total, subTotal, taxAmount) => {
      setOrders((prev) => {
        const { orders: nextOrders, modified } =
          orderMutations.updateOrderItems(prev, orderId, items, total);
        if (modified) {
          // Note: updateOrderItems in orderDomain doesn't support subTotal/taxAmount yet, 
          // let's just update the order object if it was modified
          if (typeof subTotal === 'number') modified.subTotal = subTotal;
          if (typeof taxAmount === 'number') modified.taxAmount = taxAmount;
          persist(modified);
        }
        return nextOrders;
      });
    },
    [persist],
  );

  const getOrderByTable = useCallback<OrderQueriesContextProps["getOrderByTable"]>(
    (tableId) => orderSelectors.getActiveOrderByTable(orders, tableId),
    [orders],
  );

  const clearHistory = useCallback<OrderCommandsContextProps["clearHistory"]>(
    () => {
      setOrders((prev) => orderMutations.clearHistory(prev).orders);
    },
    [],
  );

  const finalizeOrder = useCallback<OrderCommandsContextProps["finalizeOrder"]>(
    (
      orderId,
      paymentMethod,
      splitAmounts,
      customerName,
      orderType,
      customerAddress,
      finalTotal,
      subTotal,
      taxAmount,
    ) => {
      setOrders((prev) => {
        const { orders: nextOrders, modified } = orderMutations.finalizeOrder(
          prev,
          orderId,
          {
            paymentMethod,
            splitAmounts,
            customerName,
            orderType,
            customerAddress,
            finalTotal,
            subTotal,
            taxAmount,
          },
        );
        if (modified) persist(modified);
        return nextOrders;
      });
    },
    [persist],
  );

  const markAsSentToKitchen = useCallback<
    OrderCommandsContextProps["markAsSentToKitchen"]
  >(
    (orderId) => {
      setOrders((prev) => {
        const { orders: nextOrders, modified } =
          orderMutations.markAsSentToKitchen(prev, orderId, Date.now());
        if (modified) persist(modified);
        return nextOrders;
      });
    },
    [persist],
  );

  const markAsSentToKitchenByTable = useCallback<
    OrderCommandsContextProps["markAsSentToKitchenByTable"]
  >(
    (tableId) => {
      setOrders((prev) => {
        const { orders: nextOrders, modified } =
          orderMutations.markAsSentToKitchenByTable(prev, tableId, Date.now());
        if (modified) persist(modified);
        return nextOrders;
      });
    },
    [persist],
  );

  const moveOrder = useCallback<OrderCommandsContextProps["moveOrder"]>(
    (sourceTableId, destTableId) => {
      setOrders((prev) => {
        const { orders: nextOrders, modified } = orderMutations.moveOrder(
          prev,
          sourceTableId,
          destTableId,
        );
        if (modified) persist(modified);
        return nextOrders;
      });
    },
    [persist],
  );

  const unirMesas = useCallback<OrderCommandsContextProps["unirMesas"]>(
    (sourceTableId, destTableId) => {
      setOrders((prev) => {
        const { orders: nextOrders, modified } = orderMutations.unirMesas(
          prev,
          sourceTableId,
          destTableId,
        );
        if (modified) persist(modified);
        return nextOrders;
      });
    },
    [persist],
  );

  const queriesValue = useMemo<OrderQueriesContextProps>(
    () => ({ orders, getOrderByTable }),
    [orders, getOrderByTable],
  );

  const commandsValue = useMemo<OrderCommandsContextProps>(
    () => ({
      addOrder,
      updateOrderStatus,
      removeOrder,
      clearHistory,
      updateOrderItems,
      finalizeOrder,
      markAsSentToKitchen,
      markAsSentToKitchenByTable,
      moveOrder,
      unirMesas,
    }),
    [
      addOrder,
      updateOrderStatus,
      removeOrder,
      clearHistory,
      updateOrderItems,
      finalizeOrder,
      markAsSentToKitchen,
      markAsSentToKitchenByTable,
      moveOrder,
      unirMesas,
    ],
  );

  return (
    <OrderQueriesContext.Provider value={queriesValue}>
      <OrderCommandsContext.Provider value={commandsValue}>
        {children}
      </OrderCommandsContext.Provider>
    </OrderQueriesContext.Provider>
  );
};

export const useOrderQueries = (): OrderQueriesContextProps => {
  const context = useContext(OrderQueriesContext);
  if (!context)
    throw new Error("useOrderQueries debe usarse dentro de <OrderProvider>");
  return context;
};

export const useOrderCommands = (): OrderCommandsContextProps => {
  const context = useContext(OrderCommandsContext);
  if (!context)
    throw new Error("useOrderCommands debe usarse dentro de <OrderProvider>");
  return context;
};

export const useOrderContext = (): OrderContextProps => {
  const queries = useContext(OrderQueriesContext);
  const commands = useContext(OrderCommandsContext);
  if (!queries || !commands)
    throw new Error("useOrderContext debe usarse dentro de <OrderProvider>");
  return { ...queries, ...commands };
};
