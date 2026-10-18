import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BackspaceIcon from "@mui/icons-material/Backspace";
import type { Customer } from "../../customers";

interface DeliveryKeypadPanelProps {
  phoneInput: string;
  selectedCustomer: Customer | null;
  handleConfirm: () => void;
  handleKeypadPress: (val: string) => void;
}

export default function DeliveryKeypadPanel({
  phoneInput,
  selectedCustomer,
  handleConfirm,
  handleKeypadPress
}: DeliveryKeypadPanelProps) {
  return (
    <Box sx={{ flex: 1, minWidth: 350, maxWidth: 450 }}>
      <Paper
        elevation={0}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          p: 1,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >

        {}
        <Box sx={{
            minHeight: 132,
            bgcolor: "action.hover",
            mb: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
            border: "1px solid",
            borderColor: selectedCustomer
              ? "success.main"
              : phoneInput.length >= 8
                ? "warning.main"
                : "divider",
            ...(selectedCustomer && {
              bgcolor: "action.hover",
            })
          }}>
            {selectedCustomer ? (
              <>
                 <Avatar sx={{ bgcolor: "success.main", width: 44, height: 44, mb: 0.5 }}><PersonIcon /></Avatar>
                 <Typography variant="subtitle1" fontWeight="bold" color="success.main">Cliente seleccionado</Typography>
                 <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    sx={{ mt: 1, borderRadius: 2 }}
                    onClick={handleConfirm}
                 >
                    Confirmar Orden
                 </Button>
              </>
            ) : phoneInput.length >= 8 ? (
              <>
                 <Avatar sx={{ bgcolor: "warning.main", width: 44, height: 44, mb: 0.5 }}><PersonIcon /></Avatar>
                 <Typography variant="subtitle1" fontWeight="bold" color="warning.main">Nuevo cliente</Typography>
                 <Button
                    variant="contained"
                    color="warning"
                    fullWidth
                    sx={{ mt: 1, borderRadius: 2 }}
                    onClick={handleConfirm}
                 >
                    Crear Orden
                 </Button>
              </>
            ) : (
               <Avatar sx={{ width: 44, height: 44 }}><PersonIcon /></Avatar>
            )}
        </Box>

        <Box sx={{ bgcolor: "background.default", p: 1, mb: 1, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Typography variant="h5" fontWeight="bold">
               {phoneInput || "Ingrese Teléfono"}
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
             let bgcolor = "background.paper";
             let color = "text.primary";
             let gridRowSpan = 1;

             if (btn === "BACK") {
                content = <BackspaceIcon color="action" />;
                bgcolor = "action.hover";
             } else if (btn === "CLEAR") {
                content = "C";
                bgcolor = "warning.main";
                color = "warning.contrastText";
             } else if (btn === "CHECK") {
                content = <CheckCircleIcon sx={{ fontSize: 40 }} />;
                bgcolor = "success.main";
                color = "success.contrastText";
                gridRowSpan = 2;
             }

             return (
               <Button
                 key={idx}
                 variant={btn === "CHECK" || btn === "CLEAR" ? "contained" : "outlined"}
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
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor:
                      btn === "CHECK"
                        ? "success.main"
                        : btn === "CLEAR"
                          ? "warning.main"
                          : "divider",
                    transition: "background-color 120ms ease-out, transform 120ms ease-out",
                    "&:hover": {
                      bgcolor:
                        btn === "CHECK"
                          ? "success.dark"
                          : btn === "CLEAR"
                            ? "warning.dark"
                            : "action.hover",
                    },
                    "&:active": { transform: "scale(0.98)" },
                 }}
               >
                 {content}
               </Button>
             )
           })}
        </Box>
      </Paper>
    </Box>
  );
}

