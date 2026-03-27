import { Box } from "@mui/material";
import { useState } from "react";
import SectionSidebar from "../components/mesas/SectionSidebar";
import MesaGrid from "../components/mesas/MesaGrid";
import OrderPanel from "../components/mesas/OrderPanel";
import { Mesa } from "../types/mesa.types";
import { OrderItem } from "../types/order.types";

import { LOGIN_GRADIENTS } from "../theme/loginTheme";

const floors = [
  "Primera Planta", "Segunda Planta", "Tercera Planta", "Cuarta Planta",
  "Quinta Planta", "Sexta Planta", "Séptima Planta", "Octava Planta"
];

export default function MesasPage() {

  const [selectedFloor, setSelectedFloor] = useState(1);

  const mesas: Mesa[] = [
    { id: "M 1", estado: "reservado", floor: 1 },
    { id: "M 2", estado: "disponible", floor: 1 },
    { id: "M 7", estado: "disponible", floor: 1 },
  ];

  const currentOrder: OrderItem[] = [
    { id: 1, name: "Bacon", size: "Grande", price: 35, quantity: 1, timestamp: "22/03/25 11:36" },
    { id: 2, name: "Salami", size: "Personal", price: 20, quantity: 1, timestamp: "22/03/25 11:55" },
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
        overflow: "hidden",
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
