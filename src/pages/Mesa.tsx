import { Box } from "@mui/material";
import { useState } from "react";
import SectionSidebar from "../components/mesas/SectionSidebar";
import MesaGrid from "../components/mesas/MesaGrid";
import OrderPanel from "../components/mesas/OrderPanel";
import { Mesa } from "../types/mesa.types";
import { OrderItem } from "../types/order.types";

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
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f4f4f4" }}>

      <SectionSidebar
        floors={floors}
        selectedFloor={selectedFloor}
        onChangeFloor={setSelectedFloor}
      />

      <MesaGrid
        mesas={mesas}
        selectedFloor={selectedFloor}
      />

      <OrderPanel order={currentOrder} />

    </Box>
  );
}
