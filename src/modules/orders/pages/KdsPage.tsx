import { useEffect, useState, useMemo } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import { useOrderManagement } from "../hooks/useOrderManagement";
import { useAccessibleKitchens } from "../../kitchens";
import { useAuth } from "../../auth";
import { useKdsAudioAlert } from "../hooks/useKdsAudioAlert";
import {
  getSelectedKitchenId,
  setSelectedKitchenId as saveSelectedKitchenId,
} from "../api/selectedKitchenPreference";

import { KdsHeader } from "../ui/kds/KdsHeader";
import { KdsKanbanBoard } from "../ui/kds/KdsKanbanBoard";
import { KdsCard } from "../ui/kds/KdsCard";
import OrderEmptyState from "../ui/OrderEmptyState";
import { getTicketUrgency } from "../utils/timeUrgency";
import type { OrderStatus } from "../model/order.types";

interface KdsPageProps {
  resolveTableName?: (tableId: string) => string;
}

const KdsPage = ({ resolveTableName }: KdsPageProps) => {
  const { activeOrders, updateOrderStatus } = useOrderManagement();
  const { role } = useAuth();
  const {
    kitchens,
    isLoading: isKitchenAccessLoading,
    assignedKitchenId,
    hasTodayAssignment,
    assignmentError,
  } = useAccessibleKitchens();

  const [savedKitchenId, setSelectedKitchen] = useState<string>(() =>
    getSelectedKitchenId()
  );
  const [viewMode, setViewMode] = useState<"kanban" | "grid">("kanban");
  const isCook = role === "cocinero";
  const activeKitchens = useMemo(
    () => kitchens.filter((kitchen) => kitchen.isActive),
    [kitchens],
  );
  const isSavedKitchenValid =
    savedKitchenId === "" ||
    activeKitchens.some((kitchen) => kitchen.id === savedKitchenId);
  const selectedKitchenId = isCook
    ? activeKitchens.find((kitchen) => kitchen.id === assignedKitchenId)?.id ?? ""
    : isSavedKitchenValid
      ? savedKitchenId
      : "";

  useEffect(() => {
    if (!isCook && !isSavedKitchenValid && !isKitchenAccessLoading) {
      setSelectedKitchen("");
      saveSelectedKitchenId("");
    }
  }, [isCook, isKitchenAccessLoading, isSavedKitchenValid]);

  const handleKitchenChange = (kitchenId: string) => {
    if (isCook) return;
    setSelectedKitchen(kitchenId);
    saveSelectedKitchenId(kitchenId);
  };

  const filteredOrders = useMemo(() => {
    if (isCook && !selectedKitchenId) return [];
    if (!selectedKitchenId) return activeOrders;
    return activeOrders.filter((order) =>
      order.items.some(
        (item) =>
          item.kitchenId === selectedKitchenId ||
          (item.isCombo &&
            item.comboSelections?.some(
              (sel) => sel.kitchenId === selectedKitchenId,
            )),
      ),
    );
  }, [activeOrders, isCook, selectedKitchenId]);

  const { isMuted, toggleMute, newOrderAlert, clearNewOrderAlert } =
    useKdsAudioAlert(filteredOrders);

  const criticalCount = useMemo(() => {
    return filteredOrders.filter((order) => {
      const urgency = getTicketUrgency(order.timestamp);
      return urgency.level === "critical";
    }).length;
  }, [filteredOrders]);

  const accessMessage = assignmentError
    ? assignmentError
    : isKitchenAccessLoading
      ? "Consultando tu cocina asignada..."
      : !hasTodayAssignment
        ? "No tienes una cocina asignada para hoy. Solicita al administrador que revise tu horario."
        : isCook && !selectedKitchenId
          ? "La cocina asignada para hoy no está activa. Solicita al administrador que revise la configuración."
          : null;

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        p: { xs: 2, md: 4 },
        boxSizing: "border-box",
      }}
    >
      {}
      <KdsHeader
        kitchens={kitchens}
        selectedKitchenId={selectedKitchenId}
        onKitchenChange={handleKitchenChange}
        showAllKitchensTab={!isCook}
        activeCount={filteredOrders.length}
        criticalCount={criticalCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />

      {}
      {accessMessage ? (
        <Alert severity={assignmentError ? "error" : "info"}>
          {accessMessage}
        </Alert>
      ) : filteredOrders.length === 0 ? (
        <OrderEmptyState />
      ) : viewMode === "kanban" ? (
        <KdsKanbanBoard
          orders={filteredOrders}
          selectedKitchenId={selectedKitchenId}
          kitchens={kitchens}
          resolveTableName={resolveTableName}
          onUpdateStatus={updateOrderStatus}
        />
      ) : (
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(320px, 1fr))"
          gap={3}
        >
          {filteredOrders.map((order) => {
            const itemsForKitchen = selectedKitchenId
              ? order.items.filter(
                  (i) =>
                    i.kitchenId === selectedKitchenId ||
                    (i.isCombo &&
                      i.comboSelections?.some(
                        (sel) => sel.kitchenId === selectedKitchenId,
                      )),
                )
              : undefined;

            return (
              <KdsCard
                key={order.id}
                order={order}
                filteredItems={itemsForKitchen}
                kitchens={kitchens}
                selectedKitchenId={selectedKitchenId}
                resolveTableName={resolveTableName}
                onUpdateStatus={
                  updateOrderStatus as (
                    id: string,
                    status: OrderStatus,
                    cancelReason?: string,
                    adminPin?: string,
                    sentAt?: number,
                    kitchenId?: string,
                    itemId?: number | string
                  ) => void
                }
              />
            );
          })}
        </Box>
      )}

      {}
      <Snackbar
        open={Boolean(newOrderAlert)}
        autoHideDuration={6000}
        onClose={clearNewOrderAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={clearNewOrderAlert}
          severity="warning"
          variant="filled"
          sx={{
            width: "100%",
            fontSize: "1.1rem",
            fontWeight: "bold",
            boxShadow: "0 8px 32px rgba(255, 152, 0, 0.5)",
            bgcolor: "#ed6c02",
          }}
        >
          🔔 ¡NUEVA ORDEN RECIBIDA!{" "}
          {newOrderAlert?.invoiceNumber
            ? `#${newOrderAlert.invoiceNumber}`
            : ""}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KdsPage;

