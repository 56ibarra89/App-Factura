import { Box } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionSidebar from "../components/mesas/SectionSidebar";
import MesaGrid from "../components/mesas/MesaGrid";
import OrderPanel from "../components/mesas/OrderPanel";
import ReservationDialog from "../components/mesas/ReservationDialog";
import { Mesa } from "../types/mesa.types";

import { LOGIN_GRADIENTS } from "../theme/loginTheme";
import { useMesasConfig } from "../hooks/useMesasConfig";
import { useOrderContext } from "../context/OrderContext";
import { CartItemType } from "../types/cart";

export default function MesasPage() {

  const { floorsConfig } = useMesasConfig();
  
  // Filtrar plantas que tengan mesas asignadas, si no hay ninguna, mostrar la de por defecto para evitar errores.
  const activeFloors = floorsConfig.filter(f => f.tableCount > 0);
  const floors = activeFloors.length > 0 ? activeFloors.map(f => f.name) : ["Primera Planta"];
  
  // Guardaríamos el estado de las mesas en backend/localStorage, mock por ahora
  const [tableStatusMap, setTableStatusMap] = useState<Record<string, "disponible" | "reservado" | "ocupado">>({});
  const [reservationDetails, setReservationDetails] = useState<Record<string, { nombre: string; monto: number }>>({});
  
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);
  
  // Dialog state
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  // Obtener órdenes activas desde el contexto
  const { getOrderByTable } = useOrderContext();

  // Generar mesas dinámicamente según la planta seleccionada
  const activeFloorConfig = activeFloors.find(f => f.id === selectedFloor);
  const tableCount = activeFloorConfig ? activeFloorConfig.tableCount : 0;
  
  const mesas: Mesa[] = Array.from({ length: tableCount }).map((_, idx) => {
    const tableNum = idx + 1;
    const uniqueId = `F${selectedFloor}-M${tableNum}`;
    
    // Si hay una orden activa en esta mesa, está ocupada
    const hasActiveOrder = !!getOrderByTable(uniqueId);
    const estado = hasActiveOrder ? "ocupado" : (tableStatusMap[uniqueId] || "disponible");

    return {
      id: uniqueId,
      estado: estado,
      floor: selectedFloor,
      reservationName: reservationDetails[uniqueId]?.nombre
    };
  });

  const selectedMesaStatus = selectedMesaId ? tableStatusMap[selectedMesaId] || "disponible" : null;
  const isReserved = selectedMesaStatus === "reservado";

  const handleReservar = () => {
    if (!selectedMesaId) return;
    
    if (isReserved) {
      // Liberar mesa
      setTableStatusMap(prev => ({
        ...prev,
        [selectedMesaId]: "disponible"
      }));
      setReservationDetails(prev => {
        const next = { ...prev };
        delete next[selectedMesaId];
        return next;
      });
    } else {
      setIsReservationOpen(true);
    }
  };

  const handleConfirmReservation = (nombre: string, monto: number) => {
    if (!selectedMesaId) return;
    
    setTableStatusMap(prev => ({
      ...prev,
      [selectedMesaId]: "reservado"
    }));
    
    setReservationDetails(prev => ({
      ...prev,
      [selectedMesaId]: { nombre, monto }
    }));
    
    setIsReservationOpen(false);
  };

  const navigate = useNavigate();

  const handleEditOrder = () => {
    if (!selectedMesaId) return;
    navigate(`/facturacion?tableId=${selectedMesaId}`);
  };

  const handleCheckoutTable = () => {
    if (!selectedMesaId) return;
    navigate(`/facturacion?tableId=${selectedMesaId}&checkout=true`);
  };
  const handleSalir = () => {
    navigate("/home");
  };

  // Obtener la orden de la mesa seleccionada para el panel lateral
  const activeOrder = selectedMesaId ? getOrderByTable(selectedMesaId) : null;
  const currentOrder: CartItemType[] = activeOrder ? activeOrder.items : [];

  return (
    <Box sx={{ 
      display: "flex", 
      height: "100vh", 
      background: LOGIN_GRADIENTS.pageBackground, 
      p: 2.5, 
      gap: 2.5, 
      boxSizing: "border-box" 
    }}>

      {/* Sidebar with branding style */}
      <Box sx={{ width: 260, flexShrink: 0 }}>
        <SectionSidebar
          floors={floors}
          selectedFloor={selectedFloor}
          onChangeFloor={setSelectedFloor}
        />
      </Box>

      {/* Main Grid Area */}
      <Box sx={{ 
        flexGrow: 1, 
        bgcolor: "white", 
        borderRadius: 5, 
        boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        overflowY: "auto",
        border: "1px solid rgba(0,0,0,0.05)"
      }}>
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
        />
      </Box>

      {/* Modal de Reserva */}
      <ReservationDialog 
        open={isReservationOpen}
        mesaId={selectedMesaId}
        onClose={() => setIsReservationOpen(false)}
        onConfirm={handleConfirmReservation}
      />
    </Box>
  );
}
