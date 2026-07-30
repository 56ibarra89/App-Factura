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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { Customer } from "../../customers";
import type { DeliveryDriver } from "../model/delivery.types";
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
  selectedDriverId: string;
  setSelectedDriverId: (id: string) => void;
  stats: { userId: string; todayDeliveries: number }[];
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
  selectedDriverId,
  setSelectedDriverId,
  stats,
}: DeliveryInfoPanelProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { quickPrices } = useDeliveryQuickPrices();

  return (
    <Box sx={{ flex: { xs: 1, lg: 3 }, minWidth: 0 }}>
      <Paper sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper", overflow: "hidden" }}>
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
                <Typography sx={{ width: 100 }}>No Telefono:</Typography>
                <Typography fontWeight="bold">{phoneInput || " "}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography sx={{ width: 100 }}>Cliente:</Typography>
                <Typography
                  fontWeight="bold"
                  color={selectedCustomer ? "#ffd54f" : phoneInput.length >= 8 ? "#ffb74d" : "rgba(255,255,255,0.7)"}
                >
                  {selectedCustomer ? selectedCustomer.name : phoneInput.length >= 8 ? "NUEVO CLIENTE" : " "}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography sx={{ width: 100, color: "rgba(255,255,255,0.8)" }}>Direccion:</Typography>
                <Typography fontWeight="bold" color="#ffd54f">
                  {selectedAddress || " "}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mt: 3 }}>
                <Typography sx={{ width: 100, color: "rgba(255,255,255,0.8)" }}>Motorizado:</Typography>
                <Select
                  size="small"
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  displayEmpty
                  sx={{
                    minWidth: 150,
                    color: selectedDriverId ? "#ffd54f" : "rgba(255,255,255,0.8)",
                    fontWeight: "bold",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ffd54f" },
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
            <Grid size={{ xs: 4 }} sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "flex-end" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography sx={{ mr: 1, color: "rgba(255,255,255,0.8)" }}>Transporte:</Typography>
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
            </Grid>
          </Grid>
        </Box>

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
          <Button variant="outlined" size="small" onClick={() => navigate("/home")} startIcon={<ArrowBackIcon />} sx={{ flex: 1, minWidth: 100, textTransform: "none", borderRadius: 2 }}>Volver</Button>
          <Button variant="outlined" size="small" onClick={() => setSearchDialogOpen(true)} startIcon={<SearchIcon />} sx={{ flex: 1, minWidth: 120, textTransform: "none", borderRadius: 2 }}>Buscar</Button>
          <Button variant="contained" color="primary" disableElevation size="small" onClick={() => selectedCustomer && setCustomerFormOpen(true)} disabled={!selectedCustomer} startIcon={<PersonIcon />} sx={{ flex: 1, minWidth: 140, textTransform: "none", borderRadius: 2 }}>Modificar Cliente</Button>
          <Button variant="contained" color="secondary" disableElevation size="small" onClick={() => selectedCustomer && setCustomerFormOpen(true)} disabled={!selectedCustomer} sx={{ flex: 1, minWidth: 150, textTransform: "none", borderRadius: 2 }}>Modificar Direccion</Button>
          <Button variant="contained" color="success" disableElevation size="small" onClick={() => selectedCustomer && setCustomerFormOpen(true)} disabled={!selectedCustomer} sx={{ flex: 1, minWidth: 150, textTransform: "none", borderRadius: 2 }}>Agregar Direccion</Button>
        </Box>

        <TableContainer sx={{ flexGrow: 1, bgcolor: "background.paper" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50" }}>
                <TableCell sx={{ width: "30%", fontWeight: "bold", color: "text.secondary" }}>N° TELEFONO</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>DIRECCION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedCustomer && selectedCustomer.addresses?.map((addr, idx) => (
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

        <Box sx={{ display: "flex", p: 1.5, gap: 1, bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50", borderTop: `1px solid ${theme.palette.divider}` }}>
          {quickPrices.map((val, idx) => {
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
                  ...(hasVal && theme.palette.mode === "light" && {
                    bgcolor: "primary.main",
                    color: "white",
                    border: "none",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    "&:hover": { bgcolor: "primary.dark" },
                  }),
                  ...(hasVal && theme.palette.mode === "dark" && {
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
          })}
        </Box>
      </Paper>
    </Box>
  );
}
