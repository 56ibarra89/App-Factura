import { Grid, Button, alpha } from "@mui/material";
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import EditIcon from '@mui/icons-material/Edit';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import MoveUpIcon from '@mui/icons-material/MoveUp';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LogoutIcon from '@mui/icons-material/Logout';
import { LOGIN_COLORS } from "../../theme/loginTheme";

interface Props {
  onSalir: () => void;
  onReservar: () => void;
  isReserved?: boolean;
  onEditOrder?: () => void;
  onCheckout?: () => void;
  onUnirMesas?: () => void;
  onMoverPedido?: () => void;
  hasActiveOrder?: boolean;
}

export default function OrderActions({ 
  onSalir, 
  onReservar, 
  isReserved = false, 
  onEditOrder, 
  onCheckout,
  onUnirMesas,
  onMoverPedido,
  hasActiveOrder = false
}: Props) {
  const successColor = "#2e7d32";
  const cancelColor = "#d32f2f"; // Red for cancel

  return (
    <Grid container spacing={1.5}>
      <Grid size={12}>
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
          onClick={onEditOrder}
        >
          Pedir / Editar
        </Button>
      </Grid>

      <Grid size={12}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<ShoppingCartCheckoutIcon />}
          sx={{
            py: 1.5,
            bgcolor: successColor,
            color: "white",
            textTransform: "none",
            fontWeight: "900",
            borderRadius: 2.5,
            fontSize: "1rem",
            boxShadow: `0 4px 12px ${alpha(successColor, 0.4)}`,
            "&:hover": { 
              bgcolor: "#1b5e20", 
              boxShadow: `0 6px 16px ${alpha(successColor, 0.5)}`,
              transform: "translateY(-2px)"
            },
            transition: "all 0.2s"
          }}
          onClick={onCheckout}
          disabled={!hasActiveOrder}
        >
          Cobrar / Cerrar Mesa
        </Button>
      </Grid>

      <Grid size={6}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<MergeTypeIcon />}
          onClick={onUnirMesas}
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
          Unir Mesa
        </Button>
      </Grid>

      <Grid size={6}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<MoveUpIcon />}
          onClick={onMoverPedido}
          disabled={!hasActiveOrder}
          sx={{
            py: 1.5,
            bgcolor: alpha("#ff9800", 0.1),
            color: "#ed6c02",
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2.5,
            boxShadow: "none",
            "&:hover": { 
              bgcolor: alpha("#ff9800", 0.2), 
              boxShadow: "none" 
            }
          }}
        >
          Mover Pedido
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
