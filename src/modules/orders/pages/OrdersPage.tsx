import { useState, useEffect, useMemo } from "react";
import {
  Alert,
  Box,
  Typography,
  Stack,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import { BackButton, ConfirmDialog, PageHeader } from "../../../shared/ui";
import TimerIcon from "@mui/icons-material/Timer";
import DeleteIcon from "@mui/icons-material/Delete";

import OrderGrid from "../ui/OrderGrid";
import OrderEmptyState from "../ui/OrderEmptyState";
import { RoleGuard, useAuth } from "../../auth";

import { useOrderManagement } from "../hooks/useOrderManagement";
import { useAccessibleKitchens } from "../../kitchens";
import { logService } from "../../audit";
import { LOGIN_COLORS } from "../../../shared/theme";
import {
  getSelectedKitchenId,
  setSelectedKitchenId as saveSelectedKitchenId,
} from "../api/selectedKitchenPreference";
import { InvoiceCancellationDialogs } from "../../invoices/ui/InvoiceCancellationDialogs";
import { voidWastePolicyGateway } from "../../settings/api/voidWastePolicyGateway";
import {
  DEFAULT_VOID_WASTE_POLICY_CONFIG,
  type VoidWastePolicyConfig,
} from "../../settings/model/voidWastePolicy.types";
import type { Order } from "../model/order.types";

interface OrdersPageProps {
  resolveTableName?: (tableId: string) => string;
}

const OrdersPage = ({ resolveTableName }: OrdersPageProps) => {
  const { activeOrders, finishedOrders, updateOrderStatus, clearHistory } =
    useOrderManagement();

  const { username, role: userRole } = useAuth();
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [cancelReasonId, setCancelReasonId] = useState("");
  const [cancelNote, setCancelNote] = useState("");
  const [voidPolicy, setVoidPolicy] = useState<VoidWastePolicyConfig>(
    DEFAULT_VOID_WASTE_POLICY_CONFIG,
  );

  const {
    kitchens,
    isLoading: isKitchenAccessLoading,
    assignedKitchenId,
    hasTodayAssignment,
    assignmentError,
  } = useAccessibleKitchens();
  const [savedKitchenId, setSelectedKitchen] = useState<string>(() => {
    return getSelectedKitchenId();
  });

  const activeKitchens = useMemo(
    () => kitchens.filter((k) => k.isActive),
    [kitchens],
  );
  const isCook = userRole === "cocinero";
  const isValidKitchen =
    savedKitchenId === "" ||
    activeKitchens.some((k) => k.id === savedKitchenId);
  const selectedKitchenId = isCook
    ? (activeKitchens.find((kitchen) => kitchen.id === assignedKitchenId)?.id ??
      "")
    : isValidKitchen
      ? savedKitchenId
      : "";
  const selectedKitchenName = activeKitchens.find(
    (kitchen) => kitchen.id === selectedKitchenId,
  )?.name;

  useEffect(() => {
    if (!isCook && !isValidKitchen && !isKitchenAccessLoading) {
      setSelectedKitchen("");
      saveSelectedKitchenId("");
    }
  }, [isCook, isKitchenAccessLoading, isValidKitchen]);

  useEffect(() => {
    void voidWastePolicyGateway.load().then(setVoidPolicy);
  }, []);

  const handleKitchenChange = (
    event: React.SyntheticEvent,
    newValue: string,
  ) => {
    if (isCook) return;
    setSelectedKitchen(newValue);
    saveSelectedKitchenId(newValue);
  };

  const visibleActiveOrders = useMemo(() => {
    if (isCook && !selectedKitchenId) return [];
    if (!selectedKitchenId) return activeOrders;
    return activeOrders.filter((order) =>
      order.items.some((item) => item.kitchenId === selectedKitchenId),
    );
  }, [activeOrders, isCook, selectedKitchenId]);

  const visibleFinishedOrders = useMemo(() => {
    if (isCook && !selectedKitchenId) return [];
    if (!selectedKitchenId) return finishedOrders;
    return finishedOrders.filter((order) =>
      order.items.some((item) => item.kitchenId === selectedKitchenId),
    );
  }, [finishedOrders, isCook, selectedKitchenId]);

  const accessMessage = !isCook
    ? null
    : assignmentError
      ? assignmentError
      : isKitchenAccessLoading
        ? "Consultando tu cocina asignada..."
        : !hasTodayAssignment
          ? "No tienes una cocina asignada para hoy. Solicita al administrador que revise tu horario."
          : !selectedKitchenId
            ? "La cocina asignada para hoy no está activa. Solicita al administrador que revise la configuración."
            : null;

  const handleClearHistory = () => {
    clearHistory();
    logService.log(
      username,
      userRole,
      "CLEAR_HISTORY",
      "Vaciado manual de todo el historial de órdenes",
    );
    setIsClearConfirmOpen(false);
  };

  const handleDeleteOrder = (id: string) => {
    const order = [...activeOrders, ...finishedOrders].find(
      (candidate) => candidate.id === id,
    );
    if (!order) return;
    setOrderToDelete(order);
    setCancelReasonId(
      voidPolicy.reasons.find((reason) => reason.isActive)?.id ?? "",
    );
    setCancelNote("");
    setReasonDialogOpen(true);
  };

  const handleCancelSuccess = (pin?: string) => {
    if (orderToDelete) {
      updateOrderStatus(
        orderToDelete.id,
        "cancelled",
        cancelNote,
        pin,
        undefined,
        undefined,
        undefined,
        cancelReasonId,
      );
    }
    setPinDialogOpen(false);
    setOrderToDelete(null);
  };

  const submitCancellationReason = () => {
    if (!orderToDelete || !cancelReasonId) return;
    setReasonDialogOpen(false);
    const selectedReason = voidPolicy.reasons.find(
      (reason) => reason.id === cancelReasonId,
    );
    const wasPrepared = orderToDelete.items.some(
      (item) =>
        item.isSentToKitchen &&
        ["preparing", "ready", "delivered"].includes(item.kitchenStatus ?? ""),
    );
    const requiresPin =
      selectedReason?.requiresSupervisor ||
      (voidPolicy.requireSupervisorForPaidOrders &&
        orderToDelete.status === "paid") ||
      (voidPolicy.requireSupervisorWhenPreparationStarted && wasPrepared);
    if (requiresPin) setPinDialogOpen(true);
    else handleCancelSuccess();
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        pt: 4,
        pb: 4,
        px: { xs: 2, md: 6 },
      }}
    >
      <PageHeader
        title={isCook ? "Historial de Órdenes" : "Gestión de Órdenes"}
        startContent={<BackButton to="/home" />}
        actions={
          !isCook ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  bgcolor: "rgba(0,0,0,0.03)",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                }}
              >
                <TimerIcon color="action" fontSize="small" />
                <Typography
                  variant="body2"
                  fontWeight="600"
                  color="text.secondary"
                >
                  {visibleActiveOrders.length} activas
                </Typography>
              </Stack>
              <RoleGuard allowedRoles={["admin"]}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setIsClearConfirmOpen(true)}
                  startIcon={<DeleteIcon />}
                  sx={{
                    color: LOGIN_COLORS.primary,
                    borderColor: LOGIN_COLORS.primary,
                    "&:hover": {
                      borderColor: LOGIN_COLORS.primaryDark,
                      bgcolor: "rgba(0,0,0,0.02)",
                    },
                    borderRadius: 2,
                    px: 2,
                    height: 36,
                  }}
                >
                  Limpiar Historial
                </Button>
              </RoleGuard>
            </Stack>
          ) : undefined
        }
      />

      {(!isCook || activeKitchens.length > 0) && (
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={selectedKitchenId}
            onChange={handleKitchenChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            {!isCook && <Tab label="Todas las áreas" value="" />}
            {activeKitchens.map((k) => (
              <Tab key={k.id} label={k.name} value={k.id} />
            ))}
          </Tabs>
        </Box>
      )}

      {accessMessage ? (
        <Alert severity={assignmentError ? "error" : "info"}>
          {accessMessage}
        </Alert>
      ) : (
        <>
          {!isCook && (
            <>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, mt: 2 }}>
                Órdenes Activas
              </Typography>
              {visibleActiveOrders.length === 0 ? (
                <OrderEmptyState />
              ) : (
                <OrderGrid
                  orders={visibleActiveOrders}
                  selectedKitchenId={selectedKitchenId}
                  kitchens={kitchens}
                  resolveTableName={resolveTableName}
                  onUpdateStatus={updateOrderStatus}
                  onDelete={handleDeleteOrder}
                />
              )}
            </>
          )}

          {(isCook || visibleFinishedOrders.length > 0) && (
            <>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ mb: 3, mt: isCook ? 2 : 6 }}
              >
                Historial Reciente
                {isCook && selectedKitchenName
                  ? ` · ${selectedKitchenName}`
                  : ""}
              </Typography>
              {visibleFinishedOrders.length === 0 ? (
                <Alert severity="info">
                  No hay órdenes en el historial reciente
                  {selectedKitchenName ? ` de ${selectedKitchenName}` : ""}.
                </Alert>
              ) : (
                <OrderGrid
                  orders={visibleFinishedOrders.slice(0, 50)}
                  selectedKitchenId={selectedKitchenId}
                  kitchens={kitchens}
                  resolveTableName={resolveTableName}
                  onUpdateStatus={updateOrderStatus}
                  onDelete={isCook ? undefined : handleDeleteOrder}
                />
              )}
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={isClearConfirmOpen}
        title="Limpiar Historial"
        message="¿Estás seguro de que quieres limpiar todo el historial de hoy? Esta acción no se puede deshacer."
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleClearHistory}
        disableRestoreFocus
        disableEnforceFocus
      />

      {!isCook && (
        <InvoiceCancellationDialogs
          reasonOpen={reasonDialogOpen}
          pinOpen={pinDialogOpen}
          reasons={voidPolicy.reasons.filter((reason) => reason.isActive)}
          reasonId={cancelReasonId}
          note={cancelNote}
          onReasonChange={setCancelReasonId}
          onNoteChange={setCancelNote}
          onCloseReason={() => {
            setReasonDialogOpen(false);
            setOrderToDelete(null);
          }}
          onSubmitReason={submitCancellationReason}
          onClosePin={() => {
            setPinDialogOpen(false);
            setOrderToDelete(null);
          }}
          onConfirm={handleCancelSuccess}
        />
      )}
    </Box>
  );
};

export default OrdersPage;
