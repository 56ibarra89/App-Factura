import { Paper, Typography, Box, Chip, alpha } from "@mui/material";
import type { Mesa } from "../model/table.types";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import { memo } from "react";

interface Props {
  mesa: Mesa;
  isSelected?: boolean;
  onClick?: () => void;
}

interface MesaTheme {
  icon: JSX.Element;
  label: string;
  color: "error" | "warning" | "success";
}

const MesaCard = memo(({ mesa, isSelected = false, onClick }: Props) => {
  const getTheme = (): MesaTheme => {
    switch (mesa.estado) {
      case "ocupado":
        return {
          icon: <LocalDiningIcon sx={{ fontSize: 32 }} />,
          label: "Ocupado",
          color: "error",
        };
      case "reservado":
        return {
          icon: <EventSeatIcon sx={{ fontSize: 32 }} />,
          label: "Reservado",
          color: "warning",
        };
      case "disponible":
      default:
        return {
          icon: <CheckCircleOutlineIcon sx={{ fontSize: 32 }} />,
          label: "Disponible",
          color: "success",
        };
    }
  };

  const theme = getTheme();

  return (
    <Box sx={{ position: "relative", width: "100%" }} onClick={onClick}>
      <Paper
        elevation={0}
        sx={(muiTheme) => {
          const statusColor = muiTheme.palette[theme.color].main;
          return {
          width: "100%",
          aspectRatio: "1/1",
          minHeight: 145,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2,
          cursor: "pointer",
          bgcolor: "background.paper",
          color: statusColor,
          transition: "border-color 120ms ease-out, box-shadow 120ms ease-out, background-color 120ms ease-out",
          boxShadow: isSelected
            ? `0 0 0 2px ${alpha(statusColor, 0.2)}`
            : "none",
          border: "1px solid",
          borderColor: isSelected ? statusColor : "divider",
          position: "relative",
          overflow: "hidden",
          "&:hover": {
            borderColor: statusColor,
            bgcolor: alpha(statusColor, 0.04),
            boxShadow: `0 2px 8px ${alpha(statusColor, 0.14)}`,
          },
          "&:active": {
            bgcolor: alpha(statusColor, 0.08),
          },
        }}}
      >
        <Box className="mesa-icon" sx={{ display: "flex", mb: 1 }}>
          {theme.icon}
        </Box>
        <Typography
          variant="h4"
          fontWeight="800"
          sx={{
            zIndex: 1,
            mt: -0.5,
            color: "text.primary",
            letterSpacing: -1,
          }}
        >
          {mesa.id.split("-M")[1]}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 700,
            mt: -0.5,
            px: 1,
            textAlign: "center",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            width: "100%",
          }}
        >
          {mesa.reservationName || `MESA (P-${mesa.floor})`}
        </Typography>
        <Chip
          label={theme.label}
          color={theme.color}
          size="small"
          variant="outlined"
          sx={{
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
            height: 22,
            fontWeight: 700,
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        />
      </Paper>
    </Box>
  );
});

export default MesaCard;
