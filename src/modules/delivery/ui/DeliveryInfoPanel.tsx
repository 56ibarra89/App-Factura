import React from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Select,
  MenuItem,
  Chip,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import type { Customer } from "../../customers";
import type {
  DeliveryDriver,
  DeliveryZone,
  DeliveryRulesConfig,
} from "../model/delivery.types";
import { useDeliveryQuickPrices } from "../hooks/useDeliveryQuickPrices";

interface DeliveryInfoPanelProps {
  phoneInput: string;
  transporteInput: string;
  selectedCustomer: Customer | null;
  selectedAddress: string;
  setTransporteInput: (val: string) => void;
  setSearchDialogOpen: (open: boolean) => void;
  setCustomerFormOpen: (open: boolean) => void;
  setSelectedAddress: (addr: string) => void;
  drivers: DeliveryDriver[];
  stats: { userId: string; todayDeliveries: number }[];
  selectedDriverId: string;
  setSelectedDriverId: (id: string) => void;
  selectedZone?: DeliveryZone | null;
  onSelectZone?: (zone: DeliveryZone) => void;
  activeZones?: DeliveryZone[];
  deliveryRules?: DeliveryRulesConfig;
}

export default function DeliveryInfoPanel({
  phoneInput,
  transporteInput,
  selectedCustomer,
  selectedAddress,
  setTransporteInput,
  setSearchDialogOpen,
  setCustomerFormOpen,
  setSelectedAddress,
  drivers,
  stats,
  selectedDriverId,
  setSelectedDriverId,
  selectedZone,
  onSelectZone,
  activeZones = [],
  deliveryRules,
}: DeliveryInfoPanelProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { quickPrices } = useDeliveryQuickPrices();

  const handleSelectZone = (zone: DeliveryZone) => {
    onSelectZone?.(zone);
    setTransporteInput(String(zone.price));
  };

  return (
    <Box sx={{ flex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Encabezado superior */}
        <Box
          sx={{
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)"
                : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "white",
            p: 2,
            boxShadow: "inset 0 -2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 8 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography sx={{ width: 100 }}>No Teléfono:</Typography>
                <Typography fontWeight="bold">{phoneInput || " "}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography sx={{ width: 100 }}>Cliente:</Typography>
                <Typography
                  fontWeight="bold"
                  color={
                    selectedCustomer
                      ? "#ffd54f"
                      : phoneInput.length >= 8
                      ? "#ffb74d"
                      : "rgba(255,255,255,0.7)"
                  }
                >
                  {selectedCustomer
                    ? selectedCustomer.name
                    : phoneInput.length >= 8
                    ? "NUEVO CLIENTE"
                    : " "}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography sx={{ width: 100, color: "rgba(255,255,255,0.8)" }}>
                  Dirección:
                </Typography>
                <Typography fontWeight="bold" color="#ffd54f">
                  {selectedAddress || " "}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                <Typography sx={{ width: 100, color: "rgba(255,255,255,0.8)" }}>
                  Motorizado:
                </Typography>
                <Select
                  size="small"
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  displayEmpty
                  sx={{
                    minWidth: 160,
                    color: selectedDriverId ? "#ffd54f" : "rgba(255,255,255,0.8)",
                    fontWeight: "bold",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ffd54f",
                    },
                    "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.8)" },
                  }}
                >
                  <MenuItem value="">
                    <em>Ninguno</em>
                  </MenuItem>
                  {drivers.map((d) => {
                    const driverStats = stats.find((s) => s.userId === d.id);
                    const count = driverStats?.todayDeliveries || 0;
                    return (
                      <MenuItem key={d.id} value={d.id}>
                        {d.firstName} {d.lastName} ({count})
                      </MenuItem>
                    );
                  })}
                </Select>
              </Box>
            </Grid>
            <Grid
              size={{ xs: 4 }}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "flex-end",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography sx={{ mr: 1, color: "rgba(255,255,255,0.8)" }}>
                  Transporte:
                </Typography>
                <TextField
                  size="small"
                  value={transporteInput}
                  onChange={(e) => setTransporteInput(e.target.value)}
                  inputProps={{ style: { textAlign: "right" } }}
                  sx={{
                    width: 90,
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 1,
                    input: { color: "white", fontWeight: "bold" },
                    "& fieldset": { border: "none" },
                  }}
                />
              </Box>
              {selectedZone && (
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5 }}
                >
                  Zona: {selectedZone.name}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>

        {/* Botonera de acciones intermedias */}
        <Box
          sx={{
            display: "flex",
            bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100",
            p: 1,
            gap: 1,
            flexWrap: "wrap",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate("/home")}
            startIcon={<ArrowBackIcon />}
            sx={{ flex: 1, minWidth: 100, textTransform: "none", borderRadius: 2 }}
          >
            Volver
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSearchDialogOpen(true)}
            startIcon={<SearchIcon />}
            sx={{ flex: 1, minWidth: 120, textTransform: "none", borderRadius: 2 }}
          >
            Buscar
          </Button>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            size="small"
            onClick={() => selectedCustomer && setCustomerFormOpen(true)}
            disabled={!selectedCustomer}
            startIcon={<PersonIcon />}
            sx={{ flex: 1, minWidth: 140, textTransform: "none", borderRadius: 2 }}
          >
            Modificar Cliente
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disableElevation
            size="small"
            onClick={() => selectedCustomer && setCustomerFormOpen(true)}
            disabled={!selectedCustomer}
            sx={{ flex: 1, minWidth: 150, textTransform: "none", borderRadius: 2 }}
          >
            Modificar Dirección
          </Button>
          <Button
            variant="contained"
            color="success"
            disableElevation
            size="small"
            onClick={() => selectedCustomer && setCustomerFormOpen(true)}
            disabled={!selectedCustomer}
            sx={{ flex: 1, minWidth: 150, textTransform: "none", borderRadius: 2 }}
          >
            Agregar Dirección
          </Button>
        </Box>

        {/* Tabla de direcciones */}
        <TableContainer sx={{ flexGrow: 1, bgcolor: "background.paper" }}>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
                }}
              >
                <TableCell
                  sx={{ width: "30%", fontWeight: "bold", color: "text.secondary" }}
                >
                  N° TELÉFONO
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>
                  DIRECCIÓN
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedCustomer &&
                selectedCustomer.addresses?.map((addr, idx) => (
                  <TableRow
                    key={idx}
                    hover
                    selected={selectedAddress === addr.address}
                    onClick={() => setSelectedAddress(addr.address)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>{selectedCustomer.phone || phoneInput}</TableCell>
                    <TableCell>{addr.address}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Notificación de regla de envío gratis si está activa */}
        {deliveryRules?.freeDeliveryEnabled && deliveryRules.freeDeliveryMinAmount > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 0.8,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(46, 125, 50, 0.15)"
                  : "rgba(46, 125, 50, 0.08)",
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocalShippingIcon color="success" fontSize="small" />
              <Typography variant="caption" fontWeight="bold" color="success.main">
                Promoción: Envío GRATIS en consumos a partir de C$
                {deliveryRules.freeDeliveryMinAmount.toFixed(2)}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              (El costo del repartidor es cubierto por el negocio)
            </Typography>
          </Box>
        )}

        {/* Selector inferior de Zonas de Delivery */}
        <Box
          sx={{
            display: "flex",
            p: 1.5,
            gap: 1,
            bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
            borderTop: `1px solid ${theme.palette.divider}`,
            overflowX: "auto",
          }}
        >
          {activeZones.length > 0 ? (
            activeZones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id;
              return (
                <Tooltip
                  key={zone.id}
                  title={
                    zone.neighborhoods && zone.neighborhoods.length > 0
                      ? `Barrios: ${zone.neighborhoods.join(", ")}`
                      : zone.name
                  }
                  arrow
                >
                  <Button
                    variant={isSelected ? "contained" : "outlined"}
                    disableElevation
                    onClick={() => handleSelectZone(zone)}
                    startIcon={<TwoWheelerIcon />}
                    sx={{
                      flex: 1,
                      minWidth: 140,
                      py: 1,
                      borderRadius: 3,
                      flexDirection: "column",
                      alignItems: "center",
                      textTransform: "none",
                      borderColor: isSelected ? "primary.main" : theme.palette.divider,
                      ...(isSelected && {
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }),
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      lineHeight={1.2}
                      noWrap
                    >
                      {zone.name}
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={isSelected ? "inherit" : "primary.main"}
                      lineHeight={1.2}
                      sx={{ my: 0.2 }}
                    >
                      C${zone.price}
                    </Typography>
                  </Button>
                </Tooltip>
              );
            })
          ) : (
            // Fallback a precios rápidos
            quickPrices.map((val, idx) => {
              const hasVal = val && val.trim() !== "";
              return (
                <Button
                  key={idx}
                  variant={hasVal ? "contained" : "outlined"}
                  disableElevation
                  onClick={() => {
                    if (hasVal) {
                      setTransporteInput(val);
                    }
                  }}
                  disabled={!hasVal}
                  sx={{
                    flex: 1,
                    height: 44,
                    borderRadius: 6,
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    ...(hasVal &&
                      theme.palette.mode === "light" && {
                        bgcolor: "primary.main",
                        color: "white",
                        border: "none",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        "&:hover": { bgcolor: "primary.dark" },
                      }),
                    ...(hasVal &&
                      theme.palette.mode === "dark" && {
                        bgcolor: "grey.800",
                        color: "white",
                        border: `1px solid ${theme.palette.divider}`,
                        "&:hover": { bgcolor: "grey.700" },
                      }),
                    ...(!hasVal && { borderColor: "transparent" }),
                  }}
                >
                  {hasVal ? `C$${val}` : ""}
                </Button>
              );
            })
          )}
        </Box>
      </Paper>
    </Box>
  );
}
