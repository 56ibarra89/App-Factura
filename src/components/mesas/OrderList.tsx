import { Box } from "@mui/material";
import { CartItemType } from "../../types/cart";
import OrderItemRow from "./OrderItemRow";


interface Props {
  order: CartItemType[];
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
      {order.map((item, index) => (
        <OrderItemRow key={index} item={item} />
      ))}
    </Box>
  );
}
