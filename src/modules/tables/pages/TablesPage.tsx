import { Box } from "@mui/material";
import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionSidebar from "../ui/SectionSidebar";
import MesaGrid from "../ui/MesaGrid";
import OrderPanel from "../ui/OrderPanel";
import ReservationDialog from "../ui/ReservationDialog";
import TableSelectDialog from "../ui/TableSelectDialog";
import WaiterAssignmentDialog from "../ui/WaiterAssignmentDialog";
import MesasLoadingState from "../ui/MesasLoadingState";
import MesasRestrictedAccess from "../ui/MesasRestrictedAccess";
import MesasSetupRequired from "../ui/MesasSetupRequired";
import {
  FacturaPreviewDialog,
  SplitBillDialog,
  preloadCheckoutPage,
  type SplitBillCheckoutSelection,
} from "../../checkout";

import { useTaxConfig } from "../../settings";
import { useMesasConfig } from "../hooks/useMesasConfig";
import { useMyTodayZone } from "../hooks/useMyTodayZone";
import { PERMISSIONS, useAuth } from "../../auth";

import { useMesaDialogs } from "../hooks/useMesaDialogs";
import { useMesaCheckout } from "../hooks/useMesaCheckout";
import { useMesaLogic } from "../hooks/useMesaLogic";
import {
  waiterAssignmentsGateway,
  type AvailableWaiter,
} from "../api/waiterAssignmentsGateway";
import {
  type Order,
  type OrderItem,
} from "../../orders";

export default function TablesPage() {
  const { floorsConfig, isLoading: isLoadingConfig, error, retryFetch } = useMesasConfig();
  const { assignedFloorId, loadingZone, zoneError, retryZone } = useMyTodayZone();
  const { username, role, hasPermission } = useAuth();
  const { taxes, isExonerated } = useTaxConfig();

  const containerRef = useRef<HTMLDivElement>(null);

  const restoreFocus = useCallback(() => {
    setTimeout(() => {
      containerRef.current?.focus();
    }, 300);
  }, []);

  const navigate = useNavigate();
  const handleSalir = () => navigate("/home");
  const handleConfigureTables = () => navigate("/admin/mesas");

  const retryInitialLoad = useCallback(() => {
    void retryFetch();
    retryZone();
  }, [retryFetch, retryZone]);

  const [isDividirCuentaOpen, setIsDividirCuentaOpen] = useState(false);
  const [isWaiterDialogOpen, setIsWaiterDialogOpen] = useState(false);
  const [availableWaiters, setAvailableWaiters] = useState<AvailableWaiter[]>([]);
  const [isLoadingWaiters, setIsLoadingWaiters] = useState(false);
  const [isSavingWaiter, setIsSavingWaiter] = useState(false);

  useEffect(() => {
    void preloadCheckoutPage().catch((error: unknown) => {
      console.warn("No se pudo precargar la pantalla de facturacion.", error);
    });
  }, []);

  const dialogs = useMesaDialogs(restoreFocus);

  const logic = useMesaLogic({
    floorsConfig,
    role,
    username,
    assignedFloorId,
    openReservation: dialogs.openReservation,
    openTableSelect: dialogs.openTableSelect,
  });

  const checkout = useMesaCheckout(restoreFocus);

  const canReassignWaiter = ["admin", "cajero", "cajero_principal", "despachador"].includes(
    role ?? "",
  );

  const openWaiterAssignment = useCallback(async () => {
    setIsWaiterDialogOpen(true);
    setIsLoadingWaiters(true);
    try {
      setAvailableWaiters(await waiterAssignmentsGateway.listActive());
    } catch (error: unknown) {
      setIsWaiterDialogOpen(false);
      window.alert(
        error instanceof Error
          ? `No se pudo cargar el listado de meseros: ${error.message}`
          : "No se pudo cargar el listado de meseros.",
      );
    } finally {
      setIsLoadingWaiters(false);
    }
  }, []);

  const confirmWaiterAssignment = useCallback(
    async (waiterId: string) => {
      if (!logic.activeOrder) return;
      setIsSavingWaiter(true);
      try {
        await logic.assignOrderWaiter(logic.activeOrder.id, waiterId);
        setIsWaiterDialogOpen(false);
      } catch (error: unknown) {
        window.alert(
          error instanceof Error
            ? `No se pudo reasignar el mesero: ${error.message}`
            : "No se pudo reasignar el mesero.",
        );
      } finally {
        setIsSavingWaiter(false);
      }
    },
    [logic],
  );

  const handleCheckoutTable = useCallback(() => {
    if (!logic.selectedMesaId || !logic.activeOrder) return;
    checkout.openCheckoutPreview(logic.activeOrder);
  }, [logic.selectedMesaId, logic.activeOrder, checkout]);

  const handleOpenDividirCuenta = useCallback(() => {
    if (!logic.activeOrder) return;
    setIsDividirCuentaOpen(true);
  }, [logic.activeOrder]);

  const handleCheckoutSubAccount = useCallback((selection: SplitBillCheckoutSelection) => {
    if (!logic.activeOrder) return;
    setIsDividirCuentaOpen(false);

    let itemsToCheckout: OrderItem[];

    if (selection.items && selection.items.length > 0) {
      itemsToCheckout = selection.items;
      const subOrder: Order = {
        ...logic.activeOrder,
        customerName: `${logic.activeOrder.customerName || "Cliente"} (${selection.accountName})`,
        items: itemsToCheckout,
        total: selection.amount,
        discountAmount: (() => {
          const parentDiscount = logic.activeOrder.discountAmount ?? 0;
          if (parentDiscount <= 0) return 0;
          const activeTaxRate = isExonerated
            ? 0
            : (taxes ?? []).reduce(
                (sum, tax) => sum + (Number(tax.percentage) || 0),
                0,
              );
          const taxFactor = 1 + activeTaxRate / 100;
          const subItemsSubtotal = itemsToCheckout.reduce((sum, item) => {
            const paidQty = Math.max(0, item.quantity - (item.giftQuantity || 0));
            return sum + item.price * paidQty;
          }, 0);
          return Math.min(
            parentDiscount,
            Math.max(0, Number((subItemsSubtotal - selection.amount / taxFactor).toFixed(2))),
          );
        })(),
      };
      checkout.openCheckoutPreview(subOrder, {
        isSubAccount: true,
        splitSelection: selection,
        parentOrderId: logic.activeOrder.id,
      });
      return;
    } else {
      const activeTaxRate = isExonerated
        ? 0
        : (taxes ?? []).reduce(
            (sum, tax) => sum + (Number(tax.percentage) || 0),
            0,
          );
      const taxFactor = 1 + activeTaxRate / 100;
      const baseSubtotal = selection.amount / taxFactor;

      itemsToCheckout = [
        {
          name: `Pago parcial (${selection.accountName})`,
          price: baseSubtotal,
          quantity: 1,
          size: "Único",
          extras: [],
        },
      ];
    }

    // Crear sub-orden para facturar la sub-cuenta individual
    const subOrder: Order = {
      ...logic.activeOrder,
      customerName: `${logic.activeOrder.customerName || "Cliente"} (${selection.accountName})`,
      items: itemsToCheckout,
      total: selection.amount,
      discountAmount: 0,
      promotionSource: "none",
      promotionCode: undefined,
      couponId: undefined,
      discountId: undefined,
      happyHourId: undefined,
    };

    checkout.openCheckoutPreview(subOrder, {
      isSubAccount: true,
      splitSelection: selection,
      parentOrderId: logic.activeOrder.id,
    });
  }, [logic.activeOrder, checkout, isExonerated, taxes]);

  const isLoading = isLoadingConfig || loadingZone;
  const hasConfiguredTables = floorsConfig.some(
    (floor) => floor.tableCount > 0,
  );
  const canCheckoutOrder =
    !!logic.activeOrder && logic.activeOrder.items.length > 0;

  // Memoize current order format for OrderPanel
  const currentOrder = useMemo(() => logic.activeOrder ? logic.activeOrder.items : [], [logic.activeOrder]);

  if (isLoading) {
    return (
      <MesasLoadingState
        onRetry={retryInitialLoad}
        onBack={handleSalir}
      />
    );
  }

  if (zoneError) {
    return (
      <MesasLoadingState
        error={zoneError}
        onRetry={retryInitialLoad}
        onBack={handleSalir}
      />
    );
  }

  if (error) {
    return (
      <MesasLoadingState
        error={error}
        onRetry={retryInitialLoad}
        onBack={handleSalir}
      />
    );
  }

  if (!hasConfiguredTables) {
    return (
      <MesasSetupRequired
        canConfigure={hasPermission(PERMISSIONS.TABLES_CONFIGURE)}
        onBack={handleSalir}
        onConfigure={handleConfigureTables}
      />
    );
  }

  if (role === "mesero" && !assignedFloorId) {
    return <MesasRestrictedAccess />;
  }

  if (logic.activeFloors.length === 0) {
    return (
      <MesasSetupRequired
        canConfigure={hasPermission(PERMISSIONS.TABLES_CONFIGURE)}
        assignedZoneWithoutTables
        onBack={handleSalir}
        onConfigure={handleConfigureTables}
      />
    );
  }

  return (
    <Box
      ref={containerRef}
      tabIndex={-1}
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: 'background.default',
        p: 2.5,
        gap: 2.5,
        boxSizing: "border-box",
        outline: "none",
      }}
    >
      {/* Sidebar with branding style */}
      <Box sx={{ width: 260, flexShrink: 0 }}>
        <SectionSidebar
          floors={logic.floors}
          selectedFloor={logic.selectedFloor}
          onChangeFloor={logic.setSelectedFloor}
        />
      </Box>

      {/* Main Grid Area */}
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "none",
          overflowY: "auto",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <MesaGrid
          mesas={logic.mesas}
          selectedFloor={logic.selectedFloor}
          selectedMesaId={logic.selectedMesaId}
          onSelectMesa={logic.setSelectedMesaId}
        />
      </Box>

      {/* Right side Order Panel */}
      <Box sx={{ width: 400, flexShrink: 0 }}>
        <OrderPanel
          order={currentOrder}
          discountAmount={logic.activeOrder?.discountAmount}
          cashierName={logic.activeOrder?.cashierName}
          waiterName={logic.activeOrder?.waiterName}
          canReassignWaiter={canReassignWaiter}
          onReassignWaiter={openWaiterAssignment}
          onSalir={handleSalir}
          onReservar={logic.handleReservar}
          isReserved={logic.isReserved}
          onEditOrder={logic.handleEditOrder}
          onCheckout={handleCheckoutTable}
          onUnirMesas={logic.handleUnirMesas}
          onMoverPedido={logic.handleMoverPedido}
          onDividirCuenta={handleOpenDividirCuenta}
          hasActiveOrder={canCheckoutOrder}
          canCheckoutOrder={canCheckoutOrder}
          canModifyOrder={logic.canModifyOrder}
          onToggleOccupancy={logic.handleToggleOccupancy}
          isOccupied={logic.selectedMesaStatus === "ocupado" || canCheckoutOrder || (logic.selectedMesaId ? logic.isTableBlocked(logic.selectedMesaId) : false)}
          cannotReleaseTable={logic.selectedMesaId ? logic.isTableBlocked(logic.selectedMesaId) : false}
        />
      </Box>

      <ReservationDialog
        open={dialogs.isReservationOpen}
        mesaId={logic.selectedMesaId}
        onClose={dialogs.closeReservation}
        onConfirm={(nombre, monto, resTime, expTime) =>
          logic.handleConfirmReservation(nombre, monto, resTime, expTime, dialogs.closeReservation)
        }
        disableRestoreFocus
        disableEnforceFocus
      />

      <TableSelectDialog
        open={dialogs.isTableSelectOpen}
        onClose={dialogs.closeTableSelect}
        onConfirm={(target) => logic.handleTableSelectConfirm(target, dialogs.tableSelectMode!, dialogs.closeTableSelect)}
        options={logic.getAvailableTables()}
        multiSelect={true}
        maxSelection={
          dialogs.tableSelectMode === "mover"
            ? (logic.activeOrder?.linkedTables?.length || 0) + 1
            : undefined
        }
        title={
          dialogs.tableSelectMode === "unir"
            ? `Unir Mesa ${logic.selectedMesaId?.split("-M")[1]} con...`
            : `Mover Pedido de Mesa ${logic.selectedMesaId?.split("-M")[1]} a...`
        }
        disableRestoreFocus
        disableEnforceFocus
      />

      <WaiterAssignmentDialog
        open={isWaiterDialogOpen}
        waiters={availableWaiters}
        currentWaiterId={logic.activeOrder?.waiterId}
        submitting={isSavingWaiter || isLoadingWaiters}
        onClose={() => setIsWaiterDialogOpen(false)}
        onConfirm={confirmWaiterAssignment}
      />

      <SplitBillDialog
        open={isDividirCuentaOpen}
        onClose={() => setIsDividirCuentaOpen(false)}
        tableId={logic.selectedMesaId}
        order={logic.activeOrder}
        onCheckout={handleCheckoutSubAccount}
        completedSelection={
          checkout.completedSplitCheckout?.parentOrderId === logic.activeOrder?.id
            ? (checkout.completedSplitCheckout?.selection ?? null)
            : null
        }
      />

      {checkout.checkoutOrder && (
        <FacturaPreviewDialog
          open={checkout.isPreviewOpen}
          cart={checkout.checkoutCart}
          promotion={checkout.checkoutPromotion}
          subTotal={checkout.checkoutSubTotal}
          discountAmount={checkout.checkoutDiscountAmount}
          taxAmount={checkout.checkoutTaxAmount}
          total={checkout.checkoutTotal}
          onApplyPromotion={checkout.setCheckoutPromotion}
          onRemovePromotion={() => checkout.setCheckoutPromotion(null)}
          onClose={checkout.closeCheckoutPreview}
          onConfirm={checkout.handleFinalConfirm}
          title={`Cerrar Cuenta Mesa ${logic.selectedMesaId}`}
          confirmText="Finalizar y Cobrar"
          isTableMode={false}
          hideDeliveryOption={true}
          disableRestoreFocus
          disableEnforceFocus
          invoiceNumber={checkout.createdInvoiceNumber}
          cashierName={checkout.checkoutOrder.cashierName}
        />
      )}
    </Box>
  );
}
