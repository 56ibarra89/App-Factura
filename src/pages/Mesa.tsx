import { Box } from "@mui/material";
import { useState, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SectionSidebar from "../components/mesas/SectionSidebar";
import MesaGrid from "../components/mesas/MesaGrid";
import OrderPanel from "../components/mesas/OrderPanel";
import ReservationDialog from "../components/mesas/ReservationDialog";
import TableSelectDialog from "../components/mesas/TableSelectDialog";
import { Mesa } from "../types/mesa.types";

import { LOGIN_GRADIENTS } from "../theme/loginTheme";
import { useMesasConfig } from "../hooks/useMesasConfig";
import { useTableReservations } from "../hooks/useTableReservations";
import { useOrderContext } from "../context/OrderContext";
import { CartItemType } from "../types/cart";
import { PaymentMethod, OrderType } from "../types/order.types";
import FacturaPreviewDialog from "../components/FacturaPreviewDialog";

export default function MesasPage() {
  const { floorsConfig } = useMesasConfig();
  const { tableStatusMap, reservationDetails, reserveTable, releaseTable } =
    useTableReservations();
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper para restaurar el foco y evitar bloqueos de Electron
  const restoreFocus = useCallback(() => {
    setTimeout(() => {
      containerRef.current?.focus();
    }, 150);
  }, []);

  // Filtrar plantas que tengan mesas asignadas
  const activeFloors = useMemo(() => floorsConfig.filter((f) => f.tableCount > 0), [floorsConfig]);
  const floors = useMemo(() => 
    activeFloors.length > 0
      ? activeFloors.map((f) => f.name)
      : ["Primera Planta"], 
  [activeFloors]);

  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);

  // Dialog state
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTableSelectOpen, setIsTableSelectOpen] = useState(false);
  const [tableSelectMode, setTableSelectMode] = useState<
    "unir" | "mover" | null
  >(null);

  // Obtener órdenes activas desde el contexto
  const { getOrderByTable, moveOrder, unirMesas, finalizeOrder } =
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
    } else {
      setIsReservationOpen(true);
    }
  }, [selectedMesaId, getOrderByTable, isReserved, releaseTable]);

  const handleConfirmReservation = useCallback((nombre: string, monto: number) => {
    if (!selectedMesaId) return;

    reserveTable(selectedMesaId, { nombre, monto });
    setIsReservationOpen(false);
    restoreFocus();
  }, [selectedMesaId, reserveTable, restoreFocus]);

  const navigate = useNavigate();

  const handleEditOrder = useCallback(() => {
    if (!selectedMesaId) return;
    if (isReserved) releaseTable(selectedMesaId);
    navigate(`/facturacion?tableId=${selectedMesaId}`);
  }, [selectedMesaId, isReserved, releaseTable, navigate]);

  const handleCheckoutTable = useCallback(() => {
    if (!selectedMesaId) return;
    setIsPreviewOpen(true);
  }, [selectedMesaId]);

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

  const handleTableSelectConfirm = useCallback((targetTableId: string) => {
    if (!selectedMesaId) return;
    if (tableSelectMode === "unir") {
      unirMesas(selectedMesaId, targetTableId);
    } else if (tableSelectMode === "mover") {
      moveOrder(selectedMesaId, targetTableId);
      setSelectedMesaId(targetTableId);
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
  const activeOrder = useMemo(() => selectedMesaId ? getOrderByTable(selectedMesaId) : null, [selectedMesaId, getOrderByTable]);
  const currentOrder: CartItemType[] = useMemo(() => activeOrder ? activeOrder.items : [], [activeOrder]);

  const handleFinalConfirm = useCallback((
    paymentMethod: PaymentMethod,
    splitAmounts?: { efectivo: number; tarjeta: number },
    customerName?: string,
    orderType?: OrderType,
    customerAddress?: string,
  ) => {
    if (!activeOrder) return;

    finalizeOrder(
      activeOrder.id,
      paymentMethod,
      splitAmounts,
      customerName,
      orderType,
      customerAddress,
    );

    window.print();
    setIsPreviewOpen(false);
    restoreFocus();
  }, [activeOrder, finalizeOrder, restoreFocus]);

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
    restoreFocus();
  }, [restoreFocus]);

  return (
    <Box
      ref={containerRef}
      tabIndex={-1} 
      sx={{
        display: "flex",
        height: "100vh",
        background: LOGIN_GRADIENTS.pageBackground,
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
          bgcolor: "white",
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
        title={
          tableSelectMode === "unir"
            ? `Unir Mesa ${selectedMesaId?.split("-M")[1]} con...`
            : `Mover Pedido de Mesa ${selectedMesaId?.split("-M")[1]} a...`
        }
        disableRestoreFocus
        disableEnforceFocus
      />

      {activeOrder && (
        <FacturaPreviewDialog
          open={isPreviewOpen}
          cart={currentOrder}
          total={activeOrder.total}
          onClose={closePreview}
          onConfirm={handleFinalConfirm}
          title={`Cerrar Cuenta Mesa ${selectedMesaId}`}
          confirmText="Finalizar y Cobrar"
          isTableMode={false}
          disableRestoreFocus
          disableEnforceFocus
        />
      )}
    </Box>
  );
}


