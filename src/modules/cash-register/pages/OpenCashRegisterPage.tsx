import { Box, Typography, Divider } from "@mui/material";
import {
  AuthLayout,
  BrandingPanel,
} from "../../auth";
import { OpenCashRegisterForm } from "../ui/OpenCashRegisterForm";
import { useOpenCashRegister } from "../hooks/useOpenCashRegister";

import { useEffect } from "react";
import { useCaja } from "../model/CajaContext";
import Alert from "@mui/material/Alert";

export default function OpenCashRegisterPage() {
  const { currentShift } = useCaja();
  const {
    amount,
    setAmount,
    canSubmit,
    expectedAmount,
    requireExactOpening,
    handleSubmit,
    handleCancel,
    cajas,
    selectedRegisterId,
    setSelectedRegisterId,
  } = useOpenCashRegister();

  useEffect(() => {
    console.log("[AbrirCajaPage] Montado. Estado actual de la caja:", currentShift ? "ABIERTA" : "CERRADA");
  }, [currentShift]);

  return (
    <AuthLayout error="" onClearError={() => {}}>
      <BrandingPanel
        title={
          <>
            Apertura
            <br />
            de Caja
          </>
        }
        subtitle="Ingresa el monto inicial en efectivo con el que se comenzará a registrar las operaciones del día."
      />
      <Box
        sx={{
          flex: 1,
          p: { xs: 4, md: 8 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h4" fontWeight="900" color="text.primary" mb={1}>
          Nueva Caja
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Asegúrate de contar el efectivo inicial para garantizar un arqueo preciso al final del turno.
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {currentShift && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            Ya existe un turno abierto para <strong>{currentShift.cashierName}</strong>. 
            No es necesario abrir una nueva caja.
          </Alert>
        )}

        <OpenCashRegisterForm
          cajas={cajas}
          selectedRegisterId={selectedRegisterId}
          onSelectRegister={setSelectedRegisterId}
          amount={amount}
          onChangeAmount={setAmount}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          canSubmit={canSubmit}
          expectedAmount={expectedAmount}
          requireExactOpening={requireExactOpening}
        />
      </Box>
    </AuthLayout>
  );
}
