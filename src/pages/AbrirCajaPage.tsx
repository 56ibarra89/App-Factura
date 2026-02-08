import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
} from "@mui/material";
import { AbrirCajaForm } from "../components/AbrirCajaForm";


export default function AbrirCajaPage() {
  const [amount, setAmount] = useState("");

  const canSubmit = Number(amount) > 0;

  const handleSubmit = () => {
    console.log("Caja abierta con monto:", amount);
  };

  const handleCancel = () => {
    setAmount("");
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Card sx={{ width: 420 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Apertura de Caja
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Ingresa el monto inicial con el que se comenzará a trabajar hoy.
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <AbrirCajaForm
            amount={amount}
            onChangeAmount={setAmount}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            canSubmit={canSubmit}
          />
        </CardContent>
      </Card>
    </Box>
  );
}