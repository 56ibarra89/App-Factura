import { Box } from "@mui/material";
import MesaCard from "./MesaCard";
import { Mesa } from "../../types/mesa.types";

interface Props {
  mesas: Mesa[];
  selectedFloor: number;
}

export default function MesaGrid({ mesas, selectedFloor }: Props) {
  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 4,
        display: "flex",
        gap: 3,
        flexWrap: "wrap",
        alignContent: "flex-start",
      }}
    >
      {mesas
        .filter((m) => m.floor === selectedFloor)
        .map((mesa) => (
          <MesaCard key={mesa.id} mesa={mesa} />
        ))}
    </Box>
  );
}
