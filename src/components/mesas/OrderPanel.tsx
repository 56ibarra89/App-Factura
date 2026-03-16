import { Paper, Box } from "@mui/material";
import { OrderItem } from "../../types/order.types";
import OrderHeader from "./OrderHeader";
import OrderList from "./OrderList";
import OrderSummary from "./OrderSummary";
import OrderActions from "./OrderActions";

interface Props {
  order: OrderItem[];
}

export default function OrderPanel({ order }: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        bgcolor: "white",
        overflow: "hidden"
      }}
    >
      <OrderHeader />
      
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <OrderList order={order} />
      </Box>

      <Box sx={{ 
        p: 2.5, 
        borderTop: "1px solid rgba(0,0,0,0.06)",
        bgcolor: "#fafafa" 
      }}>
        <OrderSummary order={order} />
        <Box sx={{ mt: 3 }}>
          <OrderActions />
        </Box>
      </Box>
    </Paper>
  );
}
