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
  Divider,
  useTheme
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Customer } from "../../types/customer.types";

interface DeliveryInfoPanelProps {
  phoneInput: string;
  transporteInput: string;
  focusedField: "phone" | "transporte";
  selectedCustomer: Customer | null;
  selectedAddress: string;
  setFocusedField: (field: "phone" | "transporte") => void;
  setTransporteInput: (val: string) => void;
  setSearchDialogOpen: (open: boolean) => void;
  setCustomerFormOpen: (open: boolean) => void;
  setSelectedAddress: (addr: string) => void;
}

export default function DeliveryInfoPanel({
  phoneInput,
  transporteInput,
  focusedField,
  selectedCustomer,
  selectedAddress,
  setFocusedField,
  setTransporteInput,
  setSearchDialogOpen,
  setCustomerFormOpen,
  setSelectedAddress,
}: DeliveryInfoPanelProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ flex: { xs: 1, lg: 3 }, minWidth: 0 }}>
      <Paper sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper", overflow: "hidden" }}>
        {/* Header / Info Section */}
        <Box sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.800', color: "white", p: 2 }}>
          <Grid container spacing={2}>
            {/* @ts-expect-error MUI Grid TS typing issue */}
            <Grid item xs={8}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography sx={{ width: 100 }}>No Telefono:</Typography>
                <Typography fontWeight="bold">{phoneInput || " "}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography sx={{ width: 100 }}>Cliente:</Typography>
                <Typography fontWeight="bold" color="yellow">
                  {selectedCustomer ? selectedCustomer.name : " "}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography sx={{ width: 100 }}>Direccion:</Typography>
                <Typography fontWeight="bold" color="yellow">
                  {selectedAddress || " "}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mt: 3 }}>
                <Typography sx={{ width: 100 }}>Motorizado:</Typography>
                <Typography fontWeight="bold" color="orange">Ninguno</Typography>
              </Box>
            </Grid>
            {/* @ts-expect-error MUI Grid TS typing issue */}
            <Grid item xs={4} sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "flex-end" }}>
               <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={{ mr: 1 }}>Transporte:</Typography>
                  <TextField 
                     size="small" 
                     value={transporteInput}
                     onClick={() => setFocusedField("transporte")}
                     inputProps={{ style: { textAlign: "right" } }}
                     sx={{ 
                       width: 80,
                       bgcolor: focusedField === "transporte" 
                         ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#ffffcc') 
                         : (theme.palette.mode === 'dark' ? 'transparent' : 'white'),
                       input: { color: "text.primary" }
                     }}
                  />
               </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Acciones */}
        <Box sx={{ display: "flex", bgcolor: theme.palette.action.hover, p: 0.5, flexWrap: "wrap" }}>
           <Button size="small" onClick={() => navigate("/home")} startIcon={<ArrowBackIcon />} sx={{ flex: 1, minWidth: 100, color: "text.primary", textTransform: "none" }}>Volver</Button>
           <Divider orientation="vertical" flexItem />
           <Button size="small" onClick={() => setSearchDialogOpen(true)} startIcon={<SearchIcon />} sx={{ flex: 1, minWidth: 120, color: "text.primary", textTransform: "none" }}>Buscar</Button>
           <Divider orientation="vertical" flexItem />
           <Button size="small" onClick={() => selectedCustomer && setCustomerFormOpen(true)} disabled={!selectedCustomer} startIcon={<PersonIcon />} sx={{ flex: 1, minWidth: 140, color: "text.primary", textTransform: "none" }}>Modifica Cliente</Button>
           <Divider orientation="vertical" flexItem />
           <Button size="small" onClick={() => selectedCustomer && setCustomerFormOpen(true)} disabled={!selectedCustomer} sx={{ flex: 1, minWidth: 150, color: "text.primary", textTransform: "none" }}>Modificar Direccion</Button>
           <Divider orientation="vertical" flexItem />
           <Button size="small" onClick={() => selectedCustomer && setCustomerFormOpen(true)} disabled={!selectedCustomer} sx={{ flex: 1, minWidth: 150, color: "text.primary", textTransform: "none" }}>Agregar Direccion</Button>
        </Box>

        {/* Tabla Direcciones */}
        <TableContainer sx={{ flexGrow: 1, bgcolor: "background.paper" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300' }}>
                <TableCell sx={{ width: "30%", fontWeight: "bold" }}>No TELEFONO</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>DIRECCION</TableCell>
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

        {/* Botones de Moneda Rápidos */}
        <Box sx={{ display: "flex", p: 1, gap: 1, bgcolor: "background.default" }}>
           {["C$30.00", "C$50.00", "", "", "", "", ""].map((val, idx) => (
              <Button 
                key={idx} 
                variant="outlined" 
                onClick={() => {
                  if (val) {
                    const amount = val.replace("C$", "");
                    setTransporteInput(amount);
                    setFocusedField("transporte"); // opcional: enfocarlo para ver que se actualizó
                  }
                }}
                sx={{ 
                  flex: 1, 
                  height: 40, 
                  bgcolor: val ? (theme.palette.mode === 'dark' ? 'grey.800' : "#fff9c4") : "transparent",
                  color: "text.primary"
                }}
              >
                {val}
              </Button>
           ))}
        </Box>
      </Paper>
    </Box>
  );
}
