import { Box, Typography } from "@mui/material";
import { OrderItem } from "../../types/order.types";

interface Props {
  order: OrderItem[];
}

export default function OrderSummary({ order }: Props) {
  const subTotal = order.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography>Sub total</Typography>
        <Typography fontWeight="bold">
          {subTotal.toFixed(2)}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography>IVA 15%</Typography>
        <Typography>0.00</Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 1,
          pt: 1,
          borderTop: "2px solid #ddd",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Total
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {subTotal.toFixed(2)}
        </Typography>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        Mesero: <strong>Ileana Gago</strong>
      </Typography>
    </Box>
  );
}
