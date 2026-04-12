/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { Order, OrderStatus, PaymentMethod, OrderType } from "../types/order.types";
import { CartItemType } from "../types/cart";
import { saveOrderDB } from "../services/db";
import { useAuth } from "./AuthContext";

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
    splitAmounts?: { efectivo: number; tarjeta: number }
  ) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  removeOrder: (orderId: string) => void;
  clearHistory: () => void;
  updateOrderItems: (orderId: string, items: CartItemType[], total: number) => void;
  getOrderByTable: (tableId: string) => Order | undefined;
  finalizeOrder: (
    orderId: string,
    paymentMethod: PaymentMethod,
    splitAmounts?: { efectivo: number; tarjeta: number },
    customerName?: string,
    orderType?: OrderType,
    customerAddress?: string
  ) => void;
  markAsSentToKitchen: (orderId: string) => void;
  markAsSentToKitchenByTable: (tableId: string) => void;
  moveOrder: (sourceTableId: string, destTableId: string) => void;
  unirMesas: (sourceTableId: string, destTableId: string) => void;
}

const OrderContext = createContext<OrderContextProps | undefined>(undefined);

const LOCAL_STORAGE_KEY = "app_factura_orders";

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { username } = useAuth();
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      const now = new Date();
      // Filter out orders that are:
      // (delivered OR cancelled) AND NOT from today
      return parsed
        .map((o: Order) => ({ ...o, timestamp: new Date(o.timestamp) }))
        .filter((o: Order) => {
          const isToday = o.timestamp.toDateString() === now.toDateString();
          const isActive = o.status !== "paid" && o.status !== "cancelled";
          return isToday || isActive;
        });
    } catch (e) {
      console.error("Error loading orders from localStorage", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = (
    items: CartItemType[],
    total: number,
    customerName?: string,
    orderType?: OrderType,
    customerAddress?: string,
    tableId?: string,
    paymentMethod?: string,
    splitAmounts?: { efectivo: number; tarjeta: number }
  ) => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items: [...items],
      total,
      status: "pending",
      timestamp: new Date(),
      customerName,
      orderType,
      customerAddress,
      tableId,
      paymentMethod: paymentMethod as PaymentMethod,
      splitAmounts,
      cashierName: username || "Sistema",
      isSentToKitchen: !tableId, // Si no hay mesa (venta directa), va directo a cocina
    };
    setOrders((prev) => [newOrder, ...prev]);
    saveOrderDB(newOrder); // Persistir en IndexedDB
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => {
      const updatedOrders = prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      );
      
      const modifiedOrder = updatedOrders.find(o => o.id === orderId);
      if (modifiedOrder) {
        saveOrderDB(modifiedOrder); // Actualizar en IndexedDB
      }

      return updatedOrders;
    });
  };

  const removeOrder = (orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const updateOrderItems = (orderId: string, items: CartItemType[], total: number) => {
    setOrders(prev => {
      const updatedOrders = prev.map(order => 
        order.id === orderId ? { ...order, items: [...items], total } : order
      );
      
      const modifiedOrder = updatedOrders.find(o => o.id === orderId);
      if (modifiedOrder) {
        saveOrderDB(modifiedOrder); // Actualizar en IndexedDB
      }

      return updatedOrders;
    });
  };

  const getOrderByTable = (tableId: string) => {
    // La mesa sigue ocupada aunque esté 'delivered', hasta que esté 'paid'
    return orders.find(
      (o) =>
        (o.tableId === tableId || (o.linkedTables && o.linkedTables.includes(tableId))) &&
        o.status !== "paid" &&
        o.status !== "cancelled"
    );
  };

  const clearHistory = () => {
    // Mantiene solo órdenes que NO están pagadas ni canceladas
    setOrders((prev) =>
      prev.filter((order) => order.status !== "paid" && order.status !== "cancelled")
    );
  };

  const finalizeOrder = (
    orderId: string,
    paymentMethod: PaymentMethod,
    splitAmounts?: { efectivo: number; tarjeta: number },
    customerName?: string,
    orderType?: OrderType,
    customerAddress?: string
  ) => {
    setOrders((prev) => {
      const updatedOrders = prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "paid" as OrderStatus,
              paymentMethod,
              splitAmounts,
              customerName: customerName || order.customerName,
              orderType: orderType || order.orderType,
              customerAddress: customerAddress || order.customerAddress,
            }
          : order
      );

      const modifiedOrder = updatedOrders.find((o) => o.id === orderId);
      if (modifiedOrder) {
        saveOrderDB(modifiedOrder); // Actualizar en IndexedDB
      }

      return updatedOrders;
    });
  };

  const markAsSentToKitchen = (orderId: string) => {
    setOrders((prev) => {
      const updatedOrders = prev.map((order) =>
        order.id === orderId ? { ...order, isSentToKitchen: true } : order
      );

      const modifiedOrder = updatedOrders.find((o) => o.id === orderId);
      if (modifiedOrder) {
        saveOrderDB(modifiedOrder);
      }

      return updatedOrders;
    });
  };

  const markAsSentToKitchenByTable = (tableId: string) => {
    setOrders((prev) => {
      const updatedOrders = prev.map((order) =>
        (order.tableId === tableId && order.status !== 'paid' && order.status !== 'cancelled') 
          ? { ...order, isSentToKitchen: true } 
          : order
      );

      const modifiedOrder = updatedOrders.find(
        (o) => o.tableId === tableId && o.status !== 'paid' && o.status !== 'cancelled'
      );
      if (modifiedOrder) {
        saveOrderDB(modifiedOrder);
      }

      return updatedOrders;
    });
  };

  const moveOrder = (sourceTableId: string, destTableId: string) => {
    setOrders((prev) => {
      const updatedOrders = prev.map((order) =>
        order.tableId === sourceTableId && order.status !== "paid" && order.status !== "cancelled"
          ? { ...order, tableId: destTableId }
          : order
      );
      const modifiedOrder = updatedOrders.find((o) => o.tableId === destTableId && o.status !== "paid" && o.status !== "cancelled");
      if (modifiedOrder) saveOrderDB(modifiedOrder);
      return updatedOrders;
    });
  };

  const unirMesas = (sourceTableId: string, destTableId: string) => {
    setOrders((prev) => {
      const updatedOrders = prev.map((order) => {
        // If it's the order with sourceTableId, we add destTableId to linkedTables
        if (order.tableId === sourceTableId && order.status !== "paid" && order.status !== "cancelled") {
          const linkedTables = order.linkedTables || [];
          if (!linkedTables.includes(destTableId)) {
            return {
              ...order,
              linkedTables: [...linkedTables, destTableId]
            };
          }
        }
        return order;
      });
      const modifiedOrder = updatedOrders.find((o) => o.tableId === sourceTableId && o.status !== "paid" && o.status !== "cancelled");
      if (modifiedOrder) saveOrderDB(modifiedOrder);
      return updatedOrders;
    });
  };

  return (
    <OrderContext.Provider value={{ 
      orders, 
      addOrder, 
      updateOrderStatus, 
      removeOrder, 
      clearHistory,
      updateOrderItems,
      getOrderByTable,
      finalizeOrder,
      markAsSentToKitchen,
      markAsSentToKitchenByTable,
      moveOrder,
      unirMesas,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrderContext debe usarse dentro de <OrderProvider>");
  return context;
};
