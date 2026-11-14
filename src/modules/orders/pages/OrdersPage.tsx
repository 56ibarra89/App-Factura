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
import { PERMISSIONS, PermissionGuard, useAuth } from "../../auth";

import { useOrderManagement } from "../hooks/useOrderManagement";
import { useAccessibleKitchens } from "../../kitchens";
import { logService } from "../../audit";
import { LOGIN_COLORS } from "../../../shared/theme";
import {
  getSelectedKitchenId,
  setSelectedKitchenId as saveSelectedKitchenId,
} from "../api/selectedKitchenPreference";
import { InvoiceCancellationDialogs } from "../../invoices";
import {
  DEFAULT_VOID_WASTE_POLICY_CONFIG,
  voidWastePolicyGateway,
  type VoidWastePolicyConfig,
} from "../../settings";
import type { Order } from "../model/order.types";

interface OrdersPageProps {
  resolveTableName?: (tableId: string) => string;
}

const OrdersPage = ({ resolveTableName }: OrdersPageProps) => {
  const { activeOrders, finishedOrders, updateOrderStatus, clearHistory } =
    useOrderManagement();

  const { username, role: userRole, hasPermission } = useAuth();
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
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
    void voidWastePolicyGateway.load().then(setVoidPolicy).catch((error) => {
      setCancelError(error instanceof Error ? error.message : "No se pudo cargar la política de anulación.");
    });
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
      order.items.some(
        (item) =>
          item.kitchenId === selectedKitchenId ||
          item.comboSelections?.some(
            (selection) => selection.kitchenId === selectedKitchenId,
          ),
      ),
    );
  }, [activeOrders, isCook, selectedKitchenId]);

  const visibleFinishedOrders = useMemo(() => {
    if (isCook && !selectedKitchenId) return [];
    if (!selectedKitchenId) return finishedOrders;
    return finishedOrders.filter((order) =>
      order.items.some(
        (item) =>
          item.kitchenId === selectedKitchenId ||
          item.comboSelections?.some(
            (selection) => selection.kitchenId === selectedKitchenId,
          ),
      ),
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

  const handleClearHistory = async () => {
    setClearError(null);
    setIsClearing(true);
    try {
      await clearHistory();
    logService.log(
      username,
      userRole,
      "CLEAR_HISTORY",
      "Vaciado manual de todo el historial de órdenes",
    );
      setIsClearConfirmOpen(false);
    } catch (error: unknown) {
      setClearError(
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "No se pudo limpiar el historial de órdenes.",
      );
      throw error;
    }
    finally { setIsClearing(false); }
  };

  const handleDeleteOrder = (id: string) => {
    const order = [...activeOrders, ...finishedOrders].find(
      (candidate) => candidate.id === id,
    );
    if (!order || order.status === "cancelled" || !hasPermission(PERMISSIONS.ORDERS_CANCEL)) return;
    setCancelError(null);
    setOrderToDelete(order);
    setCancelReasonId(
      voidPolicy.reasons.find((reason) => reason.isActive)?.id ?? "",
    );
    setCancelNote("");
    setReasonDialogOpen(true);
  };

  const handleCancelSuccess = async (pin?: string) => {
    if (!orderToDelete || isCancelling) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      await updateOrderStatus(
        orderToDelete.id,
        "cancelled",
        cancelNote,
        pin,
        undefined,
        undefined,
        undefined,
        cancelReasonId,
      );
      setPinDialogOpen(false);
      setReasonDialogOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : "No se pudo anular la orden.");
      if (pin) { setPinDialogOpen(false); setReasonDialogOpen(true); }
    } finally {
      setIsCancelling(false);
    }
  };

  const submitCancellationReason = () => {
    if (!orderToDelete || !cancelReasonId) return;
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
    if (requiresPin) { setReasonDialogOpen(false); setPinDialogOpen(true); }
    else void handleCancelSuccess();
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
              <PermissionGuard permissions={[PERMISSIONS.ORDERS_READ, PERMISSIONS.KITCHEN_UPDATE]}>
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
              </PermissionGuard>
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

      {clearError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setClearError(null)}
        >
          {clearError}
        </Alert>
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
                  onDelete={hasPermission(PERMISSIONS.ORDERS_CANCEL) ? handleDeleteOrder : undefined}
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
                  onDelete={!isCook && hasPermission(PERMISSIONS.ORDERS_CANCEL) ? handleDeleteOrder : undefined}
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
        loading={isClearing}
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
          error={cancelError ?? undefined}
          cancelling={isCancelling}
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
