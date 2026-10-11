import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { InvoiceGateway } from "../api/invoiceGateway";
import { invoiceGateway } from "../api/invoiceGateway";
import type { Invoice } from "../model/invoice.types";
import {
  getOrderPaymentDetails,
  getPaymentDisplayName,
  getPaymentFilterId,
} from "../../orders";

export interface PaymentFilterOption {
  id: string;
  name: string;
}

export interface InvoiceSummaryTotals {
  total: number;
  cash: number;
  card: number;
  app: number;
  count: number;
}

export const useInvoiceHistory = (
  historyGateway: InvoiceGateway = invoiceGateway,
) => {
  const today = new Date();
  const getLocalDate = (d: Date) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];

  const lastMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    today.getDate(),
  );

  const [startDate, setStartDate] = useState<string>(getLocalDate(lastMonth));
  const [endDate, setEndDate] = useState<string>(getLocalDate(today));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("ALL");

  const [orders, setOrders] = useState<Invoice[]>([]);
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
      const fetched = await historyGateway.listByDateRange(startObj, endObj);
      const completedOrders = fetched.filter(
        (o) =>
          o.status === "paid" ||
          o.status === "cancelled" ||
          (o.status === "delivered" && !o.tableId),
      );
      setOrders(completedOrders);
    } catch (e) {
      console.error("useInvoiceHistory: error al cargar", e);
      setError("No se pudo cargar el historial de órdenes.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [endDate, historyGateway, startDate]);

  const initialFetchRef = useRef(fetchOrders);

  useEffect(() => {
    void initialFetchRef.current();
  }, []);

  const handleSearchClick = () => {
    void fetchOrders();
  };

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (selectedPaymentMethod && selectedPaymentMethod !== "ALL") {
      result = result.filter((o) => {
        const payments = getOrderPaymentDetails(o);
        if (selectedPaymentMethod === "MIXTO") return payments.length > 1;
        return payments.some(
          (payment) => getPaymentFilterId(payment) === selectedPaymentMethod,
        );
      });
    }

    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(lowerQuery) ||
          (o.invoiceNumber &&
            o.invoiceNumber.toLowerCase().includes(lowerQuery)) ||
          (o.customerName &&
            o.customerName.toLowerCase().includes(lowerQuery)) ||
          (o.cashierName && o.cashierName.toLowerCase().includes(lowerQuery)),
      );
    }

    return result;
  }, [orders, searchQuery, selectedPaymentMethod]);

  const paymentMethodOptions = useMemo<PaymentFilterOption[]>(() => {
    const options = new Map<string, string>();
    orders.forEach((order) => {
      getOrderPaymentDetails(order).forEach((payment) => {
        options.set(
          getPaymentFilterId(payment),
          getPaymentDisplayName(payment),
        );
      });
    });
    return [...options.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [orders]);

  const summaryTotals = useMemo<InvoiceSummaryTotals>(() => {
    const validOrders = filteredOrders.filter(
      (o) => o.status === "paid" || o.status === "delivered",
    );
    let cash = 0;
    let card = 0;
    let app = 0;
    let total = 0;

    validOrders.forEach((order) => {
      total += order.total;
      getOrderPaymentDetails(order).forEach((payment) => {
        const type = payment.methodType;
        if (type === "CASH" || (!type && payment.method === "EFECTIVO")) {
          cash += payment.amount;
        } else if (
          type === "CARD_POS" ||
          (!type && payment.method === "TARJETA")
        ) {
          card += payment.amount;
        } else {
          app += payment.amount;
        }
      });
    });

    return {
      total,
      cash,
      card,
      app,
      count: validOrders.length,
    };
  }, [filteredOrders]);

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchQuery,
    setSearchQuery,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    paymentMethodOptions,
    summaryTotals,
    loading,
    error,
    filteredOrders,
    handleSearchClick,
  };
};
