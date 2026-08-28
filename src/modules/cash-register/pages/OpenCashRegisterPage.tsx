import { Box, Typography, Divider, Alert } from "@mui/material";
import { AuthLayout, BrandingPanel, useAuth } from "../../auth";
import { OpenCashRegisterForm } from "../ui/OpenCashRegisterForm";
import { useOpenCashRegister } from "../hooks/useOpenCashRegister";
import { useEffect } from "react";
import { useCaja } from "../model/CajaContext";

export default function OpenCashRegisterPage() {
  const { currentShift } = useCaja();
  const { username } = useAuth();
  const {
    cashRegisterName,
    setCashRegisterName,
    amount,
    setAmount,
    canSubmit,
    expectedAmount,
    requireExactOpening,
    isSubmitting,
    error,
    handleSubmit,
    handleCancel,
  } = useOpenCashRegister();

  useEffect(() => {
    console.log(
      "[AbrirCajaPage] Montado. Estado actual de la caja:",
      currentShift ? "ABIERTA" : "CERRADA",
    );
  }, [currentShift]);

  const hasMyOpenShift = currentShift && currentShift.cashierName === username;

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
            Ya existe una caja abierta en el sistema por <strong>{currentShift.cashierName}</strong>. No es posible abrir otra estación.
          </Alert>
        )}

        <OpenCashRegisterForm
          cashRegisterName={cashRegisterName}
          onChangeCashRegisterName={setCashRegisterName}
          amount={amount}
          onChangeAmount={setAmount}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          canSubmit={canSubmit}
          expectedAmount={expectedAmount}
          requireExactOpening={requireExactOpening}
          isSubmitting={isSubmitting}
          error={error}
        />
      </Box>
    </AuthLayout>
  );
}
