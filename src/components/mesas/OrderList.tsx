import { Box } from "@mui/material";
import { OrderItem } from "../../types/order.types";
import OrderItemRow from "./OrderItemRow";


interface Props {
  order: OrderItem[];
}

export default function OrderList({ order }: Props) {
  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowY: "auto",
        p: 2,
      }}
    >
      {order.map((item) => (
        <OrderItemRow key={item.id} item={item} />
      ))}
    </Box>
  );
}
