import { useState, MouseEvent } from "react";
import {
  Grid,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import EditIcon from "@mui/icons-material/Edit";
import MergeTypeIcon from "@mui/icons-material/MergeType";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleIcon from "@mui/icons-material/People";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SettingsIcon from "@mui/icons-material/Settings";

interface Props {
  onSalir: () => void;
  onReservar: () => void;
  isReserved?: boolean;
  onEditOrder?: () => void;
  onCheckout?: () => void;
  onUnirMesas?: () => void;
  onMoverPedido?: () => void;
  onDividirCuenta?: () => void;
  hasActiveOrder?: boolean;
  canCheckoutOrder?: boolean;
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
  onDividirCuenta,
  hasActiveOrder = false,
  canCheckoutOrder = false,
  canModifyOrder = true,
  onToggleOccupancy,
  isOccupied = false,
  cannotReleaseTable = false,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleOpenMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Grid container spacing={1}>
      {}

      {}
      <Grid size={12}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          size="medium"
          sx={{
            py: 0.9,
            fontSize: "0.95rem",
            textTransform: "none",
            fontWeight: "800",
            borderRadius: 2.5,
            boxShadow: "none",
            transition: "background-color 120ms ease-out",
          }}
          onClick={onEditOrder}
          disabled={!onEditOrder || (!canModifyOrder && hasActiveOrder)}
        >
          Pedir / Agregar Ítems
        </Button>
      </Grid>

      {}
      <Grid size={12}>
        <Button
          fullWidth
          variant="contained"
          color="success"
          startIcon={<ShoppingCartCheckoutIcon />}
          size="medium"
          sx={{
            py: 0.8,
            textTransform: "none",
            fontWeight: "800",
            borderRadius: 2.5,
            fontSize: "0.95rem",
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
            transition: "background-color 120ms ease-out",
          }}
          onClick={onCheckout}
          disabled={!canCheckoutOrder || !canModifyOrder}
        >
          Cobrar / Cerrar Mesa
        </Button>
      </Grid>

      {/* ── MENÚ DE ACCIONES SECUNDARIAS DE MESA ── */}
      <Grid size={12}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<SettingsIcon />}
          endIcon={<KeyboardArrowDownIcon />}
          size="medium"
          onClick={handleOpenMenu}
          sx={{
            py: 0.8,
            bgcolor: "action.hover",
            color: "text.primary",
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2.5,
            fontSize: "0.88rem",
            boxShadow: "none",
            border: "1px solid",
            borderColor: "divider",
            "&:hover": {
              bgcolor: "action.selected",
              boxShadow: "none",
            },
          }}
        >
          Acciones de Mesa
        </Button>

        {/* Menú Desplegable Contextual */}
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleCloseMenu}
          PaperProps={{
            elevation: 3,
            sx: {
              minWidth: 220,
              borderRadius: 2.5,
              mt: 0.5,
              p: 0.5,
            },
          }}
        >
          {/* Opción 1: Dividir Cuenta (¡NUEVO!) */}
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              if (onDividirCuenta) onDividirCuenta();
            }}
            disabled={!canCheckoutOrder}
            sx={{ py: 1, borderRadius: 1.5 }}
          >
            <ListItemIcon>
              <CallSplitIcon color={canCheckoutOrder ? "primary" : "disabled"} fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Dividir Cuenta"
              secondary="Repartir consumo por persona"
              primaryTypographyProps={{ fontWeight: 700, fontSize: "0.88rem" }}
              secondaryTypographyProps={{ fontSize: "0.72rem" }}
            />
          </MenuItem>

          <Divider sx={{ my: 0.5 }} />

          {/* Opción 2: Unir Mesa */}
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              if (onUnirMesas) onUnirMesas();
            }}
            disabled={!canModifyOrder}
            sx={{ py: 1, borderRadius: 1.5 }}
          >
            <ListItemIcon>
              <MergeTypeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Unir Mesa"
              primaryTypographyProps={{ fontWeight: 600, fontSize: "0.88rem" }}
            />
          </MenuItem>

          {/* Opción 3: Mover Pedido */}
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              if (onMoverPedido) onMoverPedido();
            }}
            disabled={!canModifyOrder}
            sx={{ py: 1, borderRadius: 1.5 }}
          >
            <ListItemIcon>
              <MoveUpIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Mover Pedido"
              primaryTypographyProps={{ fontWeight: 600, fontSize: "0.88rem" }}
            />
          </MenuItem>

          <Divider sx={{ my: 0.5 }} />

          {/* Opción 4: Reservar / Liberar Reserva */}
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              onReservar();
            }}
            disabled={hasActiveOrder && !isReserved}
            sx={{ py: 1, borderRadius: 1.5 }}
          >
            <ListItemIcon>
              <EventSeatIcon fontSize="small" color={isReserved ? "error" : "success"} />
            </ListItemIcon>
            <ListItemText
              primary={isReserved ? "Liberar Reserva" : "Reservar Mesa"}
              primaryTypographyProps={{ fontWeight: 600, fontSize: "0.88rem" }}
            />
          </MenuItem>

          {/* Opción 5: Ocupar / Liberar Estado */}
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              if (onToggleOccupancy) onToggleOccupancy();
            }}
            disabled={cannotReleaseTable && isOccupied}
            sx={{ py: 1, borderRadius: 1.5 }}
          >
            <ListItemIcon>
              <PeopleIcon fontSize="small" color={isOccupied ? "warning" : "info"} />
            </ListItemIcon>
            <ListItemText
              primary={isOccupied ? "Liberar Estado de Mesa" : "Ocupar Mesa"}
              primaryTypographyProps={{ fontWeight: 600, fontSize: "0.88rem" }}
            />
          </MenuItem>
        </Menu>
      </Grid>

      {/* ── BOTÓN SALIR ── */}
      <Grid size={12} sx={{ mt: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          size="small"
          sx={{
            py: 0.6,
            fontSize: "0.85rem",
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2,
            borderWidth: 1.5,
            "&:hover": {
              borderWidth: 1.5,
              bgcolor: "error.main",
              color: "white",
            },
          }}
          onClick={onSalir}
        >
          Salir
        </Button>
      </Grid>
    </Grid>
  );
}

