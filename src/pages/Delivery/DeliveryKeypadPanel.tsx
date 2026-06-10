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
            bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
            mb: 1, 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center",
            borderRadius: 1,
            ...(selectedCustomer && { bgcolor: theme.palette.mode === 'dark' ? 'success.dark' : "#fff176" })
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
             let bgcolor = theme.palette.mode === 'dark' ? 'grey.700' : "#ffecb3"; // amarillo claro
             const color = "text.primary";
             let gridRowSpan = 1;
             
             if (btn === "BACK") {
                content = <BackspaceIcon color="action" />;
                bgcolor = theme.palette.mode === 'dark' ? 'grey.800' : "#e0e0e0";
             } else if (btn === "CLEAR") {
                content = "C"; // Botón de limpiar
                bgcolor = theme.palette.mode === 'dark' ? 'warning.dark' : "#ffcc80"; // naranja claro
             } else if (btn === "CHECK") {
                content = <CheckCircleIcon sx={{ color: "white", fontSize: 40 }} />;
                bgcolor = theme.palette.mode === 'dark' ? 'success.dark' : "#9ccc65";
                gridRowSpan = 2; // Ocupa esta fila y la de abajo
             }

             return (
               <Button
                 key={idx}
                 variant="contained"
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
                    "&:hover": { filter: "brightness(0.9)" }
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
