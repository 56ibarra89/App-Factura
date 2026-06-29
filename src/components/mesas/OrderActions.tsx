import { Grid, Button, alpha } from "@mui/material";
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import EditIcon from '@mui/icons-material/Edit';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import MoveUpIcon from '@mui/icons-material/MoveUp';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
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
  canModifyOrder?: boolean;
  onToggleOccupancy?: () => void;
  isOccupied?: boolean;
  cannotReleaseTable?: boolean;
}

export default function OrderActions({ 
  onSalir, 
  onReservar, 
  isReserved = false, 
  onEditOrder, 
  onCheckout,
  onUnirMesas,
  onMoverPedido,
  hasActiveOrder = false,
  canModifyOrder = true,
  onToggleOccupancy,
  isOccupied = false,
  cannotReleaseTable = false
}: Props) {
  const successColor = "#2e7d32";
  const cancelColor = "#d32f2f"; // Red for cancel

  return (
    <Grid container spacing={0.5}>
      <Grid size={12}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<EditIcon />}
          size="small"
          sx={{ 
            py: 0.5,
            fontSize: "0.85rem",
            color: "text.primary",
            borderColor: "grey.300",
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2.5,
            borderWidth: 1.5,
            "&:hover": { 
              borderWidth: 1.5,
              bgcolor: "action.hover",
              borderColor: "grey.400"
            }
          }}
          onClick={onEditOrder}
          disabled={!canModifyOrder && hasActiveOrder}
        >
          Pedir / Editar
        </Button>
      </Grid>

      <Grid size={12}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<ShoppingCartCheckoutIcon />}
          size="small"
          sx={{
            py: 0.5,
            bgcolor: successColor,
            color: "white",
            textTransform: "none",
            fontWeight: "800",
            borderRadius: 2,
            fontSize: "0.9rem",
            boxShadow: `0 4px 12px ${alpha(successColor, 0.4)}`,
            "&:hover": { 
              bgcolor: "#1b5e20", 
              boxShadow: `0 6px 16px ${alpha(successColor, 0.5)}`,
              transform: "translateY(-2px)"
            },
            transition: "all 0.2s"
          }}
          onClick={onCheckout}
          disabled={!hasActiveOrder || !canModifyOrder}
        >
          Cobrar / Cerrar Mesa
        </Button>
      </Grid>

      <Grid size={12}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<PeopleIcon />}
          size="small"
          sx={{
            py: 0.5,
            bgcolor: isOccupied ? "#f57c00" : "#1976d2", // Orange if occupied, Blue if free
            color: "white",
            textTransform: "none",
            fontWeight: "800",
            borderRadius: 2,
            fontSize: "0.9rem",
            boxShadow: `0 4px 12px ${alpha(isOccupied ? "#f57c00" : "#1976d2", 0.4)}`,
            "&:hover": { 
              bgcolor: isOccupied ? "#e65100" : "#1565c0", 
              boxShadow: `0 6px 16px ${alpha(isOccupied ? "#f57c00" : "#1976d2", 0.5)}`,
              transform: "translateY(-2px)"
            },
            transition: "all 0.2s",
            "&.Mui-disabled": {
              bgcolor: "action.disabledBackground",
              color: "text.disabled",
              boxShadow: "none"
            }
          }}
          onClick={onToggleOccupancy}
          // Removemos el disabled de MUI aquí para que el click pase y muestre el alert de validación.
          // O si preferimos, lo dejamos disabled pero con estilos correctos. Lo dejaremos disabled.
          disabled={cannotReleaseTable && isOccupied}
        >
          {isOccupied ? "Liberar Mesa" : "Ocupar Mesa"}
        </Button>
      </Grid>

      <Grid size={6}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<MergeTypeIcon />}
          onClick={onUnirMesas}
          size="small"
          sx={{
            py: 0.5,
            fontSize: "0.85rem",
            bgcolor: LOGIN_COLORS.primarySubtle,
            color: LOGIN_COLORS.primary,
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2,
            boxShadow: "none",
            "&:hover": { 
              bgcolor: alpha(LOGIN_COLORS.primary, 0.08), 
              boxShadow: "none" 
            }
          }}
          disabled={!hasActiveOrder || !canModifyOrder}
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
          disabled={!hasActiveOrder || !canModifyOrder}
          size="small"
          sx={{
            py: 0.5,
            fontSize: "0.85rem",
            bgcolor: alpha("#ff9800", 0.1),
            color: "#ed6c02",
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2,
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
          size="small"
          sx={{ 
            py: 0.5,
            fontSize: "0.85rem",
            bgcolor: isReserved ? cancelColor : successColor, 
            color: "white",
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2,
            boxShadow: `0 4px 12px ${alpha(isReserved ? cancelColor : successColor, 0.3)}`,
            "&:hover": { 
              bgcolor: isReserved ? "#b71c1c" : "#1b5e20", 
              boxShadow: `0 6px 16px ${alpha(isReserved ? cancelColor : successColor, 0.4)}`,
              transform: "translateY(-2px)"
            },
            transition: "all 0.2s",
            "&.Mui-disabled": {
              bgcolor: "action.selected",
              color: "grey.500"
            }
          }}
          onClick={onReservar}
          disabled={hasActiveOrder && !isReserved}
        >
          {isReserved ? "Liberar Mesa" : "Reservar"}
        </Button>
      </Grid>

      <Grid size={6}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          size="small"
          sx={{ 
            py: 0.5,
            fontSize: "0.85rem",
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2,
            borderWidth: 1.5,
            "&:hover": {
              borderWidth: 1.5,
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
