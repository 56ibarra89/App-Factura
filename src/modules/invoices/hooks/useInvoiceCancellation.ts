import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ChangeEvent } from "react";
import { useOrderCommands } from "../../orders";
import type { InvoiceGateway } from "../api/invoiceGateway";
import { invoiceGateway } from "../api/invoiceGateway";
import type { Invoice } from "../model/invoice.types";

const toLocalDateInput = (date: Date) =>
  new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  )
    .toISOString()
    .split("T")[0];

export function useInvoiceCancellation(
  historyGateway: InvoiceGateway = invoiceGateway,
) {
  const { updateOrderStatus } = useOrderCommands();
  const today = useMemo(() => toLocalDateInput(new Date()), []);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [orders, setOrders] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQueryState] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderToCancel, setOrderToCancel] =
    useState<Invoice | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [reasonDialogOpen, setReasonDialogOpen] =
    useState(false);
  const [pinDialogOpen, setPinDialogOpen] =
    useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);

    try {
      const fetched =
        await historyGateway.listByDateRange(start, end);
      setOrders(fetched);
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
    } finally {
      setLoading(false);
    }
  }, [endDate, historyGateway, startDate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredOrders = useMemo(() => {
    const sorted = [...orders].sort(
      (first, second) =>
        new Date(second.timestamp).getTime() -
        new Date(first.timestamp).getTime(),
    );
    if (!searchQuery) return sorted;

    const query = searchQuery.toLowerCase();
    return sorted.filter(
      (order) =>
        order.id.toLowerCase().includes(query) ||
        order.customerName
          ?.toLowerCase()
          .includes(query) ||
        (order.tableId &&
          `mesa ${order.tableId}`
            .toLowerCase()
            .includes(query)),
    );
  }, [orders, searchQuery]);

  const paginatedOrders = useMemo(
    () =>
      filteredOrders.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [filteredOrders, page, rowsPerPage],
  );

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    setPage(0);
  }, []);

  const requestCancellation = useCallback(
    (order: Invoice) => {
      setOrderToCancel(order);
      setCancelReason("");
      setReasonDialogOpen(true);
    },
    [],
  );

  const closeReasonDialog = useCallback(() => {
    setReasonDialogOpen(false);
  }, []);

  const submitReason = useCallback(() => {
    if (!cancelReason.trim()) return;
    setReasonDialogOpen(false);
    setPinDialogOpen(true);
  }, [cancelReason]);

  const closePinDialog = useCallback(() => {
    setPinDialogOpen(false);
    setOrderToCancel(null);
  }, []);

  const confirmCancellation = useCallback(
    (pin?: string) => {
      if (orderToCancel) {
        updateOrderStatus(
          orderToCancel.id,
          "cancelled",
          cancelReason,
          pin,
        );
        setOrders((current) =>
          current.map((order) =>
            order.id === orderToCancel.id
              ? { ...order, status: "cancelled" }
              : order,
          ),
        );
      }

      setPinDialogOpen(false);
      setOrderToCancel(null);
      setCancelReason("");
    },
    [cancelReason, orderToCancel, updateOrderStatus],
  );

  const changePage = useCallback(
    (_event: unknown, newPage: number) => {
      setPage(newPage);
    },
    [],
  );

  const changeRowsPerPage = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(
        Number.parseInt(event.target.value, 10),
      );
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
    loading,
    refresh,
    filteredCount: filteredOrders.length,
    paginatedOrders,
    page,
    rowsPerPage,
    changePage,
    changeRowsPerPage,
    requestCancellation,
    dialogs: {
      reasonOpen: reasonDialogOpen,
      pinOpen: pinDialogOpen,
      reason: cancelReason,
      setReason: setCancelReason,
      closeReason: closeReasonDialog,
      submitReason,
      closePin: closePinDialog,
      confirm: confirmCancellation,
    },
  };
}
