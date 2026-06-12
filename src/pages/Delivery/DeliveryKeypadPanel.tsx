import React from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  Avatar,
  useTheme
} from "@mui/material";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BackspaceIcon from "@mui/icons-material/Backspace";
import { Customer } from "../../types/customer.types";

interface DeliveryKeypadPanelProps {
  phoneInput: string;
  focusedField: "phone" | "transporte";
  selectedCustomer: Customer | null;
  setFocusedField: (field: "phone" | "transporte") => void;
  handleConfirm: () => void;
  handleKeypadPress: (val: string) => void;
}

export default function DeliveryKeypadPanel({
  phoneInput,
  focusedField,
  selectedCustomer,
  setFocusedField,
  handleConfirm,
  handleKeypadPress
}: DeliveryKeypadPanelProps) {
  const theme = useTheme();

  return (
    <Box sx={{ flex: 1, minWidth: 350, maxWidth: 450 }}>
      <Paper sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper", p: 1 }}>
        
        {/* Top Area (Listo / Profile) */}
        <Box sx={{ 
            height: 180, 
            bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
            mb: 1, 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center",
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            ...(selectedCustomer && { 
              bgcolor: theme.palette.mode === 'dark' ? 'success.dark' : "success.light",
              color: theme.palette.mode === 'dark' ? 'white' : 'success.contrastText',
              border: 'none',
              boxShadow: "0 4px 14px rgba(0,0,0,0.1)"
            })
          }}>
            {selectedCustomer ? (
              <>
                 <Avatar sx={{ bgcolor: "success.main", width: 60, height: 60, mb: 1 }}><PersonIcon fontSize="large" /></Avatar>
                 <Typography variant="h6" fontWeight="bold" color="success.main">LISTO!</Typography>
                 <Button 
                    variant="contained" 
                    color="success" 
                    fullWidth 
                    sx={{ mt: 1, borderRadius: 0 }}
                    onClick={handleConfirm}
                 >
                    Confirmar Orden
                 </Button>
              </>
            ) : phoneInput.length >= 8 ? (
              <>
                 <Avatar sx={{ bgcolor: "warning.main", width: 60, height: 60, mb: 1 }}><PersonIcon fontSize="large" /></Avatar>
                 <Typography variant="h6" fontWeight="bold" color="warning.main">NUEVO CLIENTE</Typography>
                 <Button 
                    variant="contained" 
                    color="warning" 
                    fullWidth 
                    sx={{ mt: 1, borderRadius: 0 }}
                    onClick={handleConfirm}
                 >
                    Crear Orden
                 </Button>
              </>
            ) : (
               <Avatar sx={{ width: 60, height: 60, mb: 1 }}><PersonIcon fontSize="large" /></Avatar>
            )}
        </Box>

        {/* Input activo visible arriba del teclado */}
        <Box sx={{ bgcolor: "background.default", p: 1, mb: 1, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Typography variant="h5" fontWeight="bold" onClick={() => setFocusedField("phone")} sx={{ cursor: "pointer" }}>
               {focusedField === "phone" ? phoneInput || "Ingrese Teléfono" : phoneInput}
            </Typography>
        </Box>

        {/* Keypad */}
        <Box sx={{ 
           display: "grid", 
           gridTemplateColumns: "repeat(4, 1fr)", 
           gridAutoRows: "60px",
           gap: 0.5,
           mb: 2
        }}>
           {[
              "7", "8", "9", "BACK",
              "4", "5", "6", "CLEAR",
              "1", "2", "3", "CHECK",
              "0", "00", ".", "CHECK2"
           ].map((btn, idx) => {
             if (btn === "CHECK2") return null; // Omitimos este botón, "CHECK" ocupará 2 filas

             let content: React.ReactNode = btn;
             let bgcolor = theme.palette.mode === 'dark' ? 'grey.800' : "background.paper";
             let color = theme.palette.mode === 'dark' ? "white" : "text.primary";
             let gridRowSpan = 1;
             
             if (btn === "BACK") {
                content = <BackspaceIcon color="action" />;
                bgcolor = theme.palette.mode === 'dark' ? 'grey.900' : "grey.200";
             } else if (btn === "CLEAR") {
                content = "C";
                bgcolor = theme.palette.mode === 'dark' ? 'warning.dark' : "warning.light";
                color = theme.palette.mode === 'dark' ? "white" : "warning.contrastText";
             } else if (btn === "CHECK") {
                content = <CheckCircleIcon sx={{ fontSize: 40 }} />;
                bgcolor = theme.palette.mode === 'dark' ? 'success.dark' : "success.main";
                color = "white";
                gridRowSpan = 2;
             }

             return (
               <Button
                 key={idx}
                 variant="contained"
                 disableElevation={theme.palette.mode === 'dark'}
                 onClick={() => {
                   if (btn === "CHECK" && selectedCustomer) {
                     handleConfirm();
                   } else {
                     handleKeypadPress(btn === "CHECK" ? "CHECK" : btn);
                   }
                 }}
                 sx={{
                    bgcolor,
                    color,
                    gridRow: `span ${gridRowSpan}`,
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    borderRadius: 3,
                    border: theme.palette.mode === 'light' && btn !== "CHECK" && btn !== "CLEAR" ? `1px solid ${theme.palette.divider}` : 'none',
                    "&:hover": { 
                      filter: "brightness(0.9)", 
                      bgcolor: btn === "CHECK" ? "success.dark" : undefined 
                    }
                 }}
               >
                 {content}
               </Button>
             )
           })}
        </Box>

        {/* Moto Icon */}
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
           <TwoWheelerIcon sx={{ fontSize: 120, color: "text.secondary", opacity: 0.7 }} />
        </Box>
      </Paper>
    </Box>
  );
}
