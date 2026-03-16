import { Paper, Typography, Box, alpha } from "@mui/material";
import { Mesa } from "../../types/mesa.types";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LocalDiningIcon from '@mui/icons-material/LocalDining';

interface Props {
  mesa: Mesa;
}

export default function MesaCard({ mesa }: Props) {

  const getTheme = () => {
    switch (mesa.estado) {
      case "reservado":
        return {
          bg: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
          shadow: "#27ae60",
          icon: <EventSeatIcon sx={{ fontSize: 32, color: "white", mb: 1, opacity: 0.9 }} />,
          label: "Reservado"
        };
      case "ocupado":
        return {
          bg: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
          shadow: "#f57c00",
          icon: <LocalDiningIcon sx={{ fontSize: 32, color: "white", mb: 1, opacity: 0.9 }} />,
          label: "Ocupado"
        };
      case "disponible":
      default:
        return {
          bg: "linear-gradient(135deg, #4482ff 0%, #2962ff 100%)",
          shadow: "#2962ff",
          icon: <CheckCircleOutlineIcon sx={{ fontSize: 32, color: "white", mb: 1, opacity: 0.9 }} />,
          label: "Disponible"
        };
    }
  };

  const theme = getTheme();

  return (
    <Box sx={{ position: "relative", m: 1 }}>
      <Paper
        elevation={0}
        sx={{
          width: 140,
          height: 140,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "32px",
          cursor: "pointer",
          background: theme.bg,
          color: "white",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: `0 10px 20px -5px ${alpha(theme.shadow, 0.5)}, 0 4px 10px -4px ${alpha('#000', 0.2)}`,
          border: "2px solid rgba(255,255,255,0.2)",
          position: "relative",
          overflow: "hidden",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: `0 14px 28px -6px ${alpha(theme.shadow, 0.6)}, 0 8px 16px -6px ${alpha('#000', 0.2)}`,
            "&::after": {
              transform: "translate(-50%, -50%) scale(1)",
              opacity: 1
            }
          },
          "&:active": {
            transform: "translateY(-2px) scale(0.98)",
          },
          // Soft shiny overlay effect (glassy top)
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "40%",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)",
            borderRadius: "32px 32px 0 0",
            pointerEvents: "none"
          },
          // Glow effect on hover
          "&::after": {
            content: '""',
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "120%",
            height: "120%",
            background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
            transform: "translate(-50%, -50%) scale(0.8)",
            opacity: 0,
            transition: "all 0.4s ease-out",
            pointerEvents: "none",
            borderRadius: "50%"
          }
        }}
      >
        {theme.icon}
        <Typography variant="h5" fontWeight="800" sx={{ textShadow: "0px 2px 4px rgba(0,0,0,0.3)", zIndex: 1, mt: -0.5 }}>
          {mesa.id}
        </Typography>
      </Paper>

      <Box 
        sx={{
          position: "absolute",
          bottom: -12,
          left: "50%",
          transform: "translateX(-50%)",
          background: "white",
          color: "text.primary",
          px: 2,
          py: 0.5,
          borderRadius: "16px",
          boxShadow: `0 4px 12px ${alpha(theme.shadow, 0.3)}`,
          border: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <Typography variant="caption" fontWeight="900" sx={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.5, color: theme.shadow }}>
          {theme.label}
        </Typography>
      </Box>
    </Box>
  );
}
