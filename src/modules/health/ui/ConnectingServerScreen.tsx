import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Chip,
  Fade,
} from "@mui/material";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import logoImg from "../../../assets/images/logo.png";
import {
  LOGIN_COLORS,
  LOGIN_GRADIENTS,
  LOGIN_SHADOWS,
} from "../../../shared/theme";
import type { BackendConnectionStatus } from "../model/health.types";

interface ConnectingServerScreenProps {
  status: BackendConnectionStatus;
  retryCount: number;
  isChecking: boolean;
  onRetry: () => void;
  error?: string | null;
}

export const ConnectingServerScreen: React.FC<ConnectingServerScreenProps> = ({
  status,
  isChecking,
  onRetry,
}) => {
  const isDisconnected = status === "disconnected";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: LOGIN_GRADIENTS.pageBackground,
        p: 2,
        boxSizing: "border-box",
      }}
    >
      <Fade in timeout={600}>
        <Paper
          elevation={12}
          sx={{
            width: "100%",
            maxWidth: 480,
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: LOGIN_SHADOWS.card,
            background: LOGIN_GRADIENTS.brandingPanel,
            backgroundImage: LOGIN_GRADIENTS.brandingPanelRadial,
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: { xs: 4, sm: 6 },
            textAlign: "center",
            position: "relative",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {}
          <Box
            sx={{
              position: "relative",
              mb: 3,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src={logoImg}
              alt="Pizza To Go"
              sx={{
                width: 100,
                height: 100,
                borderRadius: "25%",
                boxShadow: LOGIN_SHADOWS.logo,
                objectFit: "cover",
                border: "3px solid rgba(255, 255, 255, 0.25)",
                bgcolor: "white",
                animation: isChecking ? "pulse 2s infinite ease-in-out" : "none",
                "@keyframes pulse": {
                  "0%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.05)", boxShadow: "0 0 25px rgba(211, 47, 47, 0.6)" },
                  "100%": { transform: "scale(1)" },
                },
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </Box>

          <Typography
            variant="h4"
            fontWeight="900"
            sx={{
              mb: 1,
              letterSpacing: "-0.5px",
              textShadow: LOGIN_SHADOWS.title,
            }}
          >
            Pizza To Go
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{ opacity: 0.8, mb: 3, fontWeight: 500 }}
          >
            Sistema de Facturación
          </Typography>

          {}
          <Chip
            icon={isDisconnected ? <WifiOffIcon style={{ color: "#ff8a80" }} /> : <CircularProgress size={16} color="inherit" />}
            label={
              isDisconnected
                ? "Esperando conexión..."
                : "Conectando al servidor..."
            }
            sx={{
              bgcolor: isDisconnected ? "rgba(211, 47, 47, 0.2)" : "rgba(25, 118, 210, 0.2)",
              color: isDisconnected ? "#ff8a80" : "#80d8ff",
              border: `1px solid ${isDisconnected ? "rgba(211, 47, 47, 0.4)" : "rgba(25, 118, 210, 0.4)"}`,
              fontWeight: 600,
              mb: 4,
              px: 1.5,
              py: 2.2,
              borderRadius: 3,
              fontSize: "0.9rem",
            }}
          />

          {/* Spinner / Progress Indicator */}
          <Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
            <CircularProgress
              size={64}
              thickness={4.5}
              sx={{
                color: isDisconnected ? LOGIN_COLORS.primary : "#90caf9",
              }}
            />
          </Box>

          {/* Message Text */}
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              mb: 1,
              color: "white",
            }}
          >
            {isDisconnected
              ? "Reintentando conectar..."
              : "Estableciendo conexión..."}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              opacity: 0.75,
              maxWidth: 380,
              lineHeight: 1.6,
              mb: 4,
            }}
          >
            {isDisconnected
              ? "Reintentando conectar automáticamente con el sistema..."
              : "Por favor espera un momento mientras conectamos con el sistema."}
          </Typography>

          {/* Manual Retry Button */}
          <Button
            variant="contained"
            disabled={isChecking}
            onClick={onRetry}
            startIcon={
              isChecking ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <RefreshIcon />
              )
            }
            sx={{
              bgcolor: LOGIN_COLORS.primary,
              "&:hover": {
                bgcolor: LOGIN_COLORS.primaryDark,
              },
              color: "white",
              fontWeight: 700,
              px: 4,
              py: 1.2,
              borderRadius: 3,
              boxShadow: LOGIN_SHADOWS.logo,
              textTransform: "none",
              fontSize: "1rem",
            }}
          >
            {isChecking ? "Reintentando..." : "Reintentar ahora"}
          </Button>
        </Paper>
      </Fade>
    </Box>
  );
};

