import { Grid, Button, alpha } from "@mui/material";
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LogoutIcon from '@mui/icons-material/Logout';
import { LOGIN_COLORS } from "../../theme/loginTheme";

interface Props {
  onSalir: () => void;
  onReservar: () => void;
  isReserved?: boolean;
}

export default function OrderActions({ onSalir, onReservar, isReserved = false }: Props) {
  const primaryColor = LOGIN_COLORS.primary;
  const successColor = "#2e7d32";
  const cancelColor = "#d32f2f"; // Red for cancel

  return (
    <Grid container spacing={1.5}>
      <Grid size={6}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<PrintIcon />}
          sx={{
            py: 1.5,
            bgcolor: primaryColor,
            color: "white",
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2.5,
            boxShadow: `0 4px 12px ${LOGIN_COLORS.primaryShadow}`,
            "&:hover": { 
              bgcolor: LOGIN_COLORS.primaryDark, 
              boxShadow: `0 6px 16px ${LOGIN_COLORS.primaryShadow}`,
              transform: "translateY(-2px)"
            },
            transition: "all 0.2s"
          }}
        >
          Imprimir
        </Button>
      </Grid>

      <Grid size={6}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<EditIcon />}
          sx={{ 
            py: 1.5,
            color: "text.primary",
            borderColor: "grey.300",
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2.5,
            borderWidth: 1.5,
            "&:hover": { 
              borderWidth: 1.5,
              bgcolor: "grey.50",
              borderColor: "grey.400"
            }
          }}
        >
          Editar
        </Button>
      </Grid>

      <Grid size={12}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<MergeTypeIcon />}
          sx={{
            py: 1.5,
            bgcolor: LOGIN_COLORS.primarySubtle,
            color: LOGIN_COLORS.primary,
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2.5,
            boxShadow: "none",
            "&:hover": { 
              bgcolor: alpha(LOGIN_COLORS.primary, 0.08), 
              boxShadow: "none" 
            }
          }}
        >
          Unir Mesa o Mover Pedido
        </Button>
      </Grid>

      <Grid size={6}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<EventSeatIcon />}
          sx={{ 
            py: 1.5,
            bgcolor: isReserved ? cancelColor : successColor, 
            color: "white",
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2.5,
            boxShadow: `0 4px 12px ${alpha(isReserved ? cancelColor : successColor, 0.3)}`,
            "&:hover": { 
              bgcolor: isReserved ? "#b71c1c" : "#1b5e20", 
              boxShadow: `0 6px 16px ${alpha(isReserved ? cancelColor : successColor, 0.4)}`,
              transform: "translateY(-2px)"
            },
            transition: "all 0.2s"
          }}
          onClick={onReservar}
        >
          {isReserved ? "Liberar Mesa" : "Reservar"}
        </Button>
      </Grid>

      <Grid size={6}>
        <Button
          fullWidth
          variant="text"
          startIcon={<LogoutIcon />}
          sx={{ 
            py: 1.5,
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2.5,
            color: "error.main",
            "&:hover": {
              bgcolor: "error.main",
              color: "white",
              transform: "translateY(-2px)"
            },
            transition: "all 0.2s"
          }}
          onClick={onSalir}
        >
          Salir
        </Button>
      </Grid>
    </Grid>
  );
}
