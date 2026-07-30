import { useState } from "react";
import { Box, Typography, Stack, Button, Tabs, Tab } from "@mui/material";
import {
  BackButton,
  ConfirmDialog,
  PageHeader,
} from "../../../shared/ui";
import TimerIcon from "@mui/icons-material/Timer";
import DeleteIcon from "@mui/icons-material/Delete";

// Components
import OrderGrid from "../ui/OrderGrid";
import OrderEmptyState from "../ui/OrderEmptyState";
import {
  PinValidationDialog,
  RoleGuard,
  useAuth,
} from "../../auth";

// Hooks & Theme
import { useOrderManagement } from "../hooks/useOrderManagement";
import { useKitchens } from "../../kitchens";
import { logService } from "../../audit";
import { LOGIN_COLORS } from "../../../shared/theme";
import { getSelectedKitchenId, setSelectedKitchenId as saveSelectedKitchenId } from "../api/selectedKitchenPreference";

interface OrdersPageProps {
  resolveTableName?: (tableId: string) => string;
}

const OrdersPage = ({ resolveTableName }: OrdersPageProps) => {
  const { 
    activeOrders, 
    finishedOrders, 
    updateOrderStatus,
    clearHistory
  } = useOrderManagement();
  
  const { username, role: userRole } = useAuth();
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const { kitchens } = useKitchens();
  const [selectedKitchenId, setSelectedKitchen] = useState<string>(() => {
    return getSelectedKitchenId();
  });

  const handleKitchenChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedKitchen(newValue);
    saveSelectedKitchenId(newValue);
  };

  const handleClearHistory = () => {
    clearHistory();
    logService.log(username, userRole, "CLEAR_HISTORY", "Vaciado manual de todo el historial de órdenes");
    setIsClearConfirmOpen(false);
  };

  const handleDeleteOrder = (id: string) => {
    setOrderToDelete(id);
    setPinDialogOpen(true);
  };

  const handleCancelSuccess = (pin?: string) => {
    if (orderToDelete) {
      updateOrderStatus(orderToDelete, "cancelled", undefined, pin);
    }
    setPinDialogOpen(false);
    setOrderToDelete(null);
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedKitchenId} onChange={handleKitchenChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Todas las áreas" value="" />
          {kitchens.filter(k => k.isActive).map(k => (
            <Tab key={k.id} label={k.name} value={k.id} />
          ))}
        </Tabs>
      </Box>

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, mt: 2 }}>
        Órdenes Activas
      </Typography>

      {activeOrders.length === 0 ? (
        <OrderEmptyState />
      ) : (
        <OrderGrid 
          orders={activeOrders} 
          selectedKitchenId={selectedKitchenId}
          kitchens={kitchens}
          resolveTableName={resolveTableName}
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
            selectedKitchenId={selectedKitchenId}
            kitchens={kitchens}
            resolveTableName={resolveTableName}
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

      {/* Security Dialog */}
      <PinValidationDialog
        open={pinDialogOpen}
        onClose={() => {
          setPinDialogOpen(false);
          setOrderToDelete(null);
        }}
        onSuccess={handleCancelSuccess}
        title="Anular Factura"
      />
    </Box>
  );
};

export default OrdersPage;

