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
        bgcolor: "background.default",
        p: 2,
        boxSizing: "border-box",
      }}
    >
      <Fade in timeout={600}>
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 480,
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "background.paper",
            color: "text.primary",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: { xs: 4, sm: 6 },
            textAlign: "center",
            position: "relative",
            border: "1px solid",
            borderColor: "divider",
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
                borderRadius: 2,
                objectFit: "cover",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
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
            }}
          >
            Pizza To Go
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{ color: "text.secondary", mb: 3, fontWeight: 500 }}
          >
            Sistema de Facturación
          </Typography>

          {}
          <Chip
            icon={isDisconnected ? <WifiOffIcon /> : <CircularProgress size={16} color="inherit" />}
            label={
              isDisconnected
                ? "Esperando conexión..."
                : "Conectando al servidor..."
            }
            sx={{
              bgcolor: isDisconnected ? "error.main" : "info.main",
              color: isDisconnected ? "error.contrastText" : "info.contrastText",
              fontWeight: 600,
              mb: 4,
              px: 1.5,
              py: 2.2,
              borderRadius: 2,
              fontSize: "0.9rem",
            }}
          />

          {/* Spinner / Progress Indicator */}
          <Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
            <CircularProgress
              size={64}
              thickness={4.5}
              sx={{
                color: isDisconnected ? "error.main" : "primary.main",
              }}
            />
          </Box>

          {/* Message Text */}
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              mb: 1,
              color: "text.primary",
            }}
          >
            {isDisconnected
              ? "Reintentando conectar..."
              : "Estableciendo conexión..."}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
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
              fontWeight: 700,
              px: 4,
              py: 1.2,
              borderRadius: 2,
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

