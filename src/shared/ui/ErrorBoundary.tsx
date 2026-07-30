import { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import { logService } from "../../modules/audit";
import { LOGIN_COLORS } from "../theme";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Actualiza el estado para que el siguiente renderizado muestre la interfaz de repuesto
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Registrar el error en la bitácora de auditoría (ISO 27001 A.12.4.3)
    console.error("Uncaught error:", error, errorInfo);
    
    // Intentar registrar en el servicio de logs
    logService.log(
      "system", 
      "critical_error", 
      "APP_CRASH", 
      `Fallo crítico de aplicación: ${error.message}. Stack trace capturado en consola.`, 
      "error"
    );
  }

  private handleReset = () => {
    // Reiniciar la aplicación (recarga la página en Electron)
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            bgcolor: 'background.default',
            p: 3
          }}
        >
          <Paper
            elevation={10}
            sx={{
              p: { xs: 4, md: 6 },
              maxWidth: 500,
              textAlign: "center",
              borderRadius: 6,
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 80, color: LOGIN_COLORS.primary, mb: 2 }} />
            
            <Typography variant="h4" fontWeight={900} gutterBottom color="text.primary">
              ¡Ups! Algo salió mal
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Se ha detectado un error inesperado. Por seguridad y para garantizar la integridad de tus datos, 
              hemos pausado la ejecución y registrado el incidente en la bitácora de auditoría.
            </Typography>

            <Box 
              sx={{ 
                bgcolor: "action.hover", 
                p: 2, 
                borderRadius: 2, 
                mb: 4, 
                textAlign: "left",
                border: "1px solid",
                borderColor: "grey.200",
                display: 'none' // Oculto por defecto para el usuario final (confidencialidad)
              }}
            >
              <Typography variant="caption" sx={{ fontFamily: "monospace", color: "error.main" }}>
                {this.state.error?.message}
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={this.handleReset}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: "bold",
                textTransform: "none",
                bgcolor: LOGIN_COLORS.primary,
                "&:hover": { bgcolor: LOGIN_COLORS.primaryDark }
              }}
            >
              Reiniciar Aplicación
            </Button>
            
            <Typography variant="caption" display="block" sx={{ mt: 3, color: "text.disabled" }}>
              Si el problema persiste, contacta al soporte técnico.
            </Typography>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
