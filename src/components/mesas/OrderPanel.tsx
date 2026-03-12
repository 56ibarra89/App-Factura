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
      sx={{
        width: 400,
        borderRadius: 0,
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid #ccc",
      }}
    >
      <OrderHeader />
      <OrderList order={order} />
      <Box sx={{ p: 2 }}>
        <OrderSummary order={order} />
        <OrderActions />
      </Box>
    </Paper>
  );
}
