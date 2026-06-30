import { Paper, Box } from "@mui/material";
import OrderHeader from "./OrderHeader";
import OrderList from "./OrderList";
import OrderSummary from "./OrderSummary";
import OrderActions from "./OrderActions";
import { CartItemType } from "../../types/cart";

interface Props {
  order: CartItemType[];
  cashierName?: string;
  onSalir: () => void;
  onReservar: () => void;
  isReserved?: boolean;
  onEditOrder?: () => void;
  onCheckout?: () => void;
  onUnirMesas?: () => void;
  onMoverPedido?: () => void;
  hasActiveOrder?: boolean;
  canModifyOrder?: boolean;
  onToggleOccupancy?: () => void;
  isOccupied?: boolean;
  cannotReleaseTable?: boolean;
}

export default function OrderPanel({ 
  order, 
  cashierName,
  onSalir, 
  onReservar, 
  isReserved = false, 
  onEditOrder, 
  onCheckout,
  onUnirMesas,
  onMoverPedido,
  hasActiveOrder = false,
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
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
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
        borderTop: "1px solid rgba(0,0,0,0.06)",
        bgcolor: "action.hover" 
      }}>
        <OrderSummary order={order} cashierName={cashierName} />
        <Box sx={{ mt: 1.5 }}>
          <OrderActions 
            onSalir={onSalir} 
            onReservar={onReservar} 
            isReserved={isReserved} 
            onEditOrder={onEditOrder}
            onCheckout={onCheckout}
            onUnirMesas={onUnirMesas}
            onMoverPedido={onMoverPedido}
            hasActiveOrder={hasActiveOrder}
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
