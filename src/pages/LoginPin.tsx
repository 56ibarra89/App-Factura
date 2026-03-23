import {
  Box,
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Backspace, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useLoginPin } from "../hooks/useLoginPin";
import logoImg from "../assets/images/logo.png";

const LoginPin = () => {
  const navigate = useNavigate();
  const { pin, loading, error, appendDigit, deleteDigit, clearError, MAX_PIN_LENGTH } = useLoginPin();

  // Componente para los círculos del PIN
  const PinDots = () => {
    const dots = [];
    for (let i = 0; i < MAX_PIN_LENGTH; i++) {
        dots.push(
        <Box
          key={i}
          sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          bgcolor: i < pin.length ? "#d32f2f" : "grey.300",
          mx: 1.5,
          transition: "all 0.2s ease-in-out",
          boxShadow: i < pin.length ? "0 4px 12px rgba(211, 47, 47, 0.4)" : "none",
          }}
        />
        );
    }
    return <Box display="flex" justifyContent="center" mb={5}>{dots}</Box>;
  };

  return (
    <Box 
      height="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      sx={{
        background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)", // Fondo claro y cálido exterior
        padding: 2
      }}
    >
      <Paper 
        elevation={24} 
        sx={{ 
          width: { xs: "100%", sm: "95%", md: 950 }, 
          minHeight: 650,
          borderRadius: 6, 
          display: "flex",
          overflow: "hidden", // Para que el fondo del lado izquierdo no se salga
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
          flexDirection: { xs: "column", md: "row" }
        }}
      >
        {/* Lado Izquierdo: Diseño Atractivo */}
        <Box 
          sx={{
            flex: 1,
            background: "linear-gradient(135deg, #2b2b2b 0%, #121212 100%)",
            backgroundImage: "radial-gradient(circle at bottom left, #4a4a4a 0%, #121212 100%)",
            color: "white",
            p: { xs: 4, sm: 6 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative"
          }}
        >
          <Box mt={2}>
            <Box
              component="img"
              src={logoImg}
              alt="Pizza To Go Logo"
              sx={{
                width: 110,
                height: 110,
                borderRadius: "25%",
                mb: 4,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                objectFit: "cover",
                border: "3px solid rgba(255,255,255,0.2)",
                bgcolor: "white",
              }}
              onError={(e) => {
                // Fallback temporal si no encuentra logo.png
                e.currentTarget.src = "https://via.placeholder.com/110/cf1f2e/ffffff?text=LOGO";
              }}
            />
            <Typography variant="h3" fontWeight="900" mb={2} sx={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
              Punto<br />de Venta
            </Typography>
            <Typography variant="h6" fontWeight="400" sx={{ opacity: 0.85, maxWidth: 300, lineHeight: 1.5 }}>
              Ingresa rápidamente tu PIN usando el teclado numérico de la pantalla.
            </Typography>
          </Box>

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
                  transform: "translateX(-4px)"
              },
              transition: "all 0.2s ease"
            }}
          >
            Volver al login clásico
          </Button>
        </Box>

        {/* Lado Derecho: Numpad Log In */}
        <Box 
          sx={{ 
            flex: 1.2, 
            p: { xs: 4, sm: 6 }, 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "white"
          }}
        >
          <Typography variant="h4" fontWeight="800" color="text.primary" mb={1} align="center">
            Ingresa tu PIN
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={5} align="center">
            Para acceder al sistema
          </Typography>

          <PinDots />

          {/* Numpad Extra Grande */}
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={3} sx={{ width: "100%", maxWidth: 360 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outlined"
                onClick={() => appendDigit(num.toString())}
                disabled={loading}
                sx={{ 
                  height: 90, 
                  fontSize: 42, 
                  fontWeight: 600,
                  borderRadius: 4,
                  color: "text.primary",
                  borderColor: "grey.200",
                  "&:hover": {
                    borderColor: "#d32f2f",
                    bgcolor: "rgba(211, 47, 47, 0.04)",
                    transform: "scale(1.05)",
                    boxShadow: "0 10px 20px rgba(211, 47, 47, 0.1)"
                  },
                  transition: "all 0.15s ease"
                }}
              >
                {num}
              </Button>
            ))}
            <Box /> {/* Celda vacía */}
            <Button
              variant="outlined"
              onClick={() => appendDigit("0")}
              disabled={loading}
              sx={{ 
                height: 90, 
                fontSize: 42, 
                fontWeight: 600,
                borderRadius: 4,
                color: "text.primary",
                borderColor: "grey.200",
                "&:hover": {
                    borderColor: "#d32f2f",
                    bgcolor: "rgba(211, 47, 47, 0.04)",
                    transform: "scale(1.05)",
                    boxShadow: "0 10px 20px rgba(211, 47, 47, 0.1)"
                },
                transition: "all 0.15s ease"
              }}
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
                  transform: "scale(1.05)"
                },
                transition: "all 0.15s ease"
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
      </Paper>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={clearError} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={clearError} severity="error" sx={{ width: "100%", fontSize: "1.1rem" }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPin;
