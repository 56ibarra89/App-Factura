import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import {
  getBusinessDateString,
  getPreviousBusinessMonthDateString,
  parseBusinessDayEnd,
  parseBusinessDayStart,
} from "../../../shared/format";
import type { InvoiceGateway } from "../api/invoiceGateway";
import { invoiceGateway } from "../api/invoiceGateway";
import type { Invoice } from "../model/invoice.types";

export interface PaymentFilterOption {
  id: string;
  name: string;
}

interface AppliedFilters {
  startDate: string;
  endDate: string;
  search: string;
  paymentMethodId: string;
}

export const useInvoiceHistory = (
  historyGateway: InvoiceGateway = invoiceGateway,
) => {
  const initialFilters = useMemo<AppliedFilters>(() => {
    const today = new Date();
    return {
      startDate: getPreviousBusinessMonthDateString(today),
      endDate: getBusinessDateString(today),
      search: "",
      paymentMethodId: "ALL",
    };
  }, []);

  const [startDate, setStartDate] = useState(initialFilters.startDate);
  const [endDate, setEndDate] = useState(initialFilters.endDate);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethodState] =
    useState("ALL");
  const [appliedFilters, setAppliedFilters] =
    useState<AppliedFilters>(initialFilters);
  const [orders, setOrders] = useState<Invoice[]>([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<
    PaymentFilterOption[]
  >([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const start = parseBusinessDayStart(appliedFilters.startDate);
    const end = parseBusinessDayEnd(appliedFilters.endDate);
    if (!start || !end) return;

    setLoading(true);
    setError(null);
    try {
      const result = await historyGateway.listHistory({
        startDate: start,
        endDate: end,
        page: page + 1,
        pageSize: rowsPerPage,
        search: appliedFilters.search,
        paymentMethodId: appliedFilters.paymentMethodId,
        view: "invoices",
      });
      setOrders(result.items);
      setTotalRows(result.total);
      setPaymentMethodOptions(result.paymentMethodOptions);
    } catch (cause) {
      console.error("useInvoiceHistory: error al cargar", cause);
      setError("No se pudo cargar el historial de órdenes.");
      setOrders([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, historyGateway, page, rowsPerPage]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const handleSearchClick = useCallback(() => {
    setPage(0);
    setAppliedFilters({
      startDate,
      endDate,
      search: searchQuery.trim(),
      paymentMethodId: selectedPaymentMethod,
    });
  }, [endDate, searchQuery, selectedPaymentMethod, startDate]);

  const setSelectedPaymentMethod = useCallback((value: string) => {
    setSelectedPaymentMethodState(value);
    setPage(0);
    setAppliedFilters((current) => ({
      ...current,
      paymentMethodId: value,
    }));
  }, []);

  const changePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const changeRowsPerPage = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(Number.parseInt(event.target.value, 10));
      setPage(0);
    },
    [],
  );

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
    loading,
    error,
    orders,
    totalRows,
    page,
    rowsPerPage,
    changePage,
    changeRowsPerPage,
    handleSearchClick,
  };
};
