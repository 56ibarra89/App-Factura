import { Paper, Typography, Box, alpha } from "@mui/material";
import { Mesa } from "../../types/mesa.types";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import { LOGIN_COLORS } from "../../theme/loginTheme";

interface Props {
  mesa: Mesa;
  isSelected?: boolean;
  onClick?: () => void;
}

interface MesaTheme {
  bg: string;
  shadow: string;
  icon: JSX.Element;
  label: string;
  isNeutral?: boolean;
}

export default function MesaCard({ mesa, isSelected = false, onClick }: Props) {

  const getTheme = (): MesaTheme => {
    switch (mesa.estado) {
      case "ocupado":
        return {
          bg: `linear-gradient(135deg, ${LOGIN_COLORS.primary} 0%, ${LOGIN_COLORS.primaryDark} 100%)`,
          shadow: LOGIN_COLORS.primary,
          icon: <LocalDiningIcon sx={{ fontSize: 32, color: "white", mb: 1, opacity: 0.9 }} />,
          label: "Ocupado"
        };
      case "reservado":
        return {
          bg: "linear-gradient(135deg, #ffa726 0%, #f57c00 100%)",
          shadow: "#f57c00",
          icon: <EventSeatIcon sx={{ fontSize: 32, color: "white", mb: 1, opacity: 0.9 }} />,
          label: "Reservado"
        };
      case "disponible":
      default:
        return {
          bg: "white",
          shadow: "rgba(0,0,0,0.06)",
          icon: <CheckCircleOutlineIcon sx={{ fontSize: 32, color: "grey.400", mb: 1 }} />,
          label: "Disponible",
          isNeutral: true
        };
    }
  };

  const theme = getTheme();

  return (
    <Box sx={{ position: "relative", width: "100%" }} onClick={onClick}>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          aspectRatio: "1/1",
          minHeight: 145,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 5,
          cursor: "pointer",
          background: theme.bg,
          color: theme.isNeutral ? "text.primary" : "white",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: isSelected
            ? `0 0 0 4px ${LOGIN_COLORS.primary}, 0 12px 24px rgba(0,0,0,0.1)` 
            : theme.isNeutral 
              ? "0 4px 12px rgba(0,0,0,0.05)"
              : `0 12px 24px ${alpha(theme.shadow, 0.4)}`,
          border: theme.isNeutral ? "2px solid" : "2px solid transparent",
          borderColor: isSelected ? LOGIN_COLORS.primary : theme.isNeutral ? "grey.100" : "transparent",
          position: "relative",
          overflow: "hidden",
          "&:hover": {
            transform: "translateY(-8px) scale(1.02)",
            borderColor: theme.isNeutral ? LOGIN_COLORS.primary : "transparent",
            bgcolor: theme.isNeutral ? LOGIN_COLORS.primarySubtle : "inherit",
            boxShadow: theme.isNeutral
              ? `0 12px 20px ${LOGIN_COLORS.numpadHoverShadow}`
              : `0 16px 32px ${alpha(theme.shadow, 0.5)}`,
            "& .mesa-icon": {
              color: theme.isNeutral ? LOGIN_COLORS.primary : "white",
              transform: "scale(1.1)",
            }
          },
          "&:active": {
            transform: "scale(0.96)",
          }
        }}
      >
        <Box className="mesa-icon" sx={{ transition: "all 0.2s" }}>
          {theme.icon}
        </Box>
        <Typography variant="h4" fontWeight="800" sx={{ 
          zIndex: 1, 
          mt: -0.5,
          color: theme.isNeutral ? "text.primary" : "white",
          letterSpacing: -1
        }}>
          {mesa.id.split('-M')[1]}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 700, mt: -0.5, px: 1, textAlign: "center", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", width: "100%" }}>
          {mesa.reservationName || `MESA (P-${mesa.floor})`}
        </Typography>
      </Paper>

      <Box 
        sx={{
          position: "absolute",
          bottom: -10,
          left: "50%",
          transform: "translateX(-50%)",
          background: theme.isNeutral ? "white" : theme.shadow,
          color: theme.isNeutral ? "text.secondary" : "white",
          px: 1.5,
          py: 0.4,
          borderRadius: 2,
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          border: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <Typography variant="caption" fontWeight="900" sx={{ 
          fontSize: "0.65rem", 
          textTransform: "uppercase", 
          letterSpacing: 0.8
        }}>
          {theme.label}
        </Typography>
      </Box>
    </Box>
  );
}
