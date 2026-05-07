import { useState, useEffect, useMemo } from "react";
import { Order } from "../types/order.types";
import { getOrdersByDateRange } from "../services/db";

export const useOrderHistory = () => {
  const today = new Date();
  const lastMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    today.getDate()
  );

  const [startDate, setStartDate] = useState<string>(
    lastMonth.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    today.toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    const startObj = new Date(startDate + "T00:00:00");
    const endObj = new Date(endDate + "T23:59:59");
    
    if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
      setLoading(false);
      return;
    }

    try {
      const fetched = await getOrdersByDateRange(startObj, endObj);
      const completedOrders = fetched.filter(
        (o) => o.status === "paid" || o.status === "cancelled"
      );
      setOrders(completedOrders);
    } catch (e) {
      console.error("useOrderHistory: error al cargar", e);
      setError("No se pudo cargar el historial de órdenes.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchClick = () => {
    fetchOrders();
  };

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const lowerQuery = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(lowerQuery) ||
        (o.customerName && o.customerName.toLowerCase().includes(lowerQuery))
    );
  }, [orders, searchQuery]);

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    filteredOrders,
    handleSearchClick
  };
};
