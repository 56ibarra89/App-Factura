import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Backspace from "@mui/icons-material/Backspace";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useLoginPin } from "../hooks/useLoginPin";
import { AuthLayout } from "../components/auth/AuthLayout";
import { BrandingPanel } from "../components/auth/BrandingPanel";
import { LOGIN_COLORS } from "../theme/loginTheme";

interface PinDotsProps {
  pin: string;
  MAX_PIN_LENGTH: number;
}

const PinDots = ({ pin, MAX_PIN_LENGTH }: PinDotsProps) => {
  const dots = [];
  for (let i = 0; i < MAX_PIN_LENGTH; i++) {
    dots.push(
      <Box
        key={`pin-dot-${i}`}
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          bgcolor: i < pin.length ? LOGIN_COLORS.primary : "grey.300",
          mx: 1.5,
          transition: "all 0.2s ease-in-out",
          boxShadow: i < pin.length ? `0 4px 12px ${LOGIN_COLORS.dotActiveShadow}` : "none",
        }}
      />
    );
  }
  return <Box display="flex" justifyContent="center" mb={5}>{dots}</Box>;
};

const LoginPin = () => {

  const navigate = useNavigate();
  const { pin, loading, error, appendDigit, deleteDigit, clearError, MAX_PIN_LENGTH } = useLoginPin();


  const numpadButtonSx = {
    height: 90,
    fontSize: 42,
    fontWeight: 600,
    borderRadius: 4,
    color: "text.primary",
    borderColor: "grey.200",
    "&:hover": {
      borderColor: LOGIN_COLORS.primary,
      bgcolor: LOGIN_COLORS.primarySubtle,
      transform: "scale(1.05)",
      boxShadow: `0 10px 20px ${LOGIN_COLORS.numpadHoverShadow}`,
    },
    transition: "all 0.15s ease",
  };

  return (
    <AuthLayout error={error} onClearError={clearError}>
      <BrandingPanel
        title={<>Punto<br />de Venta</>}
        subtitle="Ingresa rápidamente tu PIN usando el teclado numérico de la pantalla."
        footerAction={
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
            sx={{
              color: "white",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1.1rem",
              alignSelf: "flex-start",
              bgcolor: "rgba(255,255,255,0.1)",
              px: { xs: 2, sm: 3 },
              py: 1.5,
              borderRadius: 3,
              mt: { xs: 4, md: 0 },
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.2)",
                transform: "translateX(-4px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Volver al login clásico
          </Button>
        }
      />

      {/* Lado Derecho: Numpad Login */}
      <Box
        sx={{
          flex: { xs: "none", md: 1.2 },
          p: { xs: 4, sm: 6 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "white",
        }}
      >
        <Typography variant="h4" fontWeight="800" color="text.primary" mb={1} align="center">
          Ingresa tu PIN
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={5} align="center">
          Para acceder al sistema
        </Typography>

        <PinDots pin={pin} MAX_PIN_LENGTH={MAX_PIN_LENGTH} />

        {/* Numpad */}
        <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={3} sx={{ width: "100%", maxWidth: 360 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="outlined"
              onClick={() => appendDigit(num.toString())}
              disabled={loading}
              sx={numpadButtonSx}
            >
              {num}
            </Button>
          ))}
          <Box /> {/* Celda vacía */}
          <Button
            variant="outlined"
            onClick={() => appendDigit("0")}
            disabled={loading}
            sx={numpadButtonSx}
          >
            0
          </Button>
          <Button
            variant="text"
            onClick={deleteDigit}
            disabled={loading || pin.length === 0}
            sx={{
              height: 90,
              borderRadius: 4,
              color: "text.secondary",
              "&:hover": {
                color: "error.main",
                bgcolor: "error.light",
                transform: "scale(1.05)",
              },
              transition: "all 0.15s ease",
            }}
          >
            <Backspace sx={{ fontSize: 48 }} />
          </Button>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" mt={4} sx={{ width: "100%", position: "absolute", bottom: 40 }}>
            <CircularProgress size={40} />
          </Box>
        )}
      </Box>
    </AuthLayout>
  );
};

export default LoginPin;
