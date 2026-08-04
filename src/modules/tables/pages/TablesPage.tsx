import { Box } from "@mui/material";
import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionSidebar from "../ui/SectionSidebar";
import MesaGrid from "../ui/MesaGrid";
import OrderPanel from "../ui/OrderPanel";
import ReservationDialog from "../ui/ReservationDialog";
import TableSelectDialog from "../ui/TableSelectDialog";
import MesasLoadingState from "../ui/MesasLoadingState";
import MesasRestrictedAccess from "../ui/MesasRestrictedAccess";
import {
  FacturaPreviewDialog,
  SplitBillDialog,
  preloadCheckoutPage,
  type SplitBillCheckoutSelection,
} from "../../checkout";

import { useTaxConfig } from "../../settings";
import { useMesasConfig } from "../hooks/useMesasConfig";
import { useMyTodayZone } from "../hooks/useMyTodayZone";
import { useAuth } from "../../auth";

import { useMesaDialogs } from "../hooks/useMesaDialogs";
import { useMesaCheckout } from "../hooks/useMesaCheckout";
import { useMesaLogic } from "../hooks/useMesaLogic";
import type { Order, OrderItem } from "../../orders";

export default function TablesPage() {
  const { floorsConfig, isLoading: isLoadingConfig, error, retryFetch } = useMesasConfig();
  const { assignedFloorId, loadingZone } = useMyTodayZone();
  const { username, role } = useAuth();
  const { taxes, isExonerated } = useTaxConfig();
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper para restaurar el foco y evitar bloqueos de Electron
  const restoreFocus = useCallback(() => {
    setTimeout(() => {
      containerRef.current?.focus();
    }, 300);
  }, []);

  const navigate = useNavigate();
  const handleSalir = () => navigate("/home");

  // Estado para modal Dividir Cuenta
  const [isDividirCuentaOpen, setIsDividirCuentaOpen] = useState(false);

  useEffect(() => {
    void preloadCheckoutPage().catch((error: unknown) => {
      console.warn("No se pudo precargar la pantalla de facturacion.", error);
    });
  }, []);

  // Custom Hooks para la lógica de la mesa
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

  // Wrapper para conectar logic y checkout
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
    } else {
      const activeTaxRate = isExonerated ? 0 : (taxes?.[0]?.percentage ?? 15);
      const taxFactor = 1 + activeTaxRate / 100;
      const baseSubtotal = Math.round((selection.amount / taxFactor) * 100) / 100;

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
    };

    checkout.openCheckoutPreview(subOrder);
  }, [logic.activeOrder, checkout, isExonerated, taxes]);

  const isLoading = isLoadingConfig || loadingZone;
  const canCheckoutOrder =
    !!logic.activeOrder && logic.activeOrder.items.length > 0;

  // Memoize current order format for OrderPanel
  const currentOrder = useMemo(() => logic.activeOrder ? logic.activeOrder.items : [], [logic.activeOrder]);

  if (isLoading) {
    return <MesasLoadingState onRetry={retryFetch} />;
  }

  if (role === "mesero" && !assignedFloorId) {
    return <MesasRestrictedAccess />;
  }

  if (!isLoadingConfig && (error || logic.activeFloors.length === 0)) {
    return <MesasLoadingState error={error} onRetry={retryFetch} />;
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
          borderRadius: 5,
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
          overflowY: "auto",
          border: "1px solid rgba(0,0,0,0.05)",
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
          cashierName={logic.activeOrder?.cashierName}
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

      <SplitBillDialog
        open={isDividirCuentaOpen}
        onClose={() => setIsDividirCuentaOpen(false)}
        tableId={logic.selectedMesaId}
        order={logic.activeOrder}
        onCheckout={handleCheckoutSubAccount}
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
