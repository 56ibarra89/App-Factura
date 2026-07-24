import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Order } from "../types/order.types";
import { getOrdersByDateRange } from "../services/db";

export const useOrderHistory = () => {
  const today = new Date();
  const getLocalDate = (d: Date) => new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split("T")[0];

  const lastMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    today.getDate()
  );

  const [startDate, setStartDate] = useState<string>(
    getLocalDate(lastMonth)
  );
  const [endDate, setEndDate] = useState<string>(
    getLocalDate(today)
  );
  const [searchQuery, setSearchQuery] = useState("");
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
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
        (o) => o.status === "paid" || o.status === "cancelled" || (o.status === "delivered" && !o.tableId)
      );
      setOrders(completedOrders);
    } catch (e) {
      console.error("useOrderHistory: error al cargar", e);
      setError("No se pudo cargar el historial de órdenes.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate]);

  const initialFetchRef = useRef(fetchOrders);

  useEffect(() => {
    void initialFetchRef.current();
  }, []);

  const handleSearchClick = () => {
    void fetchOrders();
  };

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const lowerQuery = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(lowerQuery) ||
        (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(lowerQuery)) ||
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
