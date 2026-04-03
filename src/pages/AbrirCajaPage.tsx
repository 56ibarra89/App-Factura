import { Box, Typography, Divider } from "@mui/material";
import { AuthLayout } from "../components/auth/AuthLayout";
import { BrandingPanel } from "../components/auth/BrandingPanel";
import { AbrirCajaForm } from "../components/AbrirCajaForm";
import { useAbrirCaja } from "../hooks/useAbrirCaja";

export default function AbrirCajaPage() {
  const { amount, setAmount, canSubmit, handleSubmit, handleCancel } = useAbrirCaja();

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
          bgcolor: "white",
        }}
      >
        <Typography variant="h4" fontWeight="900" color="text.primary" mb={1}>
          Nueva Caja
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Asegúrate de contar el efectivo inicial para garantizar un arqueo preciso al final del turno.
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <AbrirCajaForm
          amount={amount}
          onChangeAmount={setAmount}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          canSubmit={canSubmit}
        />
      </Box>
    </AuthLayout>
  );
}