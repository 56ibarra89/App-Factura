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
import { apiClient } from "../config/apiClient";

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
    driverId?: string,
    customerTendered?: number,
  ) => Promise<string | void>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    cancelReason?: string,
    adminPin?: string,
    sentAt?: number,
    kitchenId?: string,
  ) => void;
  removeOrder: (orderId: string) => void;
  clearHistory: () => void;
  updateOrderItems: (
    orderId: string,
    items: CartItemType[],
    total: number,
    subTotal?: number,
    taxAmount?: number,
  ) => Promise<void>;
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
  ) => Promise<string | void>;
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
  const { username, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  const ordersRef = React.useRef<Order[]>(orders);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const loadOrders = async () => {
      try {
        const backendOrders = await fetchOrdersFromBackend();
        let hiddenIds: string[] = [];
        try {
          const prefs = await apiClient('/users/me/preferences/hidden-orders');
          hiddenIds = prefs || [];
        } catch {
          console.warn("Preferencias de órdenes ocultas no disponibles (Endpoint en construcción)");
        }
        const sanitizedBackendOrders = backendOrders.map(bOrder => {
          if (bOrder.tableId && bOrder.linkedTables?.includes(bOrder.tableId)) {
            return {
              ...bOrder,
              linkedTables: bOrder.linkedTables.filter(t => t !== bOrder.tableId)
            };
          }
          return bOrder;
        });
        
        const currentOrders = ordersRef.current;
        const merged = sanitizedBackendOrders.map(bOrder => {
          const existing = currentOrders.find(o => o.id === bOrder.id);
          if (existing) {
            const backendHasLinkedTables = bOrder.linkedTables && bOrder.linkedTables.length > 0;
            const frontendHasLinkedTables = existing.linkedTables && existing.linkedTables.length > 0;
            
            // Si el backend no tiene linkedTables pero el frontend sí, preservamos el del frontend
            // Esto evita que el polling borre las mesas unidas si el backend no lo soportó.
            if (!backendHasLinkedTables && frontendHasLinkedTables) {
              return {
                ...bOrder,
                tableId: existing.tableId,
                linkedTables: existing.linkedTables
              };
            }
          }
          return bOrder;
        });

        // Conservar órdenes locales muy recientes (menos de 15 segundos) que aún no han llegado en el polling
        const backendOrderIds = new Set(backendOrders.map(o => o.id));
        const recentLocalOrders = currentOrders.filter(o => 
          !backendOrderIds.has(o.id) && (Date.now() - new Date(o.timestamp).getTime() < 15000)
        );

        const finalOrders = [...merged, ...recentLocalOrders];
        setOrders(finalOrders.filter(o => !hiddenIds.includes(o.id)));
      } catch (error) {
        console.error("Failed to load orders from backend", error);
      }
    };
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const updateOrdersState = useCallback((updater: (prev: Order[]) => Order[]) => {
    const next = updater(ordersRef.current);
    ordersRef.current = next;
    setOrders(next);
  }, []);

  const addOrder = useCallback<OrderCommandsContextProps["addOrder"]>(
    async (
      items, total, customerName, orderType, customerAddress, tableId, paymentMethod, splitAmounts, subTotal, taxAmount, discountAmount, promotionCode, driverId, customerTendered
    ) => {
      const newOrder = createOrder({
        items, total, username, customerName, orderType, customerAddress, tableId, paymentMethod, splitAmounts, subTotal, taxAmount, discountAmount, promotionCode, driverId, customerTendered
      });

      updateOrdersState((prev) => [newOrder, ...prev]);
      try {
        const createdOrder = await syncAddOrderToBackend(newOrder);
        let finalInvoiceNumber = createdOrder.invoiceNumber;

        if (!finalInvoiceNumber && newOrder.paymentMethod && newOrder.orderType === 'delivery') {
          const finalizedOrder = await syncFinalizeOrder(newOrder);
          finalInvoiceNumber = finalizedOrder.invoiceNumber;
        }

        updateOrdersState(prev => prev.map(o => o.id === newOrder.id ? { ...o, invoiceNumber: finalInvoiceNumber } : o));
        return finalInvoiceNumber;
      } catch (error) {
        console.error(error);
      }
    },
    [username, updateOrdersState],
  );

  const updateOrderStatus = useCallback<OrderCommandsContextProps["updateOrderStatus"]>(
    (orderId, status, cancelReason, adminPin, sentAt, kitchenId) => {
      updateOrdersState((prev) => {
        const { orders: nextOrders } = orderMutations.updateOrderStatus(prev, orderId, status, sentAt, kitchenId);
        return nextOrders;
      });
      syncUpdateOrderStatus(orderId, status, cancelReason, adminPin, sentAt, kitchenId).catch(console.error);
    },
    [updateOrdersState],
  );

  const removeOrder = useCallback<OrderCommandsContextProps["removeOrder"]>(
    (orderId) => {
      updateOrdersState((prev) => prev.filter((order) => order.id !== orderId));
    },
    [updateOrdersState],
  );

  const updateOrderItems = useCallback<OrderCommandsContextProps["updateOrderItems"]>(
    async (orderId, items, total, subTotal, taxAmount) => {
      let modifiedOrder: Order | undefined;
      updateOrdersState((prev) => {
        const { orders: nextOrders, modified } = orderMutations.updateOrderItems(prev, orderId, items, total);
        if (modified) {
          if (typeof subTotal === 'number') modified.subTotal = subTotal;
          if (typeof taxAmount === 'number') modified.taxAmount = taxAmount;
          modifiedOrder = modified;
        }
        return nextOrders;
      });
      if (modifiedOrder) {
        await syncUpdateOrderItems(modifiedOrder).catch(console.error);
      }
    },
    [updateOrdersState],
  );

  const getOrderByTable = useCallback<OrderQueriesContextProps["getOrderByTable"]>(
    (tableId) => orderSelectors.getActiveOrderByTable(orders, tableId),
    [orders],
  );

  const clearHistory = useCallback<OrderCommandsContextProps["clearHistory"]>(
    () => {
      updateOrdersState((prev) => {
        const toHide = prev.filter(o => o.status === 'paid' || o.status === 'cancelled').map(o => o.id);
        if (toHide.length > 0) {
          apiClient('/users/me/preferences/hidden-orders', {
            method: 'PATCH',
            body: JSON.stringify({ addHiddenIds: toHide })
          }).catch(e => console.error("Error guardando preferencias de historial", e));
        }
        return orderMutations.clearHistory(prev).orders;
      });
    },
    [updateOrdersState],
  );

  const finalizeOrder = useCallback<OrderCommandsContextProps["finalizeOrder"]>(
    async (
      orderId, paymentMethod, splitAmounts, customerName, orderType, customerAddress, finalTotal, subTotal, taxAmount, discountAmount, promotionCode
    ) => {
      let modifiedOrder: Order | undefined;
      updateOrdersState((prev) => {
        const { orders: nextOrders, modified } = orderMutations.finalizeOrder(
          prev, orderId, { paymentMethod, splitAmounts, customerName, orderType, customerAddress, finalTotal, subTotal, taxAmount, discountAmount, promotionCode }
        );
        modifiedOrder = modified;
        return nextOrders;
      });
      
      if (modifiedOrder) {
        try {
          await syncUpdateOrderItems(modifiedOrder).catch(console.error);
          const finalizedOrder = await syncFinalizeOrder(modifiedOrder);
          updateOrdersState(current => current.map(o => o.id === modifiedOrder!.id ? { ...o, status: 'paid', invoiceNumber: finalizedOrder.invoiceNumber } : o));
          return finalizedOrder.invoiceNumber;
        } catch (error) {
          console.error(error);
        }
      }
    },
    [updateOrdersState],
  );

  const markAsSentToKitchen = useCallback<OrderCommandsContextProps["markAsSentToKitchen"]>(
    (orderId) => {
      let modifiedOrder: Order | undefined;
      updateOrdersState((prev) => {
        const { orders: nextOrders, modified } = orderMutations.markAsSentToKitchen(prev, orderId, Date.now());
        modifiedOrder = modified;
        return nextOrders;
      });
      if (modifiedOrder) {
        syncUpdateOrderItems(modifiedOrder).catch(console.error);
      }
    },
    [updateOrdersState],
  );

  const markAsSentToKitchenByTable = useCallback<OrderCommandsContextProps["markAsSentToKitchenByTable"]>(
    (tableId) => {
      let modifiedOrder: Order | undefined;
      updateOrdersState((prev) => {
        const { orders: nextOrders, modified } = orderMutations.markAsSentToKitchenByTable(prev, tableId, Date.now());
        modifiedOrder = modified;
        return nextOrders;
      });
      if (modifiedOrder) {
        syncUpdateOrderItems(modifiedOrder).catch(console.error);
      }
    },
    [updateOrdersState],
  );

  const moveOrder = useCallback<OrderCommandsContextProps["moveOrder"]>(
    (sourceTableId, destTableId) => {
      let modifiedOrder: Order | undefined;
      updateOrdersState((prev) => {
        const { orders: nextOrders, modified } = orderMutations.moveOrder(prev, sourceTableId, destTableId);
        modifiedOrder = modified;
        return nextOrders;
      });
      if (modifiedOrder) {
        const tablesToSync = Array.from(new Set([
          ...(modifiedOrder.tableId ? [modifiedOrder.tableId] : []),
          ...(modifiedOrder.linkedTables || [])
        ]));
        syncUpdateTables(modifiedOrder.id, tablesToSync).catch(console.error);
      }
    },
    [updateOrdersState],
  );

  const unirMesas = useCallback<OrderCommandsContextProps["unirMesas"]>(
    (sourceTableId, destTableId) => {
      let modifiedOrder: Order | undefined;
      let isNew = false;
      updateOrdersState((prev) => {
        let { orders: nextOrders, modified } = orderMutations.unirMesas(prev, sourceTableId, destTableId);
        
        // Si no existe una orden activa para esta mesa pero queremos unirla,
        // creamos una orden en blanco para poder registrar la unión.
        if (!modified) {
          modified = createOrder({
            items: [],
            total: 0,
            tableId: sourceTableId,
            username: username || "admin",
            orderType: "local"
          });
          const newTables = Array.isArray(destTableId) ? destTableId : [destTableId];
          modified.linkedTables = newTables;
          nextOrders = [modified, ...nextOrders];
          isNew = true;
        }
        
        modifiedOrder = modified;
        return nextOrders;
      });
      
      if (modifiedOrder) {
        if (isNew) {
          syncAddOrderToBackend(modifiedOrder).catch(console.error);
        } else {
          const tablesToSync = Array.from(new Set([
            ...(modifiedOrder.tableId ? [modifiedOrder.tableId] : []),
            ...(modifiedOrder.linkedTables || [])
          ]));
          syncUpdateTables(modifiedOrder.id, tablesToSync).catch(console.error);
        }
      }
    },
    [updateOrdersState, username],
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
