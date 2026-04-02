/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { Order, OrderStatus, PaymentMethod } from "../types/order.types";
import { CartItemType } from "../types/cart";
import { saveOrderDB } from "../services/db";

interface OrderContextProps {
  orders: Order[];
  addOrder: (items: CartItemType[], total: number, customerName?: string, tableId?: string, paymentMethod?: string, splitAmounts?: { efectivo: number; tarjeta: number }) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  removeOrder: (orderId: string) => void;
  clearOrders: () => void;
  clearHistory: () => void;
}

const OrderContext = createContext<OrderContextProps | undefined>(undefined);

const LOCAL_STORAGE_KEY = "app_factura_orders";

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
          const isActive = o.status !== 'delivered' && o.status !== 'cancelled';
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

  const addOrder = (items: CartItemType[], total: number, customerName?: string, tableId?: string, paymentMethod?: string, splitAmounts?: { efectivo: number; tarjeta: number }) => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items: [...items],
      total,
      status: 'pending',
      timestamp: new Date(),
      customerName,
      tableId,
      paymentMethod: paymentMethod as PaymentMethod,
      splitAmounts,
    };
    setOrders(prev => [newOrder, ...prev]);
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

  const clearOrders = () => {
    setOrders([]);
  };

  const clearHistory = () => {
    // Keeps only orders that are NOT delivered or cancelled
    setOrders(prev => prev.filter(order => order.status !== 'delivered' && order.status !== 'cancelled'));
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, removeOrder, clearOrders, clearHistory }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrderContext debe usarse dentro de <OrderProvider>");
  return context;
};
