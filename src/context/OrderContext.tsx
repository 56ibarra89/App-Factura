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
import { useAuth } from "./AuthContext";
import {
  createOrder,
  orderMutations,
  orderSelectors,
} from "../services/order/orderDomain";
import {
  fetchOrdersFromBackend,
  syncAddOrderToBackend,
  syncUpdateOrderStatus,
  syncUpdateOrderItems,
  syncFinalizeOrder,
  syncUpdateTables
} from "../services/order/backendSync";

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
    discountAmount?: number,
    promotionCode?: string,
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
    discountAmount?: number,
    promotionCode?: string,
  ) => void;
  markAsSentToKitchen: (orderId: string) => void;
  markAsSentToKitchenByTable: (tableId: string) => void;
  moveOrder: (sourceTableId: string, destTableId: string | string[]) => void;
  unirMesas: (sourceTableId: string, destTableId: string | string[]) => void;
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

interface OrderProviderProps {
  children: React.ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({
  children,
}) => {
  const { username } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const backendOrders = await fetchOrdersFromBackend();
        setOrders(backendOrders);
      } catch (error) {
        console.error("Failed to load orders from backend", error);
      }
    };
    loadOrders();
    // Refresh periodicamente cada 10 segundos para mantener sincronización
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

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
      discountAmount,
      promotionCode,
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
        discountAmount,
        promotionCode,
        nowMs,
      });

      setOrders((prev) => [newOrder, ...prev]);
      syncAddOrderToBackend(newOrder).catch(console.error);
    },
    [username],
  );

  const updateOrderStatus = useCallback<OrderCommandsContextProps["updateOrderStatus"]>(
    (orderId, status, sentAt) => {
      setOrders((prev) => {
        const { orders: nextOrders } =
          orderMutations.updateOrderStatus(prev, orderId, status, sentAt);
        return nextOrders;
      });
      syncUpdateOrderStatus(orderId, status).catch(console.error);
    },
    [],
  );

  const removeOrder = useCallback<OrderCommandsContextProps["removeOrder"]>(
    (orderId) => {
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    },
    [],
  );

  const updateOrderItems = useCallback<OrderCommandsContextProps["updateOrderItems"]>(
    (orderId, items, total, subTotal, taxAmount) => {
      let modifiedOrder: Order | undefined;
      setOrders((prev) => {
        const { orders: nextOrders, modified } =
          orderMutations.updateOrderItems(prev, orderId, items, total);
        if (modified) {
          if (typeof subTotal === 'number') modified.subTotal = subTotal;
          if (typeof taxAmount === 'number') modified.taxAmount = taxAmount;
          modifiedOrder = modified;
        }
        return nextOrders;
      });
      
      if (modifiedOrder) {
        syncUpdateOrderItems(modifiedOrder).catch(console.error);
      }
    },
    [],
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
      discountAmount,
      promotionCode,
    ) => {
      let modifiedOrder: Order | undefined;
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
            discountAmount,
            promotionCode,
          },
        );
        modifiedOrder = modified;
        return nextOrders;
      });
      
      if (modifiedOrder) {
        syncFinalizeOrder(modifiedOrder).catch(console.error);
      }
    },
    [],
  );

  const markAsSentToKitchen = useCallback<
    OrderCommandsContextProps["markAsSentToKitchen"]
  >(
    (orderId) => {
      let modifiedOrder: Order | undefined;
      setOrders((prev) => {
        const { orders: nextOrders, modified } =
          orderMutations.markAsSentToKitchen(prev, orderId, Date.now());
        modifiedOrder = modified;
        return nextOrders;
      });
      if (modifiedOrder) {
        syncUpdateOrderItems(modifiedOrder).catch(console.error);
      }
    },
    [],
  );

  const markAsSentToKitchenByTable = useCallback<
    OrderCommandsContextProps["markAsSentToKitchenByTable"]
  >(
    (tableId) => {
      let modifiedOrder: Order | undefined;
      setOrders((prev) => {
        const { orders: nextOrders, modified } =
          orderMutations.markAsSentToKitchenByTable(prev, tableId, Date.now());
        modifiedOrder = modified;
        return nextOrders;
      });
      if (modifiedOrder) {
        syncUpdateOrderItems(modifiedOrder).catch(console.error);
      }
    },
    [],
  );

  const moveOrder = useCallback<OrderCommandsContextProps["moveOrder"]>(
    (sourceTableId, destTableId) => {
      let modifiedOrder: Order | undefined;
      setOrders((prev) => {
        const { orders: nextOrders, modified } = orderMutations.moveOrder(
          prev,
          sourceTableId,
          destTableId,
        );
        modifiedOrder = modified;
        return nextOrders;
      });
      if (modifiedOrder) {
        syncUpdateTables(modifiedOrder.id, modifiedOrder.linkedTables || (modifiedOrder.tableId ? [modifiedOrder.tableId] : [])).catch(console.error);
      }
    },
    [],
  );

  const unirMesas = useCallback<OrderCommandsContextProps["unirMesas"]>(
    (sourceTableId, destTableId) => {
      let modifiedOrder: Order | undefined;
      setOrders((prev) => {
        const { orders: nextOrders, modified } = orderMutations.unirMesas(
          prev,
          sourceTableId,
          destTableId,
        );
        modifiedOrder = modified;
        return nextOrders;
      });
      if (modifiedOrder) {
        syncUpdateTables(modifiedOrder.id, modifiedOrder.linkedTables || (modifiedOrder.tableId ? [modifiedOrder.tableId] : [])).catch(console.error);
      }
    },
    [],
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
