import { Box, Grid, Typography, Divider } from "@mui/material";
import { OrderItem } from "../../types/order.types";

interface Props {
  item: OrderItem;
}

export default function OrderItemRow({ item }: Props) {
  return (
    <Box sx={{ mb: 2 }}>
      <Grid container alignItems="flex-start">
        <Grid size={2} textAlign="center">
          <Typography fontWeight="bold">
            {item.quantity}
          </Typography>
        </Grid>

        <Grid size={7}>
          <Typography fontWeight="bold">
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item.size}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.timestamp}
          </Typography>
        </Grid>

        <Grid size={3} textAlign="right">
          <Typography fontWeight="bold">
            {(item.price * item.quantity).toFixed(2)}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ mt: 1 }} />
    </Box>
  );
}
