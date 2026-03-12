import { Paper, Typography } from "@mui/material";
import { Mesa } from "../../types/mesa.types";

interface Props {
  mesa: Mesa;
}

export default function MesaCard({ mesa }: Props) {

  const getColor = () => {
    switch (mesa.estado) {
      case "reservado":
        return "#2ecc71";
      case "ocupado":
        return "#ff9800";
      default:
        return "#4482ff";
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 140,
        height: 140,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 3,
        cursor: "pointer",
        bgcolor: getColor(),
        color: "white",
        transition: "0.2s",
        "&:hover": {
          transform: "scale(1.05)",
          filter: "brightness(0.9)",
        },
      }}
    >
      <Typography variant="h5" fontWeight="bold">
        {mesa.id}
      </Typography>

      {mesa.estado === "reservado" && (
        <Typography variant="body2" fontWeight={500}>
          Reservado
        </Typography>
      )}
    </Paper>
  );
}
