import { Box, Typography, Button } from "@mui/material";
import { useState, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SectionSidebar from "../components/mesas/SectionSidebar";
import MesaGrid from "../components/mesas/MesaGrid";
import OrderPanel from "../components/mesas/OrderPanel";
import ReservationDialog from "../components/mesas/ReservationDialog";
import TableSelectDialog from "../components/mesas/TableSelectDialog";
import { Mesa } from "../types/mesa.types";


import { useMesasConfig } from "../hooks/useMesasConfig";
import { useMyTodayZone } from "../hooks/useMyTodayZone";
import { useTableReservations } from "../hooks/useTableReservations";
import { useOrderContext } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { logService } from "../services/logService";
import { CartItemType } from "../types/cart";
import { PaymentMethod, OrderType } from "../types/order.types";
import FacturaPreviewDialog from "../components/FacturaPreviewDialog";
import { useImpuestosConfig } from "../hooks/useImpuestosConfig";
import { calculateCartTotals } from "../utils/cartTotals";

export default function MesasPage() {
  const { floorsConfig, isLoading: isLoadingConfig, error, retryFetch } = useMesasConfig();
  const { assignedFloorId, loadingZone } = useMyTodayZone();
  const { tableStatusMap, reservationDetails, reserveTable, releaseTable } =
    useTableReservations();
  const { username, role } = useAuth();
  const { taxes, isExonerated } = useImpuestosConfig();
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper para restaurar el foco y evitar bloqueos de Electron
  const restoreFocus = useCallback(() => {
    setTimeout(() => {
      containerRef.current?.focus();
    }, 300);
  }, []);

  // Filtrar plantas que tengan mesas asignadas y que pertenezcan al mesero (si es mesero)
  const activeFloors = useMemo(() => {
    let base = floorsConfig.filter((f) => f.tableCount > 0);
    if (role === "mesero" && assignedFloorId !== null) {
      base = base.filter((f) => f.id === assignedFloorId);
    }
    return base;
  }, [floorsConfig, role, assignedFloorId]);
  const floors = useMemo(() => 
    activeFloors.length > 0
      ? activeFloors.map((f) => ({ id: f.id, name: f.name }))
      : [], 
  [activeFloors]);

  const [selectedFloor, setSelectedFloor] = useState<number>(activeFloors[0]?.id || 1);

  // Sincronizar el selectedFloor si cambian los activeFloors y el actual ya no es válido
  useMemo(() => {
    if (activeFloors.length > 0 && !activeFloors.find(f => f.id === selectedFloor)) {
      setSelectedFloor(activeFloors[0].id);
    }
  }, [activeFloors, selectedFloor]);
  const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);

  // Dialog state
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTableSelectOpen, setIsTableSelectOpen] = useState(false);
  const [tableSelectMode, setTableSelectMode] = useState<
    "unir" | "mover" | null
  >(null);
  
  // Checkout snapshot state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [checkoutOrder, setCheckoutOrder] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [checkoutPromotion, setCheckoutPromotion] = useState<any>(null);
  const [createdInvoiceNumber, setCreatedInvoiceNumber] = useState<string | undefined>(undefined);

  // Obtener órdenes activas desde el contexto
  const { getOrderByTable, moveOrder, unirMesas, finalizeOrder, updateOrderItems } =
    useOrderContext();

  // Generar mesas dinámicamente según la planta seleccionada
  const activeFloorConfig = useMemo(() => activeFloors.find((f) => f.id === selectedFloor), [activeFloors, selectedFloor]);
  const tableCount = activeFloorConfig ? activeFloorConfig.tableCount : 0;

  const mesas: Mesa[] = useMemo(() => {
    return Array.from({ length: tableCount }).map((_, idx) => {
      const tableNum = idx + 1;
      const uniqueId = `F${selectedFloor}-M${tableNum}`;

      // Si hay una orden activa en esta mesa, está ocupada
      const hasActiveOrder = !!getOrderByTable(uniqueId);
      const estado = hasActiveOrder
        ? "ocupado"
        : tableStatusMap[uniqueId] || "disponible";

      return {
        id: uniqueId,
        estado: estado,
        floor: selectedFloor,
        reservationName: reservationDetails[uniqueId]?.nombre,
      };
    });
  }, [tableCount, selectedFloor, getOrderByTable, tableStatusMap, reservationDetails]);

  const selectedMesaStatus = useMemo(() => 
    selectedMesaId ? tableStatusMap[selectedMesaId] || "disponible" : null,
  [selectedMesaId, tableStatusMap]);

  const isReserved = selectedMesaStatus === "reservado";

  const handleReservar = useCallback(() => {
    if (!selectedMesaId) return;

    if (getOrderByTable(selectedMesaId)) {
      console.warn("No se puede reservar una mesa con pedido activo.");
      return;
    }

    if (isReserved) {
      releaseTable(selectedMesaId);
      logService.log(username, role, "CANCEL_RESERVATION", `Reserva cancelada para Mesa ${selectedMesaId.split("-M")[1]}`);
    } else {
      setIsReservationOpen(true);
    }
  }, [selectedMesaId, getOrderByTable, isReserved, releaseTable, username, role]);

  const handleConfirmReservation = useCallback((nombre: string, monto: number, reservationTime: string, expirationTime: string) => {
    if (!selectedMesaId) return;

    reserveTable(selectedMesaId, { nombre, monto, reservationTime, expirationTime });
    logService.log(username, role, "CREATE_RESERVATION", `Nueva reserva para ${nombre} en Mesa ${selectedMesaId.split("-M")[1]} por monto: ${monto}`);
    setIsReservationOpen(false);
    restoreFocus();
  }, [selectedMesaId, reserveTable, restoreFocus, username, role]);

  const navigate = useNavigate();

  const handleEditOrder = useCallback(() => {
    if (!selectedMesaId) return;
    if (isReserved) releaseTable(selectedMesaId);
    navigate(`/facturacion?tableId=${selectedMesaId}`);
  }, [selectedMesaId, isReserved, releaseTable, navigate]);

  const activeOrder = useMemo(() => selectedMesaId ? getOrderByTable(selectedMesaId) : null, [selectedMesaId, getOrderByTable]);

  const canModifyOrder = useMemo(() => {
    if (!activeOrder) return true;
    if (role === "admin" || role === "cajero") return true;
    return activeOrder.cashierName === username;
  }, [activeOrder, role, username]);

  const handleCheckoutTable = useCallback(() => {
    if (!selectedMesaId || !activeOrder) return;
    setCheckoutOrder(activeOrder);
    setCreatedInvoiceNumber(undefined);
    setIsPreviewOpen(true);
  }, [selectedMesaId, activeOrder]);

  const handleUnirMesas = useCallback(() => {
    if (!selectedMesaId) return;
    setTableSelectMode("unir");
    setIsTableSelectOpen(true);
  }, [selectedMesaId]);

  const handleMoverPedido = useCallback(() => {
    if (!selectedMesaId) return;
    setTableSelectMode("mover");
    setIsTableSelectOpen(true);
  }, [selectedMesaId]);

  const handleTableSelectConfirm = useCallback((targetTableId: string | string[]) => {
    if (!selectedMesaId) return;
    if (tableSelectMode === "unir") {
      unirMesas(selectedMesaId, targetTableId);
    } else if (tableSelectMode === "mover") {
      moveOrder(selectedMesaId, targetTableId);
      const nextMesaId = Array.isArray(targetTableId) ? targetTableId[0] : targetTableId;
      setSelectedMesaId(nextMesaId);
    }
    setIsTableSelectOpen(false);
    restoreFocus();
  }, [selectedMesaId, tableSelectMode, unirMesas, moveOrder, restoreFocus]);

  const getAvailableTables = useCallback(() => {
    return mesas
      .filter((m) => m.estado === "disponible" && m.id !== selectedMesaId)
      .map((m) => ({
        id: m.id,
        label: `Planta ${m.floor} - Mesa ${m.id.split("-M")[1]}`,
      }));
  }, [mesas, selectedMesaId]);

  // Obtener la orden de la mesa seleccionada
  const currentOrder: CartItemType[] = useMemo(() => activeOrder ? activeOrder.items : [], [activeOrder]);

  useMemo(
    () => calculateCartTotals(currentOrder, taxes, isExonerated),
    [currentOrder, taxes, isExonerated]
  );
  
  const checkoutCart: CartItemType[] = useMemo(() => checkoutOrder ? checkoutOrder.items : [], [checkoutOrder]);
  const { subTotal: checkoutSubTotal, taxAmount: checkoutTaxAmount, total: checkoutTotal, discountAmount: checkoutDiscountAmount } = useMemo(
    () => calculateCartTotals(checkoutCart, taxes, isExonerated, checkoutPromotion),
    [checkoutCart, taxes, isExonerated, checkoutPromotion]
  );

  const handleFinalConfirm = useCallback(async (
    paymentMethod: PaymentMethod,
    splitAmounts?: { efectivo: number; tarjeta: number },
    customerName?: string,
    orderType?: OrderType,
    customerAddress?: string,
    packagingItems?: { name: string, price: number, quantity: number }[]
  ) => {
    if (!checkoutOrder) return;

    let finalCheckoutTotal = checkoutTotal;
    let finalCheckoutSubTotal = checkoutSubTotal;
    let finalCheckoutTaxAmount = checkoutTaxAmount;
    let finalCheckoutDiscountAmount = checkoutDiscountAmount;

    // Si hay empaques (llevar o delivery), debemos agregarlos a la orden antes de facturar
    if (packagingItems && packagingItems.length > 0) {
      const extraCartItems: CartItemType[] = packagingItems.map(pkg => ({
        id: crypto.randomUUID(),
        name: `Empaque ${pkg.name}`,
        price: pkg.price,
        size: "único",
        quantity: pkg.quantity,
        extras: [],
      }));
      const fullCart = [...checkoutCart, ...extraCartItems];
      const newTotals = calculateCartTotals(fullCart, taxes, isExonerated, checkoutPromotion);
      finalCheckoutTotal = newTotals.total;
      finalCheckoutSubTotal = newTotals.subTotal;
      finalCheckoutTaxAmount = newTotals.taxAmount;
      finalCheckoutDiscountAmount = newTotals.discountAmount;
      
      await updateOrderItems(checkoutOrder.id, fullCart, finalCheckoutTotal, finalCheckoutSubTotal, finalCheckoutTaxAmount);
    }

    const invoiceNumber = await finalizeOrder(
      checkoutOrder.id,
      paymentMethod,
      splitAmounts,
      customerName,
      orderType,
      customerAddress,
      finalCheckoutTotal,
      finalCheckoutSubTotal,
      finalCheckoutTaxAmount,
      finalCheckoutDiscountAmount,
      checkoutPromotion?.code
    );

    setCreatedInvoiceNumber(invoiceNumber || "000001");
    
    setTimeout(() => {
      if (window.ipcRenderer) {
        window.ipcRenderer.send("print-silent");
        setTimeout(() => {
          setIsPreviewOpen(false);
          setCheckoutOrder(null);
          restoreFocus();
        }, 500);
      } else {
        window.print();
        setIsPreviewOpen(false);
        setCheckoutOrder(null);
        restoreFocus();
      }
    }, 500);
    }, [checkoutOrder, finalizeOrder, checkoutTotal, restoreFocus, checkoutCart, checkoutDiscountAmount, checkoutPromotion, checkoutSubTotal, checkoutTaxAmount, isExonerated, taxes, updateOrderItems]);

  const handleSalir = () => navigate("/home");

  const closeReservation = useCallback(() => {
    setIsReservationOpen(false);
    restoreFocus();
  }, [restoreFocus]);

  const closeTableSelect = useCallback(() => {
    setIsTableSelectOpen(false);
    restoreFocus();
  }, [restoreFocus]);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setCheckoutOrder(null);
    setCheckoutPromotion(null);
    setCreatedInvoiceNumber(undefined);
    restoreFocus();
  }, [restoreFocus]);

  const isLoading = isLoadingConfig || loadingZone;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" color="text.secondary">Cargando...</Typography>
      </Box>
    );
  }

  if (role === "mesero" && !assignedFloorId) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2, bgcolor: "background.default" }}>
        <Typography variant="h5" color="text.primary" fontWeight="bold">Acceso Restringido</Typography>
        <Typography variant="body1" color="text.secondary">
          No tienes zona asignada para el día de hoy.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleSalir} sx={{ mt: 2 }}>
          Volver al Inicio
        </Button>
      </Box>
    );
  }

  if (!isLoadingConfig && (error || activeFloors.length === 0)) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" color="error">Oops, no se pudieron cargar las mesas.</Typography>
        <Typography variant="body1" color="text.secondary">
          {error || 'El servidor parece estar ocupado o no hay zonas configuradas.'}
        </Typography>
        <Button variant="contained" color="primary" onClick={retryFetch}>
          Reintentar
        </Button>
      </Box>
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
          floors={floors}
          selectedFloor={selectedFloor}
          onChangeFloor={setSelectedFloor}
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
          mesas={mesas}
          selectedFloor={selectedFloor}
          selectedMesaId={selectedMesaId}
          onSelectMesa={setSelectedMesaId}
        />
      </Box>

      {/* Right side Order Panel */}
      <Box sx={{ width: 400, flexShrink: 0 }}>
        <OrderPanel
          order={currentOrder}
          onSalir={handleSalir}
          onReservar={handleReservar}
          isReserved={isReserved}
          onEditOrder={handleEditOrder}
          onCheckout={handleCheckoutTable}
          onUnirMesas={handleUnirMesas}
          onMoverPedido={handleMoverPedido}
          hasActiveOrder={!!activeOrder}
          canModifyOrder={canModifyOrder}
        />
      </Box>

      <ReservationDialog
        open={isReservationOpen}
        mesaId={selectedMesaId}
        onClose={closeReservation}
        onConfirm={handleConfirmReservation}
        disableRestoreFocus
        disableEnforceFocus
      />

      <TableSelectDialog
        open={isTableSelectOpen}
        onClose={closeTableSelect}
        onConfirm={handleTableSelectConfirm}
        options={getAvailableTables()}
        multiSelect={true}
        maxSelection={
          tableSelectMode === "mover" && activeOrder
            ? (activeOrder.linkedTables?.length || 0) + 1
            : undefined
        }
        title={
          tableSelectMode === "unir"
            ? `Unir Mesa ${selectedMesaId?.split("-M")[1]} con...`
            : `Mover Pedido de Mesa ${selectedMesaId?.split("-M")[1]} a...`
        }
        disableRestoreFocus
        disableEnforceFocus
      />

      {checkoutOrder && (
        <FacturaPreviewDialog
          open={isPreviewOpen}
          cart={checkoutCart}
          promotion={checkoutPromotion}
          subTotal={checkoutSubTotal}
          discountAmount={checkoutDiscountAmount}
          taxAmount={checkoutTaxAmount}
          total={checkoutTotal}
          onApplyPromotion={(promo) => setCheckoutPromotion(promo)}
          onRemovePromotion={() => setCheckoutPromotion(null)}
          onClose={closePreview}
          onConfirm={handleFinalConfirm}
          title={`Cerrar Cuenta Mesa ${selectedMesaId}`}
          confirmText="Finalizar y Cobrar"
          isTableMode={false}
          hideDeliveryOption={true}
          disableRestoreFocus
          disableEnforceFocus
          invoiceNumber={createdInvoiceNumber}
          cashierName={checkoutOrder.cashierName}
        />
      )}
    </Box>
  );
}
