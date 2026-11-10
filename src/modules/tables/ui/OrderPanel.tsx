import { Paper, Box, Button, Typography } from "@mui/material";
import OrderHeader from "./OrderHeader";
import OrderList from "./OrderList";
import OrderSummary from "./OrderSummary";
import OrderActions from "./OrderActions";
import type { OrderItem } from "../../orders";

interface Props {
  order: OrderItem[];
  discountAmount?: number;
  cashierName?: string;
  waiterName?: string;
  canReassignWaiter?: boolean;
  onReassignWaiter?: () => void;
  onSalir: () => void;
  onReservar: () => void;
  isReserved?: boolean;
  onEditOrder?: () => void;
  onCheckout?: () => void;
  onUnirMesas?: () => void;
  onMoverPedido?: () => void;
  onDividirCuenta?: () => void;
  hasActiveOrder?: boolean;
  canCheckoutOrder?: boolean;
  canModifyOrder?: boolean;
  onToggleOccupancy?: () => void;
  isOccupied?: boolean;
  cannotReleaseTable?: boolean;
}

export default function OrderPanel({ 
  order, 
  discountAmount,
  cashierName,
  waiterName,
  canReassignWaiter = false,
  onReassignWaiter,
  onSalir, 
  onReservar, 
  isReserved = false, 
  onEditOrder, 
  onCheckout,
  onUnirMesas,
  onMoverPedido,
  onDividirCuenta,
  hasActiveOrder = false,
  canCheckoutOrder = false,
  canModifyOrder = true,
  onToggleOccupancy,
  isOccupied = false,
  cannotReleaseTable = false
}: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        boxShadow: "none",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden"
      }}
    >
      <OrderHeader />
      
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <OrderList order={order} />
      </Box>

      <Box sx={{ 
        p: 1.5, 
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "action.hover" 
      }}>
        <OrderSummary
          order={order}
          discountAmount={discountAmount}
          cashierName={cashierName}
        />
        {hasActiveOrder && (
          <Box sx={{ mt: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Mesero responsable: {waiterName || "Sin asignar"}
            </Typography>
            {canReassignWaiter && onReassignWaiter && (
              <Button size="small" onClick={onReassignWaiter}>
                Asignar
              </Button>
            )}
          </Box>
        )}
        <Box sx={{ mt: 1.5 }}>
          <OrderActions 
            onSalir={onSalir} 
            onReservar={onReservar} 
            isReserved={isReserved} 
            onEditOrder={onEditOrder}
            onCheckout={onCheckout}
            onUnirMesas={onUnirMesas}
            onMoverPedido={onMoverPedido}
            onDividirCuenta={onDividirCuenta}
            hasActiveOrder={hasActiveOrder}
            canCheckoutOrder={canCheckoutOrder}
            canModifyOrder={canModifyOrder}
            onToggleOccupancy={onToggleOccupancy}
            isOccupied={isOccupied}
            cannotReleaseTable={cannotReleaseTable}
          />
        </Box>
      </Box>
    </Paper>
  );
}
