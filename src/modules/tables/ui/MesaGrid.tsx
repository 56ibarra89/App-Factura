import { Box } from "@mui/material";
import MesaCard from "./MesaCard";
import type { Mesa } from "../model/table.types";

interface Props {
  mesas: Mesa[];
  selectedFloor: number;
  selectedMesaId: string | null;
  onSelectMesa: (id: string) => void;
}

export default function MesaGrid({ mesas, selectedFloor, selectedMesaId, onSelectMesa }: Props) {
  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 4,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 3,
        alignContent: "start",
      }}
    >
      {mesas
        .filter((m) => m.floor === selectedFloor)
        .map((mesa) => (
          <MesaCard 
            key={mesa.id} 
            mesa={mesa} 
            isSelected={selectedMesaId === mesa.id}
            onClick={() => onSelectMesa(mesa.id)}
          />
        ))}
    </Box>
  );
}
