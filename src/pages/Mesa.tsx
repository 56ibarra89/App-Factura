import { Box } from "@mui/material";
import { useState } from "react";
import SectionSidebar from "../components/mesas/SectionSidebar";
import MesaGrid from "../components/mesas/MesaGrid";
import OrderPanel from "../components/mesas/OrderPanel";
import { Mesa } from "../types/mesa.types";
import { OrderItem } from "../types/order.types";

import { LOGIN_GRADIENTS } from "../theme/loginTheme";
import { useMesasConfig } from "../hooks/useMesasConfig";

export default function MesasPage() {

  const { floorsConfig } = useMesasConfig();
  
  // Filtrar plantas que tengan mesas asignadas, si no hay ninguna, mostrar la de por defecto para evitar errores.
  const activeFloors = floorsConfig.filter(f => f.tableCount > 0);
  const floors = activeFloors.length > 0 ? activeFloors.map(f => f.name) : ["Primera Planta"];
  
  const [selectedFloor, setSelectedFloor] = useState(1);

  // Generar mesas dinámicamente según la planta seleccionada
  const activeFloorConfig = activeFloors.find(f => f.id === selectedFloor);
  const tableCount = activeFloorConfig ? activeFloorConfig.tableCount : 0;
  
  const mesas: Mesa[] = Array.from({ length: tableCount }).map((_, idx) => ({
    id: `M ${idx + 1}`,
    estado: "disponible", // TODO: Estado guardado dinámicamente a futuro
    floor: selectedFloor
  }));

  const currentOrder: OrderItem[] = [
    { id: 1, name: "Bacon", size: "personal", price: 35, quantity: 1, timestamp: "22/03/25 11:36", extras: [] },
    { id: 2, name: "Salami", size: "personal", price: 20, quantity: 1, timestamp: "22/03/25 11:55", extras: [] },
  ];

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
        />
      </Box>

      {/* Right side Order Panel */}
      <Box sx={{ width: 400, flexShrink: 0 }}>
        <OrderPanel order={currentOrder} />
      </Box>
    </Box>
  );
}
