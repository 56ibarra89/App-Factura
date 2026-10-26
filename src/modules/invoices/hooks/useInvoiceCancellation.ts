import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useOrderCommands } from "../../orders";
import type { InvoiceGateway } from "../api/invoiceGateway";
import { invoiceGateway } from "../api/invoiceGateway";
import type { Invoice } from "../model/invoice.types";
import { voidWastePolicyGateway } from "../../settings/api/voidWastePolicyGateway";
import {
  DEFAULT_VOID_WASTE_POLICY_CONFIG,
  type VoidWastePolicyConfig,
} from "../../settings/model/voidWastePolicy.types";

const toLocalDateInput = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
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
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQueryState] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderToCancel, setOrderToCancel] = useState<Invoice | null>(null);
  const [policyConfig, setPolicyConfig] = useState<VoidWastePolicyConfig>(
    DEFAULT_VOID_WASTE_POLICY_CONFIG,
  );
  const [cancelReasonId, setCancelReasonId] = useState("");
  const [cancelNote, setCancelNote] = useState("");
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [cancellationError, setCancellationError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);

    try {
      const result = await historyGateway.listHistory({
        startDate: start,
        endDate: end,
        page: page + 1,
        pageSize: rowsPerPage,
        search: searchQuery.trim(),
        view: "all",
      });
      setOrders(result.items);
      setTotalRows(result.total);
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
    } finally {
      setLoading(false);
    }
  }, [endDate, historyGateway, page, rowsPerPage, searchQuery, startDate]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void refresh(), 250);
    return () => window.clearTimeout(timeout);
  }, [refresh]);

  useEffect(() => {
    void voidWastePolicyGateway.load().then((loaded) => {
      setPolicyConfig(loaded);
      const firstActive = loaded.reasons.find((reason) => reason.isActive);
      setCancelReasonId((current) => current || firstActive?.id || "");
    });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    setPage(0);
  }, []);

  const requestCancellation = useCallback(
    (order: Invoice) => {
      setOrderToCancel(order);
      setCancelReasonId(
        policyConfig.reasons.find((reason) => reason.isActive)?.id ?? "",
      );
      setCancelNote("");
      setReasonDialogOpen(true);
    },
    [policyConfig.reasons],
  );

  const closeReasonDialog = useCallback(() => {
    setReasonDialogOpen(false);
  }, []);

  const closePinDialog = useCallback(() => {
    setPinDialogOpen(false);
    setOrderToCancel(null);
  }, []);

  const confirmCancellation = useCallback(
    async (pin?: string) => {
      if (!orderToCancel) return;
      setCancellationError("");
      try {
        await updateOrderStatus(
          orderToCancel.id,
          "cancelled",
          cancelNote,
          pin,
          undefined,
          undefined,
          undefined,
          cancelReasonId,
        );
        await refresh();
        setPinDialogOpen(false);
        setOrderToCancel(null);
        setCancelReasonId("");
        setCancelNote("");
      } catch (error: unknown) {
        setCancellationError(
          error instanceof Error
            ? error.message
            : "El servidor rechazó la anulación.",
        );
        throw error;
      }
    },
    [cancelNote, cancelReasonId, orderToCancel, refresh, updateOrderStatus],
  );

  const submitReason = useCallback(() => {
    if (!cancelReasonId) return;
    setReasonDialogOpen(false);
    const selectedReason = policyConfig.reasons.find(
      (reason) => reason.id === cancelReasonId,
    );
    const wasPrepared = Boolean(
      orderToCancel?.items.some(
        (item) =>
          item.isSentToKitchen &&
          ["preparing", "ready", "delivered"].includes(
            item.kitchenStatus ?? "",
          ),
      ),
    );
    const requiresPin = Boolean(
      selectedReason?.requiresSupervisor ||
      (policyConfig.requireSupervisorForPaidOrders &&
        orderToCancel?.status === "paid") ||
      (policyConfig.requireSupervisorWhenPreparationStarted && wasPrepared),
    );
    if (requiresPin) {
      setPinDialogOpen(true);
    } else {
      confirmCancellation();
    }
  }, [cancelReasonId, confirmCancellation, orderToCancel, policyConfig]);

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
    loading,
    refresh,
    filteredCount: totalRows,
    paginatedOrders: orders,
    page,
    rowsPerPage,
    changePage,
    changeRowsPerPage,
    requestCancellation,
    dialogs: {
      reasonOpen: reasonDialogOpen,
      pinOpen: pinDialogOpen,
      error: cancellationError,
      reasons: policyConfig.reasons.filter((reason) => reason.isActive),
      reasonId: cancelReasonId,
      setReasonId: setCancelReasonId,
      note: cancelNote,
      setNote: setCancelNote,
      closeReason: closeReasonDialog,
      submitReason,
      closePin: closePinDialog,
      confirm: confirmCancellation,
    },
  };
}
