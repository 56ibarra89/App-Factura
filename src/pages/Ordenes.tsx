import { useState } from "react";
import { Box, Typography, Stack, Button } from "@mui/material";
import { BackButton } from "../components/BackButton";
import TimerIcon from "@mui/icons-material/Timer";
import DeleteIcon from "@mui/icons-material/Delete";

// Components
import PageHeader from "../components/PageHeader";
import OrderGrid from "../components/ordenes/OrderGrid";
import OrderEmptyState from "../components/ordenes/OrderEmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import RoleGuard from "../components/auth/RoleGuard";

// Hooks & Theme
import { useOrderManagement } from "../hooks/useOrderManagement";
import { useAuth } from "../context/AuthContext";
import { logService } from "../services/logService";
import { LOGIN_GRADIENTS, LOGIN_COLORS } from "../theme/loginTheme";

const Ordenes = () => {
  const { 
    activeOrders, 
    finishedOrders, 
    updateOrderStatus,
    clearHistory
  } = useOrderManagement();
  
  const { username, role: userRole } = useAuth();
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const handleClearHistory = () => {
    clearHistory();
    logService.log(username, userRole, "CLEAR_HISTORY", "Vaciado manual de todo el historial de órdenes");
    setIsClearConfirmOpen(false);
  };

  const handleDeleteOrder = (id: string) => {
    updateOrderStatus(id, "cancelled");
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: 'background.default',
        pt: 4,
        pb: 4,
        px: { xs: 2, md: 6 },
      }}
    >
      <PageHeader 
        title="Gestión de Órdenes" 
        startContent={<BackButton to="/home" />}
        actions={
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center" sx={{ bgcolor: 'rgba(0,0,0,0.03)', px: 1.5, py: 0.5, borderRadius: 2 }}>
              <TimerIcon color="action" fontSize="small" />
              <Typography variant="body2" fontWeight="600" color="text.secondary">
                {activeOrders.length} activas
              </Typography>
            </Stack>
            <RoleGuard allowedRoles={["admin"]}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => setIsClearConfirmOpen(true)}
                startIcon={<DeleteIcon />}
                sx={{ 
                  color: LOGIN_COLORS.primary, 
                  borderColor: LOGIN_COLORS.primary,
                  '&:hover': { borderColor: LOGIN_COLORS.primaryDark, bgcolor: 'rgba(0,0,0,0.02)' },
                  borderRadius: 2,
                  px: 2,
                  height: 36
                }}
              >
                Limpiar Historial
              </Button>
            </RoleGuard>
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
          onDelete={handleDeleteOrder} 
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
            onDelete={handleDeleteOrder} 
          />
        </>
      )}

      <ConfirmDialog
        open={isClearConfirmOpen}
        title="Limpiar Historial"
        message="¿Estás seguro de que quieres limpiar todo el historial de hoy? Esta acción no se puede deshacer."
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleClearHistory}
        disableRestoreFocus
        disableEnforceFocus
      />
    </Box>
  );
};

export default Ordenes;

