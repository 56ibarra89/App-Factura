import { useState, useMemo } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import { useOrderManagement } from "../hooks/useOrderManagement";
import { useKitchens } from "../../kitchens";
import { useKdsAudioAlert } from "../hooks/useKdsAudioAlert";
import {
  getSelectedKitchenId,
  setSelectedKitchenId as saveSelectedKitchenId,
} from "../api/selectedKitchenPreference";

// Componentes UI de KDS
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
  const { kitchens } = useKitchens();

  const [selectedKitchenId, setSelectedKitchen] = useState<string>(() =>
    getSelectedKitchenId()
  );
  const [viewMode, setViewMode] = useState<"kanban" | "grid">("kanban");

  const { isMuted, toggleMute, newOrderAlert, clearNewOrderAlert } =
    useKdsAudioAlert(activeOrders);

  const handleKitchenChange = (kitchenId: string) => {
    setSelectedKitchen(kitchenId);
    saveSelectedKitchenId(kitchenId);
  };

  // Conteo de órdenes críticas (> 15 min)
  const criticalCount = useMemo(() => {
    return activeOrders.filter((order) => {
      const urgency = getTicketUrgency(order.timestamp);
      return urgency.level === "critical";
    }).length;
  }, [activeOrders]);

  const filteredOrders = useMemo(() => {
    if (!selectedKitchenId) return activeOrders;
    return activeOrders.filter((order) =>
      order.items.some((item) => item.kitchenId === selectedKitchenId)
    );
  }, [activeOrders, selectedKitchenId]);

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
      {/* Encabezado KDS */}
      <KdsHeader
        kitchens={kitchens}
        selectedKitchenId={selectedKitchenId}
        onKitchenChange={handleKitchenChange}
        activeCount={filteredOrders.length}
        criticalCount={criticalCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />

      {/* Contenido Principal KDS */}
      {filteredOrders.length === 0 ? (
        <OrderEmptyState />
      ) : viewMode === "kanban" ? (
        <KdsKanbanBoard
          orders={activeOrders}
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
              ? order.items.filter((i) => i.kitchenId === selectedKitchenId)
              : undefined;

            return (
              <KdsCard
                key={order.id}
                order={order}
                filteredItems={itemsForKitchen}
                kitchens={kitchens}
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

      {/* Alerta Visual de Nueva Orden Entrante */}
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
