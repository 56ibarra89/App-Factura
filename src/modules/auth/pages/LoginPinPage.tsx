import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Backspace from "@mui/icons-material/Backspace";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useLoginPin } from "../hooks/useLoginPin";
import { AuthLayout } from "../ui/AuthLayout";
import { BrandingPanel } from "../ui/BrandingPanel";
import { PinDots } from "../ui/PinDots";
import { LOGIN_COLORS } from "../../../shared/theme";

const numpadButtonSx = {
  height: 90,
  fontSize: 42,
  fontWeight: 600,
  borderRadius: 4,
  color: "text.primary",
  borderColor: "divider",
  "&:hover": {
    borderColor: LOGIN_COLORS.primary,
    bgcolor: LOGIN_COLORS.primarySubtle,
    transform: "scale(1.05)",
    boxShadow: `0 10px 20px ${LOGIN_COLORS.numpadHoverShadow}`,
  },
  transition: "all 0.15s ease",
};

const LoginPin = () => {
  const navigate = useNavigate();
  const {
    pin,
    loading,
    error,
    appendDigit,
    deleteDigit,
    clearError,
    MAX_PIN_LENGTH,
    lockoutTime,
    pinEntryDisabled,
  } = useLoginPin();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (pinEntryDisabled) {
        if (/^[0-9]$/.test(e.key) || e.key === "Backspace") {
          e.preventDefault();
        }
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        appendDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        if (pin.length > 0) {
          deleteDigit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    appendDigit,
    deleteDigit,
    pin.length,
    pinEntryDisabled,
  ]);

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
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h4" fontWeight="800" color="text.primary" mb={1} align="center">
          Ingresa tu PIN
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={5} align="center">
          {lockoutTime > 0 
            ? `SISTEMA BLOQUEADO: Intenta de nuevo en ${lockoutTime}s` 
            : "Para acceder al sistema"}
        </Typography>

        <PinDots pin={pin} MAX_PIN_LENGTH={MAX_PIN_LENGTH} />

        {/* Numpad */}
        <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={3} sx={{ width: "100%", maxWidth: 360 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="outlined"
              onClick={() => appendDigit(num.toString())}
              disabled={pinEntryDisabled}
              sx={{
                ...numpadButtonSx,
                ...(lockoutTime > 0 && {
                  bgcolor: "action.hover",
                  borderColor: "grey.200",
                  color: "grey.400",
                  "&:hover": { transform: "none", boxShadow: "none", bgcolor: "action.hover" }
                })
              }}
            >
              {num}
            </Button>
          ))}
          <Box /> {/* Celda vacía */}
          <Button
            variant="outlined"
            onClick={() => appendDigit("0")}
            disabled={pinEntryDisabled}
            sx={{
              ...numpadButtonSx,
              ...(lockoutTime > 0 && {
                bgcolor: "action.hover",
                borderColor: "divider",
                color: "text.disabled",
                "&:hover": { transform: "none", boxShadow: "none", bgcolor: "action.hover" }
              })
            }}
          >
            0
          </Button>
          <Button
            variant="text"
            onClick={deleteDigit}
            disabled={pinEntryDisabled || pin.length === 0}
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
