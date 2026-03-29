import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TimerIcon from "@mui/icons-material/Timer";
import DeleteIcon from "@mui/icons-material/Delete";

// Components
import PageHeader from "../components/PageHeader";
import OrderGrid from "../components/ordenes/OrderGrid";
import OrderEmptyState from "../components/ordenes/OrderEmptyState";

// Hooks & Theme
import { useOrderManagement } from "../hooks/useOrderManagement";
import { LOGIN_GRADIENTS, LOGIN_COLORS } from "../theme/loginTheme";

const Ordenes = () => {
  const { 
    activeOrders, 
    finishedOrders, 
    updateOrderStatus, 
    removeOrder,
    clearHistory
  } = useOrderManagement();
  
  const navigate = useNavigate();

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: LOGIN_GRADIENTS.pageBackground,
        pt: 4,
        pb: 4,
        px: { xs: 2, md: 6 },
      }}
    >
      <PageHeader 
        title="Gestión de Órdenes" 
        actions={
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <TimerIcon color="action" />
              <Typography variant="body2" color="text.secondary">
                {activeOrders.length} activas
              </Typography>
            </Stack>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => {
                if (window.confirm("¿Estás seguro de que quieres limpiar todo el historial de hoy? Esta acción no se puede deshacer.")) {
                  clearHistory();
                }
              }}
              startIcon={<DeleteIcon />}
              sx={{ 
                color: LOGIN_COLORS.primary, 
                borderColor: LOGIN_COLORS.primary,
                '&:hover': { borderColor: LOGIN_COLORS.primaryDark, bgcolor: 'rgba(0,0,0,0.02)' },
                borderRadius: 2,
                px: 2
              }}
            >
              Limpiar Historial
            </Button>
            <Button 
              variant="contained" 
              size="small"
              onClick={() => navigate("/home")}
              startIcon={<ArrowBackIcon />}
              sx={{ 
                bgcolor: LOGIN_COLORS.primary, 
                '&:hover': { bgcolor: LOGIN_COLORS.primaryDark },
                borderRadius: 2,
                px: 2
              }}
            >
              Regresar al Inicio
            </Button>
          </Stack>
        }
      />

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, mt: 2 }}>
        Órdenes Activas
      </Typography>

      {activeOrders.length === 0 ? (
        <OrderEmptyState />
      ) : (
        <OrderGrid 
          orders={activeOrders} 
          onUpdateStatus={updateOrderStatus} 
          onDelete={removeOrder} 
        />
      )}

      {finishedOrders.length > 0 && (
        <>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, mt: 6 }}>
            Historial Reciente
          </Typography>
          <OrderGrid 
            orders={finishedOrders.slice(0, 50)} 
            onUpdateStatus={updateOrderStatus} 
            onDelete={removeOrder} 
          />
        </>
      )}
    </Box>
  );
};

export default Ordenes;
